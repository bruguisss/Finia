import React from 'react';

export default function StatCard({ label, value, sub, trend, loading }) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="skeleton h-7 w-28 mb-3" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 transition-colors duration-150 hover:border-border-hover">
      <p className="font-numeric text-[28px] font-semibold tabular-nums text-primary tracking-stat leading-tight">{value}</p>
      <div className="flex items-center gap-2 mt-2">
        <p className="text-[11px] font-medium text-secondary uppercase tracking-badge">{label}</p>
        {trend !== undefined && (
          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${trend > 0 ? 'bg-danger/10 text-danger' : trend < 0 ? 'bg-success/10 text-success' : 'bg-white/[0.06] text-secondary'}`}>
            {trend > 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-secondary mt-0.5">{sub}</p>}
    </div>
  );
}
