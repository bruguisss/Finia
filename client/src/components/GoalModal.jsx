import React, { useState } from 'react';
import BottomSheet from './BottomSheet.jsx';
import { createGoal } from '../api.js';

export default function GoalModal({ onClose, onSave }) {
  const [type, setType] = useState('savings');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  return (
    <BottomSheet title="Nuevo objetivo" onClose={onClose}>
      {(close) => {
        async function handleSubmit(e) {
          e.preventDefault();
          if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
            setError('Rellena el nombre y un importe objetivo válido');
            return;
          }
          setSaving(true);
          setError(null);
          try {
            const created = await createGoal({
              name: name.trim(),
              type,
              target_amount: parseFloat(targetAmount),
              current_amount: currentAmount ? parseFloat(currentAmount) : 0,
              target_date: type === 'savings' && targetDate ? targetDate : null,
            });
            onSave(created);
            close();
          } catch (err) {
            setError(err.message);
            setSaving(false);
          }
        }

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type segmented control */}
            <div className="flex bg-elevated border border-border rounded-lg p-1">
              <button
                type="button"
                onClick={() => setType('savings')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  type === 'savings' ? 'bg-success/15 text-success' : 'text-secondary'
                }`}
              >
                Ahorro
              </button>
              <button
                type="button"
                onClick={() => setType('spending')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  type === 'spending' ? 'bg-blue/15 text-blue' : 'text-secondary'
                }`}
              >
                Límite de gasto
              </button>
            </div>

            <div>
              <label className="block text-xs text-secondary mb-1.5">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'savings' ? 'ej: Fondo de emergencia' : 'ej: Gasto total mensual'}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-secondary mb-1.5">{type === 'savings' ? 'Meta (€)' : 'Límite mensual (€)'}</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="10"
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong"
                  required
                />
              </div>
              {type === 'savings' && (
                <div>
                  <label className="block text-xs text-secondary mb-1.5">Ahorrado ya (€)</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="10"
                    className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong"
                  />
                </div>
              )}
            </div>

            {type === 'savings' && (
              <div>
                <label className="block text-xs text-secondary mb-1.5">Fecha límite (opcional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-border-strong"
                />
              </div>
            )}

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
                {saving ? 'Guardando...' : 'Crear'}
              </button>
            </div>
          </form>
        );
      }}
    </BottomSheet>
  );
}
