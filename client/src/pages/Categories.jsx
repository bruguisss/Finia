import React, { useState } from 'react';
import { Pencil, Trash2, X, Plus } from 'lucide-react';
import Header from '../components/Header.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';
import { createCategory, updateCategory, deleteCategory } from '../api.js';

const PROTECTED_CATEGORY = 'Sin categoría';

export default function Categories() {
  const { categories, loading, refresh } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#00D4A8');
  const [emoji, setEmoji] = useState('🏷️');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  function openCreate() {
    setEditing(null);
    setName('');
    setColor('#00D4A8');
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

  async function handleDelete() {
    try {
      await deleteCategory(deleteTarget.id);
      await refresh();
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="pt-3 space-y-5">
      <Header title="Categorías" />

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue text-white text-caption font-semibold whitespace-nowrap"
        >
          <Plus size={14} strokeWidth={2.5} />
          Nueva categoría
        </button>
      </div>

      {deleteError && <p className="text-caption text-danger">{deleteError}</p>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-4">
              <div className="skeleton h-9 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const isProtected = cat.name === PROTECTED_CATEGORY;
            return (
              <div
                key={cat.id}
                className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
                  >
                    {cat.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-subhead text-primary truncate">{cat.name}</p>
                    <p className="text-caption text-tertiary">{cat.color}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-secondary hover:text-primary transition-colors duration-150 p-1.5 rounded-md hover:bg-white/[0.06]"
                  >
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                  {!isProtected && (
                    <button
                      onClick={() => { setDeleteError(null); setDeleteTarget(cat); }}
                      className="text-secondary hover:text-danger transition-colors duration-150 p-1.5 rounded-md hover:bg-white/[0.06]"
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'calc(100vw - 32px)', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
            className="bg-surface border border-border rounded-2xl shadow-2xl animate-fade-in"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-title-3 text-primary">
                {editing ? 'Editar categoría' : 'Nueva categoría'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-secondary hover:text-primary transition-colors duration-150">
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
              <div>
                <label className="block text-xs text-secondary mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={editing?.name === PROTECTED_CATEGORY}
                  placeholder="ej: Mascotas"
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong disabled:opacity-50"
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
                    className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-secondary focus:outline-none focus:border-border-strong"
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
                  className="flex-1 px-4 py-2.5 rounded-md bg-elevated border border-border text-sm font-medium text-primary transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-md bg-blue text-white font-semibold text-sm transition-colors duration-150 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar categoría"
          message={`¿Eliminar la categoría "${deleteTarget.name}"? Las transacciones con esta categoría pasarán a "${PROTECTED_CATEGORY}" y se eliminará el presupuesto asociado, si existe.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
