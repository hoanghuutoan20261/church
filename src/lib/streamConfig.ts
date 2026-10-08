/**
 * Stream server configuration & utilities
 * Supports dynamic configuration via NEXT_PUBLIC_STREAM_SERVER_URL
 */

export const DEFAULT_STREAM_SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_STREAM_SERVER_URL || "http://169.58.235.90:8080/live";

/**
 * Builds the HLS stream playback URL for a given church streamKey.
 * If streamKey is not provided, returns fallbackUrl or empty string.
 */
export function buildHlsStreamUrl(
  streamKey?: string,
  fallbackUrl?: string
): string {
  if (!streamKey || !streamKey.trim()) {
    return fallbackUrl || "";
  }

  const rawBase =
    process.env.NEXT_PUBLIC_STREAM_SERVER_URL || DEFAULT_STREAM_SERVER_BASE_URL;
  const cleanBase = rawBase.replace(/\/+$/, "");

  return `${cleanBase}/${encodeURIComponent(streamKey.trim())}.m3u8`;
}
