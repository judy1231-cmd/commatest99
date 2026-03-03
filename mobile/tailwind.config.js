/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        'soft-mint': '#ECFDF5',
        'text-main': '#334155',
        'text-muted': '#64748B',
        'background-light': '#F9F9F7',
      },
    },
  },
  plugins: [],
};
