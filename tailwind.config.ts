import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--bg-card)",
        fg: "var(--fg)",
        muted: "var(--fg-muted)",
        dim: "var(--fg-dim)",
        border: "var(--border)",
        routine: "#3D7A6B",
        diet: "#C4704B",
        study: "#4A6FA5",
        journal: "#8B6DAF",
        ai: "#2D2D2D",
      },
      fontFamily: {
        serif: ["Noto Serif SC", "Songti SC", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: { xl: "12px" },
    },
  },
  plugins: [],
};

export default config;
