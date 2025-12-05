import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PixelButton,
  PixelToolbar,
  PixelToolbarTitle,
  PixelToolbarGroup,
  PixelCard,
  PixelCardBody,
  PixelLoader,
  PixelInput,
  PixelModal,
} from '@/components/ui';
import { AttachmentPreview } from '@/components/todo/AttachmentPreview';
import { CameraCapture } from '@/components/todo/CameraCapture';
import { useTask, useTaskAttachments, useAttachmentOperations, useSettings } from '@/hooks';
import { isValidUrl } from '@/lib/utils';

/**
 * Attachments Page
 * Manage attachments for a task - upload, camera capture, link adding
 */
export function Attachments() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const taskId = id ? parseInt(id, 10) : undefined;

  const task = useTask(taskId);
  const attachments = useTaskAttachments(taskId);
  const settings = useSettings();
  const { createAttachment, createLinkAttachment, deleteAttachment, validateFile } =
    useAttachmentOperations();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!taskId || task === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <PixelLoader size="lg" />
      </div>
    );
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !taskId) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const validation = validateFile(file, settings?.maxFileSize);
        if (!validation.valid) {
          setError(validation.error ?? 'Invalid file');
          continue;
        }

        await createAttachment(taskId, file, settings?.compressImages ?? true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraCapture = async (blob: Blob) => {
    if (!taskId) return;

    setShowCamera(false);
    setIsUploading(true);
    setError(null);

    try {
      const file = new File([blob], `photo-${Date.now()}.webp`, { type: 'image/webp' });
      await createAttachment(taskId, file, settings?.compressImages ?? true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Capture failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = async () => {
    if (!taskId || !linkUrl) return;

    if (!isValidUrl(linkUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    setShowLinkModal(false);
    setIsUploading(true);
    setError(null);

    try {
      await createLinkAttachment(taskId, linkUrl);
      setLinkUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add link');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (window.confirm('Delete this attachment?')) {
      await deleteAttachment(attachmentId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <PixelToolbar position="top">
        <PixelToolbarGroup>
          <PixelButton size="sm" variant="ghost" onClick={() => navigate(`/task/${taskId}`)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </PixelButton>
          <PixelToolbarTitle>Attachments</PixelToolbarTitle>
        </PixelToolbarGroup>
      </PixelToolbar>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pixel-scrollbar p-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-[var(--pixel-error)] text-white font-pixel text-[10px] border-4 border-pixel-border">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Options */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">Add Attachment</h3>
            <div className="grid grid-cols-3 gap-2">
              {/* File Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-4 flex flex-col items-center gap-2 bg-pixel-surface-alt border-4 border-pixel-border hover:bg-pixel-primary hover:text-pixel-darkest transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-pixel text-[8px]">File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,audio/*,.pdf"
                multiple
                onChange={(e) => void handleFileSelect(e.target.files)}
                className="hidden"
              />

              {/* Camera */}
              <button
                onClick={() => setShowCamera(true)}
                disabled={isUploading}
                className="p-4 flex flex-col items-center gap-2 bg-pixel-surface-alt border-4 border-pixel-border hover:bg-pixel-primary hover:text-pixel-darkest transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="square" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-pixel text-[8px]">Camera</span>
              </button>

              {/* Link */}
              <button
                onClick={() => setShowLinkModal(true)}
                disabled={isUploading}
                className="p-4 flex flex-col items-center gap-2 bg-pixel-surface-alt border-4 border-pixel-border hover:bg-pixel-primary hover:text-pixel-darkest transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="font-pixel text-[8px]">Link</span>
              </button>
            </div>

            {isUploading && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <PixelLoader size="sm" />
                <span className="font-pixel text-[10px] text-pixel-text-muted">Uploading...</span>
              </div>
            )}
          </PixelCardBody>
        </PixelCard>

        {/* Attachments Grid */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">
              Files ({attachments?.length ?? 0})
            </h3>
            {attachments && attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {attachments.map((attachment) => (
                  <AttachmentPreview
                    key={attachment.id}
                    attachment={attachment}
                    onDelete={() => void handleDeleteAttachment(attachment.id!)}
                    showDetails
                  />
                ))}
              </div>
            ) : (
              <p className="font-pixel text-[10px] text-pixel-text-muted text-center py-8">
                No attachments yet
              </p>
            )}
          </PixelCardBody>
        </PixelCard>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Link Modal */}
      <PixelModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Add Link"
      >
        <div className="space-y-4">
          <PixelInput
            value={linkUrl}
            onChange={setLinkUrl}
            placeholder="https://example.com"
            type="url"
          />
          <div className="flex gap-2">
            <PixelButton
              variant="secondary"
              onClick={() => setShowLinkModal(false)}
              className="flex-1"
            >
              Cancel
            </PixelButton>
            <PixelButton
              onClick={() => void handleAddLink()}
              className="flex-1"
              disabled={!linkUrl}
            >
              Add Link
            </PixelButton>
          </div>
        </div>
      </PixelModal>
    </div>
  );
}
