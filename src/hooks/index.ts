/**
 * Hooks Index
 * Export all custom hooks
 */

export { ThemeProvider, useTheme } from './useTheme';
export {
  useInitDatabase,
  useTasks,
  useTask,
  useTaskCounts,
  useTaskAttachments,
  useSettings,
  useTaskOperations,
  useAttachmentOperations,
  useSettingsOperations,
  useBoards,
  useBoard,
  useFirstBoard,
  useBoardOperations,
  useSubtasks,
  useSubtaskCounts,
  useSubtaskOperations,
} from './useIndexedDB';
export { usePendingOpsCount, usePendingOps, useOfflineQueueOperations } from './useOfflineQueue';
export { usePWAStatus } from './usePWAStatus';
export { useSafeArea, useHasNotch, useIsLandscape } from './useSafeArea';
export {
  useFilePreview,
  useThumbnailPreview,
  useLinkPreview,
  useMultipleFilePreview,
} from './useFilePreview';
