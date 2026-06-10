import React, { useState } from 'react';
import CategoryBadge, { ALL_CATEGORIES } from './CategoryBadge.jsx';
import { updateTransactionCategory, deleteTransaction } from '../api.js';

function formatAmount(amount, type) {
  const fmt = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return type === 'debit' ? `-${fmt} €` : `+${fmt} €`;
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function TransactionRow({ transaction, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCategoryChange(e) {
    const newCat = e.target.value;
    setSaving(true);
    try {
      const updated = await updateTransactionCategory(transaction.id, newCat);
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta transacción?')) return;
    try {
      await deleteTransaction(transaction.id);
      onDelete(transaction.id);
    } catch (err) {
      console.error(err);
    }
  }

  const isDebit = transaction.type === 'debit';

  return (
    <tr className="border-b border-border hover:bg-elevated/50 transition-colors group">
      <td className="py-3 px-4 text-sm text-secondary whitespace-nowrap">
        {formatDate(transaction.date)}
      </td>
      <td className="py-3 px-4 text-sm max-w-xs">
        <span className="truncate block" title={transaction.description}>
          {transaction.description}
        </span>
      </td>
      <td className="py-3 px-4">
        {editing ? (
          <select
            autoFocus
            value={transaction.category}
            onChange={handleCategoryChange}
            onBlur={() => setEditing(false)}
            disabled={saving}
            className="bg-elevated border border-border rounded px-2 py-1 text-xs text-primary focus:outline-none focus:border-accent"
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        ) : (
          <button onClick={() => setEditing(true)} title="Click para editar">
            <CategoryBadge category={transaction.category} />
          </button>
        )}
      </td>
      <td className={`py-3 px-4 text-sm font-medium tabular-nums text-right ${isDebit ? 'text-danger' : 'text-accent'}`}>
        {formatAmount(transaction.amount, transaction.type)}
      </td>
      <td className="py-3 px-4 text-right">
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-secondary hover:text-danger transition-all text-xs px-2 py-1"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}
