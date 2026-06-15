import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Target, Handshake, CalendarClock, PiggyBank } from 'lucide-react';
import Header from '../components/Header.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import BudgetBar from '../components/BudgetBar.jsx';
import BudgetModal from '../components/BudgetModal.jsx';
import GoalCard from '../components/GoalCard.jsx';
import GoalModal from '../components/GoalModal.jsx';
import DebtCard from '../components/DebtCard.jsx';
import DebtModal from '../components/DebtModal.jsx';
import PlannedExpenseCard from '../components/PlannedExpenseCard.jsx';
import PlannedExpenseModal from '../components/PlannedExpenseModal.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';
import { useCachedData } from '../context/DataContext.jsx';
import {
  getBudgets, getGoals, getPlannedExpenses, getDebts, getDebtsSummary,
} from '../api.js';

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

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

const TABS = [
  { id: 'budgets', label: 'Presupuestos' },
  { id: 'goals', label: 'Objetivos' },
  { id: 'debts', label: 'Deudas' },
  { id: 'planned', label: 'Previstos' },
];

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="py-12 text-center text-secondary">
      <Icon size={28} strokeWidth={1.5} className="mx-auto mb-3 text-tertiary" />
      <p className="text-subhead text-primary mb-1">{title}</p>
      <p className="text-caption text-tertiary mb-4">{subtitle}</p>
      {action}
    </div>
  );
}

function AddButton({ onClick, children }) {
  return (
    <button onClick={onClick} className="px-3.5 py-1.5 rounded-full bg-blue text-white text-caption font-semibold whitespace-nowrap">
      {children}
    </button>
  );
}

export default function Plan() {
  const [tab, setTab] = useState('budgets');

  return (
    <div className="pt-3">
      <Header title="Plan" />

      {/* Tabs */}
      <div className="flex gap-5 mt-2 mb-4 border-b border-border overflow-x-auto -mx-4 px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 pb-2.5 text-subhead whitespace-nowrap border-b-2 transition-colors duration-150 ${
              tab === t.id ? 'text-primary border-blue font-medium' : 'text-tertiary border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'budgets' && <BudgetsTab />}
      {tab === 'goals' && <GoalsTab />}
      {tab === 'debts' && <DebtsTab />}
      {tab === 'planned' && <PlannedTab />}
    </div>
  );
}

