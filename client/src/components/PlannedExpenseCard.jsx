import React, { useState } from 'react';
import { Repeat, Calendar, Pencil, Trash2 } from 'lucide-react';
import CategoryAvatar from './CategoryAvatar.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { updatePlannedExpense, deletePlannedExpense } from '../api.js';

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

const FREQUENCY_LABELS = {
  once: 'Una vez',
  monthly: 'Mensual',
  yearly: 'Anual',
};

export default function PlannedExpenseCard({ expense, onEdit, onUpdate, onDelete, index = 0 }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleToggleActive() {
    try {
      const updated = await updatePlannedExpense(expense.id, { active: !expense.active });
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    }
  }

  async function confirmDelete() {
    setConfirmOpen(false);
    try {
      await deletePlannedExpense(expense.id);
      onDelete(expense.id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div
      className={`flex items-start gap-3 py-3 active:scale-[0.98] transition-transform duration-[80ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] animate-fade-in-up-sm ${!expense.active ? 'opacity-50' : ''}`}
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <CategoryAvatar category={expense.category} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-subhead text-primary truncate">{expense.name}</p>
          <span className="text-subhead font-medium tabular-nums text-danger shrink-0">-{formatEur(expense.amount)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-caption font-medium bg-white/[0.06] text-tertiary whitespace-nowrap">
            {expense.frequency === 'once' ? <Calendar size={11} strokeWidth={2} /> : <Repeat size={11} strokeWidth={2} />}
            {FREQUENCY_LABELS[expense.frequency]} · {formatDate(expense.next_date)}
          </span>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={handleToggleActive}
              className={`text-caption font-medium px-2 py-1 rounded transition-colors duration-150 whitespace-nowrap ${
                expense.active ? 'bg-success/10 text-success' : 'bg-white/[0.06] text-tertiary'
              }`}
            >
              {expense.active ? 'Activo' : 'Pausado'}
            </button>
            <button onClick={() => onEdit(expense)} className="text-tertiary p-1.5 rounded-md">
              <Pencil size={13} strokeWidth={2} />
            </button>
            <button onClick={() => setConfirmOpen(true)} className="text-tertiary p-1.5 rounded-md">
              <Trash2 size={13} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          title="Eliminar gasto previsto"
          message={`¿Eliminar "${expense.name}"? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
