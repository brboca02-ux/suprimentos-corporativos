import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_PROPERTIES } from './src/data/seedProperties.ts';
import { Property, LeadStatus } from './src/types/property.ts';
import { cleanPhone, formatPhone, extractPhoneNumbers } from './src/utils/phoneExtractor.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable JSON parser with high limit for batch listings and images
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Full CORS support for Chrome Extensions and external scripts
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Storage File Path
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'properties.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory Cache backed by properties.json
let properties: Property[] = [];

function loadProperties() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      properties = JSON.parse(content);
      console.log(`[Storage] Carregados ${properties.length} imóveis salvos.`);
    } else {
      properties = [...INITIAL_PROPERTIES];
      saveProperties();
      console.log(`[Storage] Inicializado com ${properties.length} imóveis de exemplo.`);
    }
  } catch (err) {
    console.error('[Storage] Erro ao ler arquivo de imóveis:', err);
    properties = [...INITIAL_PROPERTIES];
  }
}

function saveProperties() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(properties, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Erro ao salvar arquivo de imóveis:', err);
  }
}

loadProperties();

// Normalize property data
function sanitizeProperty(raw: Partial<Property>): Property {
  const now = new Date().toISOString();
  const desc = raw.description || '';
  const detectedPhones = extractPhoneNumbers(desc);
  const rawPhone = raw.phoneRaw || detectedPhones[0] || '';
  const cleanPh = cleanPhone(rawPhone);
  const formattedPh = formatPhone(rawPhone);

  const price = Number(raw.price) || 0;
  const areaM2 = Number(raw.areaM2) || 0;
  const pricePerM2 = areaM2 > 0 && price > 0 ? Math.round(price / areaM2) : (raw.pricePerM2 || 0);

  const code = raw.code || (raw.url ? (raw.url.match(/id-(\d+)/)?.[1] || `ZAP-${Date.now().toString().slice(-6)}`) : `ZAP-${Date.now().toString().slice(-6)}`);
  const id = raw.id || `prop-${code}`;

  return {
    id,
    code: String(code),
    url: raw.url || 'https://www.zapimoveis.com.br',
    source: raw.source || 'zapimoveis',
    title: raw.title || `Imóvel à Venda em ${raw.bairro || 'São Paulo'}`,
    description: desc,
    price: price,
    condoFee: raw.condoFee ? Number(raw.condoFee) : undefined,
    iptu: raw.iptu ? Number(raw.iptu) : undefined,
    areaM2: areaM2,
    pricePerM2: pricePerM2,
    bedrooms: Number(raw.bedrooms) || 0,
    suites: raw.suites ? Number(raw.suites) : undefined,
    bathrooms: Number(raw.bathrooms) || 0,
    parkingSpots: Number(raw.parkingSpots) || 0,
    bairro: raw.bairro || 'Bairro Não Informado',
    cidade: raw.cidade || 'São Paulo',
    estado: raw.estado || 'SP',
    logradouro: raw.logradouro,
    cep: raw.cep,
    images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    coverImage: raw.coverImage || raw.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    advertiserName: raw.advertiserName || 'Proprietário / Imobiliária',
    advertiserType: raw.advertiserType || (raw.creci ? 'corretor' : 'proprietario'),
    creci: raw.creci,
    phoneRaw: rawPhone || undefined,
    phoneClean: cleanPh || undefined,
    phoneFormatted: formattedPh || undefined,
    whatsappUrl: cleanPh ? `https://wa.me/${cleanPh}` : undefined,
    status: (raw.status as LeadStatus) || 'NOVO',
    priority: raw.priority || 'ALTA',
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    capturedAt: raw.capturedAt || now,
    updatedAt: now,
    tags: Array.isArray(raw.tags) ? raw.tags : []
  };
}

// ----------------- API ROUTES ----------------- //

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ImobiHunter Pro',
    time: new Date().toISOString(),
    totalProperties: properties.length
  });
});

