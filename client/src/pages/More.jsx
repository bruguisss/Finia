import React, { useState } from 'react';
import { ChevronRight, Upload, Tags, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import Header from '../components/Header.jsx';
import UploadZone from '../components/UploadZone.jsx';

function Row({ icon: Icon, label, onClick, last = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left ${!last ? 'border-b border-white/[0.06]' : ''}`}
    >
      <Icon size={18} strokeWidth={2} className="text-secondary shrink-0" />
      <span className="flex-1 text-body text-primary">{label}</span>
      <ChevronRight size={16} strokeWidth={2} className="text-tertiary shrink-0" />
    </button>
  );
}

function Group({ children }) {
  return <div className="bg-elevated rounded-xl overflow-hidden">{children}</div>;
}

export default function More({ onNavigate }) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="pt-3 space-y-6">
      <Header title="Más" />

      <Group>
        <Row icon={Upload} label="Importar CSV" onClick={() => setUploadOpen(true)} last />
      </Group>

      <Group>
        <Row icon={Tags} label="Categorías" onClick={() => onNavigate('categories')} />
        <Row icon={BarChart3} label="Análisis detallado" onClick={() => onNavigate('analytics')} last />
      </Group>

      <Group>
        <Row icon={SettingsIcon} label="Configuración" onClick={() => onNavigate('settings')} last />
      </Group>

      {uploadOpen && <UploadZone onClose={() => setUploadOpen(false)} />}
    </div>
  );
}
