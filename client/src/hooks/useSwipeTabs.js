import { useEffect, useRef } from 'react';

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.3;

export function useSwipeTabs({ count, activeIndex, onChange }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let tracking = false;
    let horizontal = false;

    function onTouchStart(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      tracking = true;
      horizontal = false;
    }

    function onTouchMove(e) {
      if (!tracking) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!horizontal && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        horizontal = true;
      }
      if (horizontal) e.preventDefault();
    }

    function onTouchEnd(e) {
      if (!tracking) return;
      tracking = false;
      if (!horizontal) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dt = Date.now() - startTime;
      const velocity = Math.abs(dx) / dt;
      if (Math.abs(dx) < SWIPE_THRESHOLD && velocity < VELOCITY_THRESHOLD) return;
      if (dx < 0 && activeIndex < count - 1) onChange(activeIndex + 1);
      else if (dx > 0 && activeIndex > 0) onChange(activeIndex - 1);
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [activeIndex, count, onChange]);

  return containerRef;
}
