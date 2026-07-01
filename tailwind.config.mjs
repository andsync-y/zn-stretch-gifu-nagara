/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // ブランドカラー（デザイン方針：白ベース＋抑えたアンバー1色）
        base: '#FFFFFF',
        offwhite: '#FAFAF8',
        ink: '#1A1A1A', // 主役の文字色（高コントラスト）
        charcoal: '#333333',
        line: '#EAEAEA',
        panel: '#F2F2F0',
        amber: {
          DEFAULT: '#FF9C46', // 差し色（CTA・手書き強調のみ）
          600: '#F0842A',
          700: '#D96F17',
        },
      },
      fontFamily: {
        // 本文・見出し・手書きアクセント
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
        heading: ['"Zen Kaku Gothic New"', '"Noto Sans JP"', 'sans-serif'],
        hand: ['"Yomogi"', '"Zen Kurenaido"', '"Noto Sans JP"', 'cursive'],
      },
      maxWidth: {
        content: '72rem',
      },
      keyframes: {
        fadeup: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeup: 'fadeup 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
