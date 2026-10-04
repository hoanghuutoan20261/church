/**
 * Helper to generate simple, dignified, and sacred default avatars for Protestant Churches.
 * Used automatically for any church until they upload their own custom logo/avatar.
 */

interface ChurchColorPalette {
  bg1: string;
  bg2: string;
  gold1: string;
  gold2: string;
  accent: string;
}

const PALETTES: Record<string, ChurchColorPalette> = {
  lamson: {
    bg1: "#0f172a",
    bg2: "#1e293b",
    gold1: "#fde68a",
    gold2: "#d97706",
    accent: "#fbbf24",
  }, // Deep Navy
  susong: {
    bg1: "#062c1d",
    bg2: "#0e432f",
    gold1: "#fef08a",
    gold2: "#b45309",
    accent: "#f59e0b",
  }, // Forest Emerald
  timothe: {
    bg1: "#1e1b4b",
    bg2: "#31104b",
    gold1: "#fdf4dc",
    gold2: "#d4af37",
    accent: "#eab308",
  }, // Royal Indigo
  emmanuel: {
    bg1: "#370b18",
    bg2: "#4a0e22",
    gold1: "#fef3c7",
    gold2: "#c2410c",
    accent: "#f59e0b",
  }, // Warm Burgundy
  hanoi: {
    bg1: "#141416",
    bg2: "#27272a",
    gold1: "#fffbeb",
    gold2: "#b45309",
    accent: "#d4af37",
  }, // Sanctuary Charcoal
  andien: {
    bg1: "#082f49",
    bg2: "#0e4a6e",
    gold1: "#fef9c3",
    gold2: "#ca8a04",
    accent: "#eab308",
  }, // Ocean Teal
};

const DEFAULT_PALETTES: ChurchColorPalette[] = Object.values(PALETTES);

function getChurchPalette(slug = "", name = ""): ChurchColorPalette {
  const s = slug.toLowerCase();
  if (s.includes("lamson")) return PALETTES.lamson;
  if (s.includes("loibansusong") || s.includes("susong")) return PALETTES.susong;
  if (s.includes("timothe")) return PALETTES.timothe;
  if (s.includes("emmanuel")) return PALETTES.emmanuel;
  if (s.includes("hanoi")) return PALETTES.hanoi;
  if (s.includes("andien")) return PALETTES.andien;

  let hash = 0;
  const str = s || name;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_PALETTES[Math.abs(hash) % DEFAULT_PALETTES.length];
}

function parseChurchBadge(name = "", slug = ""): { initials: string; shortName: string } {
  const s = (slug || "").toLowerCase();
  if (s.includes("lamson")) return { initials: "LS", shortName: "LAM SƠN" };
  if (s.includes("loibansusong") || s.includes("susong")) return { initials: "LSS", shortName: "LỜI SỰ SỐNG" };
  if (s.includes("timothe")) return { initials: "TM", shortName: "TIMÔTHÊ" };
  if (s.includes("emmanuel")) return { initials: "EM", shortName: "EMMANUEL" };
  if (s.includes("hanoi")) return { initials: "HN", shortName: "HÀ NỘI" };
  if (s.includes("andien")) return { initials: "AĐ", shortName: "ÂN ĐIỂN" };

  const clean = name
    .replace(/^Hội Thánh (Tin Lành )?/i, "")
    .replace(/\(.*\)/g, "")
    .trim();

  const words = clean.split(/\s+/).filter(Boolean);
  let initials = "";
  if (words.length === 1) {
    initials = words[0].slice(0, 2).toUpperCase();
  } else if (words.length === 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else {
    initials = words.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
  }

  const shortName = words.slice(0, 2).join(" ").toUpperCase().slice(0, 14);
  return { initials: initials || "HT", shortName: shortName || "TIN LÀNH" };
}

/**
 * Generate a standalone SVG Data URI for a church's default avatar
 */
export function getDefaultChurchAvatar(churchName: string, slug = ""): string {
  const palette = getChurchPalette(slug, churchName);
  const { initials, shortName } = parseChurchBadge(churchName, slug);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.gold1}" />
      <stop offset="100%" stop-color="${palette.gold2}" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="36" fill="url(#bg)" />
  <circle cx="100" cy="100" r="92" fill="none" stroke="url(#gold)" stroke-width="2.5" stroke-opacity="0.45" stroke-dasharray="6 3" />
  <circle cx="100" cy="100" r="86" fill="none" stroke="url(#gold)" stroke-width="1.2" stroke-opacity="0.25" />
  
  <g transform="translate(100, 64)">
    <circle cx="0" cy="-14" r="16" fill="none" stroke="${palette.accent}" stroke-width="1.2" stroke-opacity="0.5" stroke-dasharray="3 2" />
    <rect x="-4" y="-32" width="8" height="52" rx="2" fill="url(#gold)" />
    <rect x="-20" y="-20" width="40" height="8" rx="2" fill="url(#gold)" />
    <circle cx="0" cy="-16" r="2.5" fill="#ffffff" opacity="0.9" />
  </g>
  
  <text x="100" y="136" font-family="'Times New Roman', Georgia, serif" font-size="28" font-weight="bold" fill="url(#gold)" text-anchor="middle" letter-spacing="3">${initials}</text>
  <text x="100" y="159" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" fill="${palette.accent}" text-anchor="middle" letter-spacing="2">${shortName}</text>
  <text x="100" y="174" font-family="system-ui, -apple-system, sans-serif" font-size="7.5" font-weight="600" fill="#94a3b8" text-anchor="middle" letter-spacing="2">HỘI THÁNH TIN LÀNH</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Checks if a given avatarUrl is a genuine custom uploaded/selected avatar
 * rather than an empty string or legacy Unsplash photo.
 */
export function isCustomAvatar(avatarUrl?: string): boolean {
  if (!avatarUrl || !avatarUrl.trim()) return false;
  // If it's the old legacy stock photos of people from unsplash
  if (
    avatarUrl.includes("photo-1548625361") ||
    avatarUrl.includes("photo-1544717305") ||
    avatarUrl.includes("photo-1507003211") ||
    avatarUrl.includes("photo-1500648767") ||
    avatarUrl.includes("photo-1534528741") ||
    avatarUrl.includes("photo-1506794778")
  ) {
    return false;
  }
  return true;
}

/**
 * Returns the effective avatar for a church:
 * - If the church has uploaded/selected their own avatar, return it.
 * - Otherwise, return the elegant default Protestant church SVG avatar.
 */
export function getChurchAvatar(
  churchName: string,
  slug = "",
  customAvatarUrl?: string
): string {
  if (isCustomAvatar(customAvatarUrl)) {
    return customAvatarUrl!;
  }
  return getDefaultChurchAvatar(churchName, slug);
}
