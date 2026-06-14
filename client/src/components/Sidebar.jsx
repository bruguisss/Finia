import React from 'react';
import { LayoutGrid, Receipt, BarChart3, Target, HandCoins, Tags, Upload } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { id: 'transactions', icon: Receipt, label: 'Transacciones' },
  { id: 'analytics', icon: BarChart3, label: 'Análisis' },
  { id: 'budgets', icon: Target, label: 'Presupuestos' },
  { id: 'debts', icon: HandCoins, label: 'Deudas' },
  { id: 'categories', icon: Tags, label: 'Categorías' },
];

export default function Sidebar({ currentPage, onNavigate, onUpload }) {
  return (
    <div className="flex flex-col h-full py-3">
      {/* Workspace header */}
      <div className="flex items-center gap-2 px-3 mb-4">
        <div className="w-6 h-6 rounded-md bg-accent/15 text-accent flex items-center justify-center text-xs font-bold shrink-0">
          F
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary leading-tight truncate">Finia</p>
          <p className="text-[11px] text-secondary leading-tight truncate">Finanzas personales</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-all duration-200 ${
                active
                  ? 'bg-elevated text-primary shadow-[0_0_16px_-4px_rgba(110,231,183,0.3)]'
                  : 'text-secondary hover:text-primary hover:bg-elevated/60'
              }`}
            >
              <Icon size={15} strokeWidth={2} className={active ? 'text-accent' : ''} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Upload button */}
      <div className="px-2 mt-2">
        <button
          onClick={onUpload}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-[7px] rounded-md text-[13px] font-medium text-secondary hover:text-primary border border-border hover:border-accent/30 transition-colors"
        >
          <Upload size={14} strokeWidth={2} />
          Importar CSV
        </button>
      </div>
    </div>
  );
}
