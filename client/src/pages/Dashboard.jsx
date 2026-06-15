import React, { useState, useCallback } from 'react';
import { Area, AreaChart, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import Header from '../components/Header.jsx';
import TransactionCard from '../components/TransactionCard.jsx';
import PullToRefresh from '../components/PullToRefresh.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { useCachedData } from '../context/DataContext.jsx';
import { getSummary } from '../api.js';
import { COLORS } from '../theme.js';

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';
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

function formatDayLabel(month, day) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function buildHeroData(month, dailyTotals) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const isCurrentMonth = month === getCurrentMonth();
  const currentDay = isCurrentMonth ? new Date().getDate() : daysInMonth;

  const netByDay = {};
  (dailyTotals || []).forEach((d) => {
    const day = parseInt(d.date.slice(8, 10), 10);
    netByDay[day] = (netByDay[day] || 0) + (d.income - d.expenses);
  });

  let cumulative = 0;
  const data = [];
  for (let day = 1; day <= daysInMonth; day++) {
    cumulative += netByDay[day] || 0;
    data.push({ day, balance: day <= currentDay ? cumulative : null });
  }
  return data;
}

function HeroTooltip({ active, payload, label, month }) {
  if (!active || !payload?.length || payload[0].value == null) return null;
  return (
    <div className="bg-black rounded-full px-3 py-1.5 shadow-lg whitespace-nowrap">
      <span className="text-caption font-semibold text-primary">{formatEur(payload[0].value)}</span>
      <span className="text-caption text-tertiary ml-1.5">{formatDayLabel(month, label)}</span>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const isMobile = useIsMobile();
  const [month, setMonth] = useState(getCurrentMonth());

  const { data, loading, refresh } = useCachedData(`dashboard:${month}`, useCallback(() => getSummary(month), [month]));

  const heroData = data ? buildHeroData(month, data.dailyTotals) : [];
  const balanceColor = (data?.balance ?? 0) >= 0 ? COLORS.green : COLORS.red;
  const recent = data?.recentTransactions?.slice(0, 5) ?? [];

  return (
    <div className="pt-3">
      <Header variant="home" title="Albert Brugué" subtitle="Finanzas personales" />

      <PullToRefresh onRefresh={refresh}>
      {/* Month selector */}
      <div className="flex items-center justify-center gap-4 mt-2 mb-4">
        <button
          onClick={() => setMonth(addMonths(month, -1))}
          className="p-2 text-secondary"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
        <span className="text-title-3 text-primary capitalize tabular-nums">{formatMonth(month)}</span>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          disabled={month >= getCurrentMonth()}
          className="p-2 text-secondary disabled:opacity-30"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Hero chart */}
      {loading ? (
        <div className="skeleton h-[220px] rounded-2xl" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={heroData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={balanceColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={balanceColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: COLORS.textTertiary, fontSize: 12 }}
              interval={Math.max(0, Math.ceil(heroData.length / 6) - 1)}
            />
            <Tooltip content={<HeroTooltip month={month} />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={balanceColor}
              strokeWidth={2}
              fill="url(#heroGrad)"
              dot={false}
              connectNulls
              isAnimationActive={!isMobile}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Figures */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-caption text-tertiary uppercase">Gastos</p>
              <p className="text-display text-danger mt-1 truncate">{formatEur(data.totalExpenses)}</p>
            </div>
            <div>
              <p className="text-caption text-tertiary uppercase">Ingresos</p>
              <p className="text-display text-success mt-1 truncate">{formatEur(data.totalIncome)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-caption text-tertiary">Balance</p>
            <p className={`text-title-2 ${data.balance >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatEur(data.balance)}
            </p>
          </div>
        </>
      )}

      {/* Recent transactions */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-title-3 text-primary">Reciente</h2>
          <button onClick={() => onNavigate('transactions')} className="text-caption text-blue">
            Ver todo
          </button>
        </div>
        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
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
        ) : recent.length > 0 ? (
          <div>
            {recent.map((t, i) => (
              <TransactionCard key={t.id} transaction={t} index={i} last={i === recent.length - 1} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-secondary">
            <Receipt size={28} strokeWidth={1.5} className="mx-auto mb-3 text-tertiary" />
            <p className="text-subhead">No hay transacciones este mes.</p>
            <p className="text-subhead mt-1">Importa tu extracto CSV para empezar.</p>
          </div>
        )}
      </div>
      </PullToRefresh>
    </div>
  );
}
