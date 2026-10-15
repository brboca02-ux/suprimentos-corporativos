import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyTable } from './components/PropertyTable';
import { PropertyModal } from './components/PropertyModal';
import { ExtensionModal } from './components/ExtensionModal';
import { SimulateModal } from './components/SimulateModal';
import { ManualAddModal } from './components/ManualAddModal';
import { Property, PropertyStats, PropertyFilterQuery, LeadStatus } from './types/property';
import { INITIAL_PROPERTIES } from './data/seedProperties';
import { 
  Building2, 
  Sparkles, 
  Inbox, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowDown
} from 'lucide-react';

export default function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [bairrosList, setBairrosList] = useState<string[]>([]);
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination & Virtualization States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12); // 12, 24, 48, 0 (Todos)
  const [displayMode, setDisplayMode] = useState<'pages' | 'infinite'>('pages');
  const [infiniteLimit, setInfiniteLimit] = useState(12);

  // Filters State
  const [filters, setFilters] = useState<PropertyFilterQuery>({
    bairro: 'TODOS',
    search: '',
    status: 'TODOS',
    minBedrooms: undefined,
    hasWhatsappOnly: false,
    sortBy: 'recent'
  });

  // Modals State
  const [selectedPropertyModal, setSelectedPropertyModal] = useState<Property | null>(null);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Build query string from filters
  const buildQueryString = useCallback((f: PropertyFilterQuery) => {
    const params = new URLSearchParams();
    if (f.bairro && f.bairro !== 'TODOS') params.append('bairro', f.bairro);
    if (f.status && f.status !== 'TODOS') params.append('status', f.status);
    if (f.search) params.append('search', f.search);
    if (f.hasWhatsappOnly) params.append('hasWhatsappOnly', 'true');
    if (f.minBedrooms) params.append('minBedrooms', String(f.minBedrooms));
    if (f.minPrice) params.append('minPrice', String(f.minPrice));
    if (f.maxPrice) params.append('maxPrice', String(f.maxPrice));
    if (f.sortBy) params.append('sortBy', f.sortBy);
    return params.toString();
  }, []);

  // Fetch data from API
  const fetchData = useCallback(async (currentFilters: PropertyFilterQuery) => {
    try {
      const q = buildQueryString(currentFilters);
      const [resList, resStats, resBairros] = await Promise.all([
        fetch(`/api/imoveis?${q}`),
        fetch('/api/stats'),
        fetch('/api/bairros')
      ]);

      if (resList.ok && resStats.ok) {
        const dataList = await resList.json();
        const dataStats = await resStats.json();
        const dataBairros = resBairros.ok ? await resBairros.json() : [];

        setProperties(dataList.properties || []);
        setStats(dataStats);
        setBairrosList(dataBairros);
        setIsApiOnline(true);
      } else {
        throw new Error('API retornou status não 200');
      }
    } catch (err) {
      console.warn('[App] Erro na API backend, usando fallback local:', err);
      setIsApiOnline(false);

      // Fallback local state if API is temporarily booting
      let localProps = [...INITIAL_PROPERTIES];
      if (currentFilters.bairro && currentFilters.bairro !== 'TODOS') {
        localProps = localProps.filter((p) => p.bairro === currentFilters.bairro);
      }
      if (currentFilters.status && currentFilters.status !== 'TODOS') {
        localProps = localProps.filter((p) => p.status === currentFilters.status);
      }
      if (currentFilters.hasWhatsappOnly) {
        localProps = localProps.filter((p) => Boolean(p.phoneClean));
      }
      if (currentFilters.search) {
        const t = currentFilters.search.toLowerCase();
        localProps = localProps.filter((p) => p.title.toLowerCase().includes(t) || p.bairro.toLowerCase().includes(t));
      }
      setProperties(localProps);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [buildQueryString]);

  // Initial load & Polling (30s)
  useEffect(() => {
    fetchData(filters);
    const interval = setInterval(() => {
      fetchData(filters);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData, filters]);

  // Handle filter changes (resets pagination to page 1)
  const handleFilterChange = (newFilters: Partial<PropertyFilterQuery>) => {
    setCurrentPage(1);
    setInfiniteLimit(12);
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      fetchData(updated);
      return updated;
    });
  };

  const handleResetFilters = () => {
    setCurrentPage(1);
    setInfiniteLimit(12);
    const defaultFilters: PropertyFilterQuery = {
      bairro: 'TODOS',
      search: '',
      status: 'TODOS',
      minBedrooms: undefined,
      hasWhatsappOnly: false,
      sortBy: 'recent'
    };
    setFilters(defaultFilters);
    fetchData(defaultFilters);
  };

  // High-performance Paginated / Infinite Sliced Properties
  const totalFiltered = properties.length;
  const effectivePageSize = pageSize === 0 ? totalFiltered : (pageSize || 12);
  const totalPages = Math.max(1, Math.ceil(totalFiltered / effectivePageSize));

  const displayedProperties = useMemo(() => {
    if (displayMode === 'infinite') {
      return properties.slice(0, infiniteLimit);
    }
    if (pageSize === 0) {
      return properties; // 'Todos'
    }
    const start = (currentPage - 1) * effectivePageSize;
    return properties.slice(start, start + effectivePageSize);
  }, [properties, currentPage, effectivePageSize, pageSize, displayMode, infiniteLimit]);

  const startIndex = displayMode === 'infinite' ? 1 : (currentPage - 1) * effectivePageSize + 1;
  const endIndex = displayMode === 'infinite' ? Math.min(infiniteLimit, totalFiltered) : Math.min(currentPage * effectivePageSize, totalFiltered);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  const handleLoadMore = () => {
    setInfiniteLimit((prev) => Math.min(prev + 12, totalFiltered));
  };

  // Update lead status
  const handleUpdateStatus = async (id: string, newStatus: LeadStatus) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    if (selectedPropertyModal && selectedPropertyModal.id === id) {
      setSelectedPropertyModal((prev) => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      const res = await fetch(`/api/imoveis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Status atualizado para "${newStatus}"!`, 'success');
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch {
      showToast('Status atualizado localmente.', 'info');
    }
  };

  // Add note to property
  const handleAddNote = async (id: string, noteText: string) => {
    try {
      const res = await fetch(`/api/imoveis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.property) {
          setProperties((prev) =>
            prev.map((p) => (p.id === id ? data.property : p))
          );
          if (selectedPropertyModal && selectedPropertyModal.id === id) {
            setSelectedPropertyModal(data.property);
          }
        }
        showToast('Anotação registrada com sucesso no CRM!', 'success');
      }
    } catch {
      showToast('Erro ao salvar anotação.', 'error');
    }
  };

  // Update phone
  const handleUpdatePhone = async (id: string, newPhone: string) => {
    try {
      const res = await fetch(`/api/imoveis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneRaw: newPhone })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.property) {
          setProperties((prev) =>
            prev.map((p) => (p.id === id ? data.property : p))
          );
          if (selectedPropertyModal && selectedPropertyModal.id === id) {
            setSelectedPropertyModal(data.property);
          }
        }
        showToast('Telefone atualizado com sucesso!', 'success');
      }
    } catch {
      showToast('Erro ao atualizar telefone.', 'error');
    }
  };

  // Delete property
  const handleDeleteProperty = async (id: string) => {
    try {
      const res = await fetch(`/api/imoveis/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        showToast('Imóvel removido do CRM.', 'info');
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Simulate Zap Imóveis capture
  const handleSimulate = async (bairro: string, count: number = 2): Promise<boolean> => {
    try {
      const res = await fetch('/api/simulate-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bairro, count })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchData(filters);
        showToast(data.message || `${count} imóveis em ${bairro} processados sem duplicatas!`, 'success');
        return true;
      }
      return false;
    } catch {
      showToast('Erro ao simular captura.', 'error');
      return false;
    }
  };

  // Add manual property
  const handleAddProperty = async (propData: Partial<Property>): Promise<boolean> => {
    try {
      const res = await fetch('/api/imoveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propData)
      });
      if (res.ok) {
        await fetchData(filters);
        showToast('Novo imóvel cadastrado com sucesso!', 'success');
        return true;
      }
      return false;
    } catch {
      showToast('Erro ao cadastrar imóvel.', 'error');
      return false;
    }
  };

  // Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(filters);
  };

  // Average price per m² in the currently filtered neighborhood
  const activeBairroStats = stats?.topBairros.find((b) => b.bairro === filters.bairro);
  const avgM2ForCards = activeBairroStats ? activeBairroStats.avgM2 : stats?.precoM2Medio;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Global Header */}
      <Header
        isApiOnline={isApiOnline}
        totalProperties={properties.length}
        onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Toast feedback */}
        {toastMessage && (
          <div 
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md border animate-in slide-in-from-bottom-5 duration-200 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                : 'bg-blue-950/90 text-blue-300 border-blue-500/50'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top KPIs & Funnel Status */}
        <StatsBar
          stats={stats}
          activeStatusFilter={filters.status || 'TODOS'}
          onSelectStatusFilter={(status) => handleFilterChange({ status })}
        />

        {/* Filter & Search Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          bairrosList={bairrosList}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFiltered={properties.length}
        />

        {/* Properties View */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Carregando carteira de imóveis...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-16 bg-[#111827]/40 border border-slate-800/80 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Nenhum imóvel encontrado com esses filtros</h3>
              <p className="text-xs text-slate-400 max-w-md">
                Tente limpar os filtros de busca ou utilize o simulador de captura para coletar novos anúncios do Zap Imóveis.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Limpar Todos os Filtros
              </button>
              <button
                onClick={() => setIsSimulateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simular Captura em Moema</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Properties Grid or Table */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onOpenModal={setSelectedPropertyModal}
                    onUpdateStatus={handleUpdateStatus}
                    avgM2InNeighborhood={avgM2ForCards}
                  />
                ))}
              </div>
            ) : (
              <PropertyTable
                properties={displayedProperties}
                onOpenModal={setSelectedPropertyModal}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {/* Pagination & Infinite Load Bar */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              {/* Counter details & display mode */}
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="font-mono">
                  Mostrando <strong className="text-white">{startIndex} - {endIndex}</strong> de <strong className="text-sky-400">{totalFiltered}</strong> imóveis
                </span>

                <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setDisplayMode('pages')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      displayMode === 'pages' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Páginas
                  </button>
                  <button
                    onClick={() => setDisplayMode('infinite')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      displayMode === 'infinite' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Carregar Mais
                  </button>
                </div>
              </div>

              {/* Mode 1: Numbered Pages */}
              {displayMode === 'pages' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                      .map((pageNum, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <React.Fragment key={pageNum}>
                            {prev && pageNum - prev > 1 && (
                              <span className="px-1 text-slate-500 font-mono text-xs">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/40'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                              }`}
                            >
                              {pageNum}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Próxima página"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Page size dropdown */}
                  <div className="ml-2 flex items-center gap-1 text-xs text-slate-400">
                    <span className="hidden lg:inline text-[11px]">Por pág:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs cursor-pointer focus:outline-none"
                    >
                      <option value="12">12</option>
                      <option value="24">24</option>
                      <option value="36">36 (1 Pág. Zap)</option>
                      <option value="48">48</option>
                      <option value="0">Todos ({totalFiltered})</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* Mode 2: Infinite Load More */
                <div className="flex items-center gap-3">
                  {infiniteLimit < totalFiltered ? (
                    <button
                      onClick={handleLoadMore}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>Carregar Mais (+12 Imóveis)</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Todos os {totalFiltered} imóveis foram carregados</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedPropertyModal && (
        <PropertyModal
          property={selectedPropertyModal}
          onClose={() => setSelectedPropertyModal(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddNote={handleAddNote}
          onUpdatePhone={handleUpdatePhone}
          onDeleteProperty={handleDeleteProperty}
        />
      )}

      {isExtensionModalOpen && (
        <ExtensionModal
          onClose={() => setIsExtensionModalOpen(false)}
          isApiOnline={isApiOnline}
        />
      )}

      {isSimulateModalOpen && (
        <SimulateModal
          onClose={() => setIsSimulateModalOpen(false)}
          onSimulate={handleSimulate}
        />
      )}

      {isAddModalOpen && (
        <ManualAddModal
          onClose={() => setIsAddModalOpen(false)}
          onAddProperty={handleAddProperty}
        />
      )}
    </div>
  );
}
