export type LeadStatus =
  | 'NOVO'
  | 'CONTATADO'
  | 'INTERESSADO'
  | 'VISITA_AGENDADA'
  | 'PROPOSTA_ENVIADA'
  | 'FECHADO'
  | 'DESCARTADO';

export type AdvertiserType = 'proprietario' | 'imobiliaria' | 'corretor' | 'desconhecido';

export interface PropertyNote {
  id: string;
  text: string;
  createdAt: string;
  author?: string;
}

export interface Property {
  id: string;
  code: string;
  url: string;
  source: 'zapimoveis' | 'vivareal' | 'manual' | 'simulador' | 'extensao';
  title: string;
  description: string;
  price: number;
  condoFee?: number;
  iptu?: number;
  areaM2: number;
  pricePerM2: number;
  bedrooms: number;
  suites?: number;
  bathrooms: number;
  parkingSpots: number;

  bairro: string;
  cidade: string;
  estado: string;
  logradouro?: string;
  cep?: string;

  images: string[];
  coverImage?: string;

  advertiserName: string;
  advertiserType: AdvertiserType;
  creci?: string;
  phoneRaw?: string;
  phoneClean?: string;
  phoneFormatted?: string;
  whatsappUrl?: string;
  email?: string;

  status: LeadStatus;
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
  notes: PropertyNote[];
  capturedAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface PropertyStats {
  total: number;
  comWhatsapp: number;
  comTelefone: number;
  precoMedio: number;
  precoM2Medio: number;
  bairrosCount: number;
  porStatus: Record<LeadStatus, number>;
  topBairros: { bairro: string; count: number; avgPrice: number; avgM2: number }[];
}

export interface PropertyFilterQuery {
  bairro?: string;
  search?: string;
  status?: LeadStatus | 'TODOS';
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  hasWhatsappOnly?: boolean;
  sortBy?: 'recent' | 'price_asc' | 'price_desc' | 'm2_asc' | 'm2_desc' | 'opportunity';
}
