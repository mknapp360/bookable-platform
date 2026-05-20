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
          navy: '#1B3A4B',
          teal: '#2A5A6A',
          gold: '#C9A96E',
          cream: '#F9F6F1',
          dark: '#111111',
          grey: '#F5F5F5',
          green: '#C9A96E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        script: ['Dancing Script', 'cursive'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
