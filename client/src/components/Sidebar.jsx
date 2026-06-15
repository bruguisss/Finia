import React from 'react';
import { LayoutGrid, Receipt, BarChart3, Target, HandCoins, Tags, Upload, Flag } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { id: 'transactions', icon: Receipt, label: 'Transacciones' },
  { id: 'analytics', icon: BarChart3, label: 'Análisis' },
  { id: 'budgets', icon: Target, label: 'Presupuestos' },
  { id: 'planning', icon: Flag, label: 'Planificación' },
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
          <p className="text-sm font-semibold text-primary leading-tight tracking-tight truncate">Finia</p>
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
              className={`relative w-full flex items-center gap-2.5 pl-3.5 pr-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors duration-150 ${
                active ? 'text-primary' : 'text-secondary hover:text-primary'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-accent" />
              )}
              <Icon size={16} strokeWidth={2} className={active ? 'text-accent' : ''} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Upload button */}
      <div className="px-2 mt-2">
        <button
          onClick={onUpload}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-[7px] rounded-md text-[13px] font-medium bg-muted border border-white/10 text-primary hover:bg-[#3A3A3C] transition-colors duration-150"
        >
          <Upload size={14} strokeWidth={2} />
          Importar CSV
        </button>
      </div>
    </div>
  );
}
