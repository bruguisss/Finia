import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { useCategories, DEFAULT_COLOR } from '../context/CategoriesContext.jsx';
import { getMonthlyTrend, getTransactions } from '../api.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

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

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1a1a1f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6,
  fontSize: 12,
};

const TOP_CATEGORIES = ['Alimentación', 'Transporte', 'Ocio', 'Hogar', 'Compras', 'Salud'];

export default function Analytics() {
  const { getCategory } = useCategories();
  const isMobile = useIsMobile();
  const [trend, setTrend] = useState(null);
  const [topMerchants, setTopMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [trendData, txRes] = await Promise.all([
          getMonthlyTrend(),
          getTransactions({ type: 'debit', limit: 500, offset: 0 }),
        ]);
        setTrend(trendData);

        // Aggregate top merchants
        const map = {};
        for (const t of txRes.transactions) {
          const key = t.description;
          if (!map[key]) map[key] = { description: key, count: 0, total: 0 };
          map[key].count++;
          map[key].total += t.amount;
        }
        const sorted = Object.values(map)
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);
        setTopMerchants(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Prepare stacked area data: each month has a breakdown per category
  const stackedData = (trend || []).map((m) => {
    const row = { month: shortMonth(m.month) };
    for (const c of TOP_CATEGORIES) {
      const found = m.categoryBreakdown.find((b) => b.category === c);
      row[c] = found ? Math.round(found.total) : 0;
    }
    return row;
  });

  const barData = (trend || []).map((m) => ({
    month: shortMonth(m.month),
    Gastos: Math.round(m.expenses),
    Ingresos: Math.round(m.income),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-primary tracking-tight">Análisis</h2>

      {/* Income vs Expenses bar chart */}
      <div className="bg-surface border border-border rounded-lg p-5 transition-colors duration-150 hover:border-border-hover will-change-transform">
        <h3 className="text-sm font-medium text-primary mb-4">Ingresos vs Gastos (últimos 6 meses)</h3>
        {loading ? (
          <div className="skeleton h-52" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#6b6b7b', fontSize: 12 }} axisLine={false} tickLine={false} interval={isMobile ? 1 : 0} />
              <YAxis tick={{ fill: '#6b6b7b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} tickCount={isMobile ? 3 : 5} />
              <Tooltip
                contentStyle={{ ...CHART_TOOLTIP_STYLE, fontSize: isMobile ? 11 : 12 }}
                formatter={(v) => isMobile ? formatEurCompact(v) : formatEur(v)}
              />
              <Legend formatter={(v) => <span style={{ color: '#6b6b7b', fontSize: 12 }}>{v}</span>} />
              <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} isAnimationActive={!isMobile} />
              <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={!isMobile} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category evolution stacked area */}
      <div className="bg-surface border border-border rounded-lg p-5 transition-colors duration-150 hover:border-border-hover will-change-transform">
        <h3 className="text-sm font-medium text-primary mb-4">Evolución por categoría</h3>
        {loading ? (
          <div className="skeleton h-52" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stackedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#6b6b7b', fontSize: 12 }} axisLine={false} tickLine={false} interval={isMobile ? 1 : 0} />
              <YAxis tick={{ fill: '#6b6b7b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} tickCount={isMobile ? 3 : 5} />
              <Tooltip
                contentStyle={{ ...CHART_TOOLTIP_STYLE, fontSize: isMobile ? 11 : 12 }}
                formatter={(v) => isMobile ? formatEurCompact(v) : formatEur(v)}
              />
              <Legend formatter={(v) => <span style={{ color: '#6b6b7b', fontSize: 12 }}>{v}</span>} />
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
      <div className="bg-surface border border-border rounded-lg transition-colors duration-150 hover:border-border-hover">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-primary">Top comercios por gasto total</h3>
        </div>
        {loading ? (
          <div className="divide-y divide-white/[0.04]">
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
          <div className="divide-y divide-white/[0.04]">
            {topMerchants.map((m, i) => (
              <div key={m.description} className="flex items-center gap-4 px-5 h-10 hover:bg-white/[0.03] transition-colors duration-150">
                <span className="text-[13px] text-secondary w-6 shrink-0 tabular-nums">{i + 1}</span>
                <span className="text-[13px] text-primary flex-1 truncate">{m.description}</span>
                <span className="text-xs text-secondary">{m.count} veces</span>
                <span className="text-[13px] font-medium font-mono text-danger tabular-nums">{formatEur(m.total)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-secondary text-sm">
            No hay datos suficientes
          </div>
        )}
      </div>
    </div>
  );
}
