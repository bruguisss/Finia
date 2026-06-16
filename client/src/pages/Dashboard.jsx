import React, { useState, useCallback } from 'react';
import {
  Area, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea,
} from 'recharts';
import { ChevronLeft, ChevronRight, Receipt, Search, BarChart3, Plus } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import TransactionCard from '../components/TransactionCard.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { useCachedData } from '../context/DataContext.jsx';
import { getSummary, getBudgets, getPlannedExpenseOccurrences } from '../api.js';

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

function formatEurCompact(n) {
  return `${Math.round(n)} €`;
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

const ProgressTooltip = ({ active, payload, label, isMobile }) => {
  if (!active || !payload?.length) return null;
  const fmt = isMobile ? formatEurCompact : formatEur;
  const actual = payload.find((p) => p.dataKey === 'actual' && p.value != null);
  const projected = payload.find((p) => p.dataKey === 'projected' && p.value != null);
  const scheduled = payload.find((p) => p.dataKey === 'scheduled' && p.value != null);
  const budget = payload.find((p) => p.dataKey === 'budget' && p.value != null);
  return (
    <div className={`bg-elevated border border-border rounded-md ${isMobile ? 'p-2 text-[11px]' : 'p-3 text-xs'}`}>
      <p className="text-secondary mb-1">Día {label}</p>
      {actual && <p style={{ color: '#FF4D4D' }}>Gastado: {fmt(actual.value)}</p>}
      {projected && <p style={{ color: '#8A8A8A' }}>Proyección: {fmt(projected.value)}</p>}
      {scheduled && <p style={{ color: '#FFAA00' }}>Previsto: {fmt(scheduled.value)}</p>}
      {budget && <p style={{ color: '#8A8A8A' }}>Presupuesto: {fmt(budget.value)}</p>}
    </div>
  );
};

function buildSpendingProgress(month, dailyTotals, totalBudget, prevMonthDailyTotals, plannedOccurrences) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const isCurrentMonth = month === getCurrentMonth();
  const currentDay = isCurrentMonth ? new Date().getDate() : daysInMonth;

  const expenseByDay = {};
  (dailyTotals || []).forEach((d) => {
    const day = parseInt(d.date.slice(8, 10), 10);
    expenseByDay[day] = (expenseByDay[day] || 0) + d.expenses;
  });

  const plannedByDay = {};
  (plannedOccurrences || []).forEach((o) => {
    const day = parseInt(o.date.slice(8, 10), 10);
    plannedByDay[day] = (plannedByDay[day] || 0) + o.amount;
  });

  let cumulative = 0;
  let cumulativeAtToday = 0;
  const data = [];
  for (let day = 1; day <= daysInMonth; day++) {
    cumulative += expenseByDay[day] || 0;
    if (day <= currentDay) cumulativeAtToday = cumulative;
    data.push({
      day,
      actual: day <= currentDay ? cumulative : null,
      budget: totalBudget > 0 ? totalBudget : null,
    });
  }

  let projectedTotal = null;
  let plannedRemaining = 0;
  if (currentDay < daysInMonth && currentDay > 0) {
    const [py, pm] = addMonths(month, -1).split('-').map(Number);
    const prevDaysInMonth = new Date(py, pm, 0).getDate();
    const prevExpenseByDay = {};
    (prevMonthDailyTotals || []).forEach((d) => {
      const day = parseInt(d.date.slice(8, 10), 10);
      prevExpenseByDay[day] = (prevExpenseByDay[day] || 0) + d.expenses;
    });
    let prevCumulative = 0;
    const prevCumByDay = [0];
    for (let day = 1; day <= prevDaysInMonth; day++) {
      prevCumulative += prevExpenseByDay[day] || 0;
      prevCumByDay[day] = prevCumulative;
    }
    const prevAtCurrentDay = prevCumByDay[Math.min(currentDay, prevDaysInMonth)];

    if (prevAtCurrentDay > 0) {
      const ratio = cumulativeAtToday / prevAtCurrentDay;
      for (let day = currentDay; day <= daysInMonth; day++) {
        const prevDay = Math.min(day, prevDaysInMonth);
        data[day - 1].projected = prevCumByDay[prevDay] * ratio;
      }
      projectedTotal = prevCumByDay[Math.min(daysInMonth, prevDaysInMonth)] * ratio;
    } else {
      const avgPerDay = cumulativeAtToday / currentDay;
      projectedTotal = avgPerDay * daysInMonth;
      for (let day = currentDay; day <= daysInMonth; day++) {
        data[day - 1].projected = cumulativeAtToday + avgPerDay * (day - currentDay);
      }
    }

    let scheduledCumulative = cumulativeAtToday;
    for (let day = currentDay; day <= daysInMonth; day++) {
      if (day > currentDay) scheduledCumulative += plannedByDay[day] || 0;
      data[day - 1].scheduled = scheduledCumulative;
    }
    plannedRemaining = scheduledCumulative - cumulativeAtToday;
    projectedTotal = Math.max(projectedTotal, scheduledCumulative);
  }

  return { data, daysInMonth, currentDay, cumulativeAtToday, projectedTotal, plannedRemaining };
}

