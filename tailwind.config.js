import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#ECFDF5",
              100: "#D1FAE5",
              200: "#A7F3D0",
              300: "#6EE7B7",
              400: "#34D399",
              500: "#10B981", // Soft Green (Emerald-500)
              600: "#059669",
              700: "#047857",
              800: "#065F46",
              900: "#064E3B",
              DEFAULT: "#10B981",
              foreground: "#FFFFFF",
            },
            background: {
              50: "#FFFFFF",
              100: "#FAFAFA",
              200: "#F5F5F5",
              300: "#E5E5E5",
              400: "#D4D4D4",
              500: "#A3A3A3",
              600: "#737373",
              700: "#525252",
              800: "#404040",
              900: "#262626",
              DEFAULT: "#FFFFFF",
            },
            foreground: {
              50: "#F2F2F2",
              100: "#E6E6E6",
              200: "#CCCCCC",
              300: "#B3B3B3",
              400: "#999999",
              500: "#808080",
              600: "#666666",
              700: "#4D4D4D",
              800: "#333333",
              900: "#1A1A1A",
              DEFAULT: "#1A1A1A",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              50: "#064E3B",
              100: "#065F46",
              200: "#047857",
              300: "#059669",
              400: "#10B981",
              500: "#34D399", // Soft Green (Lighter for dark mode)
              600: "#6EE7B7",
              700: "#A7F3D0",
              800: "#D1FAE5",
              900: "#ECFDF5",
              DEFAULT: "#34D399",
              foreground: "#000000",
            },
            background: {
              50: "#1A1A1A",
              100: "#262626",
              200: "#333333",
              300: "#404040",
              400: "#525252",
              500: "#737373",
              600: "#A3A3A3",
              700: "#D4D4D4",
              800: "#E5E5E5",
              900: "#F5F5F5",
              DEFAULT: "#000000", // Dark Background
            },
            foreground: {
              50: "#262626",
              100: "#404040",
              200: "#595959",
              300: "#737373",
              400: "#8C8C8C",
              500: "#A6A6A6",
              600: "#BFBFBF",
              700: "#D9D9D9",
              800: "#F2F2F2",
              900: "#FFFFFF",
              DEFAULT: "#FFFFFF",
            },
          },
        },
      },
    }),
  ],
};
