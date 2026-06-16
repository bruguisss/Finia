import React, { useState, useEffect } from 'react';

export default function SplashScreen({ fadingOut }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: '#000000',
        opacity: fadingOut ? 0 : entered ? 1 : 0,
        transitionProperty: 'opacity',
        transitionDuration: fadingOut ? '300ms' : '400ms',
        transitionTimingFunction: 'ease',
      }}
    >
      <img
        src="/icons/logo-dark-bg.png"
        alt="Finia"
        width={220}
        height={220}
        style={{ display: 'block', userSelect: 'none', pointerEvents: 'none' }}
        draggable={false}
      />
    </div>
  );
}
