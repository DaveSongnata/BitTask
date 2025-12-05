import type { LinkPreviewData } from '@/types';
import { sanitizeUrl } from '@/lib/utils';

/**
 * Preview Service
 * Handles link preview generation with OpenGraph metadata
 * Note: Due to CORS, this will only work for same-origin URLs or URLs with CORS enabled
 */

/**
 * Fetch link preview data
 * Returns preview data if successful, or fallback data if CORS blocked
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreviewData> {
  const sanitized = sanitizeUrl(url);

  if (!sanitized) {
    return {
      url,
      success: false,
      error: 'Invalid URL',
    };
  }

  try {
    // Attempt to fetch the page
    // Note: This will fail for most external URLs due to CORS
    const response = await fetch(sanitized, {
      method: 'GET',
      headers: {
        Accept: 'text/html',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    return parseOpenGraph(sanitized, html);
  } catch (error) {
    // CORS blocked or network error - return fallback
    return createFallbackPreview(sanitized, error);
  }
}

/**
 * Parse OpenGraph metadata from HTML
 */
function parseOpenGraph(url: string, html: string): LinkPreviewData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const getMetaContent = (property: string): string | undefined => {
    const meta =
      doc.querySelector(`meta[property="${property}"]`) ||
      doc.querySelector(`meta[name="${property}"]`);
    return meta?.getAttribute('content') ?? undefined;
  };

  const title =
    getMetaContent('og:title') || doc.querySelector('title')?.textContent || undefined;

  const description =
    getMetaContent('og:description') ||
    getMetaContent('description') ||
    undefined;

  const image = getMetaContent('og:image');
  const siteName = getMetaContent('og:site_name');

  return {
    url,
    title,
    description,
    image,
    siteName,
    success: true,
  };
}

/**
 * Create fallback preview for CORS-blocked URLs
 */
function createFallbackPreview(url: string, error: unknown): LinkPreviewData {
  // Extract domain for display
  let domain: string;
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url;
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const isCorsError =
    errorMessage.includes('CORS') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('Failed to fetch');

  return {
    url,
    title: domain,
    description: isCorsError
      ? 'Preview unavailable due to website restrictions'
      : `Preview unavailable: ${errorMessage}`,
    success: false,
    error: isCorsError ? 'CORS_BLOCKED' : errorMessage,
  };
}

/**
 * Extract domain from URL for display
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Get favicon URL for a domain
 * Uses Google's favicon service as fallback
 */
export function getFaviconUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Use Google's favicon service (works without CORS issues)
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
  } catch {
    return '';
  }
}

/**
 * Check if a URL is likely to allow CORS
 */
export function isLikelyCorsAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Same origin
    if (parsed.origin === window.location.origin) {
      return true;
    }
    // Known APIs that allow CORS
    const corsAllowedDomains = [
      'api.github.com',
      'raw.githubusercontent.com',
      'cdn.jsdelivr.net',
      'unpkg.com',
    ];
    return corsAllowedDomains.some((domain) => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
}
