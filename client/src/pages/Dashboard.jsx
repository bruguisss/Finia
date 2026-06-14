import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import { useCategories, DEFAULT_COLOR } from '../context/CategoriesContext.jsx';
import { getSummary } from '../api.js';

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 13) return 'Buenos días';
  if (h < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

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

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return String(d.getDate());
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-elevated border border-border rounded-lg p-3 text-xs shadow-lg">
      <p className="text-secondary mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'expenses' ? 'Gastos' : 'Ingresos'}: {formatEur(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { getCategory } = useCategories();
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const summary = await getSummary(month);
      setData(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const trend = data && data.previousMonthExpenses > 0
    ? ((data.totalExpenses - data.previousMonthExpenses) / data.previousMonthExpenses) * 100
    : undefined;

  const pieData = (data?.categoryBreakdown || [])
    .filter((c) => c.category !== 'Sin categoría')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-primary">{getGreeting()} 👋</h2>
          <p className="text-sm text-secondary capitalize">{formatMonth(month)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth(addMonths(month, -1))}
            className="w-8 h-8 rounded-lg bg-elevated border border-border text-secondary hover:text-primary hover:border-accent/50 transition-colors flex items-center justify-center"
          >
            <ChevronLeft size={15} strokeWidth={2} />
          </button>
          <span className="text-sm text-primary font-medium px-2 capitalize">
            {formatMonth(month)}
          </span>
          <button
            onClick={() => setMonth(addMonths(month, 1))}
            disabled={month >= getCurrentMonth()}
            className="w-8 h-8 rounded-lg bg-elevated border border-border text-secondary hover:text-primary hover:border-accent/50 transition-colors flex items-center justify-center disabled:opacity-30"
          >
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          loading={loading}
          label="Ingresos"
          value={data ? formatEur(data.totalIncome) : '—'}
          sub="este mes"
        />
        <StatCard
          loading={loading}
          label="Gastos"
          value={data ? formatEur(data.totalExpenses) : '—'}
          sub="este mes"
        />
        <StatCard
          loading={loading}
          label="Balance"
          value={data ? formatEur(data.balance) : '—'}
          sub={data?.balance >= 0 ? 'positivo' : 'negativo'}
        />
        <StatCard
          loading={loading}
          label="vs Mes anterior"
          value={data ? formatEur(data.totalExpenses) : '—'}
          sub="gastos"
          trend={trend}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Daily spending chart */}
        <div className="lg:col-span-3 bg-surface border border-border rounded-lg p-5 transition-all duration-200 hover:border-accent/20">
          <h3 className="text-sm font-medium text-primary mb-4">Gasto diario</h3>
          {loading ? (
            <div className="skeleton h-48" />
          ) : (data?.dailyTotals?.length > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.dailyTotals} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
                  </linearGradient>
                  <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262b" />
                <XAxis dataKey="date" tickFormatter={formatDayLabel} tick={{ fill: '#9494a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9494a0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="expenses" stroke="#f87171" fill="url(#expGrad)" strokeWidth={2.5} name="expenses" style={{ filter: 'url(#neonGlow)' }} />
                <Area type="monotone" dataKey="income" stroke="#6ee7b7" fill="url(#incGrad)" strokeWidth={2.5} name="income" style={{ filter: 'url(#neonGlow)' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-secondary text-sm">
              Sin datos para este mes
            </div>
          )}
        </div>

        {/* Category donut */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-5 transition-all duration-200 hover:border-accent/20">
          <h3 className="text-sm font-medium text-primary mb-4">Top categorías</h3>
          {loading ? (
            <div className="skeleton h-48" />
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <defs>
                  <filter id="neonGlowPie" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="total"
                  nameKey="category"
                  style={{ filter: 'url(#neonGlowPie)' }}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.category} fill={getCategory(entry.category)?.color || DEFAULT_COLOR} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [formatEur(value), name]}
                  contentStyle={{ backgroundColor: '#1a1a1e', border: '1px solid #26262b', borderRadius: 8, fontSize: 12 }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#9494a0', fontSize: 11 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-secondary text-sm">
              Sin datos
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-surface border border-border rounded-lg transition-all duration-200 hover:border-accent/20">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-primary">Últimas transacciones</h3>
        </div>
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="skeleton h-3 w-12" />
                <div className="skeleton h-3 flex-1" />
                <div className="skeleton h-5 w-20 rounded" />
                <div className="skeleton h-3 w-16" />
              </div>
            ))}
          </div>
        ) : data?.recentTransactions?.length > 0 ? (
          <div className="divide-y divide-border">
            {data.recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 hover:bg-elevated/50 transition-colors">
                <span className="text-xs text-secondary w-12 shrink-0">
                  {new Date(t.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </span>
                <span className="text-sm text-primary flex-1 truncate">{t.description}</span>
                <CategoryBadge category={t.category} />
                <span className={`text-sm font-medium tabular-nums ml-2 ${t.type === 'debit' ? 'text-danger' : 'text-accent'}`}>
                  {t.type === 'debit' ? '-' : '+'}{new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(t.amount)} €
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-secondary text-sm">
            <p className="text-3xl mb-2">💳</p>
            <p>No hay transacciones este mes.</p>
            <p className="mt-1">Importa tu extracto CSV de Revolut para empezar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
