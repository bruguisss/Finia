import React, { useState } from 'react';
import BottomSheet from './BottomSheet.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';
import { createPlannedExpense, updatePlannedExpense } from '../api.js';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function PlannedExpenseModal({ expense, onClose, onSave }) {
  const { categories } = useCategories();
  const isEdit = !!expense;
  const [name, setName] = useState(expense?.name || '');
  const [amount, setAmount] = useState(expense?.amount || '');
  const [category, setCategory] = useState(expense?.category || 'Sin categoría');
  const [frequency, setFrequency] = useState(expense?.frequency || 'monthly');
  const [nextDate, setNextDate] = useState(expense?.next_date?.slice(0, 10) || getToday());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  return (
    <BottomSheet title={isEdit ? 'Editar gasto previsto' : 'Nuevo gasto previsto'} onClose={onClose}>
      {(close) => {
        async function handleSubmit(e) {
          e.preventDefault();
          if (!name.trim() || !amount || parseFloat(amount) <= 0) {
            setError('Rellena el nombre y un importe válido');
            return;
          }
          setSaving(true);
          setError(null);
          try {
            const payload = {
              name: name.trim(),
              amount: parseFloat(amount),
              category,
              frequency,
              next_date: nextDate,
            };
            const saved = isEdit
              ? await updatePlannedExpense(expense.id, payload)
              : await createPlannedExpense(payload);
            onSave(saved);
            close();
          } catch (err) {
            setError(err.message);
            setSaving(false);
          }
        }

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-secondary mb-1.5">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Alquiler"
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
                <label className="block text-xs text-secondary mb-1.5">Frecuencia</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-border-strong"
                >
                  <option value="once">Una vez</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
              <div>
                <label className="block text-xs text-secondary mb-1.5">
                  {frequency === 'once' ? 'Fecha' : 'Próxima fecha'}
                </label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-border-strong"
                  required
                />
              </div>
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
                {saving ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </form>
        );
      }}
    </BottomSheet>
  );
}
