import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import UploadZone from './UploadZone.jsx';

export default function Layout({ children, currentPage, onNavigate }) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-base text-primary">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-surface">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} onUpload={() => setUploadOpen(true)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-2 z-50">
        {[
          { id: 'dashboard', icon: '📊', label: 'Inicio' },
          { id: 'transactions', icon: '💳', label: 'Gastos' },
          { id: 'analytics', icon: '📈', label: 'Análisis' },
          { id: 'budgets', icon: '🎯', label: 'Budgets' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors ${
              currentPage === item.id ? 'text-accent' : 'text-secondary'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button
          onClick={() => setUploadOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-secondary"
        >
          <span className="text-lg">⬆️</span>
          Importar
        </button>
      </nav>

      {uploadOpen && <UploadZone onClose={() => setUploadOpen(false)} />}
    </div>
  );
}
