import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createGoal } from '../api.js';

export default function GoalModal({ onClose, onSave }) {
  const [type, setType] = useState('savings');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'calc(100vw - 32px)', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
        className="bg-surface border border-border rounded-2xl shadow-2xl animate-fade-in"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-primary tracking-tight">Nuevo objetivo</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors duration-150">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('savings')}
              className={`px-4 py-2.5 rounded-md text-sm font-medium border transition-colors duration-150 ${
                type === 'savings' ? 'bg-success/10 border-success text-success' : 'border-border text-secondary hover:text-primary'
              }`}
            >
              Ahorro
            </button>
            <button
              type="button"
              onClick={() => setType('spending')}
              className={`px-4 py-2.5 rounded-md text-sm font-medium border transition-colors duration-150 ${
                type === 'spending' ? 'bg-blue/10 border-blue text-blue' : 'border-border text-secondary hover:text-primary'
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
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-white/30"
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
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-white/30"
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
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-white/30"
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
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-white/30"
              />
            </div>
          )}

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
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
      </div>
    </div>
  );
}
