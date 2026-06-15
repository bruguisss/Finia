import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog.jsx';
import { updateDebt, deleteDebt } from '../api.js';

const STATUS_LABELS = { pending: 'Pendiente', partial: 'Parcial', paid: 'Pagada' };
const STATUS_COLORS = { pending: '#FFD60A', partial: 'rgba(235,235,245,0.6)', paid: '#30D158' };

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(debt) {
  if (!debt.date_due || debt.status === 'paid') return false;
  return debt.date_due < new Date().toISOString().slice(0, 10);
}

export default function DebtCard({ debt, onEdit, onUpdate, onDelete }) {
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isOwedByMe = debt.type === 'owed_by_me';
  const remaining = debt.amount - debt.amount_paid;
  const percentage = debt.amount > 0 ? Math.min(Math.round((debt.amount_paid / debt.amount) * 100), 100) : 0;
  const overdue = isOverdue(debt);

  async function handleAddPayment(e) {
    e.preventDefault();
    const value = parseFloat(payAmount);
    if (!value || value <= 0) return;
    setPaying(true);
    try {
      const newPaid = Math.min(debt.amount_paid + value, debt.amount);
      const updated = await updateDebt(debt.id, { amount_paid: newPaid });
      onUpdate(updated);
      setPayAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  }

  async function confirmDelete() {
    setConfirmOpen(false);
    try {
      await deleteDebt(debt.id);
      onDelete(debt.id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 transition-colors duration-150">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <p className="text-subhead font-medium text-primary truncate">{debt.person}</p>
          {debt.description && <p className="text-caption text-tertiary mt-0.5 truncate">{debt.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button onClick={() => onEdit(debt)} className="text-tertiary p-1">
            <Pencil size={13} strokeWidth={2} />
          </button>
          <button onClick={() => setConfirmOpen(true)} className="text-tertiary p-1">
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className="text-caption font-medium px-2 py-0.5 rounded"
          style={{ backgroundColor: `${STATUS_COLORS[debt.status]}1a`, color: STATUS_COLORS[debt.status] }}
        >
          {STATUS_LABELS[debt.status]}
        </span>
        {overdue && (
          <span className="text-caption font-medium px-2 py-0.5 rounded bg-danger/10 text-danger">
            Vencida
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mb-2 gap-2">
        <div>
          <p className={`text-title-2 tabular-nums ${isOwedByMe ? 'text-danger' : 'text-success'}`}>
            {formatEur(remaining)}
          </p>
          {debt.amount_paid > 0 && (
            <p className="text-caption text-tertiary">de {formatEur(debt.amount)} · pagado {formatEur(debt.amount_paid)}</p>
          )}
        </div>
        {debt.date_due && (
          <p className={`text-caption whitespace-nowrap ${overdue ? 'text-danger' : 'text-tertiary'}`}>
            Vence: {formatDate(debt.date_due)}
          </p>
        )}
      </div>

      {debt.amount_paid > 0 && debt.status !== 'paid' && (
        <div className="h-1 bg-elevated rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full bg-blue transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
      )}

      {debt.status !== 'paid' && (
        <form onSubmit={handleAddPayment} className="flex items-center gap-2 pt-1">
          <input
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="Registrar abono (€)"
            min="0.01"
            step="0.01"
            className="flex-1 min-w-0 bg-elevated border border-border rounded-lg px-2.5 py-1.5 text-caption text-primary placeholder-tertiary focus:outline-none focus:border-border-strong"
          />
          <button
            type="submit"
            disabled={paying || !payAmount}
            className="px-3.5 py-1.5 rounded-md bg-blue text-white text-caption font-semibold disabled:opacity-50"
          >
            {paying ? '...' : 'Abonar'}
          </button>
        </form>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Eliminar deuda"
          message={`¿Eliminar la deuda de ${debt.person}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
