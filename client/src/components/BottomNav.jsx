import React from 'react';
import { Home, Receipt, PieChart, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: Home, label: 'Inicio' },
  { id: 'transactions', icon: Receipt, label: 'Gastos' },
  { id: 'plan', icon: PieChart, label: 'Plan' },
  { id: 'more', icon: Menu, label: 'Más' },
];

// Pages reachable only via the "Más" tab — kept highlighted as a group.
const MORE_PAGES = ['more', 'analytics', 'categories', 'settings'];

export default function BottomNav({ currentPage, onNavigate }) {
  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 w-[calc(100%-32px)] max-w-[400px] md:max-w-[480px] px-3 py-2.5 rounded-[26px] border border-white/[0.12]"
      style={{
        bottom: 'calc(20px + env(safe-area-inset-bottom))',
        background: 'rgba(18,18,18,0.8)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        boxShadow: '0 0 0 0.5px rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.6)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = currentPage === item.id || (item.id === 'more' && MORE_PAGES.includes(currentPage));
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[18px] text-[13px] font-medium transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              active ? 'bg-white/10 text-primary px-3' : 'text-tertiary'
            }`}
          >
            <Icon size={22} strokeWidth={2} />
            {active && <span>{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
