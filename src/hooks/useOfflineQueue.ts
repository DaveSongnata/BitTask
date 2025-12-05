import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/idb';
import type { OfflineOp } from '@/types';
import { useCallback } from 'react';

/**
 * useOfflineQueue
 * Manages offline operations queue for future synchronization
 *
 * Architecture Notes:
 * - All write operations (create/update/delete) are stored in the offlineOps table
 * - Each operation has a unique opId for deduplication
 * - Operations are marked as synced: false until successfully sent to server
 * - When sync is implemented, operations should be processed in timestamp order
 */

/**
 * Get pending (unsynced) operations count
 */
export function usePendingOpsCount(): number | undefined {
  return useLiveQuery(() => db.offlineOps.where('synced').equals(0).count());
}

/**
 * Get all pending operations
 */
export function usePendingOps(): OfflineOp[] | undefined {
  return useLiveQuery(() =>
    db.offlineOps.where('synced').equals(0).sortBy('timestamp')
  );
}

/**
 * Offline queue operations hook
 */
export function useOfflineQueueOperations() {
  /**
   * Mark an operation as synced
   */
  const markSynced = useCallback(async (id: number): Promise<void> => {
    await db.offlineOps.update(id, { synced: true });
  }, []);

  /**
   * Mark an operation as failed with error
   */
  const markFailed = useCallback(async (id: number, error: string): Promise<void> => {
    const op = await db.offlineOps.get(id);
    if (op) {
      await db.offlineOps.update(id, {
        lastError: error,
        retryCount: op.retryCount + 1,
      });
    }
  }, []);

  /**
   * Remove synced operations (cleanup)
   */
  const cleanupSynced = useCallback(async (): Promise<number> => {
    return db.offlineOps.where('synced').equals(1).delete();
  }, []);

  /**
   * Get operations ready for sync
   * Excludes operations that have failed too many times
   */
  const getReadyForSync = useCallback(async (maxRetries: number = 3): Promise<OfflineOp[]> => {
    const pending = await db.offlineOps.where('synced').equals(0).toArray();
    return pending.filter((op) => op.retryCount < maxRetries);
  }, []);

  /**
   * Reconcile conflict between local and remote state
   *
   * Strategy: Last Write Wins (default)
   * - Compares timestamps of local operation and remote state
   * - Returns 'local' if local change is newer, 'remote' otherwise
   *
   * Future improvements:
   * - Implement 3-way merge for text fields
   * - Allow user to manually resolve conflicts
   * - Field-level merge for non-conflicting changes
   *
   * @param localOp - The local operation pending sync
   * @param remoteState - The current state from server
   * @returns 'local' to keep local changes, 'remote' to accept server state
   */
  const reconcileConflict = useCallback(
    (
      localOp: OfflineOp,
      remoteState: { updatedAt?: Date } | null
    ): 'local' | 'remote' => {
      // If remote doesn't exist, local wins
      if (!remoteState) {
        return 'local';
      }

      // If remote has no timestamp, local wins
      if (!remoteState.updatedAt) {
        return 'local';
      }

      // Last Write Wins strategy
      const localTime = localOp.timestamp.getTime();
      const remoteTime = new Date(remoteState.updatedAt).getTime();

      return localTime > remoteTime ? 'local' : 'remote';
    },
    []
  );

  /**
   * Placeholder for future sync implementation
   *
   * Expected implementation:
   * 1. Get all pending operations sorted by timestamp
   * 2. For each operation:
   *    a. Send to server (POST /api/sync)
   *    b. Handle response (success/conflict/error)
   *    c. If conflict, use reconcileConflict to decide
   *    d. Mark as synced or update retry count
   * 3. Pull remote changes (GET /api/sync?since={lastSync})
   * 4. Apply remote changes to local DB
   * 5. Notify UI of sync completion
   *
   * Authentication:
   * - Use Bearer token from environment variable
   * - Token should be stored securely (not in localStorage)
   *
   * Error handling:
   * - Retry with exponential backoff
   * - Max 3 retries before marking as failed
   * - Allow manual retry of failed operations
   */
  const sync = useCallback(async (): Promise<void> => {
    console.log('[OfflineQueue] Sync not implemented - placeholder for future API integration');

    // Future implementation:
    // const operations = await getReadyForSync();
    // for (const op of operations) {
    //   try {
    //     const response = await fetch('/api/sync', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${process.env.SYNC_API_TOKEN}`,
    //       },
    //       body: JSON.stringify(op),
    //     });
    //
    //     if (response.ok) {
    //       await markSynced(op.id!);
    //     } else if (response.status === 409) {
    //       // Conflict - resolve and retry
    //       const remoteState = await response.json();
    //       const winner = reconcileConflict(op, remoteState);
    //       if (winner === 'local') {
    //         // Retry with force flag
    //       } else {
    //         // Accept remote, discard local
    //         await markSynced(op.id!);
    //       }
    //     } else {
    //       await markFailed(op.id!, `HTTP ${response.status}`);
    //     }
    //   } catch (error) {
    //     await markFailed(op.id!, error.message);
    //   }
    // }
  }, []);

  return {
    markSynced,
    markFailed,
    cleanupSynced,
    getReadyForSync,
    reconcileConflict,
    sync,
  };
}
