/**
 * Stream server configuration & utilities
 * Supports dynamic configuration via NEXT_PUBLIC_STREAM_SERVER_URL
 * and multi-source streaming (YouTube Live, Facebook Live, MediaMTX/HLS).
 */

export const DEFAULT_STREAM_SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_STREAM_SERVER_URL || "http://169.58.235.90:8080/live";

/**
 * Extracts a YouTube 11-character video ID from diverse URL formats or bare IDs:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Bare 11-char ID
 */
export function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId || !urlOrId.trim()) return null;
  const str = urlOrId.trim();

  // If already bare 11-char alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  const match = str.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Builds a clean, embedded YouTube player URL with responsive parameters
 */
export function buildYouTubeEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    origin: typeof window !== "undefined" ? window.location.origin : "https://hoithanhvn.com",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Builds an embedded Facebook video player URL
 */
export function buildFacebookEmbedUrl(videoUrl: string, autoplay = true): string {
  const encoded = encodeURIComponent(videoUrl.trim());
  return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&autoplay=${autoplay ? "true" : "false"}`;
}

export type DetectedStreamType = "youtube" | "facebook" | "hls";

/**
 * Detects the streaming source type based on URL content or preferred type
 */
export function detectStreamType(
  url?: string,
  preferredType?: string
): DetectedStreamType {
  if (preferredType === "youtube") return "youtube";
  if (preferredType === "facebook") return "facebook";
  if (preferredType === "mediamtx" || preferredType === "custom_hls") return "hls";

  if (!url || !url.trim()) return "hls";

  const lower = url.toLowerCase().trim();
  if (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    Boolean(extractYouTubeId(url))
  ) {
    return "youtube";
  }

  if (lower.includes("facebook.com") || lower.includes("fb.watch")) {
    return "facebook";
  }

  return "hls";
}

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
