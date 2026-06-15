import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import CategoryBadge from './CategoryBadge.jsx';
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

export default function TransactionRow({ transaction, onUpdate, onDelete }) {
  const { categories } = useCategories();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  async function confirmDelete() {
    setConfirmOpen(false);
    try {
      await deleteTransaction(transaction.id);
      onDelete(transaction.id);
    } catch (err) {
      console.error(err);
    }
  }

  const isDebit = transaction.type === 'debit';

  return (
    <>
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-150 group h-10">
      <td className="px-4 text-[13px] text-secondary whitespace-nowrap">
        {formatDate(transaction.date)}
      </td>
      <td className="px-4 text-[13px] max-w-xs">
        <span className="truncate block" title={transaction.description}>
          {transaction.description}
        </span>
      </td>
      <td className={`px-4 text-[13px] font-medium font-mono tabular-nums text-right ${isDebit ? 'text-danger' : 'text-success'}`}>
        {formatAmount(transaction.amount, transaction.type)}
      </td>
      <td className="px-4">
        {editing ? (
          <select
            autoFocus
            value={transaction.category}
            onChange={handleCategoryChange}
            onBlur={() => setEditing(false)}
            disabled={saving}
            className="bg-muted border border-border rounded px-2 py-1 text-xs text-primary focus:outline-none focus:border-white/30"
          >
            {categories.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        ) : (
          <button onClick={() => setEditing(true)} title="Click para editar">
            <CategoryBadge category={transaction.category} />
          </button>
        )}
      </td>
      <td className="px-4 text-right">
        <button
          onClick={() => setConfirmOpen(true)}
          className="opacity-0 group-hover:opacity-100 text-secondary hover:text-danger transition-all duration-150 p-1.5 rounded-md hover:bg-white/[0.06]"
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </td>
    </tr>

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
