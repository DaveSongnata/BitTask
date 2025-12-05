import { db } from './idb';
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types';
import { generateId } from '@/lib/utils';

/**
 * Task Service
 * CRUD operations for tasks with offline queue support
 */

/**
 * Create a new task
 */
export async function createTask(input: TaskCreateInput): Promise<Task> {
  const now = new Date();

  const task: Omit<Task, 'id'> = {
    ...input,
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
}): Promise<Task[]> {
  let collection = db.tasks.orderBy('createdAt').reverse();

  if (options?.completed !== undefined) {
    collection = db.tasks
      .where('completed')
      .equals(options.completed ? 1 : 0)
      .reverse();
  }

  let tasks = await collection.toArray();

  // Filter by priority if specified
  if (options?.priority) {
    tasks = tasks.filter((t) => t.priority === options.priority);
  }

  // Filter by search term
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
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
