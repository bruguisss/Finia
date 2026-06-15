import React, { useState, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Loader2, FolderOpen, CheckCircle2 } from 'lucide-react';
import { uploadCSV } from '../api.js';

export default function UploadZone({ onClose }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const fileRef = useRef(null);

  async function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Por favor, sube un archivo CSV.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await uploadCSV(file);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Error al procesar el archivo');
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'calc(100vw - 32px)', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
        className="bg-surface border border-border rounded-2xl shadow-2xl animate-fade-in"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-primary tracking-tight">Importar extracto CSV</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors duration-150"><X size={18} strokeWidth={2} /></button>
        </div>

        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
          {!result ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !uploading && fileRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-lg border-2 border-dashed cursor-pointer transition-colors duration-150 ${
                  dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-elevated/50'
                } ${uploading ? 'pointer-events-none' : ''}`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {uploading ? (
                  <>
                    <Loader2 size={28} strokeWidth={2} className="text-accent animate-spin" />
                    <p className="text-sm text-secondary">Procesando y categorizando con IA...</p>
                  </>
                ) : (
                  <>
                    <FolderOpen size={32} strokeWidth={1.5} className="text-secondary" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-primary">Arrastra tu CSV aquí</p>
                      <p className="text-xs text-secondary mt-1">o haz click para seleccionar</p>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">
                  {error}
                </div>
              )}

              {/* Instructions collapsible */}
              <div className="border border-border rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-secondary hover:text-primary transition-colors duration-150"
                  onClick={() => setInstructionsOpen(!instructionsOpen)}
                >
                  <span>¿Cómo exportar desde Revolut?</span>
                  {instructionsOpen ? <ChevronUp size={14} strokeWidth={2} /> : <ChevronDown size={14} strokeWidth={2} />}
                </button>
                {instructionsOpen && (
                  <div className="px-4 pb-4 text-xs text-secondary space-y-1.5 border-t border-border pt-3">
                    <p>1. Abre Revolut app o web</p>
                    <p>2. Ve a tu cuenta → Extracto</p>
                    <p>3. Selecciona el período que quieres importar</p>
                    <p>4. Exporta en formato <strong className="text-primary">CSV</strong></p>
                    <p>5. Sube el archivo aquí</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Success screen */
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 size={40} strokeWidth={1.5} className="text-accent mx-auto" />
              <div>
                <p className="text-lg font-semibold text-primary">
                  {result.imported} transacciones importadas
                </p>
                {result.skipped > 0 && (
                  <p className="text-sm text-secondary mt-1">{result.skipped} duplicadas omitidas</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-md bg-accent text-base font-medium text-sm hover:bg-accent-hover transition-colors duration-150"
              >
                Ver transacciones
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
