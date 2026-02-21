/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // 브랜드 primary (어드민: 민트/그린, 사용자 앱: 블루)
        primary: '#10b981',
        'primary-blue': '#60A5FA',

        // 배경
        'background-light': '#F9F9F7',
        'background-dark': '#221610',

        // 어드민 테마
        'accent-mint': '#e1f2f0',
        'accent-blue': '#e1eaf2',
        'neutral-muted': '#6b5c54',

        // 사용자 앱 테마
        mint: '#D1FAE5',
        'soft-mint': '#ECFDF5',
        'pale-blue': '#EFF6FF',
        'warm-beige': '#FDFCF0',
        'accent-pink': '#FEE2E2',
        'text-main': '#334155',
        'text-muted': '#64748B',

        // 차트 색상
        'chart-1': '#60A5FA',
        'chart-2': '#34D399',
        'chart-3': '#FBBF24',
        'chart-4': '#F87171',
      },
      fontFamily: {
        display: ['Public Sans', 'Inter', 'Noto Sans KR', 'sans-serif'],
        sans: ['Inter', 'Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        hover: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
