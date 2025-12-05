import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PixelButton,
  PixelToolbar,
  PixelToolbarTitle,
  PixelToolbarGroup,
  PixelLoader,
} from '@/components/ui';
import { TodoList } from '@/components/todo/TodoList';
import { TodoForm } from '@/components/todo/TodoForm';
import { useTasks, useTaskCounts, useInitDatabase, usePWAStatus, useBoards, useBoardOperations } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Home Page
 * Main todo list view with filtering and task creation
 */
export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dbReady = useInitDatabase();
  const { isOffline, hasUpdate, updateApp, isInstallable, installApp } = usePWAStatus();

  // Board state
  const boards = useBoards();
  const { ensureDefaultBoard } = useBoardOperations();
  const [currentBoardId, setCurrentBoardId] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new');

  // Ensure default board exists and set current board
  useEffect(() => {
    if (boards && boards.length > 0 && currentBoardId === null) {
      // Check if there's a board param in URL
      const boardParam = searchParams.get('board');
      if (boardParam) {
        const boardId = parseInt(boardParam, 10);
        const boardExists = boards.some((b) => b.id === boardId);
        if (boardExists) {
          setCurrentBoardId(boardId);
          return;
        }
      }
      // Otherwise use first board
      const firstBoardId = boards[0]?.id;
      if (firstBoardId !== undefined) {
        setCurrentBoardId(firstBoardId);
      }
    } else if (boards && boards.length === 0) {
      // Create default board if none exist
      void ensureDefaultBoard().then((board) => {
        if (board.id !== undefined) {
          setCurrentBoardId(board.id);
        }
      });
    }
  }, [boards, currentBoardId, ensureDefaultBoard, searchParams]);

  // Data - filter by current board
  const tasks = useTasks({
    completed: filter === 'all' ? undefined : filter === 'completed',
    boardId: currentBoardId ?? undefined,
  });
  const counts = useTaskCounts();

  // Get current board name
  const currentBoard = boards?.find((b) => b.id === currentBoardId);

  const filterLabels = {
    all: t('home.filterAll'),
    pending: t('home.pending'),
    completed: t('home.filterCompleted'),
  };

  if (!dbReady || currentBoardId === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <PixelLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* Header */}
      <PixelToolbar position="top">
        <PixelToolbarGroup className="min-w-0 flex-1">
          {/* Hamburger Menu */}
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={() => setShowMenu(true)}
            aria-label="Menu"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </PixelButton>
          <PixelToolbarTitle>{currentBoard?.name ?? 'BitTask'}</PixelToolbarTitle>
        </PixelToolbarGroup>
        <PixelToolbarGroup className="flex-shrink-0">
          {/* Offline indicator */}
          {isOffline && (
            <span className="font-pixel text-[8px] text-pixel-warning px-2 py-1 bg-pixel-surface-alt border-2 border-pixel-border">
              {t('settings.offline')}
            </span>
          )}

          {/* Update available */}
          {hasUpdate && (
            <PixelButton size="sm" variant="secondary" onClick={updateApp}>
              {t('common.update')}
            </PixelButton>
          )}

          {/* Settings */}
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={() => navigate('/settings')}
            aria-label={t('settings.title')}
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
            {t('settings.installApp')}!
          </span>
          <PixelButton size="sm" variant="secondary" onClick={() => void installApp()}>
            {t('settings.installApp')}
          </PixelButton>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b-4 border-pixel-border bg-pixel-surface overflow-hidden">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex-1 min-w-0 py-3 font-pixel text-[10px] uppercase truncate',
              'transition-colors duration-100',
              filter === f
                ? 'bg-pixel-primary text-pixel-darkest border-b-4 border-pixel-darkest -mb-1'
                : 'text-pixel-text-muted hover:bg-pixel-surface-alt'
            )}
          >
            {filterLabels[f]}
            {counts && (
              <span className="ml-1 opacity-70">
                ({f === 'all' ? counts.total : f === 'pending' ? counts.pending : counts.completed})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto pixel-scrollbar p-4">
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
              {filter === 'all' ? t('home.noTasks') : t('home.filterCompleted')}
            </p>
            {filter === 'all' && (
              <PixelButton onClick={() => setShowForm(true)}>{t('home.addFirstTask')}</PixelButton>
            )}
          </div>
        ) : (
          <TodoList tasks={tasks} />
        )}
      </div>

      {/* FAB - Create Task */}
      <div className="fixed-bottom-safe flex justify-center pb-4">
        <PixelButton onClick={() => setShowForm(true)} size="lg" className="shadow-pixel">
          + {t('home.newTask')}
        </PixelButton>
      </div>

      {/* Task Form Modal */}
      <TodoForm open={showForm} onClose={() => setShowForm(false)} boardId={currentBoardId} />

      {/* Hamburger Menu Drawer */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-64 max-w-[80vw] bg-pixel-surface border-r-4 border-pixel-border animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="p-4 border-b-4 border-pixel-border">
              <h2 className="font-pixel text-sm uppercase">BitTask</h2>
            </div>

            {/* Board List */}
            <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto pixel-scrollbar">
              {boards?.map((board) => (
                <button
                  key={board.id}
                  onClick={() => {
                    setCurrentBoardId(board.id!);
                    setShowMenu(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 font-pixel text-[10px]',
                    'border-2 border-transparent',
                    board.id === currentBoardId
                      ? 'bg-pixel-primary text-pixel-darkest border-pixel-border'
                      : 'hover:bg-pixel-surface-alt'
                  )}
                >
                  {board.name}
                </button>
              ))}
            </div>

            {/* Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-2 border-t-4 border-pixel-border bg-pixel-surface">
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate('/boards');
                }}
                className="w-full text-left px-3 py-2 font-pixel text-[10px] hover:bg-pixel-surface-alt"
              >
                {t('boards.manage')}
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 font-pixel text-[10px] hover:bg-pixel-surface-alt"
              >
                {t('settings.title')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
