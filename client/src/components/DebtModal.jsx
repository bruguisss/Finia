import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createDebt, updateDebt } from '../api.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function DebtModal({ debt, onClose, onSave }) {
  const isEditing = !!debt;
  const [type, setType] = useState(debt?.type || 'owed_to_me');
  const [person, setPerson] = useState(debt?.person || '');
  const [description, setDescription] = useState(debt?.description || '');
  const [amount, setAmount] = useState(debt?.amount ?? '');
  const [dateCreated, setDateCreated] = useState(debt?.date_created || today());
  const [dateDue, setDateDue] = useState(debt?.date_due || '');
  const [notes, setNotes] = useState(debt?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!person.trim()) return setError('Indica el nombre de la persona');
    if (!amount || parseFloat(amount) <= 0) return setError('Introduce un importe válido');

    setSaving(true);
    setError(null);
    try {
      const data = {
        type,
        person: person.trim(),
        description: description.trim() || null,
        amount: parseFloat(amount),
        date_created: dateCreated,
        date_due: dateDue || null,
        notes: notes.trim() || null,
      };
      const saved = isEditing ? await updateDebt(debt.id, data) : await createDebt(data);
      onSave(saved);
    } catch (err) {
      setError(err.message);
    } finally {
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
          <h3 className="text-base font-semibold text-primary tracking-tight">
            {isEditing ? 'Editar deuda' : 'Nueva deuda'}
          </h3>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors duration-150"><X size={18} strokeWidth={2} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
          <div>
            <label className="block text-xs text-secondary mb-1.5">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('owed_to_me')}
                className={`px-3 py-2.5 rounded-md text-sm font-medium border transition-colors duration-150 ${
                  type === 'owed_to_me'
                    ? 'bg-success/10 border-success text-success'
                    : 'bg-elevated border-border text-secondary hover:text-primary'
                }`}
              >
                Me deben
              </button>
              <button
                type="button"
                onClick={() => setType('owed_by_me')}
                className={`px-3 py-2.5 rounded-md text-sm font-medium border transition-colors duration-150 ${
                  type === 'owed_by_me'
                    ? 'bg-danger/10 border-danger text-danger'
                    : 'bg-elevated border-border text-secondary hover:text-primary'
                }`}
              >
                Yo debo
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1.5">Persona</label>
            <input
              type="text"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="ej: Marta"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-white/30"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1.5">Descripción (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ej: Cena del viernes"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-white/30"
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
                value={dateCreated}
                onChange={(e) => setDateCreated(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-white/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1.5">Fecha límite (opcional)</label>
            <input
              type="date"
              value={dateDue}
              onChange={(e) => setDateDue(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1.5">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

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
              {saving ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