export default function Dashboard({ onNavigate, onAddTransaction, onOpenMore }) {
  const isMobile = useIsMobile();
  const [month, setMonth] = useState(getCurrentMonth());

  const { data: result, loading } = useCachedData(`dashboard:${month}`, useCallback(async () => {
    const [summary, budgetsData, prevSummary, occurrences] = await Promise.all([
      getSummary(month),
      getBudgets(month),
      getSummary(addMonths(month, -1)),
      getPlannedExpenseOccurrences(month),
    ]);
    return { summary, budgets: budgetsData, prevDailyTotals: prevSummary.dailyTotals, plannedOccurrences: occurrences };
  }, [month]));

  const data = result?.summary ?? null;
  const budgets = result?.budgets ?? [];
  const prevDailyTotals = result?.prevDailyTotals ?? [];
  const plannedOccurrences = result?.plannedOccurrences ?? [];

  const trend = data && data.previousMonthExpenses > 0
    ? ((data.totalExpenses - data.previousMonthExpenses) / data.previousMonthExpenses) * 100
    : undefined;

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.monthly_limit || 0), 0);
  const progress = data ? buildSpendingProgress(month, data.dailyTotals, totalBudget, prevDailyTotals, plannedOccurrences) : null;
  const overBudget = progress?.projectedTotal != null && totalBudget > 0 && progress.projectedTotal > totalBudget;

  return (
    <div>
      {/* Mobile top bar - fixed */}
      <div
        className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center gap-3 px-4"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top))', paddingBottom: '28px', background: 'linear-gradient(to bottom, #000000 65%, transparent 100%)' }}
      >
        <button
          onClick={onOpenMore}
          className="w-10 h-10 rounded-full bg-white/[0.15] flex items-center justify-center text-[13px] font-semibold text-primary shrink-0"
        >
          AB
        </button>
        <button
          onClick={() => onNavigate('transactions')}
          className="flex-1 h-[38px] rounded-[20px] bg-white/[0.08] flex items-center gap-2 px-3.5 text-sm text-tertiary"
        >
          <Search size={15} strokeWidth={2} className="shrink-0" />
          <span className="truncate">Buscar en Finia...</span>
        </button>
        <button
          onClick={() => onNavigate('analytics')}
          className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center text-primary shrink-0"
        >
          <BarChart3 size={18} strokeWidth={2} />
        </button>
        <button
          onClick={onAddTransaction}
          className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center text-primary shrink-0"
        >
          <Plus size={18} strokeWidth={2} />
        </button>
      </div>
      {/* Spacer for fixed mobile header */}
      <div className="md:hidden h-[96px]" />

      {/* Desktop title */}
      <div className="hidden md:block mb-6">
        <h2 className="text-xl font-semibold text-primary tracking-tight">Albert Brugué</h2>
        <p className="text-sm text-secondary">Finanzas personales</p>
      </div>

      <div className="space-y-6">
        {/* Monthly overview - no card */}
        <div>
          {/* Month selector */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => setMonth(addMonths(month, -1))}
              className="w-7 h-7 rounded-md bg-muted border border-white/10 text-primary hover:bg-[#555555] transition-colors duration-150 flex items-center justify-center"
            >
              <ChevronLeft size={14} strokeWidth={2} />
            </button>
            <span className="text-xs font-medium text-tertiary capitalize">{formatMonth(month)}</span>
            <button
              onClick={() => setMonth(addMonths(month, 1))}
              disabled={month >= getCurrentMonth()}
              className="w-7 h-7 rounded-md bg-muted border border-white/10 text-primary hover:bg-[#555555] transition-colors duration-150 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>

          {loading ? (
            <div className="skeleton h-64" />
          ) : (
            <>
              {/* Hero balance */}
              <div className="text-center mb-5">
                <p className="text-[11px] font-medium text-tertiary uppercase tracking-wider mb-1">Disponible</p>
                <p className={`text-5xl font-semibold tracking-[-0.02em] tabular-nums ${data.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatEur(data.balance)}
                </p>
                <p className="text-[17px] font-semibold text-secondary mt-1.5">
                  Gastado: {formatEur(progress.cumulativeAtToday)}
                </p>
              </div>

              {/* Chart - edge-to-edge on mobile */}
              <div className="-mx-5 md:mx-0">
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
                  <ComposedChart data={progress.data} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.08} />
                        <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0} />
                      </linearGradient>
                      <pattern id="projectionHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="6" height="6" fill="transparent" />
                        <line x1="0" y1="0" x2="0" y2="6" stroke={overBudget ? '#FF4D4D' : '#8A8A8A'} strokeWidth="1" strokeOpacity="0.25" />
                      </pattern>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" tick={{ fill: '#8A8A8A', fontSize: 11 }} axisLine={false} tickLine={false} interval={isMobile ? 6 : 2} />
                    <YAxis tick={{ fill: '#8A8A8A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v)}€`} tickCount={5} />
                    <Tooltip content={<ProgressTooltip isMobile={isMobile} />} />
                    {progress.currentDay < progress.daysInMonth && (
                      <ReferenceArea x1={progress.currentDay} x2={progress.daysInMonth} fill="url(#projectionHatch)" stroke="none" />
                    )}
                    {totalBudget > 0 && (
                      <Line type="monotone" dataKey="budget" stroke="#8A8A8A" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={!isMobile} />
                    )}
                    <Area type="monotone" dataKey="actual" stroke="#FF4D4D" fill="url(#spendGrad)" strokeWidth={2} dot={false} connectNulls isAnimationActive={!isMobile} />
                    {progress.currentDay < progress.daysInMonth && (
                      <Line type="monotone" dataKey="projected" stroke={overBudget ? '#FF4D4D' : '#8A8A8A'} strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls isAnimationActive={!isMobile} />
                    )}
                    {progress.currentDay < progress.daysInMonth && progress.plannedRemaining > 0 && (
                      <Line type="monotone" dataKey="scheduled" stroke="#FFAA00" strokeWidth={1.5} strokeDasharray="2 3" dot={false} connectNulls isAnimationActive={!isMobile} />
                    )}
                    {progress.currentDay < progress.daysInMonth && (
                      <ReferenceLine x={progress.currentDay} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ value: 'Hoy', position: 'top', fill: '#8A8A8A', fontSize: 11 }} />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
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

        {/* Recent transactions */}
        <div className="bg-surface border border-border rounded-lg transition-colors duration-150 hover:border-border-hover">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-sm font-medium tracking-heading text-primary">Últimas transacciones</h3>
          </div>
          {loading ? (
            <div className="divide-y divide-white/[0.04]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="skeleton w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-32" />
                    <div className="skeleton h-2.5 w-20" />
                  </div>
                  <div className="skeleton h-3 w-14" />
                </div>
              ))}
            </div>
          ) : data?.recentTransactions?.length > 0 ? (
            <div className="divide-y divide-white/[0.04]">
              {data.recentTransactions.map((t, i) => (
                <TransactionCard key={t.id} transaction={t} index={i} />
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-secondary text-sm">
              <Receipt size={28} strokeWidth={1.5} className="mx-auto mb-3 text-tertiary" />
              <p>No hay transacciones este mes.</p>
              <p className="mt-1">Importa tu extracto CSV de Revolut para empezar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