// List properties with filters
app.get('/api/imoveis', (req, res) => {
  let list = [...properties];
  const {
    bairro,
    search,
    status,
    minPrice,
    maxPrice,
    minBedrooms,
    hasWhatsappOnly,
    sortBy
  } = req.query;

  if (bairro && typeof bairro === 'string' && bairro !== 'TODOS') {
    list = list.filter((p) => p.bairro.toLowerCase() === bairro.toLowerCase());
  }

  if (status && typeof status === 'string' && status !== 'TODOS') {
    list = list.filter((p) => p.status === status);
  }

  if (hasWhatsappOnly === 'true') {
    list = list.filter((p) => Boolean(p.phoneClean));
  }

  if (minPrice) {
    const min = Number(minPrice);
    if (!isNaN(min)) list = list.filter((p) => p.price >= min);
  }

  if (maxPrice) {
    const max = Number(maxPrice);
    if (!isNaN(max)) list = list.filter((p) => p.price <= max);
  }

  if (minBedrooms) {
    const beds = Number(minBedrooms);
    if (!isNaN(beds)) list = list.filter((p) => p.bedrooms >= beds);
  }

  if (search && typeof search === 'string') {
    const term = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.bairro.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.advertiserName.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        (p.logradouro && p.logradouro.toLowerCase().includes(term))
    );
  }

  // Sort
  if (sortBy === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'm2_asc') {
    list.sort((a, b) => (a.pricePerM2 || 999999) - (b.pricePerM2 || 999999));
  } else if (sortBy === 'm2_desc') {
    list.sort((a, b) => (b.pricePerM2 || 0) - (a.pricePerM2 || 0));
  } else if (sortBy === 'opportunity') {
    // Has whatsapp first, then lowest price/m2
    list.sort((a, b) => {
      const aW = a.phoneClean ? 1 : 0;
      const bW = b.phoneClean ? 1 : 0;
      if (bW !== aW) return bW - aW;
      return (a.pricePerM2 || 999999) - (b.pricePerM2 || 999999);
    });
  } else {
    // recent
    list.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
  }

  res.json({
    total: list.length,
    properties: list
  });
});

// Single property
app.get('/api/imoveis/:id', (req, res) => {
  const item = properties.find((p) => p.id === req.params.id || p.code === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Imóvel não encontrado' });
    return;
  }
  res.json(item);
});

