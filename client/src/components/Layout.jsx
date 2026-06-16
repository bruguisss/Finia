import React, { useState, useLayoutEffect, useRef } from 'react';
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
  { id: 'planning', icon: Flag, label: 'Plan' },
];

const MORE_PAGES = ['budgets', 'debts', 'categories', 'analytics'];

export default function Layout({ children, currentPage, onNavigate }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const meta = PAGE_META[currentPage] || PAGE_META.dashboard;
  const PageIcon = meta.icon;
  const mainRef = useRef(null);

  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [currentPage]);

  return (
    <div className="flex h-screen overflow-hidden bg-base text-primary">
      {/* Top fade gradient (mobile) */}
      <div
        aria-hidden="true"
        className="md:hidden fixed top-0 left-0 right-0 h-20 z-40 bg-gradient-to-b from-base to-transparent pointer-events-none"
      />

      {/* Bottom fade gradient (mobile) */}
      <div
        aria-hidden="true"
        className="md:hidden fixed bottom-0 left-0 right-0 h-[100px] z-10 bg-gradient-to-t from-base to-transparent pointer-events-none"
      />

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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-accent text-base hover:bg-accent-hover transition-colors duration-150"
            >
              <Plus size={13} strokeWidth={2.5} />
              Añadir transacción
            </button>
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium bg-muted border border-white/10 text-primary hover:bg-[#555555] transition-colors duration-150"
            >
              <Upload size={13} strokeWidth={2} />
              Importar CSV
            </button>
          </div>
        </header>

        {/* Main content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div key={currentPage} className="max-w-6xl mx-auto px-5 pt-[max(1.5rem,env(safe-area-inset-top))] md:pt-6 pb-[calc(100px+env(safe-area-inset-bottom))] md:pb-6 animate-page-in">
            {React.cloneElement(children, {
              onAddTransaction: () => setAddTxOpen(true),
              onOpenMore: () => setMoreSheetOpen(true),
            })}
          </div>
        </main>
      </div>

      {/* Mobile floating glass nav island */}
      <nav
        className="md:hidden fixed left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 w-[calc(100%-48px)] max-w-[380px] px-2 py-2 rounded-[26px] bg-[rgba(20,20,22,0.55)] border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        style={{ bottom: 'calc(24px + env(safe-area-inset-bottom))', backdropFilter: 'blur(50px) saturate(200%)', WebkitBackdropFilter: 'blur(50px) saturate(200%)' }}
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex items-center justify-center gap-2 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                active ? 'flex-[2] bg-[#1c1c1e] text-white rounded-[20px] px-5 py-2.5' : 'flex-1 text-white/40 py-2.5'
              }`}
            >
              <Icon size={20} strokeWidth={2} />
              {active && <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
        <button
          onClick={() => setMoreSheetOpen(true)}
          className={`relative flex items-center justify-center gap-2 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            MORE_PAGES.includes(currentPage) ? 'flex-[2] bg-[#1c1c1e] text-white rounded-[20px] px-5 py-2.5' : 'flex-1 text-white/40 py-2.5'
          }`}
        >
          <MoreHorizontal size={20} strokeWidth={2} />
          {MORE_PAGES.includes(currentPage) && <span className="text-[13px] font-medium whitespace-nowrap">Más</span>}
        </button>
      </nav>

      {/* Mobile floating glass FAB */}
      <button
        onClick={() => setAddTxOpen(true)}
        className="md:hidden fixed right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center bg-white/[0.09] backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.1)] text-primary overflow-hidden"
        style={{ bottom: 'calc(6.5rem + env(safe-area-inset-bottom))' }}
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
