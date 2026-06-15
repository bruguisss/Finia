import React from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmDialog({ title, message, confirmLabel = 'Eliminar', onConfirm, onCancel }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'calc(100vw - 32px)', maxWidth: '360px' }}
        className="bg-surface border border-border rounded-2xl shadow-2xl animate-fade-in p-5"
      >
        <h3 className="text-base font-semibold text-primary tracking-tight mb-1.5">{title}</h3>
        <p className="text-sm text-secondary mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-md bg-muted border border-white/10 text-sm font-medium text-primary hover:bg-[#555555] transition-colors duration-150"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-md border border-danger/30 bg-danger/10 text-danger text-sm font-semibold hover:bg-danger/20 transition-colors duration-150"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