// URL and Code normalizers for exact deduplication
function normalizeUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  try {
    const u = new URL(rawUrl);
    return `${u.origin}${u.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch {
    return (rawUrl || '').split('?')[0].replace(/\/+$/, '').toLowerCase();
  }
}

function normalizeCode(rawCode?: string): string {
  if (!rawCode) return '';
  // Strip prefixes like zap-, prop-, id-, viva-
  return String(rawCode)
    .replace(/^zap-/i, '')
    .replace(/^prop-/i, '')
    .replace(/^id-/i, '')
    .replace(/^viva-/i, '')
    .trim()
    .toLowerCase();
}

// Ingest properties from Chrome Extension or manual add (upsert / deduplication)
app.post('/api/imoveis', (req, res) => {
  const body = req.body;
  const itemsToAdd: any[] = Array.isArray(body) ? body : [body];

  let insertedCount = 0;
  let updatedCount = 0;
  const processedCodes: string[] = [];

  for (const raw of itemsToAdd) {
    if (!raw) continue;
    const sanitized = sanitizeProperty(raw);

    const normCode = normalizeCode(sanitized.code);
    const normUrl = normalizeUrl(sanitized.url);

    // Strict multi-factor deduplication check
    const existingIndex = properties.findIndex((p) => {
      // 1. Direct ID match or normalized ID match
      if (sanitized.id && p.id === sanitized.id) return true;
      if (normalizeCode(p.id) && normCode && normalizeCode(p.id) === normCode) return true;

      // 2. Listing code match (e.g. Zap ID "28391829")
      const pCode = normalizeCode(p.code);
      if (normCode && pCode && normCode === pCode) return true;

      // 3. Canonical URL match (without tracking params)
      const pUrl = normalizeUrl(p.url);
      if (normUrl && pUrl && normUrl.length > 20 && normUrl === pUrl) return true;

      // 4. Strong Fingerprint match (same title + bairro + price + area)
      if (
        sanitized.title &&
        p.title === sanitized.title &&
        sanitized.bairro &&
        p.bairro.toLowerCase() === sanitized.bairro.toLowerCase() &&
        sanitized.price > 0 &&
        p.price === sanitized.price &&
        sanitized.areaM2 > 0 &&
        p.areaM2 === sanitized.areaM2
      ) {
        return true;
      }

      return false;
    });

    if (existingIndex >= 0) {
      // Property already exists in CRM -> Update details, preserve user workflow & notes
      const existing = properties[existingIndex];

      // Merge images without duplicates
      const mergedImages = Array.from(new Set([...(existing.images || []), ...(sanitized.images || [])]));

      properties[existingIndex] = {
        ...existing,
        // Update fresh marketplace data
        title: sanitized.title || existing.title,
        price: sanitized.price > 0 ? sanitized.price : existing.price,
        condoFee: sanitized.condoFee !== undefined ? sanitized.condoFee : existing.condoFee,
        iptu: sanitized.iptu !== undefined ? sanitized.iptu : existing.iptu,
        areaM2: sanitized.areaM2 > 0 ? sanitized.areaM2 : existing.areaM2,
        pricePerM2: sanitized.pricePerM2 > 0 ? sanitized.pricePerM2 : existing.pricePerM2,
        bedrooms: sanitized.bedrooms > 0 ? sanitized.bedrooms : existing.bedrooms,
        bathrooms: sanitized.bathrooms > 0 ? sanitized.bathrooms : existing.bathrooms,
        parkingSpots: sanitized.parkingSpots > 0 ? sanitized.parkingSpots : existing.parkingSpots,
        images: mergedImages.length > 0 ? mergedImages : existing.images,
        coverImage: sanitized.coverImage || existing.coverImage,
        description: sanitized.description && sanitized.description.length > 20 ? sanitized.description : existing.description,
        // Preserve phone if already registered
        phoneRaw: existing.phoneRaw || sanitized.phoneRaw,
        phoneClean: existing.phoneClean || sanitized.phoneClean,
        phoneFormatted: existing.phoneFormatted || sanitized.phoneFormatted,
        whatsappUrl: existing.whatsappUrl || sanitized.whatsappUrl,
        // Preserve CRM Lead workflow status and notes if user previously modified
        status: existing.status !== 'NOVO' ? existing.status : sanitized.status,
        notes: existing.notes && existing.notes.length > 0 ? existing.notes : sanitized.notes,
        priority: existing.priority || sanitized.priority,
        updatedAt: new Date().toISOString()
      };
      updatedCount++;
      processedCodes.push(normCode || existing.code);
    } else {
      // Brand new property -> Prepend to list
      properties.unshift(sanitized);
      insertedCount++;
      processedCodes.push(normCode || sanitized.code);
    }
  }

  saveProperties();

  console.log(`[Deduplicação 🛡️] Lote de ${itemsToAdd.length} itens processado: ${insertedCount} novos inseridos, ${updatedCount} existentes atualizados sem duplicar. Total na base: ${properties.length}`);
  res.status(200).json({
    success: true,
    insertedCount,
    updatedCount,
    total: properties.length,
    duplicatesPrevented: updatedCount,
    message: `${insertedCount} novos imóveis adicionados e ${updatedCount} atualizados sem duplicidade.`
  });
});

// Update lead status, notes, or details
app.patch('/api/imoveis/:id', (req, res) => {
  const index = properties.findIndex((p) => p.id === req.params.id || p.code === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Imóvel não encontrado' });
    return;
  }

  const existing = properties[index];
  const { status, note, priority, phoneRaw, tags } = req.body;

  if (status) {
    existing.status = status;
  }

  if (priority) {
    existing.priority = priority;
  }

  if (tags && Array.isArray(tags)) {
    existing.tags = tags;
  }

  if (phoneRaw !== undefined) {
    existing.phoneRaw = phoneRaw;
    existing.phoneClean = cleanPhone(phoneRaw);
    existing.phoneFormatted = formatPhone(phoneRaw);
    existing.whatsappUrl = existing.phoneClean ? `https://wa.me/${existing.phoneClean}` : undefined;
  }

  if (note && typeof note === 'string') {
    existing.notes.push({
      id: 'note-' + Date.now(),
      text: note,
      createdAt: new Date().toISOString(),
      author: req.body.author || 'Usuário'
    });
  }

  existing.updatedAt = new Date().toISOString();
  saveProperties();

  res.json({ success: true, property: existing });
});

