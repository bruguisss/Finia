/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#000000',
        surface: '#0A0A0A',
        elevated: '#141414',
        muted: '#1C1C1E',
        border: 'rgba(255,255,255,0.08)',
        'border-hover': 'rgba(255,255,255,0.15)',
        'border-strong': 'rgba(255,255,255,0.15)',
        primary: '#FFFFFF',
        secondary: 'rgba(235,235,245,0.6)',
        tertiary: 'rgba(235,235,245,0.3)',
        accent: '#FFFFFF',
        'accent-hover': '#E5E5E5',
        'accent-dim': '#B0B0B0',
        blue: '#0A84FF',
        'blue-dim': 'rgba(10,132,255,0.15)',
        success: '#30D158',
        danger: '#FF453A',
        warning: '#FFD60A',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        display: ['34px', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '700' }],
        'title-1': ['28px', { lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '700' }],
        'title-2': ['22px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'title-3': ['17px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        body: ['17px', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '400' }],
        callout: ['16px', { lineHeight: '1.35', fontWeight: '400' }],
        subhead: ['15px', { lineHeight: '1.3', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '400' }],
      },
      letterSpacing: {
        tight: '-0.025em',
        heading: '-0.01em',
        label: '-0.005em',
        stat: '-0.03em',
        badge: '0.02em',
        wider: '0.02em',
      },
      transitionTimingFunction: {
        'out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        pageIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUpSm: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'page-in': 'pageIn 0.2s cubic-bezier(0.23, 1, 0.32, 1) both',
        'fade-in-up': 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-up-sm': 'fadeInUpSm 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.2s ease-out both',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slideUp 0.32s cubic-bezier(0.32, 0.72, 0, 1) both',
      },
    },
  },
  plugins: [],
};
