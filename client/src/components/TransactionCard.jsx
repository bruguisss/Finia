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

export default function TransactionCard({ transaction, onUpdate, onDelete, index = 0 }) {
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
      className="flex items-center gap-3 px-4 py-3 active:bg-white/[0.04] transition-colors duration-100 animate-fade-in-up-sm"
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <CategoryAvatar category={transaction.category} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-primary truncate">{transaction.description}</p>
        {onUpdate ? (
          editing ? (
            <select
              autoFocus
              value={transaction.category}
              onChange={handleCategoryChange}
              onBlur={() => setEditing(false)}
              className="mt-0.5 bg-muted border border-border rounded px-1.5 py-0.5 text-[11px] text-primary focus:outline-none focus:border-white/30"
            >
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          ) : (
            <button onClick={() => setEditing(true)} className="text-[12px] text-secondary">
              {transaction.category} · {formatDate(transaction.date)}
            </button>
          )
        ) : (
          <p className="text-[12px] text-secondary">{transaction.category} · {formatDate(transaction.date)}</p>
        )}
      </div>
      <span className={`text-[14px] font-medium font-mono tabular-nums shrink-0 ${isDebit ? 'text-danger' : 'text-success'}`}>
        {formatAmount(transaction.amount, transaction.type)}
      </span>
      {onDelete && (
        <button onClick={() => setConfirmOpen(true)} className="shrink-0 text-secondary hover:text-danger p-1.5 -mr-1.5 rounded-md">
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