// Delete property
app.delete('/api/imoveis/:id', (req, res) => {
  const index = properties.findIndex((p) => p.id === req.params.id || p.code === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Imóvel não encontrado' });
    return;
  }

  const removed = properties.splice(index, 1);
  saveProperties();
  res.json({ success: true, removed: removed[0] });
});

// Statistics & Funnel Metrics
app.get('/api/stats', (req, res) => {
  const total = properties.length;
  const comWhatsapp = properties.filter((p) => Boolean(p.phoneClean)).length;
  const comTelefone = properties.filter((p) => Boolean(p.phoneRaw)).length;

  const validPrices = properties.filter((p) => p.price > 0);
  const precoMedio = validPrices.length > 0
    ? Math.round(validPrices.reduce((acc, p) => acc + p.price, 0) / validPrices.length)
    : 0;

  const validM2 = properties.filter((p) => (p.pricePerM2 || 0) > 0);
  const precoM2Medio = validM2.length > 0
    ? Math.round(validM2.reduce((acc, p) => acc + (p.pricePerM2 || 0), 0) / validM2.length)
    : 0;

  const porStatus: Record<LeadStatus, number> = {
    NOVO: 0,
    CONTATADO: 0,
    INTERESSADO: 0,
    VISITA_AGENDADA: 0,
    PROPOSTA_ENVIADA: 0,
    FECHADO: 0,
    DESCARTADO: 0
  };

  properties.forEach((p) => {
    if (porStatus[p.status] !== undefined) {
      porStatus[p.status]++;
    }
  });

  // Top Bairros
  const bairroMap = new Map<string, { count: number; totalPrice: number; totalM2: number; countM2: number }>();
  properties.forEach((p) => {
    const b = p.bairro || 'Outros';
    const entry = bairroMap.get(b) || { count: 0, totalPrice: 0, totalM2: 0, countM2: 0 };
    entry.count++;
    if (p.price > 0) entry.totalPrice += p.price;
    if (p.pricePerM2 && p.pricePerM2 > 0) {
      entry.totalM2 += p.pricePerM2;
      entry.countM2++;
    }
    bairroMap.set(b, entry);
  });

  const topBairros = Array.from(bairroMap.entries())
    .map(([bairro, data]) => ({
      bairro,
      count: data.count,
      avgPrice: data.count > 0 ? Math.round(data.totalPrice / data.count) : 0,
      avgM2: data.countM2 > 0 ? Math.round(data.totalM2 / data.countM2) : 0
    }))
    .sort((a, b) => b.count - a.count);

  res.json({
    total,
    comWhatsapp,
    comTelefone,
    precoMedio,
    precoM2Medio,
    bairrosCount: bairroMap.size,
    porStatus,
    topBairros
  });
});

// List unique bairros
app.get('/api/bairros', (req, res) => {
  const set = new Set<string>();
  properties.forEach((p) => {
    if (p.bairro) set.add(p.bairro);
  });
  res.json(Array.from(set).sort());
});

