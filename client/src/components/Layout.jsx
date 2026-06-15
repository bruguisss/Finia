import React, { useLayoutEffect, useRef } from 'react';
import BottomNav from './BottomNav.jsx';

export default function Layout({ children, currentPage, onNavigate }) {
  const mainRef = useRef(null);

  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [currentPage]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-base text-primary">
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <div
          key={currentPage}
          className="max-w-2xl mx-auto px-4 pb-[calc(120px+env(safe-area-inset-bottom))] animate-page-in"
        >
          {children}
        </div>
      </main>

      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
}
