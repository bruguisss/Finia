import React from 'react';
import { ChevronRight, Tags } from 'lucide-react';
import Header from '../components/Header.jsx';

const APP_VERSION = '1.0.0';

export default function Settings({ onNavigate }) {
  return (
    <div className="pt-3 space-y-6">
      <Header title="Configuración" />

      <div className="bg-elevated rounded-xl overflow-hidden">
        <button
          onClick={() => onNavigate('categories')}
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
        >
          <Tags size={18} strokeWidth={2} className="text-secondary shrink-0" />
          <span className="flex-1 text-body text-primary">Categorías</span>
          <ChevronRight size={16} strokeWidth={2} className="text-tertiary shrink-0" />
        </button>
      </div>

      <div className="bg-elevated rounded-xl overflow-hidden divide-y divide-white/[0.06]">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-body text-primary">Finia</span>
          <span className="text-subhead text-secondary">v{APP_VERSION}</span>
        </div>
        <div className="px-4 py-3">
          <p className="text-subhead text-secondary">
            Finia es tu app de finanzas personales: importa extractos, organiza tus gastos
            por categorías y planifica presupuestos, objetivos y deudas.
          </p>
        </div>
      </div>
    </div>
  );
}
