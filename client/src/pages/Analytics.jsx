import React, { useState, useCallback } from 'react';
import {
  BarChart, Bar, AreaChart, Area, ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header.jsx';
import { useCategories, DEFAULT_COLOR } from '../context/CategoriesContext.jsx';
import { useCachedData } from '../context/DataContext.jsx';
import {
  getMonthlyTrend, getTransactions, getSummary, getBudgets, getPlannedExpenseOccurrences,
} from '../api.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { COLORS } from '../theme.js';

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
}

function formatEurCompact(n) {
  return `${Math.round(n)} €`;
}

function shortMonth(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'short' });
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

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#141414',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontSize: 12,
};

const TOP_CATEGORIES = ['Alimentación', 'Transporte', 'Ocio', 'Hogar', 'Compras', 'Salud'];

const ProgressTooltip = ({ active, payload, label, isMobile }) => {
  if (!active || !payload?.length) return null;
  const fmt = isMobile ? formatEurCompact : formatEur;
  const actual = payload.find((p) => p.dataKey === 'actual' && p.value != null);
  const projected = payload.find((p) => p.dataKey === 'projected' && p.value != null);
  const scheduled = payload.find((p) => p.dataKey === 'scheduled' && p.value != null);
  const budget = payload.find((p) => p.dataKey === 'budget' && p.value != null);
  return (
    <div className={`bg-elevated border border-border rounded-lg ${isMobile ? 'p-2 text-[11px]' : 'p-3 text-caption'}`}>
      <p className="text-tertiary mb-1">Día {label}</p>
      {actual && <p style={{ color: COLORS.red }}>Gastado: {fmt(actual.value)}</p>}
      {projected && <p style={{ color: COLORS.textSecondary }}>Proyección: {fmt(projected.value)}</p>}
      {scheduled && <p style={{ color: COLORS.yellow }}>Previsto: {fmt(scheduled.value)}</p>}
      {budget && <p style={{ color: COLORS.textSecondary }}>Presupuesto: {fmt(budget.value)}</p>}
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
    // Shape the projection after last month's cumulative spending curve,
    // scaled so it matches today's actual cumulative spend.
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
      // No previous month data: fall back to a linear projection.
      const avgPerDay = cumulativeAtToday / currentDay;
      projectedTotal = avgPerDay * daysInMonth;
      for (let day = currentDay; day <= daysInMonth; day++) {
        data[day - 1].projected = cumulativeAtToday + avgPerDay * (day - currentDay);
      }
    }

    // Scheduled: a "guaranteed minimum" trajectory from known planned expenses
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

export default function Analytics() {
  const { getCategory } = useCategories();
  const isMobile = useIsMobile();
  const [month, setMonth] = useState(getCurrentMonth());

  const { data: progressResult, loading: progressLoading } = useCachedData(`analytics-progress:${month}`, useCallback(async () => {
    const [summary, budgetsData, prevSummary, occurrences] = await Promise.all([
      getSummary(month),
      getBudgets(month),
      getSummary(addMonths(month, -1)),
      getPlannedExpenseOccurrences(month),
    ]);
    return { summary, budgets: budgetsData, prevDailyTotals: prevSummary.dailyTotals, plannedOccurrences: occurrences };
  }, [month]));

  const { data: trendResult, loading: trendLoading } = useCachedData('analytics-trend', useCallback(async () => {
    const [trendData, txRes] = await Promise.all([
      getMonthlyTrend(),
      getTransactions({ type: 'debit', limit: 500, offset: 0 }),
    ]);

    const map = {};
    for (const t of txRes.transactions) {
      const key = t.description;
      if (!map[key]) map[key] = { description: key, count: 0, total: 0 };
      map[key].count++;
      map[key].total += t.amount;
    }
    const topMerchants = Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return { trend: trendData, topMerchants };
  }, []));

  const summary = progressResult?.summary ?? null;
  const budgets = progressResult?.budgets ?? [];
  const prevDailyTotals = progressResult?.prevDailyTotals ?? [];
  const plannedOccurrences = progressResult?.plannedOccurrences ?? [];

  const trendPct = summary && summary.previousMonthExpenses > 0
    ? ((summary.totalExpenses - summary.previousMonthExpenses) / summary.previousMonthExpenses) * 100
    : undefined;

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.monthly_limit || 0), 0);
  const progress = summary ? buildSpendingProgress(month, summary.dailyTotals, totalBudget, prevDailyTotals, plannedOccurrences) : null;
  const overBudget = progress?.projectedTotal != null && totalBudget > 0 && progress.projectedTotal > totalBudget;

  const trend = trendResult?.trend ?? null;
  const topMerchants = trendResult?.topMerchants ?? [];

  // Prepare stacked area data: each month has a breakdown per category
  const stackedData = (trend || []).map((mo) => {
    const row = { month: shortMonth(mo.month) };
    for (const c of TOP_CATEGORIES) {
      const found = mo.categoryBreakdown.find((b) => b.category === c);
      row[c] = found ? Math.round(found.total) : 0;
    }
    return row;
  });

  const barData = (trend || []).map((mo) => ({
    month: shortMonth(mo.month),
    Gastos: Math.round(mo.expenses),
    Ingresos: Math.round(mo.income),
  }));

  return (
    <div className="pt-3 space-y-6">
      <Header title="Análisis" />

      {/* Monthly spending progress */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-title-3 text-primary">Progreso de gasto mensual</h3>
          <div className="flex items-center gap-1 bg-elevated border border-border rounded-lg px-1 shrink-0">
            <button onClick={() => setMonth(addMonths(month, -1))} className="w-8 h-8 text-secondary flex items-center justify-center">
              <ChevronLeft size={15} strokeWidth={2} />
            </button>
            <span className="text-subhead text-primary px-1 capitalize whitespace-nowrap">{formatMonth(month)}</span>
            <button
              onClick={() => setMonth(addMonths(month, 1))}
              disabled={month >= getCurrentMonth()}
              className="w-8 h-8 text-secondary flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRight size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {progressLoading ? (
          <div className="skeleton h-64 rounded-xl" />
        ) : (
          <>
            {/* Key numbers */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-5">
              {totalBudget > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-secondary/40 shrink-0" />
                  <div>
                    <p className="text-caption text-tertiary uppercase">Presupuesto</p>
                    <p className="text-title-3 text-primary tabular-nums">{formatEur(totalBudget)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-danger shrink-0" />
                <div>
                  <p className="text-caption text-tertiary uppercase">Gastado</p>
                  <p className="text-title-3 text-primary tabular-nums">{formatEur(progress.cumulativeAtToday)}</p>
                </div>
              </div>
              {progress.projectedTotal != null && (
                <div className="flex items-center gap-2">
                  <svg width="14" height="10" viewBox="0 0 14 10" className="shrink-0" aria-hidden="true">
                    <line x1="0" y1="5" x2="14" y2="5" stroke={overBudget ? COLORS.red : COLORS.textSecondary} strokeWidth="1.5" strokeDasharray="4 4" />
                  </svg>
                  <div>
                    <p className="text-caption text-tertiary uppercase">Proyección fin de mes</p>
                    <p className={`text-title-3 tabular-nums ${overBudget ? 'text-danger' : 'text-primary'}`}>{formatEur(progress.projectedTotal)}</p>
                  </div>
                </div>
              )}
              {progress.plannedRemaining > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-warning shrink-0" />
                  <div>
                    <p className="text-caption text-tertiary uppercase">Previsto resto de mes</p>
                    <p className="text-title-3 text-primary tabular-nums">{formatEur(progress.plannedRemaining)}</p>
                  </div>
                </div>
              )}
              {trendPct !== undefined && (
                <div>
                  <p className="text-caption text-tertiary uppercase">vs mes anterior</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-title-3 text-primary tabular-nums">{formatEur(summary.totalExpenses)}</p>
                    <span className={`text-caption font-medium px-1.5 py-0.5 rounded ${trendPct > 0 ? 'bg-danger/10 text-danger' : trendPct < 0 ? 'bg-success/10 text-success' : 'bg-white/[0.06] text-secondary'}`}>
                      {trendPct > 0 ? `+${trendPct.toFixed(1)}%` : `${trendPct.toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
              <ComposedChart data={progress.data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
                  </linearGradient>
                  <pattern id="projectionHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="6" height="6" fill="transparent" />
                    <line x1="0" y1="0" x2="0" y2="6" stroke={overBudget ? COLORS.red : COLORS.textSecondary} strokeWidth="1" strokeOpacity="0.25" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: COLORS.textTertiary, fontSize: 11 }} axisLine={false} tickLine={false} interval={isMobile ? 6 : 2} />
                <YAxis tick={{ fill: COLORS.textTertiary, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v)}€`} tickCount={5} />
                <Tooltip content={<ProgressTooltip isMobile={isMobile} />} />
                {progress.currentDay < progress.daysInMonth && (
                  <ReferenceArea x1={progress.currentDay} x2={progress.daysInMonth} fill="url(#projectionHatch)" stroke="none" />
                )}
                {totalBudget > 0 && (
                  <Line type="monotone" dataKey="budget" stroke={COLORS.textSecondary} strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={!isMobile} />
                )}
                <Area type="monotone" dataKey="actual" stroke={COLORS.red} fill="url(#spendGrad)" strokeWidth={2} dot={false} connectNulls isAnimationActive={!isMobile} />
                {progress.currentDay < progress.daysInMonth && (
                  <Line type="monotone" dataKey="projected" stroke={overBudget ? COLORS.red : COLORS.textSecondary} strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls isAnimationActive={!isMobile} />
                )}
                {progress.currentDay < progress.daysInMonth && progress.plannedRemaining > 0 && (
                  <Line type="monotone" dataKey="scheduled" stroke={COLORS.yellow} strokeWidth={1.5} strokeDasharray="2 3" dot={false} connectNulls isAnimationActive={!isMobile} />
                )}
                {progress.currentDay < progress.daysInMonth && (
                  <ReferenceLine x={progress.currentDay} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ value: 'Hoy', position: 'top', fill: COLORS.textTertiary, fontSize: 11 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Income vs Expenses bar chart */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h3 className="text-title-3 text-primary mb-4">Ingresos vs Gastos (últimos 6 meses)</h3>
        {trendLoading ? (
          <div className="skeleton h-52 rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: COLORS.textTertiary, fontSize: 12 }} axisLine={false} tickLine={false} interval={isMobile ? 1 : 0} />
              <YAxis tick={{ fill: COLORS.textTertiary, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} tickCount={isMobile ? 3 : 5} />
              <Tooltip
                contentStyle={{ ...CHART_TOOLTIP_STYLE, fontSize: isMobile ? 11 : 12 }}
                formatter={(v) => isMobile ? formatEurCompact(v) : formatEur(v)}
              />
              <Legend formatter={(v) => <span style={{ color: COLORS.textTertiary, fontSize: 12 }}>{v}</span>} />
              <Bar dataKey="Ingresos" fill={COLORS.green} radius={[4, 4, 0, 0]} isAnimationActive={!isMobile} />
              <Bar dataKey="Gastos" fill={COLORS.red} radius={[4, 4, 0, 0]} isAnimationActive={!isMobile} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category evolution stacked area */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h3 className="text-title-3 text-primary mb-4">Evolución por categoría</h3>
        {trendLoading ? (
          <div className="skeleton h-52 rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stackedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: COLORS.textTertiary, fontSize: 12 }} axisLine={false} tickLine={false} interval={isMobile ? 1 : 0} />
              <YAxis tick={{ fill: COLORS.textTertiary, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} tickCount={isMobile ? 3 : 5} />
              <Tooltip
                contentStyle={{ ...CHART_TOOLTIP_STYLE, fontSize: isMobile ? 11 : 12 }}
                formatter={(v) => isMobile ? formatEurCompact(v) : formatEur(v)}
              />
              <Legend formatter={(v) => <span style={{ color: COLORS.textTertiary, fontSize: 12 }}>{v}</span>} />
              {TOP_CATEGORIES.map((c) => (
                <Area
                  key={c}
                  type="monotone"
                  dataKey={c}
                  stackId="1"
                  stroke={getCategory(c)?.color || DEFAULT_COLOR}
                  strokeWidth={1.5}
                  fill={getCategory(c)?.color || DEFAULT_COLOR}
                  fillOpacity={0.6}
                  dot={false}
                  isAnimationActive={!isMobile}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top merchants */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-title-3 text-primary">Top comercios por gasto total</h3>
        </div>
        {trendLoading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 h-10">
                <div className="skeleton h-3 w-6" />
                <div className="skeleton h-3 flex-1" />
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-3 w-12" />
              </div>
            ))}
          </div>
        ) : topMerchants.length > 0 ? (
          <div>
            {topMerchants.map((m, i) => (
              <div key={m.description} className={`flex items-center gap-4 px-5 h-11 ${i < topMerchants.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                <span className="text-caption text-tertiary w-6 shrink-0 tabular-nums">{i + 1}</span>
                <span className="text-subhead text-primary flex-1 truncate">{m.description}</span>
                <span className="text-caption text-tertiary">{m.count} veces</span>
                <span className="text-subhead font-medium text-danger tabular-nums">{formatEur(m.total)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-secondary text-subhead">
            No hay datos suficientes
          </div>
        )}
      </div>
    </div>
  );
}
