import React from 'react';
import { 
  Building, 
  MessageSquareCode, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Send,
  CalendarCheck,
  Flame
} from 'lucide-react';
import { PropertyStats, LeadStatus } from '../types/property';

interface StatsBarProps {
  stats: PropertyStats | null;
  activeStatusFilter: LeadStatus | 'TODOS';
  onSelectStatusFilter: (status: LeadStatus | 'TODOS') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  activeStatusFilter,
  onSelectStatusFilter
}) => {
  if (!stats) return null;

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const whatsappPercent = stats.total > 0 ? Math.round((stats.comWhatsapp / stats.total) * 100) : 0;

  const funnelItems: { status: LeadStatus; label: string; count: number; colorClass: string; bgClass: string; borderClass: string }[] = [
    {
      status: 'NOVO',
      label: 'Novos',
      count: stats.porStatus?.NOVO || 0,
      colorClass: 'text-sky-400',
      bgClass: 'bg-sky-500/10',
      borderClass: 'border-sky-500/30'
    },
    {
      status: 'CONTATADO',
      label: 'Contatados',
      count: stats.porStatus?.CONTATADO || 0,
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/30'
    },
    {
      status: 'INTERESSADO',
      label: 'Interessados',
      count: stats.porStatus?.INTERESSADO || 0,
      colorClass: 'text-purple-400',
      bgClass: 'bg-purple-500/10',
      borderClass: 'border-purple-500/30'
    },
    {
      status: 'VISITA_AGENDADA',
      label: 'Visitas',
      count: stats.porStatus?.VISITA_AGENDADA || 0,
      colorClass: 'text-indigo-400',
      bgClass: 'bg-indigo-500/10',
      borderClass: 'border-indigo-500/30'
    },
    {
      status: 'PROPOSTA_ENVIADA',
      label: 'Propostas',
      count: stats.porStatus?.PROPOSTA_ENVIADA || 0,
      colorClass: 'text-pink-400',
      bgClass: 'bg-pink-500/10',
      borderClass: 'border-pink-500/30'
    },
    {
      status: 'FECHADO',
      label: 'Fechados',
      count: stats.porStatus?.FECHADO || 0,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Captured */}
        <div className="bg-[#111827]/80 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Imóveis</p>
            <p className="text-xl font-bold text-white mt-0.5">{stats.total}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              <span>{stats.bairrosCount} bairros mapeados</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Building className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: WhatsApp Ready */}
        <div className="bg-[#111827]/80 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">WhatsApp Pronto</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-emerald-400">{stats.comWhatsapp}</span>
              <span className="text-xs font-semibold text-emerald-500/80">({whatsappPercent}%)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Contatos diretos para oferta</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MessageSquareCode className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Preço Médio */}
        <div className="bg-[#111827]/80 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Ticket Médio</p>
            <p className="text-xl font-bold text-white mt-0.5">{formatBRL(stats.precoMedio)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Média da carteira captada</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Preço por m² */}
        <div className="bg-[#111827]/80 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">R$ / m² Médio</p>
            <p className="text-xl font-bold text-sky-400 mt-0.5">{formatBRL(stats.precoM2Medio)}/m²</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Referência para negociação</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pipeline Funnel Quick Filter Bar */}
      <div className="bg-[#111827]/60 border border-slate-800/80 rounded-xl p-2.5">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Funil Comercial de Abordagem:</span>
          </div>
          {activeStatusFilter !== 'TODOS' && (
            <button
              onClick={() => onSelectStatusFilter('TODOS')}
              className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              Ver todos os estágios
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
          {funnelItems.map((item) => {
            const isSelected = activeStatusFilter === item.status;
            return (
              <button
                key={item.status}
                onClick={() => onSelectStatusFilter(isSelected ? 'TODOS' : item.status)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? `${item.bgClass} ${item.borderClass} ring-2 ring-blue-500/50 font-bold`
                    : 'bg-slate-900/60 border-slate-800/70 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="truncate">{item.label}</span>
                <span className={`ml-1.5 text-xs font-mono font-bold ${item.colorClass}`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
