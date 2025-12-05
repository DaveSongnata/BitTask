import { useNavigate } from 'react-router-dom';
import { PixelCard, PixelCheckbox } from '@/components/ui';
import { useTaskOperations, useTaskAttachments, useSubtaskCounts } from '@/hooks';
import { formatRelativeDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TodoItemProps {
  task: Task;
}

/**
 * TodoItem
 * Individual task card in the list view
 */
export function TodoItem({ task }: TodoItemProps) {
  const navigate = useNavigate();
  const { toggleComplete } = useTaskOperations();
  const attachments = useTaskAttachments(task.id);
  const subtaskCounts = useSubtaskCounts(task.id);

  const handleToggle = async () => {
    if (task.id !== undefined) {
      await toggleComplete(task.id);
    }
  };

  const handleClick = () => {
    if (task.id !== undefined) {
      void navigate(`/task/${task.id}`);
    }
  };

  return (
    <PixelCard
      onClick={handleClick}
      className="cursor-pointer"
      as="article"
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div onClick={(e) => e.stopPropagation()}>
          <PixelCheckbox
            checked={task.completed}
            onChange={() => void handleToggle()}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title with Sequential ID */}
          <h3
            className={cn(
              'font-pixel text-xs mb-1 truncate',
              task.completed && 'line-through text-pixel-text-muted'
            )}
          >
            <span className="text-pixel-text-muted">#{task.sequentialId}</span>{' '}
            {task.title}
          </h3>

          {/* Description Preview */}
          {task.description && (
            <p className="font-pixel text-[8px] text-pixel-text-muted line-clamp-2 mb-2">
              {task.description}
            </p>
          )}

          {/* Meta Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Badge */}
            <span
              className={cn(
                'inline-block px-2 py-0.5 font-pixel text-[8px] uppercase',
                'border-2 border-pixel-border',
                task.priority === 'low' && 'bg-[var(--priority-low)] text-white',
                task.priority === 'medium' && 'bg-[var(--priority-medium)] text-pixel-darkest',
                task.priority === 'high' && 'bg-[var(--priority-high)] text-white'
              )}
            >
              {task.priority}
            </span>

            {/* Tags */}
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 font-pixel text-[8px] bg-pixel-surface-alt border border-pixel-border"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="font-pixel text-[8px] text-pixel-text-muted">
                +{task.tags.length - 2}
              </span>
            )}

            {/* Subtask Progress */}
            {subtaskCounts && subtaskCounts.total > 0 && (
              <span className="inline-flex items-center gap-1 font-pixel text-[8px] text-pixel-text-muted">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="square"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                {subtaskCounts.completed}/{subtaskCounts.total}
              </span>
            )}

            {/* Attachment Count */}
            {attachments && attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 font-pixel text-[8px] text-pixel-text-muted">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="square"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                {attachments.length}
              </span>
            )}

            {/* Time */}
            <span className="ml-auto font-pixel text-[8px] text-pixel-text-muted">
              {formatRelativeDate(task.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </PixelCard>
  );
}
