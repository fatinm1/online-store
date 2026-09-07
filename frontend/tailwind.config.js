/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy warm palette — kept for admin panel compatibility
        clay: '#9a6a48',
        espresso: '#2b1d12',
        cream: '#f7f2e9',
        parchment: '#efe7d6',
        sand: '#e3d6bf',
        gold: '#b08a52',
        // Dark editorial storefront theme
        obsidian: '#080808',
        onyx: '#0f0f0f',
        charcoal: '#181818',
        iron: '#272727',
        ivory: '#ede8de',
        pearl: '#b8b0a4',
        mist: '#6e6660',
        accent: '#b8965a',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'tighter-extra': '-0.04em',
        'widest-xl': '0.25em',
      },
      boxShadow: {
        gold: '0 0 40px rgba(184,150,90,0.15)',
        card: '0 4px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
