import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PixelButton,
  PixelToolbar,
  PixelToolbarTitle,
  PixelToolbarGroup,
  PixelLoader,
} from '@/components/ui';
import { TodoList } from '@/components/todo/TodoList';
import { TodoForm } from '@/components/todo/TodoForm';
import { useTasks, useTaskCounts, useInitDatabase, usePWAStatus } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Home Page
 * Main todo list view with filtering and task creation
 */
export function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dbReady = useInitDatabase();
  const { isOffline, hasUpdate, updateApp, isInstallable, installApp } = usePWAStatus();

  // Filter state
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new');

  // Data
  const tasks = useTasks({
    completed: filter === 'all' ? undefined : filter === 'completed',
  });
  const counts = useTaskCounts();

  if (!dbReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <PixelLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <PixelToolbar position="top">
        <PixelToolbarTitle>BitTask</PixelToolbarTitle>
        <PixelToolbarGroup>
          {/* Offline indicator */}
          {isOffline && (
            <span className="font-pixel text-[8px] text-pixel-warning px-2 py-1 bg-pixel-surface-alt border-2 border-pixel-border">
              Offline
            </span>
          )}

          {/* Update available */}
          {hasUpdate && (
            <PixelButton size="sm" variant="secondary" onClick={updateApp}>
              Update
            </PixelButton>
          )}

          {/* Settings */}
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={() => navigate('/settings')}
            aria-label="Settings"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </PixelButton>
        </PixelToolbarGroup>
      </PixelToolbar>

      {/* Install Banner */}
      {isInstallable && (
        <div className="bg-pixel-primary px-4 py-2 flex items-center justify-between border-b-4 border-pixel-border">
          <span className="font-pixel text-[10px] text-pixel-darkest">
            Install BitTask for offline access!
          </span>
          <PixelButton size="sm" variant="secondary" onClick={() => void installApp()}>
            Install
          </PixelButton>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b-4 border-pixel-border bg-pixel-surface">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex-1 py-3 font-pixel text-[10px] uppercase',
              'transition-colors duration-100',
              filter === f
                ? 'bg-pixel-primary text-pixel-darkest border-b-4 border-pixel-darkest -mb-1'
                : 'text-pixel-text-muted hover:bg-pixel-surface-alt'
            )}
          >
            {f}
            {counts && (
              <span className="ml-1 opacity-70">
                ({f === 'all' ? counts.total : f === 'pending' ? counts.pending : counts.completed})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pixel-scrollbar p-4">
        {tasks === undefined ? (
          <div className="flex items-center justify-center py-8">
            <PixelLoader />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-pixel-surface-alt border-4 border-pixel-border flex items-center justify-center">
              <span className="font-pixel text-2xl text-pixel-muted">?</span>
            </div>
            <p className="font-pixel text-xs text-pixel-text-muted mb-4">
              {filter === 'all'
                ? 'No tasks yet'
                : filter === 'pending'
                  ? 'All done!'
                  : 'Nothing completed'}
            </p>
            {filter === 'all' && (
              <PixelButton onClick={() => setShowForm(true)}>Create First Task</PixelButton>
            )}
          </div>
        ) : (
          <TodoList tasks={tasks} />
        )}
      </div>

      {/* FAB - Create Task */}
      <div className="fixed-bottom-safe flex justify-center pb-4">
        <PixelButton onClick={() => setShowForm(true)} size="lg" className="shadow-pixel">
          + New Task
        </PixelButton>
      </div>

      {/* Task Form Modal */}
      <TodoForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
