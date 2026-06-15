import React, { useState } from 'react';
import { Repeat, Calendar, Pencil, Trash2 } from 'lucide-react';
import CategoryBadge from './CategoryBadge.jsx';
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

export default function PlannedExpenseRow({ expense, onEdit, onUpdate, onDelete }) {
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
    <>
    <tr className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-150 group h-10 ${!expense.active ? 'opacity-50' : ''}`}>
      <td className="px-4 text-[13px] text-primary">{expense.name}</td>
      <td className="px-4"><CategoryBadge category={expense.category} /></td>
      <td className="px-4 text-[13px] font-medium font-mono tabular-nums text-right text-danger whitespace-nowrap">
        -{formatEur(expense.amount)}
      </td>
      <td className="px-4">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-white/[0.06] text-secondary whitespace-nowrap">
          {expense.frequency === 'once' ? <Calendar size={11} strokeWidth={2} /> : <Repeat size={11} strokeWidth={2} />}
          {FREQUENCY_LABELS[expense.frequency]}
        </span>
      </td>
      <td className="px-4 text-[13px] text-secondary whitespace-nowrap">{formatDate(expense.next_date)}</td>
      <td className="px-4">
        <button
          onClick={handleToggleActive}
          className={`text-[11px] font-medium px-2 py-1 rounded transition-colors duration-150 whitespace-nowrap ${
            expense.active ? 'bg-success/10 text-success' : 'bg-white/[0.06] text-secondary'
          }`}
        >
          {expense.active ? 'Activo' : 'Pausado'}
        </button>
      </td>
      <td className="px-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button onClick={() => onEdit(expense)} className="text-secondary hover:text-primary p-1.5 rounded-md hover:bg-white/[0.06]">
            <Pencil size={13} strokeWidth={2} />
          </button>
          <button onClick={() => setConfirmOpen(true)} className="text-secondary hover:text-danger p-1.5 rounded-md hover:bg-white/[0.06]">
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      </td>
    </tr>

    {confirmOpen && (
      <ConfirmDialog
        title="Eliminar gasto previsto"
        message={`¿Eliminar "${expense.name}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    )}
    </>
  );
}
