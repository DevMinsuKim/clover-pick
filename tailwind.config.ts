import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: "var(--color-primary)",
        primary1: "var(--color-primary1)",
        primaryHover: "var(--color-primary-hover)",
        divider: "var(--color-divider)",
        content1: "var(--color-content1)",
        content1Hover: "var(--color-content1-hover)",
        content2: "var(--color-content2)",
        content3: "var(--color-content3)",
        content4: "var(--color-content4)",
        content4Hover: "var(--color-content4-hover)",
      },
      screens: {
        xs: "375px",
      },
      keyframes: {
        "loop-scroll": {
          from: { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(-100% - 4rem))" },
        },
        "reverse-loop-scroll": {
          from: { transform: "translateX(calc(-100% - 4rem))" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "loop-scroll": "loop-scroll 30s linear infinite",
        "reverse-loop-scroll": "reverse-loop-scroll 30s linear infinite",
      },
    },
  },

  darkMode: "class",
};
export default config;
