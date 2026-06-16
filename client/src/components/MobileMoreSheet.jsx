import React, { useEffect } from 'react';
import { BarChart3, Target, HandCoins, Tags, Upload } from 'lucide-react';

const MORE_ITEMS = [
  { id: 'analytics', icon: BarChart3, label: 'Análisis' },
  { id: 'budgets', icon: Target, label: 'Presupuestos' },
  { id: 'debts', icon: HandCoins, label: 'Deudas' },
  { id: 'categories', icon: Tags, label: 'Categorías' },
];

export default function MobileMoreSheet({ currentPage, onNavigate, onUpload, onClose }) {
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const savedScrollTop = main.scrollTop;
    main.style.overflowY = 'hidden';
    return () => {
      main.style.overflowY = '';
      main.scrollTop = savedScrollTop;
    };
  }, []);

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-surface border-t border-border rounded-t-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-slide-up">
        <div className="w-9 h-1 bg-black/[0.12] dark:bg-white/[0.15] rounded-full mx-auto mt-2.5 mb-1" />
        <div className="px-2 py-1">
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-colors duration-150 ${
                  active
                    ? 'text-primary bg-black/[0.06] dark:bg-white/[0.06]'
                    : 'text-secondary hover:text-primary hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={18} strokeWidth={2} className={active ? 'text-accent' : ''} />
                {item.label}
              </button>
            );
          })}
          <div className="border-t border-border my-1 mx-3" />
          <button
            onClick={() => { onUpload(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-secondary hover:text-primary hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors duration-150"
          >
            <Upload size={18} strokeWidth={2} />
            Importar CSV
          </button>
        </div>
      </div>
    </div>
  );
}
