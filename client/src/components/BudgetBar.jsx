import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog.jsx';
import { useCategories, DEFAULT_COLOR, DEFAULT_EMOJI } from '../context/CategoriesContext.jsx';
import { updateBudget, deleteBudget } from '../api.js';

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

export default function BudgetBar({ budget, onUpdate, onDelete, last = false }) {
  const { getCategory } = useCategories();
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(budget.monthly_limit);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { category, monthly_limit, spent = 0, percentage = 0 } = budget;
  const cat = getCategory(category);
  const emoji = cat?.emoji || DEFAULT_EMOJI;
  const color = cat?.color || DEFAULT_COLOR;

  const barColor = percentage >= 100 ? '#FF453A' : percentage >= 75 ? '#FFD60A' : '#30D158';

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

  async function confirmDelete() {
    setConfirmOpen(false);
    try {
      await deleteBudget(budget.id);
      onDelete(budget.id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className={`py-3 ${!last ? 'border-b border-white/[0.05]' : ''}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{emoji}</span>
          <p className="text-subhead text-primary truncate">{category}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-caption text-tertiary tabular-nums whitespace-nowrap">
            {formatEur(spent)} / {formatEur(monthly_limit)}
          </span>
          <button onClick={() => setEditing(!editing)} className="text-tertiary p-1">
            <Pencil size={13} strokeWidth={2} />
          </button>
          <button onClick={() => setConfirmOpen(true)} className="text-tertiary p-1">
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="h-1 bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }}
        />
      </div>

      {editing && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="flex-1 bg-elevated border border-border rounded-lg px-3 py-1.5 text-subhead text-primary focus:outline-none focus:border-border-strong"
            placeholder="Límite mensual"
            min="0"
            step="10"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-md bg-blue text-white text-caption font-semibold disabled:opacity-50"
          >
            {saving ? '...' : 'Guardar'}
          </button>
        </div>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Eliminar presupuesto"
          message={`¿Eliminar el presupuesto de ${category}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
