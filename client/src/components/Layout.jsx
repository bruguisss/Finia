import React, { useState } from 'react';
import { LayoutGrid, Receipt, BarChart3, Target, HandCoins, Tags, Upload, Plus, Flag, MoreHorizontal } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import UploadZone from './UploadZone.jsx';
import AddTransactionModal from './AddTransactionModal.jsx';
import MobileMoreSheet from './MobileMoreSheet.jsx';

const PAGE_META = {
  dashboard: { label: 'Dashboard', icon: LayoutGrid },
  transactions: { label: 'Transacciones', icon: Receipt },
  analytics: { label: 'Análisis', icon: BarChart3 },
  budgets: { label: 'Presupuestos', icon: Target },
  planning: { label: 'Planificación', icon: Flag },
  debts: { label: 'Deudas', icon: HandCoins },
  categories: { label: 'Categorías', icon: Tags },
};

const MOBILE_NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Inicio' },
  { id: 'transactions', icon: Receipt, label: 'Gastos' },
  { id: 'analytics', icon: BarChart3, label: 'Análisis' },
  { id: 'planning', icon: Flag, label: 'Plan' },
];

const MORE_PAGES = ['budgets', 'debts', 'categories'];

export default function Layout({ children, currentPage, onNavigate }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const meta = PAGE_META[currentPage] || PAGE_META.dashboard;
  const PageIcon = meta.icon;

  return (
    <div className="flex h-screen overflow-hidden bg-base text-primary">
      {/* Desktop sidebar - flush panel, separated by subtle shadow only */}
      <div className="hidden md:flex flex-col w-60 shrink-0 bg-base shadow-[4px_0_24px_-12px_rgba(0,0,0,0.7)]">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} onUpload={() => setUploadOpen(true)} />
      </div>

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="hidden md:flex items-center justify-between h-12 shrink-0 border-b border-border px-5">
          <div className="flex items-center gap-2 text-sm">
            <PageIcon size={15} strokeWidth={2} className="text-secondary" />
            <span className="font-medium text-primary tracking-tight">{meta.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddTxOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium bg-accent text-base hover:bg-accent-hover transition-colors duration-150"
            >
              <Plus size={13} strokeWidth={2.5} />
              Añadir transacción
            </button>
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium bg-muted border border-white/10 text-primary hover:bg-[#3f3f46] transition-colors duration-150"
            >
              <Upload size={13} strokeWidth={2} />
              Importar CSV
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div key={currentPage} className="max-w-6xl mx-auto px-5 pt-[max(1.5rem,env(safe-area-inset-top))] md:pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile floating glass nav */}
      <nav className="md:hidden fixed left-3 right-3 z-40 flex items-center justify-around gap-1 px-2 py-2 rounded-[28px] bg-white/[0.07] backdrop-blur-2xl backdrop-saturate-150 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden" style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl text-[11px] font-medium transition-colors duration-150 ${
                active ? 'text-primary bg-white/10' : 'text-secondary'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
        <button
          onClick={() => setMoreSheetOpen(true)}
          className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl text-[11px] font-medium transition-colors duration-150 ${
            MORE_PAGES.includes(currentPage) ? 'text-primary bg-white/10' : 'text-secondary'
          }`}
        >
          <MoreHorizontal size={18} strokeWidth={2} />
          Más
        </button>
      </nav>

      {/* Mobile floating glass FAB */}
      <button
        onClick={() => setAddTxOpen(true)}
        className="md:hidden fixed right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center bg-white/[0.09] backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.1)] text-primary overflow-hidden"
        style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.1] to-transparent pointer-events-none" />
        <Plus size={24} strokeWidth={2.5} className="relative" />
      </button>

      {moreSheetOpen && (
        <MobileMoreSheet
          currentPage={currentPage}
          onNavigate={onNavigate}
          onUpload={() => setUploadOpen(true)}
          onClose={() => setMoreSheetOpen(false)}
        />
      )}

      {uploadOpen && <UploadZone onClose={() => setUploadOpen(false)} />}
      {addTxOpen && (
        <AddTransactionModal
          onClose={() => setAddTxOpen(false)}
          onSwitchToUpload={() => { setAddTxOpen(false); setUploadOpen(true); }}
        />
      )}
    </div>
  );
}
