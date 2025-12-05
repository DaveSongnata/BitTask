import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelModal, PixelButton, PixelInput } from '@/components/ui';
import { useTaskOperations } from '@/hooks';
import { cn } from '@/lib/utils';
import type { TaskPriority } from '@/types';

interface TodoFormProps {
  open: boolean;
  onClose: () => void;
}

/**
 * TodoForm
 * Modal form for creating a new task
 */
export function TodoForm({ open, onClose }: TodoFormProps) {
  const navigate = useNavigate();
  const { createTask } = useTaskOperations();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setTags('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const task = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        completed: false,
      });

      handleClose();

      // Navigate to the new task
      if (task.id !== undefined) {
        void navigate(`/task/${task.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PixelModal open={open} onClose={handleClose} title="New Task">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {/* Error */}
        {error && (
          <div className="p-2 bg-[var(--pixel-error)] text-white font-pixel text-[10px] border-2 border-pixel-border">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block font-pixel text-[10px] text-pixel-text-muted mb-2">
            Title *
          </label>
          <PixelInput
            value={title}
            onChange={setTitle}
            placeholder="What needs to be done?"
            required
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-pixel text-[10px] text-pixel-text-muted mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            rows={3}
            maxLength={500}
            className="pixel-input w-full resize-none"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block font-pixel text-[10px] text-pixel-text-muted mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  'flex-1 py-2 font-pixel text-[10px] uppercase',
                  'border-4 border-pixel-border transition-colors',
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
        </div>

        {/* Tags */}
        <div>
          <label className="block font-pixel text-[10px] text-pixel-text-muted mb-2">
            Tags (comma separated)
          </label>
          <PixelInput
            value={tags}
            onChange={setTags}
            placeholder="work, urgent, personal"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <PixelButton
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </PixelButton>
          <PixelButton
            type="submit"
            className="flex-1"
            loading={isSubmitting}
            disabled={!title.trim()}
          >
            Create
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}
