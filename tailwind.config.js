/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        scrollDownDot: {
          "0%": {
            opacity: 0,
            transform: "translateY(-1rem)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0.6rem)",
          },
        },
        scrollDownArrow: {
          "0%": {
            opacity: 0,
            transform: "translateY(-0.5rem)",
          },
          "25%": {
            opacity: 0.25,
          },
          "50%": {
            opacity: 0.5,
          },
          "75%": {
            opacity: 0.75,
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0.5rem)",
          },
        },
        generationLottoBg: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      animation: {
        scrollDownDot: "scrollDownDot 1.15s linear infinite",
        scrollDownArrow: "scrollDownArrow 1.15s linear infinite",
        generationLottoBg: "generationLottoBg 4s ease infinite",
      },
      screens: {
        sm: "330px",
        // => @media (min-width: 330px) { ... }

        md: "425px",
        // => @media (min-width: 425px) { ... }

        lg: "576px",
        // => @media (min-width: 576px) { ... }

        xl: "768px",
        // => @media (min-width: 768px) { ... }

        "2xl": "1024px",
        // => @media (min-width: 1024px) { ... }

        "3xl": "1440px",
        // => @media (min-width: 1440px) { ... }
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
