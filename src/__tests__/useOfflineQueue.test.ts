import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineQueueOperations } from '@/hooks/useOfflineQueue';
import { useTaskOperations } from '@/hooks/useIndexedDB';
import { db, clearDatabase } from '@/services/idb';
import type { OfflineOp, Task } from '@/types';

describe('useOfflineQueue', () => {
  beforeEach(async () => {
    await clearDatabase();
    await db.offlineOps.clear();
  });

  describe('Offline operations are queued', () => {
    it('should queue operation when creating task', async () => {
      const { result: taskOps } = renderHook(() => useTaskOperations());

      await act(async () => {
        await taskOps.current.createTask({
          title: 'Queued Task',
          priority: 'medium',
          tags: [],
          completed: false,
          boardId: 1,
        });
      });

      const ops = await db.offlineOps.toArray();
      expect(ops.length).toBe(1);
      expect(ops[0]?.opType).toBe('create');
      expect(ops[0]?.entity).toBe('task');
      expect(ops[0]?.synced).toBe(false);
    });

    it('should queue operation when updating task', async () => {
      const { result: taskOps } = renderHook(() => useTaskOperations());

      let task: Task | undefined;
      await act(async () => {
        task = await taskOps.current.createTask({
          title: 'Update Queue Test',
          priority: 'low',
          tags: [],
          completed: false,
          boardId: 1,
        });
      });

      await act(async () => {
        await taskOps.current.updateTask(task!.id!, { title: 'Updated' });
      });

      const ops = await db.offlineOps.toArray();
      expect(ops.length).toBe(2);
      expect(ops[1]?.opType).toBe('update');
    });

    it('should queue operation when deleting task', async () => {
      const { result: taskOps } = renderHook(() => useTaskOperations());

      let task: Task | undefined;
      await act(async () => {
        task = await taskOps.current.createTask({
          title: 'Delete Queue Test',
          priority: 'high',
          tags: [],
          completed: false,
          boardId: 1,
        });
      });

      await act(async () => {
        await taskOps.current.deleteTask(task!.id!);
      });

      const ops = await db.offlineOps.toArray();
      const deleteOp = ops.find((op) => op.opType === 'delete');
      expect(deleteOp).toBeDefined();
    });
  });

  describe('useOfflineQueueOperations', () => {
    it('should mark operation as synced', async () => {
      // Create a test operation
      const opId = await db.offlineOps.add({
        opId: 'test-op-1',
        opType: 'create',
        entity: 'task',
        entityId: 1,
        payload: {},
        timestamp: new Date(),
        synced: false,
        retryCount: 0,
      });

      const { result } = renderHook(() => useOfflineQueueOperations());

      await act(async () => {
        await result.current.markSynced(opId as number);
      });

      const op = await db.offlineOps.get(opId as number);
      expect(op?.synced).toBe(true);
    });

    it('should mark operation as failed', async () => {
      const opId = await db.offlineOps.add({
        opId: 'test-op-2',
        opType: 'update',
        entity: 'task',
        entityId: 2,
        payload: {},
        timestamp: new Date(),
        synced: false,
        retryCount: 0,
      });

      const { result } = renderHook(() => useOfflineQueueOperations());

      await act(async () => {
        await result.current.markFailed(opId as number, 'Network error');
      });

      const op = await db.offlineOps.get(opId as number);
      expect(op?.lastError).toBe('Network error');
      expect(op?.retryCount).toBe(1);
    });

    it('should cleanup synced operations', async () => {
      // Add synced and unsynced operations
      await db.offlineOps.add({
        opId: 'synced-1',
        opType: 'create',
        entity: 'task',
        entityId: 1,
        payload: {},
        timestamp: new Date(),
        synced: true,
        retryCount: 0,
      });

      await db.offlineOps.add({
        opId: 'unsynced-1',
        opType: 'create',
        entity: 'task',
        entityId: 2,
        payload: {},
        timestamp: new Date(),
        synced: false,
        retryCount: 0,
      });

      const { result } = renderHook(() => useOfflineQueueOperations());

      let deletedCount;
      await act(async () => {
        deletedCount = await result.current.cleanupSynced();
      });

      expect(deletedCount).toBe(1);

      const remaining = await db.offlineOps.toArray();
      expect(remaining.length).toBe(1);
      expect(remaining[0]?.synced).toBe(false);
    });

    it('should reconcile conflicts using lastModifiedWins', () => {
      const { result } = renderHook(() => useOfflineQueueOperations());

      const localOp: OfflineOp = {
        id: 1,
        opId: 'local-1',
        opType: 'update',
        entity: 'task',
        entityId: 1,
        payload: {},
        timestamp: new Date('2024-01-02'),
        synced: false,
        retryCount: 0,
      };

      // Remote is older - local should win
      const olderRemote = { updatedAt: new Date('2024-01-01') };
      expect(result.current.reconcileConflict(localOp, olderRemote)).toBe('local');

      // Remote is newer - remote should win
      const newerRemote = { updatedAt: new Date('2024-01-03') };
      expect(result.current.reconcileConflict(localOp, newerRemote)).toBe('remote');

      // No remote - local wins
      expect(result.current.reconcileConflict(localOp, null)).toBe('local');
    });

    it('should get operations ready for sync', async () => {
      // Add operations with different retry counts
      await db.offlineOps.add({
        opId: 'retry-0',
        opType: 'create',
        entity: 'task',
        entityId: 1,
        payload: {},
        timestamp: new Date(),
        synced: false,
        retryCount: 0,
      });

      await db.offlineOps.add({
        opId: 'retry-5',
        opType: 'update',
        entity: 'task',
        entityId: 2,
        payload: {},
        timestamp: new Date(),
        synced: false,
        retryCount: 5,
      });

      const { result } = renderHook(() => useOfflineQueueOperations());

      let ready: OfflineOp[] | undefined;
      await act(async () => {
        ready = await result.current.getReadyForSync(3);
      });

      expect(ready?.length).toBe(1);
      expect(ready?.[0]?.opId).toBe('retry-0');
    });
  });
});
