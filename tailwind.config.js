/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2b2b2b',
        muted: '#8a8a8a',
        line: '#d9d6cf',
        paper: '#faf9f6',
        card: '#ffffff',
        accent: '#5b8a72',
      },
    },
  },
  plugins: [],
};
