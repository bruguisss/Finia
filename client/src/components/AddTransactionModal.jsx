import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCategories } from '../context/CategoriesContext.jsx';
import { createTransaction } from '../api.js';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTransactionModal({ onClose, onSwitchToUpload }) {
  const { categories } = useCategories();
  const [type, setType] = useState('debit');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Sin categoría');
  const [date, setDate] = useState(getToday());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
      window.location.reload();
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
          <h2 className="text-base font-semibold text-primary tracking-tight">Añadir transacción</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors duration-150">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('debit')}
              className={`px-4 py-2.5 rounded-md text-sm font-medium border transition-colors duration-150 ${
                type === 'debit' ? 'bg-danger/10 border-danger text-danger' : 'border-border text-secondary hover:text-primary'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('credit')}
              className={`px-4 py-2.5 rounded-md text-sm font-medium border transition-colors duration-150 ${
                type === 'credit' ? 'bg-success/10 border-success text-success' : 'border-border text-secondary hover:text-primary'
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
              <label className="block text-xs text-secondary mb-1.5">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={getToday()}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-white/30"
                required
              />
            </div>
          </div>

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

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-md bg-muted border border-white/10 text-sm font-medium text-primary hover:bg-[#3A3A3C] transition-colors duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-md bg-accent text-base font-medium text-sm hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Añadir'}
            </button>
          </div>

          {onSwitchToUpload && (
            <button
              type="button"
              onClick={onSwitchToUpload}
              className="w-full text-center text-xs text-secondary hover:text-accent transition-colors duration-150 pt-1"
            >
              ¿Prefieres importar un extracto CSV?
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
