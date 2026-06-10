/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0f1117',
        surface: '#1a1d27',
        elevated: '#222536',
        border: '#2e3147',
        primary: '#f0f2ff',
        secondary: '#8b90a7',
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
