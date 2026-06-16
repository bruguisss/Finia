import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import AnimatedLogo from './AnimatedLogo.jsx';

export default function SplashScreen({ fadingOut }) {
  const [entered, setEntered] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: isDark ? '#000000' : '#FFFFFF',
        opacity: fadingOut ? 0 : entered ? 1 : 0,
        transitionProperty: 'opacity',
        transitionDuration: fadingOut ? '300ms' : '400ms',
        transitionTimingFunction: 'ease',
      }}
    >
      <AnimatedLogo
        size={160}
        color={isDark ? '#ffffff' : '#000000'}
      />
    </div>
  );
}
