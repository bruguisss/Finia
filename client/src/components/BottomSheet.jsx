import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const TRANSITION = 'transform 320ms cubic-bezier(0.32,0.72,0,1)';
const CLOSE_DURATION = 320;
const DRAG_CLOSE_THRESHOLD = 120;
const VELOCITY_CLOSE_THRESHOLD = 0.6;

export default function BottomSheet({ title, onClose, children }) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragData = useRef({ startY: 0, lastY: 0, lastTime: 0, velocity: 0 });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function requestClose() {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, CLOSE_DURATION);
  }

  function onPointerDown(e) {
    dragData.current = { startY: e.clientY, lastY: e.clientY, lastTime: Date.now(), velocity: 0 };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const delta = e.clientY - dragData.current.startY;
    const now = Date.now();
    const dt = now - dragData.current.lastTime;
    if (dt > 0) dragData.current.velocity = (e.clientY - dragData.current.lastY) / dt;
    dragData.current.lastY = e.clientY;
    dragData.current.lastTime = now;
    // Rubber-band: free downward drag, dampened upward drag
    setDragY(delta > 0 ? delta : delta / 3);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragY > DRAG_CLOSE_THRESHOLD || dragData.current.velocity > VELOCITY_CLOSE_THRESHOLD) {
      requestClose();
    } else {
      setDragY(0);
    }
  }

  const offset = !mounted || closing ? '100%' : `${dragY}px`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      style={{ opacity: mounted && !closing ? 1 : 0, transition: 'opacity 320ms ease-out' }}
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, maxHeight: '90vh',
          transform: `translateY(${offset})`,
          transition: dragging ? 'none' : TRANSITION,
        }}
        className="bg-surface border-t border-border rounded-t-2xl shadow-2xl overflow-y-auto"
      >
        <div
          className="flex justify-center pt-2.5 pb-1 touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="w-9 h-1 rounded-full bg-white/15" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-border">
            <h3 className="text-title-3 text-primary">{title}</h3>
            <button onClick={requestClose} className="text-secondary hover:text-primary transition-colors duration-150">
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        )}
        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {typeof children === 'function' ? children(requestClose) : children}
        </div>
      </div>
    </div>,
    document.body
  );
}
