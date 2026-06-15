import React, { useState } from 'react';
import BottomSheet from './BottomSheet.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';
import { useInvalidateData } from '../context/DataContext.jsx';
import { createTransaction } from '../api.js';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTransactionModal({ onClose }) {
  const { categories } = useCategories();
  const invalidateData = useInvalidateData();
  const [type, setType] = useState('debit');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Sin categoría');
  const [date, setDate] = useState(getToday());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  return (
    <BottomSheet title="Añadir transacción" onClose={onClose}>
      {(close) => {
        async function handleSubmit(e) {
          e.preventDefault();
          if (!description.trim() || !amount || parseFloat(amount) <= 0) {
            setError('Rellena la descripción y un importe válido');
            return;
          }
          setSaving(true);
          setError(null);
          try {
            await createTransaction({
              date,
              description: description.trim(),
              amount: parseFloat(amount),
              type,
              category,
            });
            invalidateData();
            close();
          } catch (err) {
            setError(err.message);
            setSaving(false);
          }
        }

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Segmented type control */}
            <div className="flex bg-elevated border border-border rounded-lg p-1">
              <button
                type="button"
                onClick={() => setType('debit')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  type === 'debit' ? 'bg-danger/15 text-danger' : 'text-secondary'
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  type === 'credit' ? 'bg-success/15 text-success' : 'text-secondary'
                }`}
              >
                Ingreso
              </button>
            </div>

            <div>
              <label className="block text-xs text-secondary mb-1.5">Descripción</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ej: Cena con amigos"
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-secondary mb-1.5">Importe (€)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-secondary mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={getToday()}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-border-strong"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-secondary mb-1.5">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-border-strong"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={close}
                className="flex-1 px-4 py-2.5 rounded-md bg-elevated border border-border text-sm font-medium text-primary transition-colors duration-150"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-md bg-blue text-white font-semibold text-sm transition-colors duration-150 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Añadir'}
              </button>
            </div>
          </form>
        );
      }}
    </BottomSheet>
  );
}
