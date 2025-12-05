import { db } from './idb';
import type { Board, BoardCreateInput, BoardUpdateInput } from '@/types';

/**
 * Board Service
 * CRUD operations for boards
 */

/**
 * Get the next order number for a new board
 */
async function getNextOrder(): Promise<number> {
  const lastBoard = await db.boards.orderBy('order').last();
  return (lastBoard?.order ?? -1) + 1;
}

/**
 * Create a new board
 */
export async function createBoard(input: BoardCreateInput): Promise<Board> {
  const now = new Date();
  const order = input.order ?? (await getNextOrder());

  const board: Omit<Board, 'id'> = {
    name: input.name,
    order,
    createdAt: now,
    updatedAt: now,
  };

  const id = (await db.boards.add(board as Board)) as number;

  return { ...board, id };
}

/**
 * Get a board by ID
 */
export async function getBoard(id: number): Promise<Board | undefined> {
  return db.boards.get(id);
}

/**
 * Get all boards ordered by order
 */
export async function getAllBoards(): Promise<Board[]> {
  return db.boards.orderBy('order').toArray();
}

/**
 * Get the first board (for default selection)
 */
export async function getFirstBoard(): Promise<Board | undefined> {
  return db.boards.orderBy('order').first();
}

/**
 * Get board count
 */
export async function getBoardCount(): Promise<number> {
  return db.boards.count();
}

/**
 * Update a board
 */
export async function updateBoard(
  id: number,
  updates: BoardUpdateInput
): Promise<Board | undefined> {
  const board = await db.boards.get(id);
  if (!board) return undefined;

  const updatedBoard: Board = {
    ...board,
    ...updates,
    updatedAt: new Date(),
  };

  await db.boards.put(updatedBoard);

  return updatedBoard;
}

/**
 * Delete a board (only if not the last one)
 * Returns false if cannot delete (last board)
 */
export async function deleteBoard(id: number): Promise<boolean> {
  const boardCount = await db.boards.count();

  // Cannot delete the last board
  if (boardCount <= 1) {
    return false;
  }

  const board = await db.boards.get(id);
  if (!board) return false;

  // Get the first board that is not this one to reassign tasks
  const otherBoard = await db.boards.where('id').notEqual(id).first();
  if (!otherBoard) return false;

  // Reassign all tasks from this board to another board
  await db.tasks.where('boardId').equals(id).modify({ boardId: otherBoard.id });

  // Delete the board
  await db.boards.delete(id);

  return true;
}

/**
 * Reorder boards
 */
export async function reorderBoards(orderedIds: number[]): Promise<void> {
  const updates = orderedIds.map((id, index) => ({
    id,
    order: index,
    updatedAt: new Date(),
  }));

  await db.transaction('rw', db.boards, async () => {
    for (const update of updates) {
      await db.boards.update(update.id, {
        order: update.order,
        updatedAt: update.updatedAt,
      });
    }
  });
}

/**
 * Ensure at least one board exists (create default if needed)
 */
export async function ensureDefaultBoard(): Promise<Board> {
  const existingBoard = await db.boards.orderBy('order').first();
  if (existingBoard) {
    return existingBoard;
  }

  // Create default board
  return createBoard({ name: 'Geral', order: 0 });
}
