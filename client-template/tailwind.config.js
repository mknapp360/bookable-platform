/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#YOUR_PRIMARY_COLOR',   // e.g. '#29ab00'
          dark: '#YOUR_DARK_COLOR',       // e.g. '#1a1a2e'
          grey: '#YOUR_GREY_COLOR',       // e.g. '#f5f5f7'
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
