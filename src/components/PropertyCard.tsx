import React, { useState } from 'react';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  ExternalLink, 
  MessageSquare, 
  Phone, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  ShieldCheck, 
  Sparkles, 
  StickyNote, 
  Share2
} from 'lucide-react';
import { Property, LeadStatus } from '../types/property';
import { buildWhatsAppLink, WHATSAPP_TEMPLATES, WhatsAppTemplateId } from '../utils/phoneExtractor';

interface PropertyCardProps {
  property: Property;
  onOpenModal: (property: Property) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  avgM2InNeighborhood?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onOpenModal,
  onUpdateStatus,
  avgM2InNeighborhood
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateId>('parceria_comprador');
  const [copiedPhone, setCopiedPhone] = useState(false);

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatBRL = (val?: number) =>
    val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val) : '-';

  const copyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.phoneFormatted || property.phoneRaw) {
      navigator.clipboard.writeText(property.phoneFormatted || property.phoneRaw || '');
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // WhatsApp Link
  const whatsappUrl = property.phoneClean
    ? buildWhatsAppLink(property.phoneClean, selectedTemplate, {
        advertiserName: property.advertiserName,
        bairro: property.bairro,
        code: property.code,
        price: property.price,
        areaM2: property.areaM2,
        bedrooms: property.bedrooms,
        url: property.url
      })
    : null;

  // Status Colors
  const statusStyles: Record<LeadStatus, { label: string; badgeClass: string }> = {
    NOVO: { label: 'Novo Lead', badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
    CONTATADO: { label: 'Contatado', badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    INTERESSADO: { label: 'Interessado', badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    VISITA_AGENDADA: { label: 'Visita Agendada', badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
    PROPOSTA_ENVIADA: { label: 'Proposta Enviada', badgeClass: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
    FECHADO: { label: 'Venda Fechada', badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    DESCARTADO: { label: 'Descartado', badgeClass: 'bg-slate-700 text-slate-400 border-slate-600' }
  };

  // Price per m² compared to neighborhood average
  const isOpportunity =
    avgM2InNeighborhood && property.pricePerM2 && property.pricePerM2 < avgM2InNeighborhood * 0.92;

  return (
    <div 
      onClick={() => onOpenModal(property)}
      className="group bg-[#111827] border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Top Image Carousel Container */}
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
        <img
          src={images[currentImageIndex]}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Carousel controls if > 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Foto anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Próxima foto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] text-white font-mono">
              {currentImageIndex + 1}/{images.length}
            </div>
          </>
        )}

        {/* Top Badges over image */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
          {/* Bairro Badge */}
          <span className="px-2.5 py-1 rounded-lg bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
            {property.bairro}
          </span>

          {/* Opportunity Badge if below m² average */}
          {isOpportunity && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/95 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              OPORTUNIDADE (-8% m²)
            </span>
          )}
        </div>

        {/* Lead Status Select on top right */}
        <div className="absolute top-2.5 right-2.5" onClick={(e) => e.stopPropagation()}>
          <select
            value={property.status}
            onChange={(e) => onUpdateStatus(property.id, e.target.value as LeadStatus)}
            className={`text-[11px] font-bold px-2 py-1 rounded-lg border backdrop-blur-md appearance-none cursor-pointer focus:outline-none transition-all ${statusStyles[property.status]?.badgeClass}`}
          >
            <option value="NOVO" className="bg-slate-900 text-sky-400">Novo Lead</option>
            <option value="CONTATADO" className="bg-slate-900 text-amber-400">Contatado</option>
            <option value="INTERESSADO" className="bg-slate-900 text-purple-400">Interessado</option>
            <option value="VISITA_AGENDADA" className="bg-slate-900 text-indigo-400">Visita Agendada</option>
            <option value="PROPOSTA_ENVIADA" className="bg-slate-900 text-pink-400">Proposta Enviada</option>
            <option value="FECHADO" className="bg-slate-900 text-emerald-400">Venda Fechada</option>
            <option value="DESCARTADO" className="bg-slate-900 text-slate-400">Descartado</option>
          </select>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        {/* Price & m² */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-extrabold text-white tracking-tight">
              {formatBRL(property.price)}
            </span>
            {property.pricePerM2 > 0 && (
              <span className="text-xs font-mono font-semibold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/50">
                {formatBRL(property.pricePerM2)}/m²
              </span>
            )}
          </div>

          {/* Condominium & IPTU */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
            {property.condoFee ? (
              <span>Cond: <strong className="text-slate-300">R$ {property.condoFee}</strong></span>
            ) : null}
            {property.iptu ? (
              <span>IPTU: <strong className="text-slate-300">R$ {property.iptu}</strong></span>
            ) : null}
            <span className="ml-auto font-mono text-[10px] text-slate-400">Cód: {property.code}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-200 mt-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {property.title}
          </h3>
        </div>

        {/* Specs Icons (m², Bed, Bath, Parking) */}
        <div className="grid grid-cols-4 gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-slate-300 text-xs">
          <div className="flex items-center gap-1.5" title="Área Útil">
            <Maximize className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold">{property.areaM2 || '-'}m²</span>
          </div>
          <div className="flex items-center gap-1.5" title="Dormitórios">
            <Bed className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">{property.bedrooms} qts</span>
          </div>
          <div className="flex items-center gap-1.5" title="Banheiros">
            <Bath className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold">{property.bathrooms} banh</span>
          </div>
          <div className="flex items-center gap-1.5" title="Vagas de Garagem">
            <Car className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{property.parkingSpots} vag</span>
          </div>
        </div>

        {/* Advertiser & Contact info */}
        <div className="pt-1 border-t border-slate-800/70 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate text-slate-300">
              {property.advertiserType === 'proprietario' ? (
                <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
              <span className="truncate font-medium text-[11px]">{property.advertiserName}</span>
            </div>
            {property.creci && (
              <span className="text-[10px] text-slate-400 font-mono shrink-0">CRECI {property.creci}</span>
            )}
          </div>

          {/* Phone row with copy */}
          {(property.phoneFormatted || property.phoneRaw) && (
            <div className="flex items-center justify-between bg-slate-900/60 rounded-lg px-2.5 py-1 text-xs">
              <span className="flex items-center gap-1.5 font-mono text-emerald-400 font-medium">
                <Phone className="w-3 h-3" />
                {property.phoneFormatted || property.phoneRaw}
              </span>
              <button
                onClick={copyPhone}
                className="text-slate-400 hover:text-white transition-colors p-1"
                title="Copiar telefone"
              >
                {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* WhatsApp Prospecting Action Footer */}
        <div className="pt-2 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
          {property.phoneClean ? (
            <div className="flex gap-1.5">
              {/* WhatsApp Direct Prospecting Button */}
              <a
                href={whatsappUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all"
                title="Chamar no WhatsApp com mensagem de oferta pré-preenchida"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Chamar no WhatsApp</span>
              </a>

              {/* Template selector trigger */}
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as WhatsAppTemplateId)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] rounded-xl px-2 py-1 focus:outline-none cursor-pointer max-w-[120px]"
                title="Escolha o modelo de abordagem comercial"
              >
                <option value="parceria_comprador">Tenho Comprador</option>
                <option value="captacao_exclusiva">Captação Exclusiva</option>
                <option value="agendamento_visita">Agendar Visita</option>
                <option value="oferta_permuta">Verificar Permuta</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-400 text-xs">
              <span className="text-[11px]">Telefone não identificado</span>
              <button
                onClick={() => onOpenModal(property)}
                className="text-blue-400 hover:underline text-[11px] font-semibold"
              >
                Adicionar
              </button>
            </div>
          )}

          {/* Secondary Action: Original Zap link + Notes count */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
            <span className="flex items-center gap-1">
              <StickyNote className="w-3 h-3 text-slate-400" />
              <span>{property.notes?.length || 0} anotações</span>
            </span>

            <a
              href={property.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
              title="Abrir anúncio original no Zap Imóveis"
            >
              <span>Ver no Zap</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
