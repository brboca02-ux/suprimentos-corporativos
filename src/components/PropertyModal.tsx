import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Maximize, 
  Bed, 
  Bath, 
  Car, 
  Phone, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Plus, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react';
import { Property, LeadStatus, PropertyNote } from '../types/property';
import { 
  buildWhatsAppLink, 
  WHATSAPP_TEMPLATES, 
  WhatsAppTemplateId, 
  cleanPhone, 
  formatPhone 
} from '../utils/phoneExtractor';

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onAddNote: (id: string, noteText: string) => void;
  onUpdatePhone: (id: string, newPhone: string) => void;
  onDeleteProperty: (id: string) => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  onClose,
  onUpdateStatus,
  onAddNote,
  onUpdatePhone,
  onDeleteProperty
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateId>('parceria_comprador');
  const [newNoteText, setNewNoteText] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(property.phoneRaw || property.phoneFormatted || '');
  const [copiedMessage, setCopiedMessage] = useState(false);

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  const formatBRL = (val?: number) =>
    val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val) : '-';

  const template = WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplate) || WHATSAPP_TEMPLATES[0];
  const generatedMessage = template.generateText({
    advertiserName: property.advertiserName,
    bairro: property.bairro,
    code: property.code,
    price: property.price,
    areaM2: property.areaM2,
    bedrooms: property.bedrooms,
    url: property.url
  });

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

  const handleSavePhone = () => {
    onUpdatePhone(property.id, phoneInput);
    setIsEditingPhone(false);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(property.id, newNoteText.trim());
    setNewNoteText('');
  };

  const copyMessageText = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg">
              {property.bairro}
            </span>
            <span className="font-mono text-xs text-slate-400">ID: {property.code}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">• Fonte: {property.source}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={property.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Ver Anúncio no Zap</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Section 1: Gallery & Financials */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={images[selectedPhotoIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedPhotoIndex((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-mono">
                      Foto {selectedPhotoIndex + 1} de {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        selectedPhotoIndex === idx ? 'border-blue-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Financials & Basic Specs Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white leading-snug">
                  {property.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{property.logradouro ? `${property.logradouro}, ` : ''}{property.bairro}, {property.cidade} - {property.estado}</span>
                </div>
              </div>

              {/* Price Breakdown Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Valor de Venda</span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-2xl font-extrabold text-white">
                      {formatBRL(property.price)}
                    </span>
                    {property.pricePerM2 > 0 && (
                      <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-1 rounded-md border border-sky-800">
                        {formatBRL(property.pricePerM2)}/m²
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">Condomínio Mensal:</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{formatBRL(property.condoFee)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">IPTU Anual / Parcela:</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{formatBRL(property.iptu)}</p>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-4 gap-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center text-xs">
                <div>
                  <div className="text-slate-400 flex items-center justify-center gap-1 mb-1">
                    <Maximize className="w-3.5 h-3.5 text-blue-400" />
                    <span>Área</span>
                  </div>
                  <p className="font-bold text-white text-sm">{property.areaM2} m²</p>
                </div>
                <div>
                  <div className="text-slate-400 flex items-center justify-center gap-1 mb-1">
                    <Bed className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Quartos</span>
                  </div>
                  <p className="font-bold text-white text-sm">{property.bedrooms} ({property.suites || 0} suítes)</p>
                </div>
                <div>
                  <div className="text-slate-400 flex items-center justify-center gap-1 mb-1">
                    <Bath className="w-3.5 h-3.5 text-sky-400" />
                    <span>Banhs</span>
                  </div>
                  <p className="font-bold text-white text-sm">{property.bathrooms}</p>
                </div>
                <div>
                  <div className="text-slate-400 flex items-center justify-center gap-1 mb-1">
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vagas</span>
                  </div>
                  <p className="font-bold text-white text-sm">{property.parkingSpots}</p>
                </div>
              </div>

              {/* Advertiser Info */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Anunciante</span>
                  <p className="font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                    {property.advertiserType === 'proprietario' ? (
                      <UserCheck className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                    )}
                    <span>{property.advertiserName}</span>
                  </p>
                  {property.creci && <span className="text-slate-400 font-mono text-[11px]">CRECI: {property.creci}</span>}
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Telefone Cadastrado</span>
                  {isEditingPhone ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-xs text-white w-32"
                      />
                      <button onClick={handleSavePhone} className="bg-blue-600 px-2 py-1 rounded text-[11px] font-bold">Salvar</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                      <span className="font-mono font-bold text-emerald-400">
                        {property.phoneFormatted || property.phoneRaw || 'Não informado'}
                      </span>
                      <button
                        onClick={() => setIsEditingPhone(true)}
                        className="text-blue-400 hover:underline text-[10px]"
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Commercial Outreach & WhatsApp Machine */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Máquina de Prospecção & WhatsApp</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mensagens estratégicas prontas para captar o imóvel para venda ou propor parceria comercial.
                </p>
              </div>

              {/* Template selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 whitespace-nowrap">Modelo:</span>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as WhatsAppTemplateId)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {WHATSAPP_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generated Message Preview Box */}
            <div className="relative bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {generatedMessage}

              <button
                onClick={copyMessageText}
                className="absolute top-3 right-3 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer"
                title="Copiar texto da mensagem"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMessage ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>

            {/* Direct WhatsApp Call */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Mudar Estágio do Lead:</span>
                <select
                  value={property.status}
                  onChange={(e) => onUpdateStatus(property.id, e.target.value as LeadStatus)}
                  className="bg-slate-900 border border-slate-700 font-semibold text-xs rounded-lg px-2.5 py-1 text-white focus:outline-none"
                >
                  <option value="NOVO">Novo Lead</option>
                  <option value="CONTATADO">Contatado</option>
                  <option value="INTERESSADO">Interessado</option>
                  <option value="VISITA_AGENDADA">Visita Agendada</option>
                  <option value="PROPOSTA_ENVIADA">Proposta Enviada</option>
                  <option value="FECHADO">Venda Fechada</option>
                  <option value="DESCARTADO">Descartado</option>
                </select>
              </div>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-700/30 transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Abrir Conversa no WhatsApp com Mensagem</span>
                </a>
              ) : (
                <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-lg">
                  ⚠️ Cadastre um telefone acima para habilitar o envio direto pelo WhatsApp.
                </span>
              )}
            </div>
          </div>

          {/* Section 3: Description & CRM Notes Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Descrição Completa do Anúncio
              </h4>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-line">
                {property.description || 'Nenhuma descrição fornecida pelo anunciante.'}
              </div>
            </div>

            {/* Notes & Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Histórico de Contato & Anotações CRM</span>
              </h4>

              {/* Add Note Form */}
              <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Ex: Liguei e proprietário aceita marcar visita terça às 15h..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </form>

              {/* Notes List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {property.notes && property.notes.length > 0 ? (
                  property.notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1"
                    >
                      <p className="text-slate-200">{note.text}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{note.author || 'Usuário'}</span>
                        <span>{new Date(note.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-900/40 rounded-xl">
                    Nenhuma anotação registrada ainda. Registre aqui suas ligações, propostas e detalhes da negociação.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/70 text-xs">
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir este imóvel do CRM?')) {
                onDeleteProperty(property.id);
                onClose();
              }
            }}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir Imóvel</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-xl font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
