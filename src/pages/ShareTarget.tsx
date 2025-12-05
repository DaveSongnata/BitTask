import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PixelButton,
  PixelToolbar,
  PixelToolbarTitle,
  PixelToolbarGroup,
  PixelCard,
  PixelCardBody,
  PixelLoader,
  PixelInput,
} from '@/components/ui';
import { TodoForm } from '@/components/todo';
import {
  useBoards,
  useBoardOperations,
  useTasks,
  useTaskOperations,
  useAttachmentOperations,
} from '@/hooks';
import { cn } from '@/lib/utils';

interface SharedFileData {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

interface ShareData {
  title: string;
  text: string;
  url: string;
  files: SharedFileData[];
  timestamp: number;
}

/**
 * ShareTarget Page
 * Handles files/data shared from other apps via Web Share Target API
 */
export function ShareTarget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const boards = useBoards();
  const { ensureDefaultBoard } = useBoardOperations();
  const [currentBoardId, setCurrentBoardId] = useState<number | null>(null);
  const tasks = useTasks({ boardId: currentBoardId ?? undefined });
  const { createTask } = useTaskOperations();
  const { createAttachment } = useAttachmentOperations();

  // Share data state
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [mode, setMode] = useState<'choose' | 'create' | 'assign'>('choose');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Initialize board
  useEffect(() => {
    // Wait for boards to load (not undefined)
    if (boards === undefined) return;

    // If no boards exist, create default
    if (boards.length === 0) {
      void ensureDefaultBoard()
        .then((board) => {
          if (board.id !== undefined) {
            setCurrentBoardId(board.id);
          }
        })
        .catch((error) => {
          console.error('Failed to create default board:', error);
        });
      return;
    }

    // If currentBoardId is already set and valid, do nothing
    if (currentBoardId !== null) {
      const boardStillExists = boards.some((b) => b.id === currentBoardId);
      if (boardStillExists) return;
    }

    // Otherwise use first board
    const firstBoardId = boards[0]?.id;
    if (firstBoardId !== undefined) {
      setCurrentBoardId(firstBoardId);
    }
  }, [boards, currentBoardId, ensureDefaultBoard]);

