import React, { useState, useEffect } from 'react';
import BottomSheet from './BottomSheet.jsx';
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

  return (
    <BottomSheet title="Nuevo presupuesto" onClose={onClose}>
      {(close) => {
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
            close();
          } catch (err) {
            setError(err.message);
            setSaving(false);
          }
        }

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                onClick={close}
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
        );
      }}
    </BottomSheet>
  );
}
