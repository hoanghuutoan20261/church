/**
 * Google Maps link generator for Church addresses
 * Supports custom Google Map URL, directions URL, and fallback search query
 */

export function getChurchGoogleMapsUrl(
  address?: string,
  churchName?: string,
  customMapUrl?: string
): string {
  if (customMapUrl && customMapUrl.trim().startsWith("http")) {
    return customMapUrl.trim();
  }

  const cleanAddress = address?.trim() || "";
  const cleanName = churchName?.trim() || "";

  // Combine church name & address for optimal Google Maps search accuracy
  const query = [cleanName, cleanAddress].filter(Boolean).join(", ");

  if (!query) {
    return "https://www.google.com/maps";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getChurchDirectionsUrl(
  address?: string,
  churchName?: string,
  customMapUrl?: string
): string {
  if (customMapUrl && customMapUrl.trim().startsWith("http")) {
    return customMapUrl.trim();
  }

  const cleanAddress = address?.trim() || "";
  const cleanName = churchName?.trim() || "";
  const destination = [cleanName, cleanAddress].filter(Boolean).join(", ");

  if (!destination) {
    return "https://www.google.com/maps";
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
