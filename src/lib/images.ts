/**
 * Utility to optimize images using the images-processor dynamic URL parameters.
 */

interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
}

/**
 * Transforms a raw image URL from our processor into an optimized version.
 * Works with the format: http://localhost:4200/img/{id}
 */
export function getOptimizedImageUrl(url: string | undefined, options: OptimizeOptions = {}): string {
  if (!url) return "";

  // If the URL already contains query parameters, or isn't from our processor, return as is
  // (Assuming our internal URLs start with /img/ or the localhost:4200/img/ prefix)
  if (!url.includes("/img/")) return url;

  const { width, height, quality, format } = options;
  const params = new URLSearchParams();

  if (width) params.append("w", width.toString());
  if (height) params.append("h", height.toString());
  if (quality) params.append("q", quality.toString());
  if (format) params.append("fmt", format);

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Common presets for UI components
 */
export const IMAGE_PRESETS = {
  THUMBNAIL_SM: { width: 80, height: 80, quality: 70, format: 'webp' } as OptimizeOptions,
  THUMBNAIL_MD: { width: 200, height: 200, quality: 80, format: 'webp' } as OptimizeOptions,
  PREVIEW_LG: { width: 600, height: 600, quality: 85, format: 'webp' } as OptimizeOptions,
  LOGO: { width: 150, height: 150, quality: 90, format: 'webp' } as OptimizeOptions,
};
