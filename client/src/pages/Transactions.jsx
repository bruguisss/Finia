import React, { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus } from 'lucide-react';
import Header from '../components/Header.jsx';
import TransactionCard from '../components/TransactionCard.jsx';
import PullToRefresh from '../components/PullToRefresh.jsx';
import AddTransactionModal from '../components/AddTransactionModal.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';
import { useCachedData } from '../context/DataContext.jsx';
import { useInvalidateData } from '../context/DataContext.jsx';
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

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

function groupLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.getTime() === today.getTime()) return 'Hoy';
  if (d.getTime() === yesterday.getTime()) return 'Ayer';
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function groupTransactions(transactions) {
  const groups = [];
  let current = null;
  for (const t of transactions) {
    if (!current || current.date !== t.date) {
      current = { date: t.date, label: groupLabel(t.date), items: [], total: 0 };
      groups.push(current);
    }
    current.items.push(t);
    current.total += t.type === 'credit' ? t.amount : -t.amount;
  }
  return groups;
}

const PAGE_SIZE = 50;

export default function Transactions() {
  const { categories } = useCategories();
  const invalidateData = useInvalidateData();
  const [month, setMonth] = useState(getCurrentMonth());
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

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

  const cacheKey = `transactions:${month}:${category}:${debouncedSearch}:${offset}`;
  const { data: result, loading, mutate, refresh } = useCachedData(cacheKey, useCallback(async () => {
    const res = await getTransactions({
      month,
      category: category || undefined,
      search: debouncedSearch || undefined,
      limit: PAGE_SIZE,
      offset,
    });
    return { transactions: res.transactions, total: res.total };
  }, [month, category, debouncedSearch, offset]));

  const transactions = result?.transactions ?? [];
  const total = result?.total ?? 0;
  const groups = groupTransactions(transactions);

  function handleUpdate(updated) {
    mutate((prev) => prev && ({ ...prev, transactions: prev.transactions.map((t) => t.id === updated.id ? updated : t) }));
  }

  function handleDelete(id) {
    mutate((prev) => prev && ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id), total: prev.total - 1 }));
  }

  function handleAdded() {
    invalidateData();
    setAddOpen(false);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="pt-3">
      <Header title="Gastos" />

      <PullToRefresh onRefresh={refresh}>
      {/* Filters */}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-1 bg-elevated border border-border rounded-lg px-1 shrink-0">
          <button
            onClick={() => { setMonth(addMonths(month, -1)); setOffset(0); }}
            className="w-8 h-8 text-secondary flex items-center justify-center"
          ><ChevronLeft size={15} strokeWidth={2} /></button>
          <span className="text-subhead text-primary px-1 capitalize whitespace-nowrap">{formatMonth(month)}</span>
          <button
            onClick={() => { setMonth(addMonths(month, 1)); setOffset(0); }}
            disabled={month >= getCurrentMonth()}
            className="w-8 h-8 text-secondary flex items-center justify-center disabled:opacity-30"
          ><ChevronRight size={15} strokeWidth={2} /></button>
        </div>

        <div className="relative flex-1 min-w-0">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar"
            className="w-full bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-subhead text-primary placeholder-tertiary focus:outline-none focus:border-border-strong"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 mt-3 overflow-x-auto -mx-4 px-4 pb-1">
        <button
          onClick={() => { setCategory(''); setOffset(0); }}
          className={`shrink-0 px-3 py-1.5 rounded-full text-caption whitespace-nowrap border ${category === '' ? 'bg-white/10 text-primary border-transparent' : 'border-border text-secondary'}`}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => { setCategory(c.name); setOffset(0); }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-caption whitespace-nowrap border ${category === c.name ? 'bg-white/10 text-primary border-transparent' : 'border-border text-secondary'}`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="mt-2">
        {loading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 min-h-[56px]">
                <div className="skeleton w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-32" />
                  <div className="skeleton h-2.5 w-20" />
                </div>
                <div className="skeleton h-3 w-14" />
              </div>
            ))}
          </div>
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.date} className="mb-2">
              <div className="flex items-center justify-between pt-4 pb-1">
                <p className="text-caption text-tertiary uppercase">{group.label}</p>
                <p className={`text-caption ${group.total >= 0 ? 'text-success' : 'text-danger'}`}>
                  {group.total >= 0 ? '+' : ''}{formatEur(group.total)}
                </p>
              </div>
              {group.items.map((t, i) => (
                <TransactionCard
                  key={t.id}
                  transaction={t}
                  index={i}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  last={i === group.items.length - 1}
                />
              ))}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-secondary">
            <Search size={28} strokeWidth={1.5} className="mx-auto mb-3 text-tertiary" />
            <p className="text-subhead">No se encontraron transacciones</p>
            {(search || category) && (
              <button
                onClick={() => { setSearch(''); setDebouncedSearch(''); setCategory(''); setOffset(0); }}
                className="mt-2 text-blue text-subhead"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
          <span className="text-caption text-tertiary">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="px-3.5 py-1.5 text-subhead font-medium rounded-md bg-elevated border border-border text-primary disabled:opacity-30"
            >
              Anterior
            </button>
            <button
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={offset + PAGE_SIZE >= total}
              className="px-3.5 py-1.5 text-subhead font-medium rounded-md bg-elevated border border-border text-primary disabled:opacity-30"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      </PullToRefresh>

      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed right-4 z-30 w-[52px] h-[52px] rounded-full flex items-center justify-center bg-blue text-white"
        style={{ bottom: 'calc(92px + env(safe-area-inset-bottom))', boxShadow: '0 4px 20px rgba(10,132,255,0.4)' }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {addOpen && (
        <AddTransactionModal
          onClose={handleAdded}
        />
      )}
    </div>
  );
}
