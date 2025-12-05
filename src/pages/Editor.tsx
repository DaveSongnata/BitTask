import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PixelButton,
  PixelToolbar,
  PixelToolbarTitle,
  PixelToolbarGroup,
  PixelInput,
  PixelCheckbox,
  PixelCard,
  PixelCardBody,
  PixelLoader,
  PixelModal,
  PixelConfirmModal,
} from '@/components/ui';
import { AttachmentPreview, ImageViewer } from '@/components/todo';
import { useTask, useTaskAttachments, useTaskOperations, useAttachmentOperations } from '@/hooks';
import { cn } from '@/lib/utils';
import type { TaskPriority, Attachment } from '@/types';

/**
 * Editor Page
 * Task detail view with editing capabilities
 */
export function Editor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const taskId = id ? parseInt(id, 10) : undefined;

  const task = useTask(taskId);
  const attachments = useTaskAttachments(taskId);
  const { updateTask, deleteTask, toggleComplete } = useTaskOperations();
  const { deleteAttachment } = useAttachmentOperations();

  // Local edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tags, setTags] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewingImage, setViewingImage] = useState<Attachment | null>(null);

  // Confirmation modal state
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [showDeleteAttachmentModal, setShowDeleteAttachmentModal] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form when task loads
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority);
      setTags(task.tags.join(', '));
    }
  }, [task]);

  if (!taskId || task === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <PixelLoader size="lg" />
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTask(taskId, {
        title,
        description: description || undefined,
        priority,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteTaskModal(true);
  };

  const handleConfirmDeleteTask = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(taskId);
      void navigate('/home', { replace: true });
    } finally {
      setIsDeleting(false);
      setShowDeleteTaskModal(false);
    }
  };

  const handleToggleComplete = async () => {
    await toggleComplete(taskId);
  };

  const handleDeleteAttachmentClick = (attachmentId: number) => {
    setAttachmentToDelete(attachmentId);
    setShowDeleteAttachmentModal(true);
  };

  const handleConfirmDeleteAttachment = async () => {
    if (attachmentToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteAttachment(attachmentToDelete);
    } finally {
      setIsDeleting(false);
      setShowDeleteAttachmentModal(false);
      setAttachmentToDelete(null);
    }
  };

  const handleViewAttachment = (attachment: Attachment) => {
    if (attachment.type === 'image') {
      setViewingImage(attachment);
    } else if (attachment.type === 'link' && attachment.url) {
      window.open(attachment.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* Header */}
      <PixelToolbar position="top">
        <PixelToolbarGroup className="min-w-0 flex-1">
          <PixelButton size="sm" variant="ghost" onClick={() => navigate('/home')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </PixelButton>
          <PixelToolbarTitle>{t('home.title')}</PixelToolbarTitle>
        </PixelToolbarGroup>
        <PixelToolbarGroup className="flex-shrink-0">
          {isEditing ? (
            <>
              <PixelButton size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                {t('common.cancel')}
              </PixelButton>
              <PixelButton size="sm" onClick={() => void handleSave()} loading={isSaving}>
                {t('common.save')}
              </PixelButton>
            </>
          ) : (
            <>
              <PixelButton size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                {t('common.edit')}
              </PixelButton>
              <PixelButton size="sm" variant="danger" onClick={handleDeleteClick}>
                {t('common.delete')}
              </PixelButton>
            </>
          )}
        </PixelToolbarGroup>
      </PixelToolbar>

      {/* Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto pixel-scrollbar p-4 space-y-4">
        {/* Completion Toggle */}
        <PixelCard>
          <PixelCardBody>
            <PixelCheckbox
              checked={task.completed}
              onChange={() => void handleToggleComplete()}
              label={task.completed ? t('task.completed') : t('task.completed')}
            />
          </PixelCardBody>
        </PixelCard>

        {/* Title & Description */}
        <PixelCard>
          <PixelCardBody className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block font-pixel text-[10px] text-pixel-text-muted mb-2">
                    {t('task.title')}
                  </label>
                  <PixelInput value={title} onChange={setTitle} placeholder={t('task.titlePlaceholder')} />
                </div>
                <div>
                  <label className="block font-pixel text-[10px] text-pixel-text-muted mb-2">
                    {t('task.description')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('task.descriptionPlaceholder')}
                    rows={4}
                    className="pixel-input w-full resize-none"
                  />
                </div>
              </>
            ) : (
              <>
                <h2
                  className={cn(
                    'font-pixel text-sm',
                    task.completed && 'line-through text-pixel-text-muted'
                  )}
                >
                  {task.title}
                </h2>
                {task.description && (
                  <p className="font-pixel text-[10px] text-pixel-text-muted leading-relaxed">
                    {task.description}
                  </p>
                )}
              </>
            )}
          </PixelCardBody>
        </PixelCard>

        {/* Priority */}
        <PixelCard>
          <PixelCardBody>
            <label className="block font-pixel text-[10px] text-pixel-text-muted mb-2">
              {t('task.priority')}
            </label>
            {isEditing ? (
              <div className="flex gap-2 overflow-hidden">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1 min-w-0 py-2 font-pixel text-[10px] uppercase truncate',
                      'border-4 border-pixel-border',
                      priority === p
                        ? p === 'low'
                          ? 'bg-[var(--priority-low)] text-white'
                          : p === 'medium'
                            ? 'bg-[var(--priority-medium)] text-pixel-darkest'
                            : 'bg-[var(--priority-high)] text-white'
                        : 'bg-pixel-surface hover:bg-pixel-surface-alt'
                    )}
                  >
                    {t(`task.priority${p.charAt(0).toUpperCase() + p.slice(1)}`)}
                  </button>
                ))}
              </div>
            ) : (
              <span
                className={cn(
                  'inline-block px-3 py-1 font-pixel text-[10px] uppercase',
                  'border-2 border-pixel-border',
                  task.priority === 'low' && 'bg-[var(--priority-low)] text-white',
                  task.priority === 'medium' && 'bg-[var(--priority-medium)] text-pixel-darkest',
                  task.priority === 'high' && 'bg-[var(--priority-high)] text-white'
                )}
              >
                {t(`task.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)}
              </span>
            )}
          </PixelCardBody>
        </PixelCard>

        {/* Tags */}
        <PixelCard>
          <PixelCardBody>
            <label className="block font-pixel text-[10px] text-pixel-text-muted mb-2">{t('task.tags')}</label>
            {isEditing ? (
              <PixelInput
                value={tags}
                onChange={setTags}
                placeholder={t('task.tagsPlaceholder')}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {task.tags.length > 0 ? (
                  task.tags.map((tag) => (
                    <span key={tag} className="pixel-tag">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="font-pixel text-[10px] text-pixel-text-muted">{t('common.none')}</span>
                )}
              </div>
            )}
          </PixelCardBody>
        </PixelCard>

        {/* Attachments */}
        <PixelCard>
          <PixelCardBody>
            <div className="flex items-center justify-between mb-3">
              <label className="font-pixel text-[10px] text-pixel-text-muted">{t('task.attachments')}</label>
              <PixelButton
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/task/${taskId}/attachments`)}
              >
                {t('common.edit')}
              </PixelButton>
            </div>
            {attachments && attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attachments.map((attachment) => (
                  <AttachmentPreview
                    key={attachment.id}
                    attachment={attachment}
                    onClick={() => handleViewAttachment(attachment)}
                    onDelete={isEditing ? () => handleDeleteAttachmentClick(attachment.id!) : undefined}
                  />
                ))}
              </div>
            ) : (
              <p className="font-pixel text-[10px] text-pixel-text-muted">{t('task.noAttachments')}</p>
            )}
          </PixelCardBody>
        </PixelCard>

        {/* Metadata */}
        <div className="font-pixel text-[8px] text-pixel-text-muted space-y-1">
          <p>{t('task.createdAt')}: {task.createdAt.toLocaleString()}</p>
          <p>{t('task.updatedAt')}: {task.updatedAt.toLocaleString()}</p>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <PixelModal
          open={!!viewingImage}
          onClose={() => setViewingImage(null)}
          title={viewingImage.filename}
          className="max-w-4xl"
        >
          <ImageViewer
            attachment={viewingImage}
            onClose={() => setViewingImage(null)}
          />
        </PixelModal>
      )}

      {/* Delete Task Confirmation Modal */}
      <PixelConfirmModal
        open={showDeleteTaskModal}
        onClose={() => setShowDeleteTaskModal(false)}
        onConfirm={() => void handleConfirmDeleteTask()}
        title={t('task.deleteTask')}
        message={t('task.deleteTaskConfirm')}
        confirmText={t('common.delete')}
        variant="danger"
        loading={isDeleting}
      />

      {/* Delete Attachment Confirmation Modal */}
      <PixelConfirmModal
        open={showDeleteAttachmentModal}
        onClose={() => {
          setShowDeleteAttachmentModal(false);
          setAttachmentToDelete(null);
        }}
        onConfirm={() => void handleConfirmDeleteAttachment()}
        title={t('task.deleteAttachment')}
        message={t('task.deleteAttachmentConfirm')}
        confirmText={t('common.delete')}
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
