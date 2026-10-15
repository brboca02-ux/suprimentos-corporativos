/**
 * Utility functions for extracting, formatting and creating WhatsApp links
 * for Brazilian real estate listings.
 */

// Regex for Brazilian phone numbers (e.g. +55 11 98765-4321, (11) 98765-4321, 11987654321, 11 987654321)
const BR_PHONE_REGEX = /(?:\+?55\s?)?(?:\(?0?([1-9]{2})\)?\s?)(?:(9\s?\d{4})[-\s]?(\d{4})|(\d{4})[-\s]?(\d{4}))/g;

export function extractPhoneNumbers(text: string): string[] {
  if (!text) return [];
  const matches: string[] = [];
  const regex = new RegExp(BR_PHONE_REGEX);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0].trim();
    // Only include if it has at least 10 digits
    const digits = raw.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) {
      matches.push(raw);
    }
  }

  return Array.from(new Set(matches));
}

export function cleanPhone(rawPhone?: string): string {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');

  // If starts with 0 (e.g. 011987654321), strip leading zero
  if (digits.startsWith('0') && (digits.length === 11 || digits.length === 12)) {
    digits = digits.substring(1);
  }

  // If missing country code 55 (e.g. 11987654321 -> 11 digits, or 1187654321 -> 10 digits)
  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits;
  }

  return digits;
}

export function formatPhone(rawOrClean?: string): string {
  if (!rawOrClean) return '';
  const digits = rawOrClean.replace(/\D/g, '');

  let ddd = '';
  let part1 = '';
  let part2 = '';

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    ddd = digits.substring(2, 4);
    if (digits.length === 13) {
      part1 = digits.substring(4, 9);
      part2 = digits.substring(9);
    } else {
      part1 = digits.substring(4, 8);
      part2 = digits.substring(8);
    }
  } else if (digits.length === 11) {
    ddd = digits.substring(0, 2);
    part1 = digits.substring(2, 7);
    part2 = digits.substring(7);
  } else if (digits.length === 10) {
    ddd = digits.substring(0, 2);
    part1 = digits.substring(2, 6);
    part2 = digits.substring(6);
  } else {
    return rawOrClean;
  }

  return `(${ddd}) ${part1}-${part2}`;
}

export type WhatsAppTemplateId = 'parceria_comprador' | 'captacao_exclusiva' | 'agendamento_visita' | 'oferta_permuta';

export interface WhatsAppTemplate {
  id: WhatsAppTemplateId;
  label: string;
  generateText: (params: {
    advertiserName: string;
    bairro: string;
    code?: string;
    price: number;
    areaM2?: number;
    bedrooms?: number;
    url?: string;
  }) => string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'parceria_comprador',
    label: 'Tenho Comprador na Região (Maior Conversão)',
    generateText: ({ advertiserName, bairro, code, price, url }) => {
      const nome = advertiserName && !advertiserName.toLowerCase().includes('desconhecido') 
        ? advertiserName.split(' ')[0] 
        : '';
      const saudacao = nome ? `Olá ${nome}, tudo bem?` : 'Olá, tudo bem?';
      const valorStr = price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price) : '';
      const refStr = code ? `(Ref: ${code})` : '';

      return `${saudacao} Vi seu anúncio de venda do imóvel no bairro ${bairro || 'da sua região'} ${refStr}${valorStr ? ` anunciado por ${valorStr}` : ''}.\n\nTrabalho com prospecção e tenho clientes com perfil comprador qualificado buscando oportunidades exatamente com essas características na região.\n\nPodemos conversar sobre uma parceria de venda para apresentar aos compradores?`;
    }
  },
  {
    id: 'captacao_exclusiva',
    label: 'Captação & Representação Comercial',
    generateText: ({ advertiserName, bairro, code }) => {
      const nome = advertiserName ? advertiserName.split(' ')[0] : '';
      const saudacao = nome ? `Olá ${nome}!` : 'Olá!';
      return `${saudacao} Sou especialista em captação e intermediação de imóveis no ${bairro}.\n\nVi o seu anúncio ${code ? `(código ${code})` : ''} e gostaria de saber se o imóvel ainda está 100% disponível para venda. Estamos com forte demanda de famílias buscando imóveis no bairro neste mês. Podemos alinhar uma conversa rápida?`;
    }
  },
  {
    id: 'agendamento_visita',
    label: 'Agendamento de Visita de Avaliação',
    generateText: ({ advertiserName, bairro, bedrooms, areaM2 }) => {
      const nome = advertiserName ? advertiserName.split(' ')[0] : '';
      const specs = [areaM2 ? `${areaM2}m²` : '', bedrooms ? `${bedrooms} quartos` : ''].filter(Boolean).join(', ');
      return `Olá ${nome || 'proprietário(a)'}, tudo bem?\n\nIdentifiquei seu imóvel em ${bairro}${specs ? ` (${specs})` : ''} e gostaria de agendar uma visita presencial para conhecer o imóvel e apresentar um estudo de mercado e proposta de aceleração de venda.\n\nQual o melhor dia e horário para você esta semana?`;
    }
  },
  {
    id: 'oferta_permuta',
    label: 'Pergunta sobre Negociação / Proposta',
    generateText: ({ advertiserName, bairro, price }) => {
      const valorStr = price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price) : '';
      return `Olá! Vi o anúncio do imóvel no bairro ${bairro} (${valorStr}).\n\nGostaria de saber se você estuda contrapropostas para pagamento à vista ou se aceita permuta por outro imóvel de menor valor na negociação. Aguardo seu retorno!`;
    }
  }
];

export function buildWhatsAppLink(
  phoneClean: string,
  templateId: WhatsAppTemplateId = 'parceria_comprador',
  params: {
    advertiserName: string;
    bairro: string;
    code?: string;
    price: number;
    areaM2?: number;
    bedrooms?: number;
    url?: string;
  }
): string {
  if (!phoneClean) return '';
  const digits = cleanPhone(phoneClean);
  if (!digits) return '';

  const template = WHATSAPP_TEMPLATES.find((t) => t.id === templateId) || WHATSAPP_TEMPLATES[0];
  const message = template.generateText(params);

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
