import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PixelButton, PixelInput, PixelCheckbox } from '@/components/ui';
import { useSubtasks, useSubtaskOperations } from '@/hooks';
import { cn } from '@/lib/utils';
import type { Subtask } from '@/types';

interface SubtaskListProps {
  taskId: number;
  editable?: boolean;
}

/**
 * SubtaskList
 * Checklist of subtasks within a task
 */
export function SubtaskList({ taskId, editable = true }: SubtaskListProps) {
  const { t } = useTranslation();
  const subtasks = useSubtasks(taskId);
  const { createSubtask, toggleComplete, deleteSubtask } = useSubtaskOperations();

  // New subtask state
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = async () => {
    if (!newTitle.trim()) return;

    setIsAdding(true);
    try {
      await createSubtask({
        taskId,
        title: newTitle.trim(),
        completed: false,
      });
      setNewTitle('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleAddSubtask();
    }
  };

  const handleToggle = async (subtask: Subtask) => {
    if (subtask.id !== undefined) {
      await toggleComplete(subtask.id);
    }
  };

  const handleDelete = async (subtask: Subtask) => {
    if (subtask.id !== undefined) {
      await deleteSubtask(subtask.id);
    }
  };

  // Calculate progress
  const total = subtasks?.length ?? 0;
  const completed = subtasks?.filter((s) => s.completed).length ?? 0;

  return (
    <div className="space-y-3">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <label className="font-pixel text-[10px] text-pixel-text-muted">
          {t('subtasks.title')}
        </label>
        {total > 0 && (
          <span className="font-pixel text-[10px] text-pixel-text-muted">
            {t('subtasks.progress', { completed, total })}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-2 bg-pixel-surface-alt border-2 border-pixel-border">
          <div
            className="h-full bg-pixel-primary transition-all duration-300"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      )}

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks?.map((subtask) => (
          <div
            key={subtask.id}
            className={cn(
              'flex items-center gap-2 p-2 border-2 border-pixel-border',
              'bg-pixel-surface group'
            )}
          >
            <PixelCheckbox
              checked={subtask.completed}
              onChange={() => void handleToggle(subtask)}
              size="sm"
            />
            <span
              className={cn(
                'flex-1 font-pixel text-[10px]',
                subtask.completed && 'line-through text-pixel-text-muted'
              )}
            >
              {subtask.title}
            </span>
            {editable && (
              <button
                onClick={() => void handleDelete(subtask)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                aria-label={t('common.delete')}
              >
                <svg className="w-3 h-3 text-pixel-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new subtask */}
      {editable && (
        <div className="flex gap-2">
          <div className="flex-1">
            <PixelInput
              value={newTitle}
              onChange={setNewTitle}
              placeholder={t('subtasks.placeholder')}
              disabled={isAdding}
              onKeyDown={handleKeyDown}
            />
          </div>
          <PixelButton
            size="sm"
            onClick={() => void handleAddSubtask()}
            disabled={!newTitle.trim() || isAdding}
            loading={isAdding}
          >
            {t('subtasks.add')}
          </PixelButton>
        </div>
      )}
    </div>
  );
}
