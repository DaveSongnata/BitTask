import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskOperations, useInitDatabase } from '@/hooks/useIndexedDB';
import type { Task } from '@/types';
import { db, clearDatabase } from '@/services/idb';

describe('useIndexedDB', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('useInitDatabase', () => {
    it('should initialize database', async () => {
      const { result } = renderHook(() => useInitDatabase());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  describe('useTaskOperations', () => {
    it('should create a task', async () => {
      const { result } = renderHook(() => useTaskOperations());

      let task: Task | undefined;
      await act(async () => {
        task = await result.current.createTask({
          title: 'Test Task',
          description: 'Test Description',
          priority: 'medium',
          tags: ['test'],
          completed: false,
          boardId: 1,
        });
      });

      expect(task).toBeDefined();
      expect(task?.title).toBe('Test Task');
      expect(task?.id).toBeDefined();
    });

    it('should update a task', async () => {
      const { result } = renderHook(() => useTaskOperations());

      let task: Task | undefined;
      await act(async () => {
        task = await result.current.createTask({
          title: 'Original Title',
          priority: 'low',
          tags: [],
          completed: false,
          boardId: 1,
        });
      });

      await act(async () => {
        task = await result.current.updateTask(task!.id!, {
          title: 'Updated Title',
        });
      });

      expect(task?.title).toBe('Updated Title');
    });

    it('should toggle task completion', async () => {
      const { result } = renderHook(() => useTaskOperations());

      let task: Task | undefined;
      await act(async () => {
        task = await result.current.createTask({
          title: 'Toggle Test',
          priority: 'medium',
          tags: [],
          completed: false,
          boardId: 1,
        });
      });

      expect(task?.completed).toBe(false);

      await act(async () => {
        task = await result.current.toggleComplete(task!.id!);
      });

      expect(task?.completed).toBe(true);
    });

    it('should delete a task', async () => {
      const { result } = renderHook(() => useTaskOperations());

      let task: Task | undefined;
      await act(async () => {
        task = await result.current.createTask({
          title: 'Delete Test',
          priority: 'high',
          tags: [],
          completed: false,
          boardId: 1,
        });
      });

      let deleted: boolean | undefined;
      await act(async () => {
        deleted = await result.current.deleteTask(task!.id!);
      });

      expect(deleted).toBe(true);

      const found = await db.tasks.get(task!.id);
      expect(found).toBeUndefined();
    });
  });
});
