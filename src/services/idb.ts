import Dexie, { type EntityTable } from 'dexie';
import type { Task, Attachment, OfflineOp, Settings, Board, Subtask } from '@/types';

/**
 * BitTask Database
 * Dexie.js wrapper for IndexedDB with full TypeScript support
 */
class BitTaskDatabase extends Dexie {
  tasks!: EntityTable<Task, 'id'>;
  boards!: EntityTable<Board, 'id'>;
  subtasks!: EntityTable<Subtask, 'id'>;
  attachments!: EntityTable<Attachment, 'id'>;
  offlineOps!: EntityTable<OfflineOp, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor() {
    super('BitTaskDB');

    // Schema version 1
    this.version(1).stores({
      // Tasks table
      tasks: '++id, title, completed, priority, createdAt, updatedAt',

      // Attachments table
      attachments: '++id, taskId, type, createdAt',

      // Offline operations queue (for future sync)
      offlineOps: '++id, opId, opType, entity, entityId, timestamp, synced',

      // Settings (single row)
      settings: '++id',
    });

    // Schema version 2 - Add sequentialId to tasks
    this.version(2)
      .stores({
        tasks: '++id, sequentialId, title, completed, priority, createdAt, updatedAt',
        attachments: '++id, taskId, type, createdAt',
        offlineOps: '++id, opId, opType, entity, entityId, timestamp, synced',
        settings: '++id',
      })
      .upgrade(async (tx) => {
        // Migrate existing tasks: assign sequential IDs based on creation order
        const tasks = await tx.table('tasks').orderBy('createdAt').toArray();
        let nextSeqId = 1;
        for (const task of tasks) {
          await tx.table('tasks').update(task.id, { sequentialId: nextSeqId });
          nextSeqId++;
        }
      });

    // Schema version 3 - Add boards table and boardId to tasks
    this.version(3)
      .stores({
        tasks: '++id, sequentialId, boardId, title, completed, priority, createdAt, updatedAt',
        boards: '++id, name, order, createdAt',
        attachments: '++id, taskId, type, createdAt',
        offlineOps: '++id, opId, opType, entity, entityId, timestamp, synced',
        settings: '++id',
      })
      .upgrade(async (tx) => {
        // Create default board "Geral"
        const now = new Date();
        const defaultBoardId = await tx.table('boards').add({
          name: 'Geral',
          order: 0,
          createdAt: now,
          updatedAt: now,
        });

        // Assign all existing tasks to the default board
        await tx
          .table('tasks')
          .toCollection()
          .modify({ boardId: defaultBoardId });
      });

    // Schema version 4 - Add subtasks table
    this.version(4).stores({
      tasks: '++id, sequentialId, boardId, title, completed, priority, createdAt, updatedAt',
      boards: '++id, name, order, createdAt',
      subtasks: '++id, taskId, completed, order, createdAt',
      attachments: '++id, taskId, type, createdAt',
      offlineOps: '++id, opId, opType, entity, entityId, timestamp, synced',
      settings: '++id',
    });
  }
}

// Singleton instance
export const db = new BitTaskDatabase();

/**
 * Initialize database with default settings if needed
 */
export async function initializeDatabase(): Promise<void> {
  const settingsCount = await db.settings.count();

  if (settingsCount === 0) {
    await db.settings.add({
      theme: 'slso8',
      mode: 'system',
      maxFileSize: 20 * 1024 * 1024, // 20MB
      showWelcome: true,
      compressImages: true,
      imageQuality: 0.8,
    });
  }
}

/**
 * Clear all data (for testing or reset)
 */
export async function clearDatabase(): Promise<void> {
  await db.tasks.clear();
  await db.attachments.clear();
  await db.offlineOps.clear();
  // Don't clear settings
}

/**
 * Export database for backup
 */
export async function exportDatabase(): Promise<{
  tasks: Task[];
  attachments: Omit<Attachment, 'blob' | 'thumbnailBlob'>[];
  settings: Settings | undefined;
}> {
  const tasks = await db.tasks.toArray();
  const attachments = await db.attachments.toArray();
  const settings = await db.settings.toCollection().first();

  // Remove blobs from export (too large for JSON)
  const attachmentsWithoutBlobs = attachments.map(({ blob: _blob, thumbnailBlob: _thumbnailBlob, ...rest }) => rest);

  return {
    tasks,
    attachments: attachmentsWithoutBlobs,
    settings,
  };
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  taskCount: number;
  attachmentCount: number;
  pendingOpsCount: number;
}> {
  const [taskCount, attachmentCount, pendingOpsCount] = await Promise.all([
    db.tasks.count(),
    db.attachments.count(),
    db.offlineOps.where('synced').equals(0).count(),
  ]);

  return { taskCount, attachmentCount, pendingOpsCount };
}
