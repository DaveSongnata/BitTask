import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase } from '@/services/idb';
import * as taskService from '@/services/taskService';
import * as fileService from '@/services/fileService';
import * as boardService from '@/services/boardService';
import * as subtaskService from '@/services/subtaskService';
import type {
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  Attachment,
  Settings,
  Board,
  BoardCreateInput,
  BoardUpdateInput,
  Subtask,
  SubtaskCreateInput,
  SubtaskUpdateInput,
} from '@/types';
import { useEffect, useState } from 'react';

/**
 * useIndexedDB
 * Main hook for database operations with reactive queries
 */

/**
 * Initialize database on app start
 */
export function useInitDatabase(): boolean {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeDatabase()
      .then(() => setInitialized(true))
      .catch((error: unknown) => {
        console.error('Failed to initialize database:', error);
      });
  }, []);

  return initialized;
}

/**
 * Get all tasks with live updates
 */
export function useTasks(options?: {
  completed?: boolean;
  priority?: Task['priority'];
  search?: string;
  boardId?: number;
}): Task[] | undefined {
  return useLiveQuery(
    () => taskService.getTasks(options),
    [options?.completed, options?.priority, options?.search, options?.boardId]
  );
}

/**
 * Get a single task with live updates
 */
export function useTask(id: number | undefined): Task | undefined {
  return useLiveQuery(() => (id ? taskService.getTask(id) : undefined), [id]);
}

/**
 * Get task counts with live updates
 */
export function useTaskCounts(): { total: number; completed: number; pending: number } | undefined {
  return useLiveQuery(() => taskService.getTaskCounts());
}

/**
 * Get attachments for a task with live updates
 */
export function useTaskAttachments(taskId: number | undefined): Attachment[] | undefined {
  return useLiveQuery(
    () => (taskId ? fileService.getTaskAttachments(taskId) : []),
    [taskId]
  );
}

/**
 * Get settings with live updates
 */
export function useSettings(): Settings | undefined {
  return useLiveQuery(() => db.settings.toCollection().first());
}

/**
 * Task operations hook
 */
export function useTaskOperations() {
  return {
    createTask: async (input: TaskCreateInput): Promise<Task> => {
      return taskService.createTask(input);
    },

    updateTask: async (id: number, updates: TaskUpdateInput): Promise<Task | undefined> => {
      return taskService.updateTask(id, updates);
    },

    deleteTask: async (id: number): Promise<boolean> => {
      return taskService.deleteTask(id);
    },

    toggleComplete: async (id: number): Promise<Task | undefined> => {
      return taskService.toggleTaskComplete(id);
    },
  };
}

/**
 * Attachment operations hook
 */
export function useAttachmentOperations() {
  return {
    createAttachment: async (
      taskId: number,
      file: File,
      compress?: boolean
    ): Promise<Attachment> => {
      return fileService.createAttachment(taskId, file, compress);
    },

    createLinkAttachment: async (
      taskId: number,
      url: string,
      metadata?: Attachment['metadata']
    ): Promise<Attachment> => {
      return fileService.createLinkAttachment(taskId, url, metadata);
    },

    deleteAttachment: async (id: number): Promise<boolean> => {
      return fileService.deleteAttachment(id);
    },

    validateFile: (file: File, maxSize?: number) => {
      return fileService.validateFile(file, maxSize);
    },
  };
}

/**
 * Settings operations hook
 */
export function useSettingsOperations() {
  return {
    updateSettings: async (updates: Partial<Settings>): Promise<void> => {
      const current = await db.settings.toCollection().first();
      if (current?.id !== undefined) {
        await db.settings.update(current.id, updates);
      }
    },
  };
}

// ============================================
// Board Hooks
// ============================================

/**
 * Get all boards with live updates
 */
export function useBoards(): Board[] | undefined {
  return useLiveQuery(() => boardService.getAllBoards());
}

/**
 * Get a single board with live updates
 */
export function useBoard(id: number | undefined): Board | undefined {
  return useLiveQuery(() => (id ? boardService.getBoard(id) : undefined), [id]);
}

/**
 * Get the first board (for default selection)
 */
export function useFirstBoard(): Board | undefined {
  return useLiveQuery(() => boardService.getFirstBoard());
}

/**
 * Board operations hook
 */
export function useBoardOperations() {
  return {
    createBoard: async (input: BoardCreateInput): Promise<Board> => {
      return boardService.createBoard(input);
    },

    updateBoard: async (id: number, updates: BoardUpdateInput): Promise<Board | undefined> => {
      return boardService.updateBoard(id, updates);
    },

    deleteBoard: async (id: number): Promise<boolean> => {
      return boardService.deleteBoard(id);
    },

    reorderBoards: async (orderedIds: number[]): Promise<void> => {
      return boardService.reorderBoards(orderedIds);
    },

    ensureDefaultBoard: async (): Promise<Board> => {
      return boardService.ensureDefaultBoard();
    },
  };
}

// ============================================
// Subtask Hooks
// ============================================

/**
 * Get all subtasks for a task with live updates
 */
export function useSubtasks(taskId: number | undefined): Subtask[] | undefined {
  return useLiveQuery(
    () => (taskId ? subtaskService.getSubtasksByTaskId(taskId) : []),
    [taskId]
  );
}

/**
 * Get subtask counts for a task with live updates
 */
export function useSubtaskCounts(
  taskId: number | undefined
): { total: number; completed: number } | undefined {
  return useLiveQuery(
    () => (taskId ? subtaskService.getSubtaskCounts(taskId) : { total: 0, completed: 0 }),
    [taskId]
  );
}

/**
 * Subtask operations hook
 */
export function useSubtaskOperations() {
  return {
    createSubtask: async (input: Omit<SubtaskCreateInput, 'order'>): Promise<Subtask> => {
      const order = await subtaskService.getNextSubtaskOrder(input.taskId);
      return subtaskService.createSubtask({ ...input, order });
    },

    updateSubtask: async (id: number, updates: SubtaskUpdateInput): Promise<Subtask | undefined> => {
      return subtaskService.updateSubtask(id, updates);
    },

    deleteSubtask: async (id: number): Promise<boolean> => {
      return subtaskService.deleteSubtask(id);
    },

    toggleComplete: async (id: number): Promise<Subtask | undefined> => {
      return subtaskService.toggleSubtaskComplete(id);
    },

    reorderSubtasks: async (taskId: number, subtaskIds: number[]): Promise<void> => {
      return subtaskService.reorderSubtasks(taskId, subtaskIds);
    },
  };
}