function BudgetsTab() {
  const { categories } = useCategories();
  const [month, setMonth] = useState(getCurrentMonth());
  const [modalOpen, setModalOpen] = useState(false);

  const { data: budgets = [], loading, mutate } = useCachedData(`budgets:${month}`, useCallback(() => getBudgets(month), [month]));

  function handleUpdate(updated) {
    mutate((prev) => (prev ?? []).map((b) => b.id === updated.id ? updated : b));
  }

  function handleDelete(id) {
    mutate((prev) => (prev ?? []).filter((b) => b.id !== id));
  }

  function handleCreate(created) {
    mutate((prev) => [...(prev ?? []), created]);
    setModalOpen(false);
  }

  const usedCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = categories.filter(
    (c) => !usedCategories.has(c.name) && c.name !== 'Ingresos' && c.name !== 'Sin categoría'
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-1 bg-elevated border border-border rounded-lg px-1">
          <button onClick={() => setMonth(addMonths(month, -1))} className="w-8 h-8 text-secondary flex items-center justify-center">
            <ChevronLeft size={15} strokeWidth={2} />
          </button>
          <span className="text-subhead text-primary px-1 capitalize whitespace-nowrap">{formatMonth(month)}</span>
          <button
            onClick={() => setMonth(addMonths(month, 1))}
            disabled={month >= getCurrentMonth()}
            className="w-8 h-8 text-secondary flex items-center justify-center disabled:opacity-30"
          >
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </div>
        {(loading || budgets.length > 0) && (
          <AddButton onClick={() => setModalOpen(true)}>+ Añadir</AddButton>
        )}
      </div>

      <AlertBanner budgets={budgets} />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-1 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : budgets.length > 0 ? (
        <div>
          {budgets.map((b, i) => (
            <BudgetBar key={b.id} budget={b} onUpdate={handleUpdate} onDelete={handleDelete} last={i === budgets.length - 1} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No hay presupuestos configurados"
          subtitle="Añade presupuestos para controlar tus gastos por categoría"
          action={<AddButton onClick={() => setModalOpen(true)}>+ Añadir tu primer presupuesto</AddButton>}
        />
      )}

      {modalOpen && (
        <BudgetModal availableCategories={availableCategories} onClose={() => setModalOpen(false)} onSave={handleCreate} />
      )}
    </div>
  );
}

function GoalsTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: result, loading, mutate } = useCachedData('planning', useCallback(async () => {
    const [goalsData, expensesData] = await Promise.all([getGoals(), getPlannedExpenses()]);
    return { goals: goalsData, expenses: expensesData };
  }, []));

  const goals = result?.goals ?? [];

  function handleUpdate(updated) {
    mutate((prev) => ({ ...prev, goals: (prev?.goals ?? []).map((g) => (g.id === updated.id ? updated : g)) }));
  }

  function handleDelete(id) {
    mutate((prev) => ({ ...prev, goals: (prev?.goals ?? []).filter((g) => g.id !== id) }));
  }

  function handleCreate(created) {
    mutate((prev) => ({ ...prev, goals: [...(prev?.goals ?? []), created] }));
    setModalOpen(false);
  }

  return (
    <div>
      {(loading || goals.length > 0) && (
        <div className="flex justify-end mb-3">
          <AddButton onClick={() => setModalOpen(true)}>+ Nuevo objetivo</AddButton>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-5">
              <div className="skeleton h-4 w-32 mb-3" />
              <div className="skeleton h-3 w-24 mb-4" />
              <div className="skeleton h-1 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PiggyBank}
          title="No hay objetivos configurados"
          subtitle="Define metas de ahorro o límites de gasto para seguir tu progreso"
          action={<AddButton onClick={() => setModalOpen(true)}>+ Añadir tu primer objetivo</AddButton>}
        />
      )}

      {modalOpen && (
        <GoalModal onClose={() => setModalOpen(false)} onSave={handleCreate} />
      )}
    </div>
  );
}

