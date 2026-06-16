import React, { useState, useEffect } from 'react';

export default function SplashScreen({ fadingOut }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-base transition-opacity"
      style={{
        opacity: fadingOut ? 0 : entered ? 1 : 0,
        transitionDuration: fadingOut ? '300ms' : '400ms',
      }}
    >
      <span style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.04em', color: '#000000', marginBottom: '8px' }}>
        F
      </span>
      <p style={{ fontSize: '13px', color: 'rgba(60,60,67,0.4)' }}>
        Finanzas personales
      </p>
    </div>
  );
}
