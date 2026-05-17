/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        asphalt: '#302F2C',
        paper: '#EFEDE3',
      },
      fontFamily: {
        scribble: ['"Gochi Hand"', 'cursive'],
      },
    },
  },
  plugins: [],
}