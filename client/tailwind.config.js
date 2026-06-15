/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0B1220',
        surface: '#121A2E',
        elevated: '#161F36',
        muted: '#1E293B',
        border: 'rgba(255,255,255,0.08)',
        'border-hover': 'rgba(255,255,255,0.16)',
        primary: '#F8FAFC',
        secondary: '#94A3B8',
        tertiary: '#334155',
        accent: '#10B981',
        'accent-hover': '#059669',
        'accent-dim': '#6EE7B7',
        success: '#22c55e',
        danger: '#DC2626',
        warning: '#f59e0b',
        brand: '#1E40AF',
        'brand-light': '#3B82F6',
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        heading: ['Orbitron', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.025em',
        heading: '-0.01em',
        label: '-0.005em',
        stat: '-0.03em',
        badge: '0.02em',
        wider: '0.02em',
      },
      keyframes: {
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
        ambientDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.12' },
          '50%': { transform: 'translate(4%, -4%) scale(1.08)', opacity: '0.18' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-up-sm': 'fadeInUpSm 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.2s ease-out both',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        ambient: 'ambientDrift 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
