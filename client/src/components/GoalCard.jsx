import React, { useState } from 'react';
import { Pencil, Trash2, PiggyBank, TrendingDown, Plus } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog.jsx';
import { updateGoal, deleteGoal } from '../api.js';

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function GoalCard({ goal, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState(goal.target_amount);
  const [contribution, setContribution] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { id, name, type, target_amount, current_amount, target_date, percentage = 0 } = goal;
  const isSavings = type === 'savings';

  const barColor = isSavings
    ? '#30D158'
    : (percentage >= 100 ? '#FF453A' : percentage >= 75 ? '#FFD60A' : '#30D158');

  async function handleSaveTarget() {
    setSaving(true);
    try {
      const updated = await updateGoal(id, { target_amount: parseFloat(target) });
      onUpdate({ ...goal, ...updated });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleContribute(e) {
    e.preventDefault();
    if (!contribution || parseFloat(contribution) === 0) return;
    setSaving(true);
    try {
      const newAmount = parseFloat(current_amount) + parseFloat(contribution);
      const updated = await updateGoal(id, { current_amount: newAmount });
      const newPercentage = target_amount > 0 ? Math.round((newAmount / target_amount) * 100) : 0;
      onUpdate({ ...goal, ...updated, percentage: newPercentage });
      setContribution('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setConfirmOpen(false);
    try {
      await deleteGoal(id);
      onDelete(id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 transition-colors duration-150">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isSavings ? (
            <PiggyBank size={18} strokeWidth={1.75} className="text-success shrink-0" />
          ) : (
            <TrendingDown size={18} strokeWidth={1.75} className="text-blue shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-subhead font-medium text-primary truncate">{name}</p>
            <p className="text-caption text-tertiary">
              {formatEur(current_amount)} de {formatEur(target_amount)}
              {target_date && ` · hasta ${formatDate(target_date)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-subhead font-semibold tabular-nums" style={{ color: barColor }}>
            {percentage}%
          </span>
          <button onClick={() => setEditing(!editing)} className="text-tertiary p-1">
            <Pencil size={13} strokeWidth={2} />
          </button>
          <button onClick={() => setConfirmOpen(true)} className="text-tertiary p-1">
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="h-2 bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }}
        />
      </div>

      {editing && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-1 bg-elevated border border-border rounded-lg px-3 py-1.5 text-subhead text-primary focus:outline-none focus:border-border-strong"
            placeholder="Importe objetivo"
            min="0"
            step="10"
          />
          <button
            onClick={handleSaveTarget}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-md bg-blue text-white text-caption font-semibold disabled:opacity-50"
          >
            {saving ? '...' : 'Guardar'}
          </button>
        </div>
      )}

      {isSavings && !editing && (
        <form onSubmit={handleContribute} className="mt-3 flex items-center gap-2">
          <input
            type="number"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            className="flex-1 bg-elevated border border-border rounded-lg px-3 py-1.5 text-subhead text-primary placeholder-tertiary focus:outline-none focus:border-border-strong"
            placeholder="Añadir aporte (€)"
            step="1"
          />
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-elevated border border-border text-primary text-caption font-medium disabled:opacity-50"
          >
            <Plus size={13} strokeWidth={2} />
            Aporte
          </button>
        </form>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Eliminar objetivo"
          message={`¿Eliminar el objetivo "${name}"? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
