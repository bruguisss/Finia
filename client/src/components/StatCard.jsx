import React from 'react';

export default function StatCard({ label, value, sub, trend, loading }) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-5">
        <div className="skeleton h-3 w-24 mb-3" />
        <div className="skeleton h-7 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-5 hover:border-accent/30 transition-colors">
      <p className="text-xs text-secondary uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-semibold tabular-nums text-primary">{value}</p>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-1.5">
          {sub && <span className="text-xs text-secondary">{sub}</span>}
          {trend !== undefined && (
            <span className={`text-xs font-medium ${trend > 0 ? 'text-danger' : trend < 0 ? 'text-accent' : 'text-secondary'}`}>
              {trend > 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
