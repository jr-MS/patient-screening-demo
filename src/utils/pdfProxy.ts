/**
 * Convert Azure Blob Storage URL to local proxy URL to avoid CORS issues
 */
export const convertToProxyUrl = (blobUrl: string): string => {
  // In dev, proxy Azure Blob URLs to avoid CORS; otherwise return original
  if (!import.meta.env.DEV) {
    return blobUrl;
  }

  try {
    const url = new URL(blobUrl, window.location.origin);
    const isBlobHost = url.hostname.endsWith('.blob.core.windows.net');

    if (isBlobHost) {
      return `/api/blob${url.pathname}${url.search}`;
    }

    // Non-blob URLs (e.g., local /docs) are returned directly
    return url.href;
  } catch (error) {
    return blobUrl;
  }
};
