import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PixelButton,
  PixelToolbar,
  PixelToolbarTitle,
  PixelToolbarGroup,
  PixelCard,
  PixelCardBody,
  PixelInput,
  PixelModal,
} from '@/components/ui';
import { useBoards, useBoardOperations } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Board Manager Page
 * CRUD operations for boards
 */
export function BoardManager() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const boards = useBoards();
  const { createBoard, updateBoard, deleteBoard } = useBoardOperations();

  // New board state
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    setIsCreating(true);
    try {
      await createBoard({
        name: newBoardName.trim(),
        order: boards?.length ?? 0,
      });
      setNewBoardName('');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async () => {
    if (editingId === null || !editingName.trim()) return;

    await updateBoard(editingId, { name: editingName.trim() });
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteBoard = async () => {
    if (deleteConfirmId === null) return;

    const success = await deleteBoard(deleteConfirmId);
    if (!success) {
      // Show error - cannot delete last board
      alert(t('boards.cannotDeleteLast'));
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* Header */}
      <PixelToolbar position="top">
        <PixelToolbarGroup>
          <PixelButton size="sm" variant="ghost" onClick={() => navigate('/home')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </PixelButton>
          <PixelToolbarTitle>{t('boards.manage')}</PixelToolbarTitle>
        </PixelToolbarGroup>
      </PixelToolbar>

      {/* Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto pixel-scrollbar p-4 space-y-4">
        {/* Create New Board */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">{t('boards.create')}</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <PixelInput
                  value={newBoardName}
                  onChange={setNewBoardName}
                  placeholder={t('boards.namePlaceholder')}
                  disabled={isCreating}
                />
              </div>
              <PixelButton
                onClick={() => void handleCreateBoard()}
                disabled={!newBoardName.trim() || isCreating}
                loading={isCreating}
              >
                {t('common.add')}
              </PixelButton>
            </div>
          </PixelCardBody>
        </PixelCard>

        {/* Board List */}
        <PixelCard>
          <PixelCardBody>
            <h3 className="font-pixel text-xs mb-4">{t('boards.title')}</h3>
            <div className="space-y-2">
              {boards?.map((board) => (
                <div
                  key={board.id}
                  className={cn(
                    'flex items-center gap-2 p-2 border-2 border-pixel-border',
                    editingId === board.id ? 'bg-pixel-surface-alt' : 'bg-pixel-surface'
                  )}
                >
                  {editingId === board.id ? (
                    // Edit mode
                    <>
                      <div className="flex-1">
                        <PixelInput
                          value={editingName}
                          onChange={setEditingName}
                          placeholder={t('boards.namePlaceholder')}
                        />
                      </div>
                      <PixelButton
                        size="sm"
                        onClick={() => void handleSaveEdit()}
                        disabled={!editingName.trim()}
                      >
                        {t('common.save')}
                      </PixelButton>
                      <PixelButton size="sm" variant="ghost" onClick={handleCancelEdit}>
                        {t('common.cancel')}
                      </PixelButton>
                    </>
                  ) : (
                    // View mode
                    <>
                      <span className="flex-1 font-pixel text-[10px] truncate">{board.name}</span>
                      <PixelButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(board.id!, board.name)}
                        aria-label={t('boards.rename')}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="square"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </PixelButton>
                      <PixelButton
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteConfirmId(board.id!)}
                        aria-label={t('boards.delete')}
                        disabled={boards.length <= 1}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="square"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </PixelButton>
                    </>
                  )}
                </div>
              ))}
            </div>
          </PixelCardBody>
        </PixelCard>
      </div>

      {/* Delete Confirmation Modal */}
      <PixelModal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title={t('boards.delete')}
      >
        <p className="font-pixel text-[10px] text-pixel-text-muted mb-4">
          {t('boards.deleteConfirm')}
        </p>
        <div className="flex gap-2 justify-end">
          <PixelButton variant="ghost" onClick={() => setDeleteConfirmId(null)}>
            {t('common.cancel')}
          </PixelButton>
          <PixelButton variant="danger" onClick={() => void handleDeleteBoard()}>
            {t('common.delete')}
          </PixelButton>
        </div>
      </PixelModal>
    </div>
  );
}
