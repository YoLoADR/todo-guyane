import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        merenza: {
          primary: "#0F4C81",
          accent: "#E8B04B",
          neutral: "#1A1A2E",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;