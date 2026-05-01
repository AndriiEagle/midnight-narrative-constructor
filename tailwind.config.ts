import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-color)",
        foreground: "var(--text-color)",
        accent: "var(--ui-accent)",
        panel: "var(--panel-bg)",
        border: "var(--ui-border)",
      },
      boxShadow: {
        bleed: "0 24px 90px -40px var(--shadow-color)",
      },
      transitionTimingFunction: {
        bleed: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-cormorant)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
