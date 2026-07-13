/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // KEY VISUAL基準：モノクロ＋タオル由来のウォームトープ
        paper: '#F7F7F4',
        paper2: '#ECEDEA',
        panel: '#E4E5E2',
        ink: '#151719',
        sub: '#333638',
        muted: '#62676B',
        faint: '#969CA1',
        line: '#D4D7D8',
        accent: '#92745E',
        // 黒セクション内のトーン
        inkpaper: '#F7F7F4',
        inkmuted: '#B9BEC2',
        inkfaint: '#7D848A',
        amber: {
          DEFAULT: '#92745E',
          600: '#7A604D',
          700: '#634C3C',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
        display: ['"Archivo Black"', '"Noto Sans JP"', 'sans-serif'],
        script: ['"Inter"', '"Noto Sans JP"', 'sans-serif'],
      },
      maxWidth: {
        content: '85rem', // 1360px
      },
      boxShadow: {
        hard: '10px 10px 0 #92745E',
        'hard-l': '-10px 10px 0 #92745E',
        'hard-sm': '7px 7px 0 #92745E',
        'hard-btn': '5px 5px 0 rgba(146,116,94,0.28)',
        'hard-btn-light': '6px 6px 0 rgba(247,245,240,0.18)',
      },
      keyframes: {
        marquee: {
          to: { transform: 'translateX(-50%)' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(44px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        marquee: 'marquee 36s linear infinite',
        'marquee-sp': 'marquee 28s linear infinite',
        'spin-slow': 'spinSlow 16s linear infinite',
      },
    },
  },
  plugins: [],
};
