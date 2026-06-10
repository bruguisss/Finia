import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'transactions', icon: '💳', label: 'Transacciones' },
  { id: 'analytics', icon: '📈', label: 'Análisis' },
  { id: 'budgets', icon: '🎯', label: 'Presupuestos' },
];

export default function Sidebar({ currentPage, onNavigate, onUpload }) {
  return (
    <div className="flex flex-col h-full py-6">
      {/* Logo */}
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold text-accent tracking-tight">
          Finia
        </h1>
        <p className="text-xs text-secondary mt-0.5">Finanzas personales</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-secondary hover:text-primary hover:bg-elevated'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </nav>

      {/* Upload button */}
      <div className="px-3 mt-auto">
        <button
          onClick={onUpload}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-all border border-accent/20"
        >
          <span>⬆️</span>
          Importar CSV
        </button>
      </div>
    </div>
  );
}
