import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 64;
const MAX_PULL = 100;
const RESISTANCE = 2.2;

export function usePullToRefresh(onRefresh) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const el = containerRef.current;
    const scrollEl = el?.closest('main');
    if (!el || !scrollEl) return;

    let startY = 0;
    let pulling = false;
    let distance = 0;

    function onTouchStart(e) {
      if (scrollEl.scrollTop > 0 || refreshing) return;
      startY = e.touches[0].clientY;
      pulling = true;
      distance = 0;
    }

    function onTouchMove(e) {
      if (!pulling) return;
      const delta = e.touches[0].clientY - startY;
      if (delta <= 0) {
        if (distance !== 0) {
          distance = 0;
          setPullDistance(0);
        }
        return;
      }
      e.preventDefault();
      distance = Math.min(delta / RESISTANCE, MAX_PULL);
      setPullDistance(distance);
    }

    async function onTouchEnd() {
      if (!pulling) return;
      pulling = false;
      if (distance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(THRESHOLD);
        try {
          await onRefreshRef.current?.();
        } finally {
          setRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
      distance = 0;
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
  }, [refreshing]);

  return { containerRef, pullDistance, refreshing, threshold: THRESHOLD };
}
