import React, { useState, useEffect, useCallback } from 'react';
import { Target, CalendarClock } from 'lucide-react';
import GoalCard from '../components/GoalCard.jsx';
import GoalModal from '../components/GoalModal.jsx';
import PlannedExpenseRow from '../components/PlannedExpenseRow.jsx';
import PlannedExpenseCard from '../components/PlannedExpenseCard.jsx';
import PlannedExpenseModal from '../components/PlannedExpenseModal.jsx';
import { getGoals, getPlannedExpenses } from '../api.js';

export default function Planning() {
  const [goals, setGoals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsData, expensesData] = await Promise.all([getGoals(), getPlannedExpenses()]);
      setGoals(goalsData);
      setExpenses(expensesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleGoalSave(created) {
    setGoals((prev) => [...prev, created]);
    setGoalModalOpen(false);
  }

  function handleGoalUpdate(updated) {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  }

  function handleGoalDelete(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function openCreateExpense() {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  }

  function openEditExpense(expense) {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  }

  function handleExpenseSave(saved) {
    setExpenses((prev) => {
      const exists = prev.some((e) => e.id === saved.id);
      return exists ? prev.map((e) => (e.id === saved.id ? saved : e)) : [...prev, saved];
    });
    setExpenseModalOpen(false);
  }

  function handleExpenseUpdate(updated) {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  function handleExpenseDelete(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-primary tracking-tight">Planificación</h2>
      </div>

      {/* Goals section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium tracking-heading text-primary">Objetivos</h3>
          {(loading || goals.length > 0) && (
            <button
              onClick={() => setGoalModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-accent text-base text-[13px] font-semibold hover:bg-accent-hover transition-colors duration-150"
            >
              + Nuevo objetivo
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-5">
                <div className="skeleton h-4 w-32 mb-3" />
                <div className="skeleton h-3 w-24 mb-4" />
                <div className="skeleton h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => (
              <GoalCard key={g.id} goal={g} onUpdate={handleGoalUpdate} onDelete={handleGoalDelete} />
            ))}
          </div>
        ) : (
          <div className="py-12 px-6 text-center text-secondary bg-surface border border-border rounded-lg">
            <Target size={28} strokeWidth={1.5} className="mx-auto mb-3 text-tertiary" />
            <p className="font-medium text-primary mb-1">No hay objetivos configurados</p>
            <p className="text-sm mb-4">Define metas de ahorro o límites de gasto para seguir tu progreso</p>
            <button
              onClick={() => setGoalModalOpen(true)}
              className="px-3.5 py-1.5 rounded-md bg-accent text-base font-semibold text-[13px] hover:bg-accent-hover transition-colors duration-150"
            >
              + Añadir tu primer objetivo
            </button>
          </div>
        )}
      </div>

      {/* Planned expenses section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium tracking-heading text-primary">Gastos previstos</h3>
          {(loading || expenses.length > 0) && (
            <button
              onClick={openCreateExpense}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-accent text-base text-[13px] font-semibold hover:bg-accent-hover transition-colors duration-150"
            >
              + Nuevo gasto previsto
            </button>
          )}
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-8 w-full" />
              ))}
            </div>
          ) : expenses.length > 0 ? (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-secondary uppercase tracking-wider">Nombre</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-secondary uppercase tracking-wider">Categoría</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-secondary uppercase tracking-wider">Importe</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-secondary uppercase tracking-wider">Frecuencia</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-secondary uppercase tracking-wider">Próxima fecha</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-secondary uppercase tracking-wider">Estado</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e) => (
                      <PlannedExpenseRow
                        key={e.id}
                        expense={e}
                        onEdit={openEditExpense}
                        onUpdate={handleExpenseUpdate}
                        onDelete={handleExpenseDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-white/[0.04]">
                {expenses.map((e, i) => (
                  <PlannedExpenseCard
                    key={e.id}
                    expense={e}
                    index={i}
                    onEdit={openEditExpense}
                    onUpdate={handleExpenseUpdate}
                    onDelete={handleExpenseDelete}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 px-6 text-center text-secondary">
              <CalendarClock size={28} strokeWidth={1.5} className="mx-auto mb-3 text-tertiary" />
              <p className="font-medium text-primary mb-1">No hay gastos previstos</p>
              <p className="text-sm mb-4">Añade gastos recurrentes o puntuales para que la app los prediga</p>
              <button
                onClick={openCreateExpense}
                className="px-3.5 py-1.5 rounded-md bg-accent text-base font-semibold text-[13px] hover:bg-accent-hover transition-colors duration-150"
              >
                + Añadir tu primer gasto previsto
              </button>
            </div>
          )}
        </div>
      </div>

      {goalModalOpen && (
        <GoalModal onClose={() => setGoalModalOpen(false)} onSave={handleGoalSave} />
      )}

      {expenseModalOpen && (
        <PlannedExpenseModal
          expense={editingExpense}
          onClose={() => setExpenseModalOpen(false)}
          onSave={handleExpenseSave}
        />
      )}
    </div>
  );
}
