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
      letterSpacing: {
        'tighter-extra': '-4.75px',
      },
      boxShadow: {
        'xl': '0 20px 40px rgba(154, 106, 72, 0.08)',
        'inner-soft': 'inset 0 2px 10px rgba(43, 29, 18, 0.03)',
      },
    },
  },
  plugins: [],
}
