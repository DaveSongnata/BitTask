import Dexie, { type EntityTable } from 'dexie';
import type { Task, Attachment, OfflineOp, Settings } from '@/types';

/**
 * BitTask Database
 * Dexie.js wrapper for IndexedDB with full TypeScript support
 */
class BitTaskDatabase extends Dexie {
  tasks!: EntityTable<Task, 'id'>;
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
