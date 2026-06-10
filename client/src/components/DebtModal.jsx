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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base font-semibold text-primary">
            {isEditing ? 'Editar deuda' : 'Nueva deuda'}
          </h3>
          <button onClick={onClose} className="text-secondary hover:text-primary"><X size={18} strokeWidth={2} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-secondary mb-1.5">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('owed_to_me')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  type === 'owed_to_me'
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'bg-elevated border-border text-secondary hover:text-primary'
                }`}
              >
                Me deben
              </button>
              <button
                type="button"
                onClick={() => setType('owed_by_me')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
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
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-accent"
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
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-accent"
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
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-1.5">Fecha</label>
              <input
                type="date"
                value={dateCreated}
                onChange={(e) => setDateCreated(e.target.value)}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-accent"
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
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1.5">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm text-secondary hover:text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-lg bg-accent text-base font-medium text-sm hover:bg-accent/80 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
