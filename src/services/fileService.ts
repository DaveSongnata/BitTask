import { db } from './idb';
import type {
  Attachment,
  AttachmentType,
  CompressionOptions,
  FileValidationResult,
} from '@/types';
import { generateId } from '@/lib/utils';

// Allowed MIME types
const ALLOWED_MIME_TYPES: Record<AttachmentType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'],
  pdf: ['application/pdf'],
  link: [], // Links don't have MIME types
};

// Default compression options
const DEFAULT_COMPRESSION: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'webp',
};

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  maxSize: number = 20 * 1024 * 1024
): FileValidationResult {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${Math.round(maxSize / 1024 / 1024)}MB)`,
    };
  }

  // Check MIME type
  const type = getAttachmentType(file.type);
  if (!type) {
    return {
      valid: false,
      error: 'File type not supported',
    };
  }

  return { valid: true };
}

/**
 * Get attachment type from MIME type
 */
export function getAttachmentType(mimeType: string): AttachmentType | null {
  for (const [type, mimes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimes.includes(mimeType)) {
      return type as AttachmentType;
    }
  }
  return null;
}

/**
 * Compress an image using canvas
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = DEFAULT_COMPRESSION
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions
      let { width, height } = img;
      const maxWidth = options.maxWidth ?? DEFAULT_COMPRESSION.maxWidth!;
      const maxHeight = options.maxHeight ?? DEFAULT_COMPRESSION.maxHeight!;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Create canvas and draw
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      const format = options.format ?? DEFAULT_COMPRESSION.format!;
      const quality = options.quality ?? DEFAULT_COMPRESSION.quality!;
      const mimeType = format === 'webp' ? 'image/webp' : `image/${format}`;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Create thumbnail for an image
 */
export async function createThumbnail(blob: Blob, size: number = 150): Promise<Blob> {
  return compressImage(new File([blob], 'thumbnail'), {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'webp',
  });
}

/**
 * Create an attachment
 */
export async function createAttachment(
  taskId: number,
  file: File,
  compress: boolean = true
): Promise<Attachment> {
  const type = getAttachmentType(file.type);
  if (!type) {
    throw new Error('Unsupported file type');
  }

  let blob: Blob = file;
  let thumbnailBlob: Blob | undefined;

  // Compress images if enabled
  if (type === 'image' && compress) {
    blob = await compressImage(file);
    thumbnailBlob = await createThumbnail(blob);
  }

  const now = new Date();
  const attachmentData: Omit<Attachment, 'id'> = {
    taskId,
    type,
    filename: file.name,
    mimeType: file.type,
    size: blob.size,
    blob,
    thumbnailBlob,
    createdAt: now,
  };

  const id = await db.attachments.add(attachmentData as Attachment) as number;

  // Queue for sync
  await db.offlineOps.add({
    opId: generateId(),
    opType: 'create',
    entity: 'attachment',
    entityId: id,
    payload: { taskId, filename: file.name, type, size: blob.size },
    timestamp: now,
    synced: false,
    retryCount: 0,
  });

  return { ...attachmentData, id };
}

/**
 * Create a link attachment
 */
export async function createLinkAttachment(
  taskId: number,
  url: string,
  metadata?: Attachment['metadata']
): Promise<Attachment> {
  const now = new Date();
  const attachmentData: Omit<Attachment, 'id'> = {
    taskId,
    type: 'link',
    filename: url,
    mimeType: 'text/uri-list',
    size: url.length,
    url,
    metadata,
    createdAt: now,
  };

  const id = await db.attachments.add(attachmentData as Attachment);

  return { ...attachmentData, id };
}

/**
 * Get attachment by ID
 */
export async function getAttachment(id: number): Promise<Attachment | undefined> {
  return db.attachments.get(id);
}

/**
 * Get all attachments for a task
 */
export async function getTaskAttachments(taskId: number): Promise<Attachment[]> {
  return db.attachments.where('taskId').equals(taskId).toArray();
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(id: number): Promise<boolean> {
  const attachment = await db.attachments.get(id);
  if (!attachment) return false;

  await db.attachments.delete(id);

  // Queue for sync
  await db.offlineOps.add({
    opId: generateId(),
    opType: 'delete',
    entity: 'attachment',
    entityId: id,
    payload: null,
    timestamp: new Date(),
    synced: false,
    retryCount: 0,
  });

  return true;
}

/**
 * Create object URL for a blob attachment
 * Remember to revoke when done!
 */
export function createObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke object URL to free memory
 */
export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Get attachment count for a task
 */
export async function getAttachmentCount(taskId: number): Promise<number> {
  return db.attachments.where('taskId').equals(taskId).count();
}
