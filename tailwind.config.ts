import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mrz: {
          bg: "var(--mrz-bg)",
          surface: "var(--mrz-surface)",
          border: "var(--mrz-border)",
          text: "var(--mrz-text)",
          "text-muted": "var(--mrz-text-muted)",
          accent: "var(--mrz-accent)",
          "accent-hover": "var(--mrz-accent-hover)",
        },
      },
      borderRadius: {
        "mrz-sm": "var(--mrz-radius-sm)",
        "mrz-md": "var(--mrz-radius-md)",
      },
      boxShadow: {
        mrz: "var(--mrz-shadow)",
      },
      transitionDuration: {
        mrz: "var(--mrz-transition)",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
