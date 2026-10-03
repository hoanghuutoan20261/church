import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        sanctuary: {
          950: "#0b0d10",
          900: "#0f1115", // Deep warm charcoal primary background
          850: "#14171d", // Panels and sidebar background
          800: "#1a1e26", // Card and container background
          750: "#222732", // Borders & separators
          700: "#2f3644", // Active borders
          600: "#4b5363",
          500: "#6b7280",
          400: "#9ca3af", // Subtitles & muted labels
          300: "#d1d5db",
          200: "#e5e7eb",
          100: "#f3f4f6", // Off-white primary text
          50: "#f9fafb",
        },
        gold: {
          50: "#fbf8f1",
          100: "#f5edd9",
          200: "#ead8b0",
          300: "#dcbf80",
          400: "#c5a059", // Signature liturgical bronze/warm gold
          500: "#b58e46",
          600: "#9a7436",
          700: "#7a592b",
          800: "#5c4122",
          900: "#45301a",
        },
        candle: {
          light: "#fef3c7",
          DEFAULT: "#e09f3e",
          deep: "#b45309",
        },
        sacrament: {
          light: "#993d48",
          DEFAULT: "#722f37",
          dark: "#4e1b21",
        },
        olive: {
          DEFAULT: "#4a5340",
          dark: "#32382b",
        },
        parchment: {
          50: "#faf8f5",
          100: "#f5f0e8",
          200: "#ebe2d3",
          800: "#24201c",
          900: "#1c1815",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Cinzel", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        sanctuary: "0 4px 20px -2px rgba(0, 0, 0, 0.45)",
        candle: "0 0 18px -2px rgba(197, 160, 89, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
