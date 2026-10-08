import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e2430" />
      <stop offset="70%" stop-color="#0f1115" />
      <stop offset="100%" stop-color="#090b0e" />
    </radialGradient>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f6d78d" />
      <stop offset="40%" stop-color="#c5a059" />
      <stop offset="100%" stop-color="#9a7428" />
    </linearGradient>
    <linearGradient id="haloGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c5a059" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#c5a059" stop-opacity="0.05" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background rounded canvas -->
  <rect width="512" height="512" rx="112" fill="url(#bgGlow)" />
  <rect width="512" height="512" rx="112" fill="none" stroke="#c5a059" stroke-width="2" stroke-opacity="0.2" />

  <!-- Sacred Halo Ring -->
  <circle cx="256" cy="236" r="148" fill="none" stroke="url(#haloGradient)" stroke-width="12" />
  <circle cx="256" cy="236" r="148" fill="none" stroke="#c5a059" stroke-width="1.5" stroke-opacity="0.5" stroke-dasharray="6 6" />

  <!-- Radiant Light rays -->
  <circle cx="256" cy="236" r="90" fill="#c5a059" fill-opacity="0.08" />

  <!-- The Holy Cross (Golden Reverent Minimalist) -->
  <g filter="url(#shadow)">
    <!-- Vertical Beam -->
    <rect x="236" y="106" width="40" height="270" rx="8" fill="url(#goldGradient)" />
    <!-- Horizontal Beam -->
    <rect x="156" y="176" width="200" height="40" rx="8" fill="url(#goldGradient)" />
    <!-- Center Highlight Jewel -->
    <circle cx="256" cy="196" r="6" fill="#fff5d0" />
  </g>

  <!-- Church Foundation Arc -->
  <path d="M 176 416 C 220 398, 292 398, 336 416" fill="none" stroke="#c5a059" stroke-width="3" stroke-linecap="round" stroke-opacity="0.6" />
</svg>
`;

async function generate() {
  const publicDir = path.join(process.cwd(), "public");
  await fs.mkdir(publicDir, { recursive: true });

  const svgBuffer = Buffer.from(svgIcon);

  // 1. icon-512x512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "icon-512x512.png"));
  console.log("✓ Generated icon-512x512.png");

  // 2. icon-192x192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, "icon-192x192.png"));
  console.log("✓ Generated icon-192x192.png");

  // 3. apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("✓ Generated apple-touch-icon.png");

  // 4. icon-maskable-512x512.png
  // Maskable icons require a safe zone padding (inner 80%)
  const maskableSvg = svgIcon.replace('rx="112"', 'rx="0"');
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "icon-maskable-512x512.png"));
  console.log("✓ Generated icon-maskable-512x512.png");

  // 5. favicon-32x32.png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, "favicon-32x32.png"));
  console.log("✓ Generated favicon-32x32.png");

  console.log("All PWA icons generated successfully!");
}

generate().catch(console.error);
