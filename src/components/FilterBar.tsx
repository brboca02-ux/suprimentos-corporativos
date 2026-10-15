import React from 'react';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  LayoutGrid, 
  Table, 
  Check, 
  X,
  ArrowUpDown,
  PhoneCall,
  BedDouble
} from 'lucide-react';
import { PropertyFilterQuery, LeadStatus } from '../types/property';

interface FilterBarProps {
  filters: PropertyFilterQuery;
  onFilterChange: (newFilters: Partial<PropertyFilterQuery>) => void;
  onResetFilters: () => void;
  bairrosList: string[];
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  bairrosList,
  viewMode,
  onViewModeChange,
  totalFiltered
}) => {
  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.bairro && filters.bairro !== 'TODOS') ||
    (filters.status && filters.status !== 'TODOS') ||
    filters.hasWhatsappOnly ||
    filters.minBedrooms ||
    filters.minPrice ||
    filters.maxPrice ||
    (filters.sortBy && filters.sortBy !== 'recent')
  );

  return (
    <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-3 shadow-md space-y-3">
      {/* Row 1: Search, Bairro, WhatsApp Toggle, View Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Buscar por bairro, condomínio, código Zap, anunciante..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bairro Selector */}
        <div className="relative min-w-[180px]">
          <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filters.bairro || 'TODOS'}
            onChange={(e) => onFilterChange({ bairro: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-7 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
          >
            <option value="TODOS">Todos os Bairros</option>
            {bairrosList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">▼</div>
        </div>

        {/* WhatsApp Only Switch */}
        <button
          onClick={() => onFilterChange({ hasWhatsappOnly: !filters.hasWhatsappOnly })}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            filters.hasWhatsappOnly
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-semibold'
              : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600'
          }`}
        >
          <PhoneCall className={`w-3.5 h-3.5 ${filters.hasWhatsappOnly ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>Com WhatsApp</span>
          {filters.hasWhatsappOnly && <Check className="w-3 h-3 text-emerald-400 ml-0.5" />}
        </button>

        {/* Sort By */}
        <div className="relative min-w-[170px]">
          <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filters.sortBy || 'recent'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-7 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
          >
            <option value="recent">Mais Recentes</option>
            <option value="opportunity">Maior Oportunidade</option>
            <option value="price_asc">Menor Preço (R$)</option>
            <option value="price_desc">Maior Preço (R$)</option>
            <option value="m2_asc">Menor R$/m²</option>
            <option value="m2_desc">Maior R$/m²</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">▼</div>
        </div>

        {/* View Mode Toggle: Grid vs Table */}
        <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 self-center">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Visualização em Cards"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Visualização em Tabela CRM"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row 2: Secondary Quick Filters (Bedrooms, Price limits, Clear) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Bedrooms Pills */}
          <div className="flex items-center gap-1 text-slate-400">
            <BedDouble className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium mr-1">Quartos:</span>
            {[
              { val: undefined, label: 'Todos' },
              { val: 1, label: '1+' },
              { val: 2, label: '2+' },
              { val: 3, label: '3+' },
              { val: 4, label: '4+' }
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => onFilterChange({ minBedrooms: b.val })}
                className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-all ${
                  filters.minBedrooms === b.val
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Status Quick Pill if not TODOS */}
          {filters.status && filters.status !== 'TODOS' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-900/30 border border-blue-500/40 text-blue-300 text-[11px]">
              <span>Status: <strong>{filters.status}</strong></span>
              <button onClick={() => onFilterChange({ status: 'TODOS' })} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Counter & Clear Button */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs font-mono">
            {totalFiltered} imóvel(is) encontrado(s)
          </span>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