  // Request share data from service worker
  useEffect(() => {
    const isPending = searchParams.get('pending') === 'true';
    const hasError = searchParams.get('error') === 'true';

    if (hasError) {
      setError(t('share.errorReceiving'));
      setLoading(false);
      return;
    }

    if (isPending) {
      // Request share data from service worker
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'SHARE_DATA') {
          setShareData(event.data.data);
          setLoading(false);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({ type: 'GET_SHARE_DATA' });
      });

      // Timeout if no response
      const timeout = setTimeout(() => {
        if (loading) {
          setError(t('share.timeout'));
          setLoading(false);
        }
      }, 5000);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
        clearTimeout(timeout);
      };
    } else {
      // No pending share, redirect to home
      navigate('/home', { replace: true });
    }
  }, [searchParams, navigate, t, loading]);

  // Convert base64 to File
  const base64ToFile = useCallback((fileData: SharedFileData): File => {
    const binary = atob(fileData.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], fileData.name, { type: fileData.type });
  }, []);

  // Handle creating a new task with attachments
  const handleCreateTask = async () => {
    if (!shareData || currentBoardId === null) return;

    setProcessing(true);
    try {
      // Create the task
      const task = await createTask({
        title: shareData.title || shareData.text || t('share.untitledTask'),
        description: shareData.url || undefined,
        boardId: currentBoardId,
        priority: 'medium',
        tags: [],
        completed: false,
      });

      // Attach files
      if (task.id !== undefined) {
        for (const fileData of shareData.files) {
          const file = base64ToFile(fileData);
          await createAttachment(task.id, file, true);
        }
      }

      // Clear share data and navigate to the task
      await clearShareData();
      navigate(`/task/${task.id}`, { replace: true });
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(t('errors.failedToCreate'));
    } finally {
      setProcessing(false);
    }
  };

  // Handle assigning to existing task
  const handleAssignToTask = async (taskId: number) => {
    if (!shareData) return;

    setProcessing(true);
    try {
      // Attach files to the existing task
      for (const fileData of shareData.files) {
        const file = base64ToFile(fileData);
        await createAttachment(taskId, file, true);
      }

      // Clear share data and navigate to the task
      await clearShareData();
      navigate(`/task/${taskId}`, { replace: true });
    } catch (err) {
      console.error('Failed to assign to task:', err);
      setError(t('errors.failedToUpdate'));
    } finally {
      setProcessing(false);
    }
  };

  // Handle dismiss
  const handleDismiss = async () => {
    await clearShareData();
    navigate('/home', { replace: true });
  };

  // Clear share data from service worker cache
  const clearShareData = async () => {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ type: 'CLEAR_SHARE_DATA' });
  };

  // Filter tasks by search query
  const filteredTasks = tasks?.filter((task) => {
    const query = searchQuery.toLowerCase();
    const matchesId = `#${task.sequentialId}`.includes(query);
    const matchesTitle = task.title.toLowerCase().includes(query);
    return matchesId || matchesTitle;
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <PixelLoader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <PixelCard>
          <PixelCardBody className="text-center">
            <p className="font-pixel text-xs text-pixel-danger mb-4">{error}</p>
            <PixelButton onClick={() => navigate('/home', { replace: true })}>
              {t('common.back')}
            </PixelButton>
          </PixelCardBody>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* Header */}
      <PixelToolbar position="top">
        <PixelToolbarGroup>
          <PixelButton size="sm" variant="ghost" onClick={() => void handleDismiss()}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </PixelButton>
          <PixelToolbarTitle>{t('share.title')}</PixelToolbarTitle>
        </PixelToolbarGroup>
      </PixelToolbar>

      {/* Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto pixel-scrollbar p-4 space-y-4">
        {/* Preview of shared content */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-[10px] text-pixel-text-muted mb-3">
              {t('share.receivedContent')}
            </h3>
            {shareData?.files && shareData.files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {shareData.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 py-1 bg-pixel-surface-alt border-2 border-pixel-border"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="square"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="font-pixel text-[8px] truncate max-w-[120px]">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {shareData?.text && (
              <p className="font-pixel text-[10px] text-pixel-text-muted line-clamp-2">
                {shareData.text}
              </p>
            )}
            {shareData?.url && (
              <p className="font-pixel text-[8px] text-pixel-accent truncate">
                {shareData.url}
              </p>
            )}
          </PixelCardBody>
        </PixelCard>

        {/* Mode selection */}
        {mode === 'choose' && (
          <div className="space-y-3">
            <PixelButton
              className="w-full"
              onClick={() => void handleCreateTask()}
              loading={processing}
            >
              {t('share.createTask')}
            </PixelButton>

            <PixelButton
              className="w-full"
              variant="secondary"
              onClick={() => setMode('assign')}
            >
              {t('share.assignToTask')}
            </PixelButton>

            <PixelButton
              className="w-full"
              variant="ghost"
              onClick={() => void handleDismiss()}
            >
              {t('share.dismiss')}
            </PixelButton>
          </div>
        )}

        {/* Assign to existing task */}
        {mode === 'assign' && (
          <div className="space-y-4">
            <PixelInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('share.searchPlaceholder')}
            />

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pixel-scrollbar">
              {filteredTasks?.map((task) => (
                <button
                  key={task.id}
                  onClick={() => void handleAssignToTask(task.id!)}
                  disabled={processing}
                  className={cn(
                    'w-full text-left px-3 py-2 font-pixel text-[10px]',
                    'border-2 border-pixel-border bg-pixel-surface',
                    'hover:bg-pixel-primary hover:text-pixel-darkest',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <span className="text-pixel-text-muted">#{task.sequentialId}</span>{' '}
                  {task.title}
                </button>
              ))}
              {filteredTasks?.length === 0 && (
                <p className="font-pixel text-[10px] text-pixel-text-muted text-center py-4">
                  {t('home.noTasks')}
                </p>
              )}
            </div>

            <PixelButton variant="ghost" onClick={() => setMode('choose')}>
              {t('common.back')}
            </PixelButton>
          </div>
        )}
      </div>

      {/* Create Task Form Modal */}
      {showCreateForm && currentBoardId !== null && (
        <TodoForm
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          boardId={currentBoardId}
        />
      )}
    </div>
  );
}
