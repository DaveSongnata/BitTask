import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from '@/components/ui';
import { AttachmentPreview } from '@/components/todo/AttachmentPreview';
import { useTask, useTaskAttachments, useTaskOperations, useAttachmentOperations } from '@/hooks';
import { cn } from '@/lib/utils';
import type { TaskPriority } from '@/types';

/**
 * Editor Page
 * Task detail view with editing capabilities
 */
export function Editor() {
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

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(taskId);
      void navigate('/home', { replace: true });
    }
  };

  const handleToggleComplete = async () => {
    await toggleComplete(taskId);
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
          <PixelButton size="sm" variant="ghost" onClick={() => navigate('/home')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </PixelButton>
          <PixelToolbarTitle>Task</PixelToolbarTitle>
        </PixelToolbarGroup>
        <PixelToolbarGroup>
          {isEditing ? (
            <>
              <PixelButton size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </PixelButton>
              <PixelButton size="sm" onClick={() => void handleSave()} loading={isSaving}>
                Save
              </PixelButton>
            </>
          ) : (
            <>
              <PixelButton size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                Edit
              </PixelButton>
              <PixelButton size="sm" variant="danger" onClick={() => void handleDelete()}>
                Delete
              </PixelButton>
            </>
          )}
        </PixelToolbarGroup>
      </PixelToolbar>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pixel-scrollbar p-4 space-y-4">
        {/* Completion Toggle */}
        <PixelCard>
          <PixelCardBody>
            <PixelCheckbox
              checked={task.completed}
              onChange={() => void handleToggleComplete()}
              label={task.completed ? 'Completed' : 'Mark as complete'}
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
                    Title
                  </label>
                  <PixelInput value={title} onChange={setTitle} placeholder="Task title" />
                </div>
                <div>
                  <label className="block font-pixel text-[10px] text-pixel-text-muted mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
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
              Priority
            </label>
            {isEditing ? (
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1 py-2 font-pixel text-[10px] uppercase',
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
                    {p}
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
                {task.priority}
              </span>
            )}
          </PixelCardBody>
        </PixelCard>

        {/* Tags */}
        <PixelCard>
          <PixelCardBody>
            <label className="block font-pixel text-[10px] text-pixel-text-muted mb-2">Tags</label>
            {isEditing ? (
              <PixelInput
                value={tags}
                onChange={setTags}
                placeholder="tag1, tag2, tag3"
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
                  <span className="font-pixel text-[10px] text-pixel-text-muted">No tags</span>
                )}
              </div>
            )}
          </PixelCardBody>
        </PixelCard>

        {/* Attachments */}
        <PixelCard>
          <PixelCardBody>
            <div className="flex items-center justify-between mb-3">
              <label className="font-pixel text-[10px] text-pixel-text-muted">Attachments</label>
              <PixelButton
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/task/${taskId}/attachments`)}
              >
                Manage
              </PixelButton>
            </div>
            {attachments && attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attachments.map((attachment) => (
                  <AttachmentPreview
                    key={attachment.id}
                    attachment={attachment}
                    onDelete={isEditing ? () => void handleDeleteAttachment(attachment.id!) : undefined}
                  />
                ))}
              </div>
            ) : (
              <p className="font-pixel text-[10px] text-pixel-text-muted">No attachments</p>
            )}
          </PixelCardBody>
        </PixelCard>

        {/* Metadata */}
        <div className="font-pixel text-[8px] text-pixel-text-muted space-y-1">
          <p>Created: {task.createdAt.toLocaleString()}</p>
          <p>Updated: {task.updatedAt.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
