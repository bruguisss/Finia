import React, { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { useCategories } from '../context/CategoriesContext.jsx';
import { createCategory, updateCategory, deleteCategory } from '../api.js';

const PROTECTED_CATEGORY = 'Sin categoría';

export default function Categories() {
  const { categories, loading, refresh } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6ee7b7');
  const [emoji, setEmoji] = useState('🏷️');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function openCreate() {
    setEditing(null);
    setName('');
    setColor('#6ee7b7');
    setEmoji('🏷️');
    setError(null);
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setName(cat.name);
    setColor(cat.color);
    setEmoji(cat.emoji);
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !emoji.trim()) {
      setError('Rellena todos los campos');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateCategory(editing.id, { name: name.trim(), color, emoji: emoji.trim() });
      } else {
        await createCategory({ name: name.trim(), color, emoji: emoji.trim() });
      }
      await refresh();
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"?\n\nLas transacciones con esta categoría pasarán a "${PROTECTED_CATEGORY}" y se eliminará el presupuesto asociado, si existe.`)) return;
    try {
      await deleteCategory(cat.id);
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">Categorías</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-base text-sm font-medium hover:bg-accent/80 transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-4">
              <div className="skeleton h-9 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const isProtected = cat.name === PROTECTED_CATEGORY;
            return (
              <div
                key={cat.id}
                className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between gap-3 transition-all duration-200 hover:border-accent/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    {cat.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{cat.name}</p>
                    <p className="text-xs text-secondary">{cat.color}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-secondary hover:text-primary transition-colors p-1.5 rounded-md hover:bg-elevated"
                  >
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                  {!isProtected && (
                    <button
                      onClick={() => handleDelete(cat)}
                      className="text-secondary hover:text-danger transition-colors p-1.5 rounded-md hover:bg-elevated"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="bg-surface border border-border rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-base font-semibold text-primary">
                {editing ? 'Editar categoría' : 'Nueva categoría'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-secondary hover:text-primary">
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-secondary mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={editing?.name === PROTECTED_CATEGORY}
                  placeholder="ej: Mascotas"
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-accent disabled:opacity-50"
                  required
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-secondary mb-1.5">Emoji</label>
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="🏷️"
                    maxLength={4}
                    className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-secondary mb-1.5">Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-[42px] bg-elevated border border-border rounded-lg px-1.5 py-1.5 cursor-pointer"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm text-secondary hover:text-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-accent text-base font-medium text-sm hover:bg-accent/80 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
