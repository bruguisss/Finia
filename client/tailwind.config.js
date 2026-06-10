/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#09090b',
        surface: '#0f0f12',
        elevated: '#1a1a1e',
        border: '#26262b',
        primary: '#f5f5f6',
        secondary: '#9494a0',
        accent: '#6ee7b7',
        'accent-dim': '#10b981',
        danger: '#f87171',
        warning: '#fbbf24',
        info: '#60a5fa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
