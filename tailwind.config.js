/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          red: '#ff0000',
          blue: '#3b4cca',
          yellow: '#ffde00',
          gold: '#b3a125',
          green: '#4dad5b',
          bg: '#f8f9fa'
        }
      },
      fontFamily: {
        round: ['"M PLUS Rounded 1c"', 'Nunito', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
