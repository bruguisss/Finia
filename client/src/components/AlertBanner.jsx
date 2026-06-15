import React from 'react';
import { AlertTriangle, Zap } from 'lucide-react';

export default function AlertBanner({ budgets }) {
  const exceeded = budgets.filter((b) => b.percentage >= 100);
  const warning = budgets.filter((b) => b.percentage >= 75 && b.percentage < 100);

  if (exceeded.length === 0 && warning.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {exceeded.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-danger/10 border border-danger/30 text-sm">
          <AlertTriangle size={15} strokeWidth={2} className="text-danger shrink-0" />
          <span className="text-danger font-medium">Presupuesto superado:</span>
          <span className="text-primary">
            {exceeded.map((b) => b.category).join(', ')}
          </span>
        </div>
      )}
      {warning.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
          <Zap size={15} strokeWidth={2} className="text-warning shrink-0" />
          <span className="text-warning font-medium">Cerca del límite:</span>
          <span className="text-primary">
            {warning.map((b) => `${b.category} (${b.percentage}%)`).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}
