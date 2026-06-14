import React, { useState } from 'react';
import { LayoutGrid, Receipt, BarChart3, Target, HandCoins, Tags, Upload, Plus, Flag, Menu } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import UploadZone from './UploadZone.jsx';
import AddTransactionModal from './AddTransactionModal.jsx';

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
  { id: 'transactions', icon: Receipt, label: 'Transacciones' },
  { id: 'analytics', icon: BarChart3, label: 'Análisis' },
  { id: 'budgets', icon: Target, label: 'Presupuestos' },
  { id: 'planning', icon: Flag, label: 'Planificación' },
  { id: 'debts', icon: HandCoins, label: 'Deudas' },
  { id: 'categories', icon: Tags, label: 'Categorías' },
];

export default function Layout({ children, currentPage, onNavigate }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

        {/* Mobile top bar */}
        <header className="md:hidden relative flex items-center justify-between h-12 shrink-0 border-b border-border px-4">
          <div className="flex items-center gap-2 text-sm">
            <PageIcon size={15} strokeWidth={2} className="text-secondary" />
            <span className="font-medium text-primary tracking-tight">{meta.label}</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-md bg-muted border border-white/10 text-primary hover:bg-[#3f3f46] transition-colors duration-150 flex items-center justify-center"
          >
            <Menu size={16} strokeWidth={2} />
          </button>

          {mobileMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)} />
              <div className="absolute right-4 top-12 w-48 bg-surface border border-border rounded-lg shadow-2xl z-50 py-1 animate-scale-in">
                {MOBILE_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors duration-150 ${
                        active ? 'text-primary' : 'text-secondary hover:text-primary'
                      }`}
                    >
                      <Icon size={15} strokeWidth={2} className={active ? 'text-accent' : ''} />
                      {item.label}
                    </button>
                  );
                })}
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => { setUploadOpen(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-secondary hover:text-primary transition-colors duration-150"
                >
                  <Upload size={15} strokeWidth={2} />
                  Importar CSV
                </button>
              </div>
            </>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div key={currentPage} className="max-w-6xl mx-auto px-5 py-6 pb-20 md:pb-6 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-base border-t border-white/[0.06] flex justify-center py-2 z-50">
        <button
          onClick={() => setAddTxOpen(true)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-base hover:bg-accent-hover transition-colors duration-150"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </nav>

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
