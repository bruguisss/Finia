import React, { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/StatCard.jsx';
import DebtCard from '../components/DebtCard.jsx';
import DebtModal from '../components/DebtModal.jsx';
import { getDebts, getDebtsSummary } from '../api.js';

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [debtsData, summaryData] = await Promise.all([
        getDebts({ type: typeFilter || undefined, status: statusFilter || undefined }),
        getDebtsSummary(),
      ]);
      setDebts(debtsData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditingDebt(null);
    setModalOpen(true);
  }

  function openEdit(debt) {
    setEditingDebt(debt);
    setModalOpen(true);
  }

  function handleSave(saved) {
    setDebts((prev) => {
      const exists = prev.some((d) => d.id === saved.id);
      return exists ? prev.map((d) => (d.id === saved.id ? saved : d)) : [saved, ...prev];
    });
    setModalOpen(false);
    getDebtsSummary().then(setSummary).catch(console.error);
  }

  function handleUpdate(updated) {
    setDebts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    getDebtsSummary().then(setSummary).catch(console.error);
  }

  function handleDelete(id) {
    setDebts((prev) => prev.filter((d) => d.id !== id));
    getDebtsSummary().then(setSummary).catch(console.error);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-primary">Deudas</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-base text-sm font-medium hover:bg-accent/80 transition-colors"
        >
          + Nueva deuda
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Yo debo"
          value={summary ? formatEur(summary.totalOwedByMe) : '—'}
          loading={loading}
        />
        <StatCard
          label="Me deben"
          value={summary ? formatEur(summary.totalOwedToMe) : '—'}
          loading={loading}
        />
        <StatCard
          label="Vencidas"
          value={summary ? summary.overdueCount : '—'}
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
        >
          <option value="">Todos los tipos</option>
          <option value="owed_to_me">Me deben</option>
          <option value="owed_by_me">Yo debo</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="partial">Parcial</option>
          <option value="paid">Pagada</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-5">
              <div className="skeleton h-4 w-32 mb-3" />
              <div className="skeleton h-3 w-24 mb-4" />
              <div className="skeleton h-6 w-28" />
            </div>
          ))}
        </div>
      ) : debts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {debts.map((d) => (
            <DebtCard
              key={d.id}
              debt={d}
              onEdit={openEdit}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-secondary">
          <p className="text-4xl mb-3">🤝</p>
          <p className="font-medium text-primary mb-1">No hay deudas registradas</p>
          <p className="text-sm mb-4">Lleva el control del dinero que debes o que te deben</p>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-lg bg-accent text-base font-medium text-sm hover:bg-accent/80 transition-colors"
          >
            + Añadir tu primera deuda
          </button>
        </div>
      )}

      {modalOpen && (
        <DebtModal
          debt={editingDebt}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
