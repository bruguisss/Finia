import React, { useState } from 'react';
import BottomSheet from './BottomSheet.jsx';
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

  return (
    <BottomSheet title={isEditing ? 'Editar deuda' : 'Nueva deuda'} onClose={onClose}>
      {(close) => {
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
            close();
          } catch (err) {
            setError(err.message);
          } finally {
            setSaving(false);
          }
        }

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-secondary mb-1.5">Tipo</label>
              <div className="flex bg-elevated border border-border rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setType('owed_to_me')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    type === 'owed_to_me' ? 'bg-success/15 text-success' : 'text-secondary'
                  }`}
                >
                  Me deben
                </button>
                <button
                  type="button"
                  onClick={() => setType('owed_by_me')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    type === 'owed_by_me' ? 'bg-danger/15 text-danger' : 'text-secondary'
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
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong"
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
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong"
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
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-secondary mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={dateCreated}
                  onChange={(e) => setDateCreated(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-border-strong"
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
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-border-strong"
              />
            </div>

            <div>
              <label className="block text-xs text-secondary mb-1.5">Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Notas adicionales..."
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong resize-none"
              />
            </div>

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
                {saving ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </form>
        );
      }}
    </BottomSheet>
  );
}
