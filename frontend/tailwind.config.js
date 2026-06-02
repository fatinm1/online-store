/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        clay: '#9a6a48',
        espresso: '#2b1d12',
        cream: '#f7f2e9',
        parchment: '#efe7d6',
        sand: '#e3d6bf',
        gold: '#b08a52',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Questrial"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
