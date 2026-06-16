import React, { useState, useEffect } from 'react';

export default function SplashScreen({ fadingOut }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Font: Inter 800 @ 90px. Estimates for crosshair intersection (dot center):
  // - F glyph width ≈ 50px, gap 5px, dot radius 9px → dot center x = 64px from logo left
  // - Logo total width ≈ 73px → logo center x = 36.5px → dot is +27.5px right of center
  // - With lineHeight=1, F height ≈ 90px → logo center y = 45px from top
  // - Dot center sits at baseline ≈ 81px from top → +36px below logo center
  const CROSS_X = 28; // px right of viewport 50%
  const CROSS_Y = 36; // px below viewport 50%

  return (
    <div
      className="fixed inset-0 z-[9999] bg-base"
      style={{
        opacity: fadingOut ? 0 : entered ? 1 : 0,
        transition: `opacity ${fadingOut ? '300ms' : '400ms'} ease`,
      }}
    >
      {/* Crosshair — vertical line through dot center */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `calc(50% + ${CROSS_X}px)`,
          width: '1.5px',
          backgroundColor: 'var(--brand-tertiary)',
        }}
      />
      {/* Crosshair — horizontal line through dot center */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `calc(50% + ${CROSS_Y}px)`,
          height: '1.5px',
          backgroundColor: 'var(--brand-tertiary)',
        }}
      />

      {/* Logo: F + dot, centered in viewport */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '5px',
        }}
      >
        <span
          style={{
            fontSize: '90px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: 'var(--color-primary)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            userSelect: 'none',
          }}
        >
          F
        </span>
        {/* Period dot — sits at baseline (shifted down so center ≈ baseline) */}
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            marginBottom: '-2px',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
}
