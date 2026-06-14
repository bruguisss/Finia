import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import TransactionRow from '../components/TransactionRow.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';
import { getTransactions } from '../api.js';

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function addMonths(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

const PAGE_SIZE = 50;

export default function Transactions() {
  const { categories } = useCategories();
  const [month, setMonth] = useState(getCurrentMonth());
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  // Debounce search
  const debounceRef = useRef(null);
  function handleSearchChange(val) {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setOffset(0);
    }, 300);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions({
        month,
        category: category || undefined,
        search: debouncedSearch || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setTransactions(res.transactions);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month, category, debouncedSearch, offset]);

  useEffect(() => { load(); }, [load]);

  function handleUpdate(updated) {
    setTransactions((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }

  function handleDelete(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setTotal((prev) => prev - 1);
  }

  function handleFilterChange() {
    setOffset(0);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-primary tracking-tight">Transacciones</h2>
        <span className="text-sm text-secondary">{total} transacciones</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Month selector */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg px-1">
          <button
            onClick={() => { setMonth(addMonths(month, -1)); handleFilterChange(); }}
            className="w-8 h-8 text-secondary hover:text-primary transition-colors duration-150 flex items-center justify-center"
          ><ChevronLeft size={15} strokeWidth={2} /></button>
          <span className="text-sm text-primary px-2 capitalize whitespace-nowrap">{formatMonth(month)}</span>
          <button
            onClick={() => { setMonth(addMonths(month, 1)); handleFilterChange(); }}
            disabled={month >= getCurrentMonth()}
            className="w-8 h-8 text-secondary hover:text-primary transition-colors duration-150 flex items-center justify-center disabled:opacity-30"
          ><ChevronRight size={15} strokeWidth={2} /></button>
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); handleFilterChange(); }}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-40">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar transacciones..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-primary placeholder-secondary focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-secondary uppercase tracking-wider">Fecha</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-secondary uppercase tracking-wider">Descripción</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-secondary uppercase tracking-wider">Importe</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-secondary uppercase tracking-wider">Categoría</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04] h-10">
                    <td className="px-4"><div className="skeleton h-3 w-16" /></td>
                    <td className="px-4"><div className="skeleton h-3 w-48" /></td>
                    <td className="px-4"><div className="skeleton h-3 w-16 ml-auto" /></td>
                    <td className="px-4"><div className="skeleton h-5 w-24 rounded" /></td>
                    <td className="px-4" />
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-secondary">
                    <Search size={28} strokeWidth={1.5} className="mx-auto mb-3 text-tertiary" />
                    <p>No se encontraron transacciones</p>
                    {(search || category) && (
                      <button
                        onClick={() => { setSearch(''); setDebouncedSearch(''); setCategory(''); setOffset(0); }}
                        className="mt-2 text-accent text-sm hover:underline"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-secondary">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0}
                className="px-3.5 py-1.5 text-[13px] font-medium rounded-md bg-white/[0.06] border border-white/10 text-secondary hover:text-primary disabled:opacity-30 transition-colors duration-150"
              >
                Anterior
              </button>
              <button
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= total}
                className="px-3.5 py-1.5 text-[13px] font-medium rounded-md bg-white/[0.06] border border-white/10 text-secondary hover:text-primary disabled:opacity-30 transition-colors duration-150"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
