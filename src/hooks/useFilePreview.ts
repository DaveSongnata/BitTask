import { useState, useEffect, useCallback } from 'react';
import { createObjectURL, revokeObjectURL } from '@/services/fileService';
import { fetchLinkPreview, getFaviconUrl, extractDomain } from '@/services/previewService';
import type { Attachment, LinkPreviewData } from '@/types';

/**
 * useFilePreview
 * Manages object URLs for file attachments with automatic cleanup
 */
export function useFilePreview(attachment: Attachment | undefined): {
  previewUrl: string | null;
  isLoading: boolean;
  error: string | null;
} {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attachment) {
      setPreviewUrl(null);
      return;
    }

    // For links, use the URL directly
    if (attachment.type === 'link' && attachment.url) {
      setPreviewUrl(attachment.url);
      return;
    }

    // For blob attachments, create object URL
    if (attachment.blob) {
      setIsLoading(true);
      const url = createObjectURL(attachment.blob);
      setPreviewUrl(url);
      setIsLoading(false);

      // Cleanup on unmount or when attachment changes
      return () => {
        revokeObjectURL(url);
      };
    }

    setError('No preview available');
  }, [attachment]);

  return { previewUrl, isLoading, error };
}

/**
 * useThumbnailPreview
 * Uses thumbnail blob if available, falls back to full blob
 */
export function useThumbnailPreview(attachment: Attachment | undefined): string | null {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!attachment) {
      setThumbnailUrl(null);
      return;
    }

    // Use thumbnail if available
    const blob = attachment.thumbnailBlob ?? attachment.blob;
    if (blob) {
      const url = createObjectURL(blob);
      setThumbnailUrl(url);

      return () => {
        revokeObjectURL(url);
      };
    }
  }, [attachment]);

  return thumbnailUrl;
}

/**
 * useLinkPreview
 * Fetches and caches link preview data
 */
export function useLinkPreview(url: string | undefined): {
  preview: LinkPreviewData | null;
  isLoading: boolean;
  favicon: string;
  domain: string;
  refetch: () => void;
} {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPreview = useCallback(async () => {
    if (!url) {
      setPreview(null);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchLinkPreview(url);
      setPreview(data);
    } catch (error) {
      setPreview({
        url,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch preview',
      });
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void fetchPreview();
  }, [fetchPreview]);

  return {
    preview,
    isLoading,
    favicon: url ? getFaviconUrl(url) : '',
    domain: url ? extractDomain(url) : '',
    refetch: () => void fetchPreview(),
  };
}

/**
 * useMultipleFilePreview
 * Manages object URLs for multiple attachments
 */
export function useMultipleFilePreview(
  attachments: Attachment[]
): Map<number, string> {
  const [urlMap, setUrlMap] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const newMap = new Map<number, string>();

    for (const attachment of attachments) {
      if (attachment.id === undefined) continue;

      if (attachment.type === 'link' && attachment.url) {
        newMap.set(attachment.id, attachment.url);
      } else if (attachment.thumbnailBlob ?? attachment.blob) {
        const blob = attachment.thumbnailBlob ?? attachment.blob;
        if (blob) {
          newMap.set(attachment.id, createObjectURL(blob));
        }
      }
    }

    setUrlMap(newMap);

    // Cleanup old URLs
    return () => {
      for (const url of newMap.values()) {
        if (url.startsWith('blob:')) {
          revokeObjectURL(url);
        }
      }
    };
  }, [attachments]);

  return urlMap;
}
