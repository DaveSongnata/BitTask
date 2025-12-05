import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setError(t('task.titleRequired'));
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
      setError(err instanceof Error ? err.message : t('errors.failedToCreate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PixelModal open={open} onClose={handleClose} title={t('home.newTask')}>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        {/* Error */}
        {error && (
          <div className="p-2 bg-[var(--pixel-error)] text-white font-pixel text-[10px] border-2 border-pixel-border">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block font-pixel text-[10px] text-pixel-text-muted mb-1">
            {t('task.title')} *
          </label>
          <PixelInput
            value={title}
            onChange={setTitle}
            placeholder={t('task.titlePlaceholder')}
            required
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-pixel text-[10px] text-pixel-text-muted mb-1">
            {t('task.description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('task.descriptionPlaceholder')}
            rows={2}
            maxLength={500}
            className="pixel-input w-full resize-none"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block font-pixel text-[10px] text-pixel-text-muted mb-1">
            {t('task.priority')}
          </label>
          <div className="flex gap-2 overflow-hidden">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  'flex-1 min-w-0 py-2 font-pixel text-[10px] uppercase truncate',
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
                {t(`task.priority${p.charAt(0).toUpperCase() + p.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block font-pixel text-[10px] text-pixel-text-muted mb-1">
            {t('task.tags')}
          </label>
          <PixelInput
            value={tags}
            onChange={setTags}
            placeholder={t('task.tagsPlaceholder')}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <PixelButton
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </PixelButton>
          <PixelButton
            type="submit"
            className="flex-1"
            loading={isSubmitting}
            disabled={!title.trim()}
          >
            {t('common.add')}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}
