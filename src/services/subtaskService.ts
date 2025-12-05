/**
 * Subtask Service
 * CRUD operations for subtasks
 */
import { db } from './idb';
import type { Subtask, SubtaskCreateInput, SubtaskUpdateInput } from '@/types';

/**
 * Create a new subtask
 */
export async function createSubtask(input: SubtaskCreateInput): Promise<Subtask> {
  const now = new Date();

  const id = await db.subtasks.add({
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  const subtask = await db.subtasks.get(id);
  if (!subtask) {
    throw new Error('Failed to create subtask');
  }

  return subtask;
}

/**
 * Get a subtask by ID
 */
export async function getSubtask(id: number): Promise<Subtask | undefined> {
  return db.subtasks.get(id);
}

/**
 * Get all subtasks for a task
 */
export async function getSubtasksByTaskId(taskId: number): Promise<Subtask[]> {
  return db.subtasks.where('taskId').equals(taskId).sortBy('order');
}

/**
 * Get subtask counts for a task
 */
export async function getSubtaskCounts(taskId: number): Promise<{ total: number; completed: number }> {
  const subtasks = await db.subtasks.where('taskId').equals(taskId).toArray();
  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.completed).length;
  return { total, completed };
}

/**
 * Update a subtask
 */
export async function updateSubtask(
  id: number,
  updates: SubtaskUpdateInput
): Promise<Subtask | undefined> {
  const now = new Date();

  await db.subtasks.update(id, {
    ...updates,
    updatedAt: now,
  });

  return db.subtasks.get(id);
}

/**
 * Toggle subtask completion
 */
export async function toggleSubtaskComplete(id: number): Promise<Subtask | undefined> {
  const subtask = await db.subtasks.get(id);
  if (!subtask) return undefined;

  return updateSubtask(id, { completed: !subtask.completed });
}

/**
 * Delete a subtask
 */
export async function deleteSubtask(id: number): Promise<boolean> {
  await db.subtasks.delete(id);
  return true;
}

/**
 * Delete all subtasks for a task
 */
export async function deleteSubtasksByTaskId(taskId: number): Promise<number> {
  return db.subtasks.where('taskId').equals(taskId).delete();
}

/**
 * Reorder subtasks within a task
 */
export async function reorderSubtasks(_taskId: number, subtaskIds: number[]): Promise<void> {
  const now = new Date();

  await db.transaction('rw', db.subtasks, async () => {
    for (let i = 0; i < subtaskIds.length; i++) {
      await db.subtasks.update(subtaskIds[i], {
        order: i,
        updatedAt: now,
      });
    }
  });
}

/**
 * Get the next order value for a new subtask
 */
export async function getNextSubtaskOrder(taskId: number): Promise<number> {
  const lastSubtask = await db.subtasks
    .where('taskId')
    .equals(taskId)
    .reverse()
    .sortBy('order')
    .then((subtasks) => subtasks[0]);

  return (lastSubtask?.order ?? -1) + 1;
}
