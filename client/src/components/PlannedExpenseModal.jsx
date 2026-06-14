import React, { useState } from 'react';
import { X } from 'lucide-react';
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
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-border rounded-t-2xl md:rounded-lg w-full max-w-sm shadow-2xl animate-slide-up md:animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-primary tracking-tight">{isEdit ? 'Editar gasto previsto' : 'Nuevo gasto previsto'}</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors duration-150">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
          <div>
            <label className="block text-xs text-secondary mb-1.5">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Alquiler"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-white/30"
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
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-white/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-1.5">Frecuencia</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-white/30"
              >
                <option value="once">Una vez</option>
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
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-white/30"
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
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-white/30"
                required
              />
            </div>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-md bg-muted border border-white/10 text-sm font-medium text-primary hover:bg-[#3f3f46] transition-colors duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-md bg-accent text-base font-medium text-sm hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
