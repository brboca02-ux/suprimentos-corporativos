import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Loader2
} from 'lucide-react';

interface SimulateModalProps {
  onClose: () => void;
  onSimulate: (bairro: string, count?: number) => Promise<boolean>;
}

export const SimulateModal: React.FC<SimulateModalProps> = ({
  onClose,
  onSimulate
}) => {
  const [bairro, setBairro] = useState('Moema');
  const [customBairro, setCustomBairro] = useState('');
  const [batchCount, setBatchCount] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const popularBairros = [
    'Moema',
    'Pinheiros',
    'Itaim Bibi',
    'Perdizes',
    'Copacabana',
    'Barra da Tijuca',
    'Vila Mariana',
    'Jardins'
  ];

  const handleRunSimulate = async () => {
    const target = customBairro.trim() || bairro;
    setIsLoading(true);
    setSuccessMsg('');
    try {
      const ok = await onSimulate(target, batchCount);
      if (ok) {
        setSuccessMsg(`✓ ${batchCount} imóveis em ${target} capturados e inseridos no CRM sem duplicatas!`);
        setTimeout(() => {
          onClose();
        }, 1600);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Simulador de Captura Zap Imóveis</h3>
              <p className="text-xs text-slate-400">Teste o fluxo de captação imediatamente no navegador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Escolha o Bairro para Capturar:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {popularBairros.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setBairro(b);
                  setCustomBairro('');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                  bairro === b && !customBairro
                    ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="text-xs text-slate-400 block mb-1">Ou digite outro bairro / cidade:</label>
            <input
              type="text"
              value={customBairro}
              onChange={(e) => {
                setCustomBairro(e.target.value);
              }}
              placeholder="Ex: Brooklin, Bela Vista, Leblon, Jardim Iririú..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Quantidade de Imóveis para Simular:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 2, label: '2 Imóveis', desc: 'Rápido' },
                { count: 30, label: '30 Imóveis', desc: '1 Página Zap' },
                { count: 88, label: '88 Imóveis', desc: 'Multi-Páginas (Bairro Completo)' }
              ].map((opt) => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setBatchCount(opt.count)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    batchCount === opt.count
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{opt.label}</div>
                  <div className="text-[10px] text-slate-400">{opt.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
              <span>🛡️</span>
              <span>Ao simular novamente, a deduplicação atualiza registros sem duplicar.</span>
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleRunSimulate}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isLoading ? 'Capturando dados no Zap...' : 'Simular Captura Agora'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
