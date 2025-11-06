/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      safelist: [
  { pattern: /bg-(blue|green|purple|orange|indigo|pink)-(100|900)/ },
  { pattern: /text-(blue|green|purple|orange|indigo|pink)-(300|600)/ },
],
      colors: {
        // Brand colors from logo
        brand: {
          DEFAULT: "#334155",
          50: "#e8ecf0",
          100: "#d1d9e1",
          200: "#a3b3c3",
          300: "#758da5",
          400: "#476787",
          500: "#334155",
          600: "#192636",
          700: "#131c28",
          800: "#0d131a",
          900: "#07090c",
          950: "#030405",
        },
        primary: {
          50: "#e8ecf0",
          100: "#d1d9e1",
          200: "#a3b3c3",
          300: "#758da5",
          400: "#476787",
          500: "#334155",
          600: "#192636",
          700: "#131c28",
          800: "#0d131a",
          900: "#07090c",
          950: "#030405",
        },
        // Healthcare accent colors
        accent: {
          teal: "#06b6d4",
          cyan: "#0891b2",
          emerald: "#10b981",
          indigo: "#6366f1",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#0a2547",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
