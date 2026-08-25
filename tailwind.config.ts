import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: "#FDFCF9",
          DEFAULT: "#FBF9F5",
          muted: "#F3EFE6",
          dark: "#EAE4D5",
          border: "#E2DACB",
          ring: "#D5C8B4",
        },
        ink: {
          DEFAULT: "#1C1917",
          light: "#44403C",
          muted: "#78716C",
          faint: "#A8A29E",
        },
        archival: {
          oxblood: "#881337",
          spruce: "#14532D",
          amber: "#B45309",
          navy: "#1E293B",
          sand: "#D4C5B0",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Cinzel", "EB Garamond", "Georgia", "serif"],
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Geist Mono", "monospace"],
      },
      boxShadow: {
        archival: "0 10px 30px -10px rgba(40, 30, 20, 0.12), 0 4px 6px -2px rgba(40, 30, 20, 0.05)",
        "archival-lift": "0 25px 50px -12px rgba(40, 30, 20, 0.25), 0 8px 16px -4px rgba(40, 30, 20, 0.1)",
        "paper-depth": "inset 0 1px 2px rgba(255, 255, 255, 0.6), 0 2px 4px rgba(0, 0, 0, 0.08)",
        "tray-depth": "inset 0 2px 8px rgba(30, 20, 10, 0.08), 0 1px 3px rgba(0,0,0,0.02)",
      },
    },
  },
  plugins: [],
};
export default config;
