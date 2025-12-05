/**
 * BitTask Type Definitions
 * Central type definitions for the application
 */

// ============================================
// Board Types
// ============================================

export interface Board {
  id?: number;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type BoardCreateInput = Omit<Board, 'id' | 'createdAt' | 'updatedAt'>;
export type BoardUpdateInput = Partial<Omit<Board, 'id' | 'createdAt'>>;

// ============================================
// Task Types
// ============================================

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id?: number;
  sequentialId: number; // Auto-generated sequential ID for citation (#42)
  boardId: number; // Every task belongs to a board
  title: string;
  description?: string;
  tags: string[];
  priority: TaskPriority;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskCreateInput = Omit<Task, 'id' | 'sequentialId' | 'createdAt' | 'updatedAt'>;
export type TaskUpdateInput = Partial<Omit<Task, 'id' | 'sequentialId' | 'createdAt'>>;

// ============================================
// Subtask Types
// ============================================

export interface Subtask {
  id?: number;
  taskId: number;
  title: string;
  completed: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SubtaskCreateInput = Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>;
export type SubtaskUpdateInput = Partial<Omit<Subtask, 'id' | 'taskId' | 'createdAt'>>;

// ============================================
// Attachment Types
// ============================================

export type AttachmentType = 'image' | 'audio' | 'pdf' | 'link';

export interface Attachment {
  id?: number;
  taskId: number;
  type: AttachmentType;
  filename: string;
  mimeType: string;
  size: number;
  blob?: Blob;
  url?: string; // For links
  metadata?: AttachmentMetadata;
  thumbnailBlob?: Blob;
  createdAt: Date;
}

export interface AttachmentMetadata {
  // Image metadata
  width?: number;
  height?: number;
  // Audio metadata
  duration?: number;
  // PDF metadata
  pageCount?: number;
  // Link metadata (OpenGraph)
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogSiteName?: string;
}

export type AttachmentCreateInput = Omit<Attachment, 'id' | 'createdAt'>;

// ============================================
// Offline Operation Types (for future sync)
// ============================================

export type OfflineOpType = 'create' | 'update' | 'delete';
export type OfflineOpEntity = 'task' | 'attachment';

export interface OfflineOp {
  id?: number;
  opId: string; // Unique operation ID for deduplication
  opType: OfflineOpType;
  entity: OfflineOpEntity;
  entityId: number;
  payload: unknown;
  timestamp: Date;
  synced: boolean;
  retryCount: number;
  lastError?: string;
}

// ============================================
// Settings Types
// ============================================

export type ThemeName = 'slso8' | 'original';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Settings {
  id?: number;
  theme: ThemeName;
  mode: ThemeMode;
  maxFileSize: number; // in bytes, default 20MB
  showWelcome: boolean;
  compressImages: boolean;
  imageQuality: number; // 0.1 to 1
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'slso8',
  mode: 'system',
  maxFileSize: 20 * 1024 * 1024, // 20MB
  showWelcome: true,
  compressImages: true,
  imageQuality: 0.8,
};

// ============================================
// UI Types
// ============================================

export interface PixelButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface PixelInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
  maxLength?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export interface PixelModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

// ============================================
// PWA Types
// ============================================

export interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

export interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ============================================
// File Service Types
// ============================================

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================
// Preview Service Types
// ============================================

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  success: boolean;
  error?: string;
}
