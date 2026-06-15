import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createBudget } from '../api.js';

export default function BudgetModal({ availableCategories, onClose, onSave }) {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (availableCategories.length > 0 && !category) {
      setCategory(availableCategories[0].name);
    }
  }, [availableCategories, category]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!limit || parseFloat(limit) <= 0) {
      setError('Introduce un límite válido');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createBudget({ category, monthly_limit: parseFloat(limit) });
      onSave(created);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'calc(100vw - 32px)', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
        className="bg-surface border border-border rounded-2xl shadow-2xl animate-fade-in"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base font-semibold text-primary tracking-tight">Nuevo presupuesto</h3>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors duration-150"><X size={18} strokeWidth={2} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
          <div>
            <label className="block text-xs text-secondary mb-1.5">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-border-strong"
            >
              {availableCategories.map((c) => (
                <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1.5">Límite mensual (€)</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="ej: 300"
              min="1"
              step="10"
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong"
              required
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-md bg-elevated border border-border text-sm font-medium text-primary transition-colors duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-md bg-blue text-white font-semibold text-sm transition-colors duration-150 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
