import React from 'react';
import { 
  Property, 
  LeadStatus 
} from '../types/property';
import { 
  MessageSquare, 
  ExternalLink, 
  Phone, 
  MapPin, 
  Maximize, 
  Bed, 
  Car,
  Eye
} from 'lucide-react';
import { buildWhatsAppLink } from '../utils/phoneExtractor';

interface PropertyTableProps {
  properties: Property[];
  onOpenModal: (property: Property) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
}

export const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
  onOpenModal,
  onUpdateStatus
}) => {
  const formatBRL = (val?: number) =>
    val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val) : '-';

  const statusStyles: Record<LeadStatus, { label: string; badgeClass: string }> = {
    NOVO: { label: 'Novo Lead', badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
    CONTATADO: { label: 'Contatado', badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    INTERESSADO: { label: 'Interessado', badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    VISITA_AGENDADA: { label: 'Visita Agendada', badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
    PROPOSTA_ENVIADA: { label: 'Proposta Enviada', badgeClass: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
    FECHADO: { label: 'Venda Fechada', badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    DESCARTADO: { label: 'Descartado', badgeClass: 'bg-slate-700 text-slate-400 border-slate-600' }
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Imóvel & Foto</th>
              <th className="py-3 px-4">Localização</th>
              <th className="py-3 px-4">Valor & R$/m²</th>
              <th className="py-3 px-4">Área / Qts / Vagas</th>
              <th className="py-3 px-4">Anunciante & Contato</th>
              <th className="py-3 px-4">Estágio Lead</th>
              <th className="py-3 px-4 text-right">Ação WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {properties.map((p) => {
              const cover = p.coverImage || p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
              const whatsappUrl = p.phoneClean
                ? buildWhatsAppLink(p.phoneClean, 'parceria_comprador', {
                    advertiserName: p.advertiserName,
                    bairro: p.bairro,
                    code: p.code,
                    price: p.price,
                    areaM2: p.areaM2,
                    bedrooms: p.bedrooms,
                    url: p.url
                  })
                : null;

              return (
                <tr 
                  key={p.id}
                  className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                  onClick={() => onOpenModal(p)}
                >
                  {/* Foto & Título */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={cover}
                        alt=""
                        className="w-14 h-11 rounded-lg object-cover bg-slate-950 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {p.title}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">Cód: {p.code}</span>
                      </div>
                    </div>
                  </td>

                  {/* Localização */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span>{p.bairro}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{p.cidade} - {p.estado}</span>
                  </td>

                  {/* Valor & R$/m² */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="font-bold text-white text-sm">{formatBRL(p.price)}</p>
                    {p.pricePerM2 > 0 && (
                      <span className="text-[10px] font-mono text-sky-400">
                        {formatBRL(p.pricePerM2)}/m²
                      </span>
                    )}
                  </td>

                  {/* Área / Qts / Vagas */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span title="Área útil">{p.areaM2 || '-'}m²</span>
                      <span>•</span>
                      <span title="Quartos">{p.bedrooms} qts</span>
                      <span>•</span>
                      <span title="Vagas">{p.parkingSpots} vag</span>
                    </div>
                  </td>

                  {/* Anunciante & Telefone */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="font-medium text-slate-200 truncate max-w-[150px]">{p.advertiserName}</p>
                    {p.phoneFormatted ? (
                      <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {p.phoneFormatted}
                      </p>
                    ) : (
                      <span className="text-[10px] text-slate-400">Sem telefone</span>
                    )}
                  </td>

                  {/* Status do Lead */}
                  <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={p.status}
                      onChange={(e) => onUpdateStatus(p.id, e.target.value as LeadStatus)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border appearance-none cursor-pointer focus:outline-none ${statusStyles[p.status]?.badgeClass}`}
                    >
                      <option value="NOVO" className="bg-slate-900 text-sky-400">Novo Lead</option>
                      <option value="CONTATADO" className="bg-slate-900 text-amber-400">Contatado</option>
                      <option value="INTERESSADO" className="bg-slate-900 text-purple-400">Interessado</option>
                      <option value="VISITA_AGENDADA" className="bg-slate-900 text-indigo-400">Visita Agendada</option>
                      <option value="PROPOSTA_ENVIADA" className="bg-slate-900 text-pink-400">Proposta Enviada</option>
                      <option value="FECHADO" className="bg-slate-900 text-emerald-400">Venda Fechada</option>
                      <option value="DESCARTADO" className="bg-slate-900 text-slate-400">Descartado</option>
                    </select>
                  </td>

                  {/* Ação WhatsApp */}
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-sm transition-all"
                          title="Enviar WhatsApp de captação"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-white" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => onOpenModal(p)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs"
                        >
                          + Contato
                        </button>
                      )}

                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        title="Ver no Zap Imóveis"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
