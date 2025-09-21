import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        // Golden Munch Color Palette
        'golden-orange': '#F9A03F',
        'deep-amber': '#D97706',
        'cream-white': '#FFF8F0',
        'chocolate-brown': '#4B2E2E',
        'caramel-beige': '#E6C89C',
        'mint-green': '#A8D5BA',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;