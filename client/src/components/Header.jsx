import React from 'react';

export default function Header({ title, subtitle, variant = 'default' }) {
  return (
    <header
      className="sticky top-0 z-10 -mx-4 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 mb-1 border-b border-white/[0.06]"
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title-3 text-primary truncate">{title}</h1>
          {subtitle && <p className="text-caption text-tertiary truncate">{subtitle}</p>}
        </div>
        {variant === 'home' && (
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-title-3 text-primary shrink-0">
            A
          </div>
        )}
      </div>
    </header>
  );
}
