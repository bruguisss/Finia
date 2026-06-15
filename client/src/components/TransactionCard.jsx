import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import CategoryAvatar from './CategoryAvatar.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';
import { updateTransactionCategory, deleteTransaction } from '../api.js';

function formatAmount(amount, type) {
  const fmt = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return type === 'debit' ? `-${fmt} €` : `+${fmt} €`;
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function TransactionCard({ transaction, onUpdate, onDelete, index = 0, last = false }) {
  const { categories } = useCategories();
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDebit = transaction.type === 'debit';

  async function handleCategoryChange(e) {
    const newCat = e.target.value;
    try {
      const updated = await updateTransactionCategory(transaction.id, newCat);
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setEditing(false);
    }
  }

  async function confirmDelete() {
    setConfirmOpen(false);
    try {
      await deleteTransaction(transaction.id);
      onDelete(transaction.id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
    <div
      className={`flex items-center gap-3 py-2.5 min-h-[56px] active:scale-[0.98] transition-transform duration-[80ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] animate-fade-in-up-sm ${!last ? 'border-b border-white/[0.05]' : ''}`}
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <CategoryAvatar category={transaction.category} size={40} />
      <div className="flex-1 min-w-0">
        <p className="text-body text-primary truncate">{transaction.description}</p>
        {onUpdate ? (
          editing ? (
            <select
              autoFocus
              value={transaction.category}
              onChange={handleCategoryChange}
              onBlur={() => setEditing(false)}
              className="mt-0.5 bg-muted border border-border rounded px-1.5 py-0.5 text-caption text-primary focus:outline-none focus:border-white/30"
            >
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          ) : (
            <button onClick={() => setEditing(true)} className="text-caption text-tertiary truncate">
              {transaction.category}
            </button>
          )
        ) : (
          <p className="text-caption text-tertiary truncate">{transaction.category}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className={`text-body font-semibold ${isDebit ? 'text-danger' : 'text-success'}`}>
          {formatAmount(transaction.amount, transaction.type)}
        </p>
        <p className="text-caption text-tertiary">{formatDate(transaction.date)}</p>
      </div>
      {onDelete && (
        <button onClick={() => setConfirmOpen(true)} className="shrink-0 text-tertiary hover:text-danger p-1.5 -mr-1.5 rounded-md">
          <Trash2 size={14} strokeWidth={2} />
        </button>
      )}
    </div>

    {confirmOpen && (
      <ConfirmDialog
        title="Eliminar transacción"
        message="¿Eliminar esta transacción? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    )}
    </>
  );
}
