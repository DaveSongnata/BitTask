import { db } from './idb';
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types';
import { generateId } from '@/lib/utils';

/**
 * Task Service
 * CRUD operations for tasks with offline queue support
 */

/**
 * Get the next sequential ID for a new task
 */
async function getNextSequentialId(): Promise<number> {
  const lastTask = await db.tasks.orderBy('sequentialId').last();
  return (lastTask?.sequentialId ?? 0) + 1;
}

/**
 * Create a new task
 */
export async function createTask(input: TaskCreateInput): Promise<Task> {
  const now = new Date();
  const sequentialId = await getNextSequentialId();

  const task: Omit<Task, 'id'> = {
    ...input,
    sequentialId,
    createdAt: now,
    updatedAt: now,
  };

  const id = await db.tasks.add(task as Task) as number;

  // Queue for future sync
  await queueOfflineOp('create', 'task', id, task);

  return { ...task, id };
}

/**
 * Get a task by ID
 */
export async function getTask(id: number): Promise<Task | undefined> {
  return db.tasks.get(id);
}

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<Task[]> {
  return db.tasks.orderBy('createdAt').reverse().toArray();
}

/**
 * Get tasks with filters
 */
export async function getTasks(options?: {
  completed?: boolean;
  priority?: Task['priority'];
  search?: string;
  boardId?: number;
}): Promise<Task[]> {
  // Get all tasks ordered by createdAt descending
  let tasks = await db.tasks.orderBy('createdAt').reverse().toArray();

  // Filter by board
  if (options?.boardId !== undefined) {
    tasks = tasks.filter((t) => t.boardId === options.boardId);
  }

  // Filter by completed status (in memory to avoid IndexedDB boolean issues)
  if (options?.completed !== undefined) {
    tasks = tasks.filter((t) => t.completed === options.completed);
  }

  // Filter by priority if specified
  if (options?.priority) {
    tasks = tasks.filter((t) => t.priority === options.priority);
  }

  // Filter by search term
  if (options?.search) {
    const searchTerm = options.search.trim();
    const searchLower = searchTerm.toLowerCase();

    // Check if searching by sequential ID (e.g., "#42" or "42")
    const seqIdMatch = searchTerm.match(/^#?(\d+)$/);
    if (seqIdMatch?.[1]) {
      const seqId = parseInt(seqIdMatch[1], 10);
      tasks = tasks.filter((t) => t.sequentialId === seqId);
    } else {
      // Regular text search
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }
  }

  return tasks;
}

/**
 * Update a task
 */
export async function updateTask(id: number, updates: TaskUpdateInput): Promise<Task | undefined> {
  const task = await db.tasks.get(id);
  if (!task) return undefined;

  const updatedTask: Task = {
    ...task,
    ...updates,
    updatedAt: new Date(),
  };

  await db.tasks.put(updatedTask);

  // Queue for future sync
  await queueOfflineOp('update', 'task', id, updates);

  return updatedTask;
}

/**
 * Toggle task completion
 */
export async function toggleTaskComplete(id: number): Promise<Task | undefined> {
  const task = await db.tasks.get(id);
  if (!task) return undefined;

  return updateTask(id, { completed: !task.completed });
}

/**
 * Delete a task and its attachments
 */
export async function deleteTask(id: number): Promise<boolean> {
  const task = await db.tasks.get(id);
  if (!task) return false;

  // Delete all attachments for this task
  await db.attachments.where('taskId').equals(id).delete();

  // Delete the task
  await db.tasks.delete(id);

  // Queue for future sync
  await queueOfflineOp('delete', 'task', id, null);

  return true;
}

/**
 * Get task count by completion status
 */
export async function getTaskCounts(): Promise<{
  total: number;
  completed: number;
  pending: number;
}> {
  const all = await db.tasks.toArray();
  const completed = all.filter((t) => t.completed).length;

  return {
    total: all.length,
    completed,
    pending: all.length - completed,
  };
}

/**
 * Queue an operation for future sync
 */
async function queueOfflineOp(
  opType: 'create' | 'update' | 'delete',
  entity: 'task' | 'attachment',
  entityId: number,
  payload: unknown
): Promise<void> {
  await db.offlineOps.add({
    opId: generateId(),
    opType,
    entity,
    entityId,
    payload,
    timestamp: new Date(),
    synced: false,
    retryCount: 0,
  });
}
