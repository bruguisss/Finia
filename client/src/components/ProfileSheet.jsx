import React, { useEffect } from 'react';
import { Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const OPTIONS = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'system', label: 'Sistema', Icon: Smartphone },
  { value: 'dark', label: 'Oscuro', Icon: Moon },
];

export default function ProfileSheet({ onClose }) {
  const { preference, setTheme } = useTheme();

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
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="bg-surface rounded-t-3xl px-5 pt-3">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-[15px] font-semibold text-primary shrink-0">
              AB
            </div>
            <div>
              <p className="text-[15px] font-semibold text-primary">Albert Brugué</p>
              <p className="text-sm text-secondary">Finanzas personales</p>
            </div>
          </div>

          <p className="text-[11px] font-medium text-tertiary uppercase tracking-wider mb-3">Apariencia</p>
          <div className="flex gap-2 p-1.5 bg-muted rounded-2xl mb-6">
            {OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 ${
                  preference === value
                    ? 'bg-surface shadow-sm text-primary'
                    : 'text-tertiary hover:text-secondary'
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            ))}
          </div>

          <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 104px)' }} />
        </div>
      </div>
    </>
  );
}
