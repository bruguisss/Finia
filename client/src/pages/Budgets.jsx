import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Target } from 'lucide-react';
import BudgetBar from '../components/BudgetBar.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';
import { getBudgets, createBudget } from '../api.js';

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function addMonths(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

export default function Budgets() {
  const { categories } = useCategories();
  const [month, setMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBudgets(month);
      setBudgets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newLimit || parseFloat(newLimit) <= 0) {
      setError('Introduce un límite válido');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createBudget({ category: newCategory, monthly_limit: parseFloat(newLimit) });
      setBudgets((prev) => [...prev, created]);
      setModalOpen(false);
      setNewLimit('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleUpdate(updated) {
    setBudgets((prev) => prev.map((b) => b.id === updated.id ? updated : b));
  }

  function handleDelete(id) {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

  const usedCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = categories.filter(
    (c) => !usedCategories.has(c.name) && c.name !== 'Ingresos' && c.name !== 'Sin categoría'
  );

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.some((c) => c.name === newCategory)) {
      setNewCategory(availableCategories[0].name);
    }
  }, [availableCategories, newCategory]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-primary tracking-tight">Presupuestos</h2>
          <p className="text-sm text-secondary capitalize">{formatMonth(month)}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month selector */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg px-1">
            <button
              onClick={() => setMonth(addMonths(month, -1))}
              className="w-8 h-8 text-secondary hover:text-primary transition-colors duration-150 flex items-center justify-center"
            ><ChevronLeft size={15} strokeWidth={2} /></button>
            <span className="text-sm text-primary px-2 capitalize whitespace-nowrap">{formatMonth(month)}</span>
            <button
              onClick={() => setMonth(addMonths(month, 1))}
              disabled={month >= getCurrentMonth()}
              className="w-8 h-8 text-secondary hover:text-primary transition-colors duration-150 flex items-center justify-center disabled:opacity-30"
            ><ChevronRight size={15} strokeWidth={2} /></button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            disabled={availableCategories.length === 0}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-accent text-base text-[13px] font-medium hover:bg-accent-hover transition-colors duration-150 disabled:opacity-40"
          >
            + Añadir presupuesto
          </button>
        </div>
      </div>

      <AlertBanner budgets={budgets} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-5">
              <div className="skeleton h-4 w-32 mb-3" />
              <div className="skeleton h-3 w-24 mb-4" />
              <div className="skeleton h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetBar
              key={b.id}
              budget={b}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-secondary">
          <Target size={28} strokeWidth={1.5} className="mx-auto mb-3 text-tertiary" />
          <p className="font-medium text-primary mb-1">No hay presupuestos configurados</p>
          <p className="text-sm mb-4">Añade presupuestos para controlar tus gastos por categoría</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-1.5 rounded-md bg-accent text-base font-medium text-[13px] hover:bg-accent-hover transition-colors duration-150"
          >
            + Añadir tu primer presupuesto
          </button>
        </div>
      )}

      {/* Add budget modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="bg-surface border border-border rounded-lg w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-base font-semibold text-primary tracking-tight">Nuevo presupuesto</h3>
              <button onClick={() => setModalOpen(false)} className="text-secondary hover:text-primary transition-colors duration-150"><X size={18} strokeWidth={2} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-secondary mb-1.5">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-white/30"
                >
                  {availableCategories.map((c) => (
                    <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-secondary mb-1.5">Límite mensual (€)</label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="ej: 300"
                  min="1"
                  step="10"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-danger">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-md bg-muted border border-white/10 text-sm font-medium text-primary hover:bg-[#334155] transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-md bg-accent text-base font-medium text-sm hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