function DebtsTab() {
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);

  const { data: result, loading, mutate } = useCachedData(`debts:${statusFilter}`, useCallback(async () => {
    const [debtsData, summaryData] = await Promise.all([
      getDebts({ status: statusFilter || undefined }),
      getDebtsSummary(),
    ]);
    return { debts: debtsData, summary: summaryData };
  }, [statusFilter]));

  const debts = result?.debts ?? [];
  const summary = result?.summary ?? null;

  function refreshSummary() {
    getDebtsSummary().then((summaryData) => mutate((prev) => ({ ...prev, summary: summaryData }))).catch(console.error);
  }

  function openCreate() {
    setEditingDebt(null);
    setModalOpen(true);
  }

  function openEdit(debt) {
    setEditingDebt(debt);
    setModalOpen(true);
  }

  function handleSave(saved) {
    mutate((prev) => {
      const list = prev?.debts ?? [];
      const exists = list.some((d) => d.id === saved.id);
      const debts = exists ? list.map((d) => (d.id === saved.id ? saved : d)) : [saved, ...list];
      return { ...prev, debts };
    });
    setModalOpen(false);
    refreshSummary();
  }

  function handleUpdate(updated) {
    mutate((prev) => ({ ...prev, debts: (prev?.debts ?? []).map((d) => (d.id === updated.id ? updated : d)) }));
    refreshSummary();
  }

  function handleDelete(id) {
    mutate((prev) => ({ ...prev, debts: (prev?.debts ?? []).filter((d) => d.id !== id) }));
    refreshSummary();
  }

  const owedByMe = debts.filter((d) => d.type === 'owed_by_me');
  const owedToMe = debts.filter((d) => d.type === 'owed_to_me');

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-caption text-tertiary uppercase">Debo</p>
          <p className="text-title-3 text-danger mt-0.5 tabular-nums truncate">{summary ? formatEur(summary.totalOwedByMe) : '—'}</p>
        </div>
        <div>
          <p className="text-caption text-tertiary uppercase">Me deben</p>
          <p className="text-title-3 text-success mt-0.5 tabular-nums truncate">{summary ? formatEur(summary.totalOwedToMe) : '—'}</p>
        </div>
        <div>
          <p className="text-caption text-tertiary uppercase">Vencidas</p>
          <p className="text-title-3 text-primary mt-0.5 tabular-nums truncate">{summary ? summary.overdueCount : '—'}</p>
        </div>
      </div>

      {/* Filters + add */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto">
        {[['', 'Todas'], ['pending', 'Pendiente'], ['partial', 'Parcial'], ['paid', 'Pagada']].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-caption whitespace-nowrap border ${statusFilter === value ? 'bg-white/10 text-primary border-transparent' : 'border-border text-secondary'}`}
          >
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <AddButton onClick={openCreate}>+ Nueva deuda</AddButton>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-5">
              <div className="skeleton h-4 w-32 mb-3" />
              <div className="skeleton h-3 w-24 mb-4" />
              <div className="skeleton h-6 w-28" />
            </div>
          ))}
        </div>
      ) : debts.length > 0 ? (
        <div className="space-y-6">
          {owedByMe.length > 0 && (
            <div>
              <p className="text-caption text-tertiary uppercase mb-2">Debo</p>
              <div className="space-y-3">
                {owedByMe.map((d) => (
                  <DebtCard key={d.id} debt={d} onEdit={openEdit} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
          {owedToMe.length > 0 && (
            <div>
              <p className="text-caption text-tertiary uppercase mb-2">Me deben</p>
              <div className="space-y-3">
                {owedToMe.map((d) => (
                  <DebtCard key={d.id} debt={d} onEdit={openEdit} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Handshake}
          title="No hay deudas registradas"
          subtitle="Lleva el control del dinero que debes o que te deben"
          action={<AddButton onClick={openCreate}>+ Añadir tu primera deuda</AddButton>}
        />
      )}

      {modalOpen && (
        <DebtModal debt={editingDebt} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}

function PlannedTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const { data: result, loading, mutate } = useCachedData('planning', useCallback(async () => {
    const [goalsData, expensesData] = await Promise.all([getGoals(), getPlannedExpenses()]);
    return { goals: goalsData, expenses: expensesData };
  }, []));

  const expenses = result?.expenses ?? [];

  function openCreate() {
    setEditingExpense(null);
    setModalOpen(true);
  }

  function openEdit(expense) {
    setEditingExpense(expense);
    setModalOpen(true);
  }

  function handleSave(saved) {
    mutate((prev) => {
      const list = prev?.expenses ?? [];
      const exists = list.some((e) => e.id === saved.id);
      const expenses = exists ? list.map((e) => (e.id === saved.id ? saved : e)) : [...list, saved];
      return { ...prev, expenses };
    });
    setModalOpen(false);
  }

  function handleUpdate(updated) {
    mutate((prev) => ({ ...prev, expenses: (prev?.expenses ?? []).map((e) => (e.id === updated.id ? updated : e)) }));
  }

  function handleDelete(id) {
    mutate((prev) => ({ ...prev, expenses: (prev?.expenses ?? []).filter((e) => e.id !== id) }));
  }

  return (
    <div>
      {(loading || expenses.length > 0) && (
        <div className="flex justify-end mb-3">
          <AddButton onClick={openCreate}>+ Nuevo gasto previsto</AddButton>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <div className="skeleton w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3 w-32" />
                <div className="skeleton h-2.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : expenses.length > 0 ? (
        <div>
          {expenses.map((e, i) => (
            <PlannedExpenseCard key={e.id} expense={e} index={i} onEdit={openEdit} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarClock}
          title="No hay gastos previstos"
          subtitle="Añade gastos recurrentes o puntuales para que la app los prediga"
          action={<AddButton onClick={openCreate}>+ Añadir tu primer gasto previsto</AddButton>}
        />
      )}

      {modalOpen && (
        <PlannedExpenseModal expense={editingExpense} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
