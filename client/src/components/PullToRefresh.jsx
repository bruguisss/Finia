import React from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '../hooks/usePullToRefresh.js';

export default function PullToRefresh({ onRefresh, children }) {
  const { containerRef, pullDistance, refreshing, threshold } = usePullToRefresh(onRefresh);
  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div ref={containerRef}>
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{ height: pullDistance }}
      >
        <RefreshCw
          size={18}
          strokeWidth={2}
          className={refreshing ? 'animate-spin text-secondary' : 'text-tertiary'}
          style={{
            opacity: progress,
            transform: refreshing ? undefined : `rotate(${progress * 270}deg)`,
            transition: 'opacity 150ms ease-out',
          }}
        />
      </div>
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 200ms cubic-bezier(0.23,1,0.32,1)' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
