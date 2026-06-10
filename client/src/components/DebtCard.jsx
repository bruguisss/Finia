import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { updateDebt, deleteDebt } from '../api.js';

const STATUS_LABELS = { pending: 'Pendiente', partial: 'Parcial', paid: 'Pagada' };
const STATUS_COLORS = { pending: '#fbbf24', partial: '#60a5fa', paid: '#6ee7b7' };

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

  async function handleDelete() {
    if (!confirm(`¿Eliminar deuda de ${debt.person}?`)) return;
    try {
      await deleteDebt(debt.id);
      onDelete(debt.id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-5 transition-all duration-200 hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary truncate">{debt.person}</p>
          {debt.description && <p className="text-xs text-secondary mt-0.5 truncate">{debt.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button onClick={() => onEdit(debt)} className="text-secondary hover:text-primary transition-colors">
            <Pencil size={13} strokeWidth={2} />
          </button>
          <button onClick={handleDelete} className="text-secondary hover:text-danger transition-colors">
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${isOwedByMe ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
          {isOwedByMe ? 'Yo debo' : 'Me deben'}
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded"
          style={{ backgroundColor: `${STATUS_COLORS[debt.status]}20`, color: STATUS_COLORS[debt.status] }}
        >
          {STATUS_LABELS[debt.status]}
        </span>
        {overdue && (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-danger/10 text-danger">
            Vencida
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mb-2 gap-2">
        <div>
          <p className={`text-xl font-semibold tabular-nums ${isOwedByMe ? 'text-danger' : 'text-accent'}`}>
            {formatEur(remaining)}
          </p>
          {debt.amount_paid > 0 && (
            <p className="text-xs text-secondary">de {formatEur(debt.amount)} · pagado {formatEur(debt.amount_paid)}</p>
          )}
        </div>
        {debt.date_due && (
          <p className={`text-xs whitespace-nowrap ${overdue ? 'text-danger' : 'text-secondary'}`}>
            Vence: {formatDate(debt.date_due)}
          </p>
        )}
      </div>

      {debt.amount_paid > 0 && debt.status !== 'paid' && (
        <div className="h-1.5 bg-elevated rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${percentage}%` }} />
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
            className="flex-1 min-w-0 bg-elevated border border-border rounded px-2.5 py-1.5 text-xs text-primary placeholder-secondary focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={paying || !payAmount}
            className="px-3 py-1.5 rounded bg-accent text-base text-xs font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            {paying ? '...' : 'Abonar'}
          </button>
        </form>
      )}
    </div>
  );
}
