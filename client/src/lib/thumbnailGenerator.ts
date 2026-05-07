/**
 * Thumbnail Generator Utility
 * Generates and caches model thumbnails for library display
 */

const THUMBNAIL_CACHE_KEY = 'crg_thumbnail_cache';
const THUMBNAIL_SIZE = 256;

export interface ThumbnailCache {
  [modelId: string]: {
    data: string; // Base64 encoded image
    timestamp: number;
  };
}

/**
 * Get thumbnail cache from localStorage
 */
function getThumbnailCache(): ThumbnailCache {
  try {
    const data = localStorage.getItem(THUMBNAIL_CACHE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Save thumbnail to cache
 */
function saveThumbnailToCache(modelId: string, imageData: string): void {
  try {
    const cache = getThumbnailCache();
    cache[modelId] = {
      data: imageData,
      timestamp: Date.now(),
    };
    localStorage.setItem(THUMBNAIL_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to cache thumbnail:', error);
  }
}

/**
 * Get cached thumbnail
 */
export function getCachedThumbnail(modelId: string): string | null {
  const cache = getThumbnailCache();
  return cache[modelId]?.data || null;
}

/**
 * Generate thumbnail from Three.js scene
 */
export async function generateThumbnail(
  scene: any,
  camera: any,
  renderer: any,
  modelId: string
): Promise<string | null> {
  try {
    // Check cache first
    const cached = getCachedThumbnail(modelId);
    if (cached) {
      return cached;
    }

    // Store original renderer size
    const originalSize = renderer.getSize(new (window as any).__THREE__.Vector2());

    // Set thumbnail size
    renderer.setSize(THUMBNAIL_SIZE, THUMBNAIL_SIZE);

    // Render scene
    renderer.render(scene, camera);

    // Get canvas data
    const canvas = renderer.domElement as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/png', 0.8);

    // Restore original size
    renderer.setSize(originalSize.width, originalSize.height);

    // Cache the thumbnail
    saveThumbnailToCache(modelId, imageData);

    return imageData;
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    return null;
  }
}

/**
 * Generate thumbnail from canvas
 */
export function generateThumbnailFromCanvas(
  canvas: HTMLCanvasElement,
  modelId: string
): string | null {
  try {
    // Check cache first
    const cached = getCachedThumbnail(modelId);
    if (cached) {
      return cached;
    }

    // Create temporary canvas for resizing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = THUMBNAIL_SIZE;
    tempCanvas.height = THUMBNAIL_SIZE;

    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return null;

    // Draw and resize
    ctx.drawImage(canvas, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

    const imageData = tempCanvas.toDataURL('image/png', 0.8);

    // Cache the thumbnail
    saveThumbnailToCache(modelId, imageData);

    return imageData;
  } catch (error) {
    console.error('Failed to generate thumbnail from canvas:', error);
    return null;
  }
}

/**
 * Clear thumbnail cache
 */
export function clearThumbnailCache(): void {
  try {
    localStorage.removeItem(THUMBNAIL_CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear thumbnail cache:', error);
  }
}

/**
 * Clear specific thumbnail from cache
 */
export function clearThumbnail(modelId: string): void {
  try {
    const cache = getThumbnailCache();
    delete cache[modelId];
    localStorage.setItem(THUMBNAIL_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to clear thumbnail:', error);
  }
}

/**
 * Get cache statistics
 */
export function getThumbnailCacheStats(): {
  count: number;
  size: number;
  oldestTimestamp?: number;
  newestTimestamp?: number;
} {
  const cache = getThumbnailCache();
  const entries = Object.values(cache);

  if (entries.length === 0) {
    return { count: 0, size: 0 };
  }

  const timestamps = entries.map((e) => e.timestamp);

  return {
    count: entries.length,
    size: entries.reduce((sum, e) => sum + e.data.length, 0),
    oldestTimestamp: Math.min(...timestamps),
    newestTimestamp: Math.max(...timestamps),
  };
}

/**
 * Clean up old thumbnails (older than 30 days)
 */
export function cleanupOldThumbnails(daysOld: number = 30): number {
  try {
    const cache = getThumbnailCache();
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    let removed = 0;
    Object.keys(cache).forEach((modelId) => {
      if (cache[modelId].timestamp < cutoffTime) {
        delete cache[modelId];
        removed++;
      }
    });

    if (removed > 0) {
      localStorage.setItem(THUMBNAIL_CACHE_KEY, JSON.stringify(cache));
    }

    return removed;
  } catch (error) {
    console.warn('Failed to cleanup thumbnails:', error);
    return 0;
  }
}

/**
 * Generate placeholder thumbnail (gradient)
 */
export function generatePlaceholderThumbnail(color: string = '#dc2626'): string {
  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL_SIZE;
  canvas.height = THUMBNAIL_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, '#1f2937');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

  // Add text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('3D Model', THUMBNAIL_SIZE / 2, THUMBNAIL_SIZE / 2);

  return canvas.toDataURL('image/png', 0.8);
}

/**
 * Format cache size for display
 */
export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