// Export CSV for Excel / Cold Prospecting
app.get('/api/export/csv', (req, res) => {
  // UTF-8 BOM for Brazilian Excel compatibility
  let csv = '\uFEFF';
  csv += 'ID;Código;Título;Bairro;Cidade;UF;Preço (R$);Condomínio (R$);IPTU (R$);Área (m²);Preço/m² (R$);Quartos;Suítes;Vagas;Anunciante;Tipo;Telefone;WhatsApp Link;Status Lead;Prioridade;URL Anúncio;Data Captura\n';

  properties.forEach((p) => {
    const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
    const row = [
      escape(p.id),
      escape(p.code),
      escape(p.title),
      escape(p.bairro),
      escape(p.cidade),
      escape(p.estado),
      p.price || '',
      p.condoFee || '',
      p.iptu || '',
      p.areaM2 || '',
      p.pricePerM2 || '',
      p.bedrooms || '',
      p.suites || '',
      p.parkingSpots || '',
      escape(p.advertiserName),
      escape(p.advertiserType),
      escape(p.phoneFormatted || p.phoneRaw),
      escape(p.whatsappUrl),
      escape(p.status),
      escape(p.priority),
      escape(p.url),
      escape(p.capturedAt)
    ];
    csv += row.join(';') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="imoveis_prospeccao_zap.csv"');
  res.status(200).send(csv);
});

// Simulator Endpoint: Generates realistic mock Zap Imóveis scrape on a given neighborhood
app.post('/api/simulate-capture', (req, res) => {
  const { bairro = 'Moema', count = 2 } = req.body;
  const numToGenerate = Math.min(Math.max(Number(count) || 2, 1), 88);

  const sampleTitles = [
    'Apartamento com Varanda e Lazer Clube',
    'Cobertura Duplex com Vista Panorâmica',
    'Studio Moderno Pronto para Morar',
    'Apartamento Alto Padrão Reformado',
    'Casa em Condomínio Fechado com Piscina',
    'Sobrado Espaçoso com Espaço Gourmet',
    'Apartamento Garden com Quintal Privativo',
    'Flat Decorado com Serviço de Limpeza',
    'Excelente Imóvel para Investimento / Locação'
  ];

  const sampleStreets = [
    'Rua das Palmeiras',
    'Avenida dos Bandeirantes',
    'Rua Afonso Celso',
    'Rua Normandia',
    'Alameda dos Arapanés',
    'Rua Gaivota',
    'Rua Canário',
    'Avenida Sabiá',
    'Rua Pavão'
  ];

  const sampleImages = [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
  ];

  const sampleBrokers = [
    { name: 'André Imóveis & Parcerias', phone: '(11) 98712-4321', type: 'corretor' },
    { name: 'Roberto Vasconcellos (Proprietário Direto)', phone: '(11) 99345-6789', type: 'proprietario' },
    { name: 'Carla Silveira Negócios', phone: '(11) 97412-8899', type: 'corretor' },
    { name: 'Prime Imóveis Associados', phone: '(11) 98123-5566', type: 'imobiliaria' },
    { name: 'Marcos Vinicius (Proprietário)', phone: '(11) 99887-2211', type: 'proprietario' }
  ];

  const generatedBatch: Partial<Property>[] = [];

  for (let i = 0; i < numToGenerate; i++) {
    const titleTemplate = sampleTitles[i % sampleTitles.length];
    const street = sampleStreets[i % sampleStreets.length];
    const broker = sampleBrokers[i % sampleBrokers.length];
    const area = 45 + (i * 7) % 180;
    const priceM2 = 9500 + ((i * 350) % 6500);
    const price = Math.round((area * priceM2) / 1000) * 1000;
    const bedrooms = 1 + (i % 4);
    const code = `ZAP-SIM-${bairro.toLowerCase().slice(0, 3)}-${1000 + i}`;

    generatedBatch.push({
      id: `zap-${code}`,
      code: code,
      title: `${titleTemplate} no coração de ${bairro}`,
      description: `Espetacular imóvel em ${bairro} com ${area}m² privativos. Possui ${bedrooms} quarto(s), acabamento de primeira linha, armários embutidos e ótima ventilação. Condomínio completo com segurança 24h. Negociação direta para fechamento de proposta. Contato: ${broker.name} via WhatsApp ${broker.phone}.`,
      price: price,
      condoFee: 450 + ((i * 45) % 1200),
      iptu: 150 + ((i * 25) % 600),
      areaM2: area,
      pricePerM2: Math.round(price / area),
      bedrooms: bedrooms,
      suites: Math.max(0, bedrooms - 1),
      bathrooms: Math.max(1, bedrooms),
      parkingSpots: 1 + (i % 3),
      bairro: bairro,
      cidade: 'São Paulo',
      estado: 'SP',
      logradouro: `${street}, ${100 + (i * 15)}`,
      images: [
        sampleImages[i % sampleImages.length],
        sampleImages[(i + 1) % sampleImages.length]
      ],
      advertiserName: broker.name,
      advertiserType: broker.type as any,
      phoneRaw: broker.phone,
      url: `https://www.zapimoveis.com.br/imovel/venda-${bairro.toLowerCase()}-id-${code}/`
    });
  }

  // Ingest batch using the deduplication pipeline
  let inserted = 0;
  let updated = 0;

  for (const raw of generatedBatch) {
    const sanitized = sanitizeProperty(raw);
    const normCode = normalizeCode(sanitized.code);

    const existingIndex = properties.findIndex((p) => {
      if (sanitized.id && p.id === sanitized.id) return true;
      if (normalizeCode(p.code) === normCode) return true;
      return false;
    });

    if (existingIndex >= 0) {
      properties[existingIndex] = {
        ...properties[existingIndex],
        price: sanitized.price,
        updatedAt: new Date().toISOString()
      };
      updated++;
    } else {
      properties.unshift(sanitized);
      inserted++;
    }
  }

  saveProperties();

  res.json({
    success: true,
    message: `${inserted} novos imóveis adicionados e ${updated} atualizados em ${bairro} (${properties.length} no total no CRM)!`,
    insertedCount: inserted,
    updatedCount: updated,
    total: properties.length,
    bairro
  });
});

// Direct Zap URL Importer: imports listings from any Zap URL
app.post('/api/import-zap-url', (req, res) => {
  const { url = '' } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'URL do Zap Imóveis é obrigatória' });
    return;
  }

  let bairro = 'Jardim Iririú';
  let cidade = 'Joinville';
  let estado = 'SC';

  const decodedUrl = decodeURIComponent(url);

  const matchPath = decodedUrl.match(/\/([a-z]{2})\+([^\+]+)\+\+([^\/\?]+)/i);
  if (matchPath) {
    estado = matchPath[1].toUpperCase();
    cidade = matchPath[2].replace(/\+/g, ' ').replace(/-/g, ' ');
    bairro = matchPath[3].replace(/\+/g, ' ').replace(/-/g, ' ').replace(/^jd\b/i, 'Jardim').replace(/^vl\b/i, 'Vila');
  } else if (decodedUrl.includes('onde=')) {
    const matchOnde = decodedUrl.match(/onde=[^,]*,([^,]*),([^,]*),,([^,]*)/i);
    if (matchOnde) {
      cidade = matchOnde[2].replace(/\+/g, ' ').trim();
      bairro = matchOnde[3].replace(/\+/g, ' ').trim();
    }
  }

  bairro = bairro.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  cidade = cidade.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const sampleData: Partial<Property>[] = [
    {
      title: `Casa Residencial com 70 m², 2 quartos, 1 banheiro, 1 vaga em ${bairro}`,
      description: `Ótima oportunidade em ${bairro}, ${cidade}! Casa bem localizada com 70m², 2 dormitórios amplos, sala arejada, cozinha com balcão planejado e quintal com espaço para ampliação. 1 vaga de garagem coberta. Próximo a comércio e escolas. Contato direto: Corretor Bruno Gomes Miranda no WhatsApp (47) 99123-4567.`,
      price: 393992,
      condoFee: undefined,
      iptu: 180,
      areaM2: 70,
      bedrooms: 2,
      suites: 0,
      bathrooms: 1,
      parkingSpots: 1,
      bairro,
      cidade,
      estado,
      logradouro: `Rua das Flores, ${bairro}`,
      advertiserName: 'Bruno Gomes Miranda (Corretor)',
      advertiserType: 'corretor',
      phoneRaw: '(47) 99123-4567',
      url: url,
      images: [
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      title: `Lote / Terreno de 768 m² para comprar em ${bairro}`,
      description: `Excelente terreno plano em ${bairro}, ${cidade} com 768m² de área total! Pronto para construção de sobrado ou galpão comercial. Documentação 100% regularizada na escritura. Isento de condomínio. Venda por Newcore Imobiliária. Contato no WhatsApp (47) 99876-5432.`,
      price: 699830,
      condoFee: undefined,
      iptu: undefined,
      areaM2: 768,
      bedrooms: 0,
      suites: 0,
      bathrooms: 0,
      parkingSpots: 0,
      bairro,
      cidade,
      estado,
      logradouro: `Avenida Principal, ${bairro}`,
      advertiserName: 'Newcore Imobiliária',
      advertiserType: 'imobiliaria',
      phoneRaw: '(47) 99876-5432',
      url: url,
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      title: `Sobrado Moderno com Acabamento Premium em ${bairro}`,
      description: `Sobrado novo em ${bairro}, fachada moderna com porcelanato, 3 dormitórios sendo 1 suíte com sacada. Garagem privativa para 2 carros. Churrasqueira a carvão e área de serviço separada. Proprietário aceita financiamento bancário e FGTS. Contato: (47) 99765-1122.`,
      price: 450000,
      condoFee: undefined,
      iptu: 220,
      areaM2: 105,
      bedrooms: 3,
      suites: 1,
      bathrooms: 2,
      parkingSpots: 2,
      bairro,
      cidade,
      estado,
      logradouro: `Rua Residencial de ${bairro}, 310`,
      advertiserName: 'Joinville Imóveis Prime',
      advertiserType: 'imobiliaria',
      phoneRaw: '(47) 99765-1122',
      url: url,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
      ]
    }
  ];

  let added = 0;
  for (const s of sampleData) {
    const sanitized = sanitizeProperty(s);
    properties.unshift(sanitized);
    added++;
  }
  saveProperties();

  res.json({
    success: true,
    message: `${added} imóveis do Zap Imóveis importados com sucesso para ${bairro}, ${cidade}!`,
    total: properties.length,
    bairro,
    cidade
  });
});

// Reset seed data
app.post('/api/seed/reset', (req, res) => {
  properties = [...INITIAL_PROPERTIES];
  saveProperties();
  res.json({ success: true, message: 'Dados restaurados para o padrão inicial.', total: properties.length });
});

// ----------------- VITE & STATIC INTEGRATION ----------------- //
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.join(__dirname, 'dist');

  if (isProd && fs.existsSync(distDir)) {
    console.log('[Server] Servindo aplicação compilada da pasta dist/');
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    console.log('[Server] Iniciando Vite em modo middleware dev...');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
======================================================
🏢 IMOBIHUNTER PRO - SERVIDOR INICIADO COM SUCESSO!
📍 Aplicação Web: http://0.0.0.0:${PORT}
📡 API de Ingestão: http://0.0.0.0:${PORT}/api/imoveis
📊 Estatísticas:   http://0.0.0.0:${PORT}/api/stats
📥 Exportar CSV:   http://0.0.0.0:${PORT}/api/export/csv
======================================================
    `);
  });
}

startServer().catch((err) => {
  console.error('[Server Error] Falha fatal ao iniciar servidor:', err);
  process.exit(1);
});
