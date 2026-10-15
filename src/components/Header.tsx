import React from 'react';
import { 
  Building2, 
  Puzzle, 
  Download, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';

interface HeaderProps {
  isApiOnline: boolean;
  totalProperties: number;
  onOpenExtensionModal: () => void;
  onOpenSimulateModal: () => void;
  onOpenAddModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isApiOnline,
  totalProperties,
  onOpenExtensionModal,
  onOpenSimulateModal,
  onOpenAddModal,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 flex items-center justify-center shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                ImobiHunter <span className="text-blue-500 font-extrabold text-sm uppercase px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">PRO</span>
              </h1>
              {/* Online/Offline Status Indicator */}
              <div 
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  isApiOnline 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                }`}
                title={isApiOnline ? 'API RESTful conectada e pronta para receber captações' : 'Tentando conectar à API do CRM...'}
              >
                {isApiOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Wifi className="w-3 h-3" />
                    <span>API Online</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <WifiOff className="w-3 h-3" />
                    <span>API Offline</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Captador de Imóveis no Zap Imóveis & CRM de Prospecção Ativa
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Extension Button */}
          <button
            onClick={onOpenExtensionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Puzzle className="w-4 h-4 text-indigo-200" />
            <span>Extensão Chrome</span>
            <span className="bg-indigo-800 text-indigo-200 text-[10px] px-1.5 py-0.2 rounded font-mono">v1.2.1</span>
          </button>

          {/* Simulate Scrape Button */}
          <button
            onClick={onOpenSimulateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 text-sky-300 text-xs font-medium transition-all cursor-pointer"
            title="Simular captura de imóveis no Zap Imóveis por bairro"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simular Captura</span>
          </button>

          {/* Export CSV Button */}
          <a
            href="/api/export/csv"
            download="imoveis_prospeccao_zap.csv"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
            title="Exportar planilha para Excel ou Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </a>

          {/* Add Manual Property */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Imóvel</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Atualizar lista de imóveis"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
