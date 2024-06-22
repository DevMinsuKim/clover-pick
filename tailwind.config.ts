import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
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
      },
    },
  },
  darkMode: "class",
};
export default config;
