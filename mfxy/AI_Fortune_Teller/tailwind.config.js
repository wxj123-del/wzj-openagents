/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mystic-purple': '#6B46C1',
        'mystic-gold': '#F6E05E',
        'mystic-dark': '#1A1B4B',
      }
    },
  },
  plugins: [],
}
