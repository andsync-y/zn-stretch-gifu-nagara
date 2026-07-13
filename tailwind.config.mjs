/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // TOP v5 デザイントークン（エディトリアル・クラフト）
        paper: '#F7F5F0', // ベースの生成り
        paper2: '#EFEDE6', // 交互セクションの少し濃い生成り
        panel: '#ECEAE4',
        ink: '#1A1A1A', // 主役の黒
        sub: '#333333', // 本文
        muted: '#555555',
        faint: '#999999',
        line: '#EAEAEA',
        // 黒セクション内のトーン
        inkpaper: '#F7F5F0',
        inkmuted: '#BBB8B2',
        inkfaint: '#8A8884',
        amber: {
          DEFAULT: '#FF9C46',
          600: '#F0842A',
          700: '#D96F17',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'], // 英字大見出し・価格
        script: ['"Cormorant Garamond"', 'serif'], // 英語イタリックの添えラベル
        hand: ['"Yomogi"', '"Noto Sans JP"', 'cursive'],
      },
      maxWidth: {
        content: '85rem', // 1360px
      },
      boxShadow: {
        hard: '10px 10px 0 #1A1A1A',
        'hard-l': '-10px 10px 0 #1A1A1A',
        'hard-sm': '8px 8px 0 #1A1A1A',
        'hard-btn': '6px 6px 0 rgba(26,26,26,0.15)',
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
