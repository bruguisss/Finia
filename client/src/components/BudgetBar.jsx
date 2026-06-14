import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useCategories, DEFAULT_COLOR, DEFAULT_EMOJI } from '../context/CategoriesContext.jsx';
import { updateBudget, deleteBudget } from '../api.js';

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

export default function BudgetBar({ budget, onUpdate, onDelete }) {
  const { getCategory } = useCategories();
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(budget.monthly_limit);
  const [saving, setSaving] = useState(false);

  const { category, monthly_limit, spent = 0, percentage = 0 } = budget;
  const cat = getCategory(category);
  const emoji = cat?.emoji || DEFAULT_EMOJI;
  const color = cat?.color || DEFAULT_COLOR;

  const barColor = percentage >= 100 ? '#f87171' : percentage >= 75 ? '#fbbf24' : '#6ee7b7';

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateBudget(budget.id, { monthly_limit: parseFloat(limit), color });
      onUpdate({ ...budget, ...updated });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar presupuesto de ${category}?`)) return;
    try {
      await deleteBudget(budget.id);
      onDelete(budget.id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-5 transition-all duration-200 hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="text-sm font-medium text-primary">{category}</p>
            <p className="text-xs text-secondary">{formatEur(spent)} de {formatEur(monthly_limit)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold tabular-nums"
            style={{ color: barColor }}
          >
            {percentage}%
          </span>
          <button onClick={() => setEditing(!editing)} className="text-secondary hover:text-primary transition-colors">
            <Pencil size={13} strokeWidth={2} />
          </button>
          <button onClick={handleDelete} className="text-secondary hover:text-danger transition-colors">
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }}
        />
      </div>

      {/* Edit form */}
      {editing && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="flex-1 bg-elevated border border-border rounded px-3 py-1.5 text-sm text-primary focus:outline-none focus:border-accent"
            placeholder="Límite mensual"
            min="0"
            step="10"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded bg-accent text-base text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            {saving ? '...' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  );
}
