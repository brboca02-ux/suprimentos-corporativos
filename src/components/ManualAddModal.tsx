import React, { useState } from 'react';
import { X, Plus, Building, Phone, MapPin, DollarSign, Image } from 'lucide-react';
import { Property } from '../types/property';

interface ManualAddModalProps {
  onClose: () => void;
  onAddProperty: (property: Partial<Property>) => Promise<boolean>;
}

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  onClose,
  onAddProperty
}) => {
  const [title, setTitle] = useState('');
  const [bairro, setBairro] = useState('Moema');
  const [cidade, setCidade] = useState('São Paulo');
  const [price, setPrice] = useState('1200000');
  const [areaM2, setAreaM2] = useState('90');
  const [bedrooms, setBedrooms] = useState('3');
  const [parkingSpots, setParkingSpots] = useState('2');
  const [advertiserName, setAdvertiserName] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bairro.trim()) {
      alert('Preencha ao menos o título e o bairro do imóvel.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onAddProperty({
        title: title.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        price: Number(price) || 0,
        areaM2: Number(areaM2) || 0,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: 2,
        parkingSpots: Number(parkingSpots) || 0,
        advertiserName: advertiserName.trim() || 'Proprietário Direto',
        advertiserType: 'proprietario',
        phoneRaw: phoneRaw.trim(),
        url: url.trim() || 'https://www.zapimoveis.com.br',
        description: description.trim(),
        images: imageUrl ? [imageUrl.trim()] : [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        ],
        source: 'manual'
      });

      if (ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-2xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cadastrar Novo Imóvel Manualmente</h3>
              <p className="text-xs text-slate-400">Insira um imóvel do Zap ou captação própria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Título do Anúncio *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Apartamento 3 quartos com varanda em Moema"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Bairro *</label>
              <input
                type="text"
                required
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Ex: Moema, Pinheiros, Itaim Bibi"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="São Paulo"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Preço (R$)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Área (m²)</label>
              <input
                type="number"
                value={areaM2}
                onChange={(e) => setAreaM2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Quartos</label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Vagas</label>
              <input
                type="number"
                value={parkingSpots}
                onChange={(e) => setParkingSpots(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Nome do Anunciante / Proprietário</label>
              <input
                type="text"
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="Ex: Carlos Eduardo (Proprietário)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phoneRaw}
                onChange={(e) => setPhoneRaw(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Link do Anúncio Zap</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.zapimoveis.com.br/imovel/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">URL da Imagem de Capa</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cole a descrição do anúncio aqui..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Cadastrar Imóvel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
