/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'chat-dark': '#1e1e1e',
        'chat-darker': '#171717',
        'chat-light': '#2d2d2d',
      },
      typography: {
        DEFAULT: {
          css: {
            pre: {
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
            },
            code: {
              backgroundColor: '#2d2d2d',
              color: '#d4d4d4',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
          },
        },
      },
    },
  },
  plugins: [],
};