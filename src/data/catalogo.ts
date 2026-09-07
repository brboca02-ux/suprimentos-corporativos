export const EMPRESA = {
  nome: "Nexus Suprimentos",
  selo: "Soluções Corporativas & Varejo",
  razaoSocial: "Nexus Distribuidora de Suprimentos Ltda.",
  cnpj: "12.345.678/0001-90",
  telefone: "(11) 4002-8922",
  whatsapp: "5511987654321",
  email: "cotacao@nexussuprimentos.com.br",
  horario: "Seg a Sex, 8h às 18h | Sáb, 8h às 12h",
  endereco: "Av. das Indústrias, 1420 — Galpão 3, São Paulo/SP",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+das+Industrias+1420+Sao+Paulo",
} as const;

export type Perfil = "corporativo" | "varejo";

export type Categoria =
  | "escritorio"
  | "embalagens"
  | "escrita"
  | "escolar"
  | "organizacao";

export const CATEGORIAS: { id: Categoria | "todos"; label: string; emoji: string }[] = [
  { id: "todos", label: "Todos", emoji: "" },
  { id: "escritorio", label: "Suprimentos de Escritório & Papel A4", emoji: "🏢" },
  { id: "embalagens", label: "Embalagens & Expedição", emoji: "📦" },
  { id: "escrita", label: "Escrita & Correção", emoji: "🖊️" },
  { id: "escolar", label: "Material Escolar & Criativo", emoji: "🎒" },
  { id: "organizacao", label: "Organização & Ergonomia", emoji: "🪑" },
];

export type Produto = {
  id: string;
  nome: string;
  descricao: string;
  categoria: Categoria;
  tag: string;
  precoUnitario: number;
  precoAtacado: number;
  minimoAtacado: number;
  unidade: string;
  imagem?: string;
};

export const PRODUTOS: Produto[] = [
  {
    id: "p1",
    nome: "Papel Sulfite A4 75g — Caixa c/ 10 resmas",
    descricao: "5.000 folhas, alta alvura, ideal para impressão corporativa em volume.",
    categoria: "escritorio",
    tag: "Mais Vendido B2B",
    precoUnitario: 289.9,
    precoAtacado: 264.5,
    minimoAtacado: 5,
    unidade: "cx",
    imagem: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80",
  },
  {
    id: "p2",
    nome: "Toner Compatível Laser Preto",
    descricao: "Rendimento de até 3.000 páginas com qualidade de impressão estável.",
    categoria: "escritorio",
    tag: "Pronta Entrega",
    precoUnitario: 98.9,
    precoAtacado: 84.5,
    minimoAtacado: 10,
    unidade: "un",
    imagem: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=80",
  },
  {
    id: "p3",
    nome: "Envelope Kraft A4 — Pacote c/ 100",
    descricao: "Gramatura reforçada para envio de documentos e contratos.",
    categoria: "embalagens",
    tag: "Preço por Caixa",
    precoUnitario: 64.9,
    precoAtacado: 55.9,
    minimoAtacado: 6,
    unidade: "pct",
    imagem: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&q=80",
  },
  {
    id: "p4",
    nome: "Fita Adesiva Transparente 48mm x 100m",
    descricao: "Alta aderência para expedição e fechamento de caixas.",
    categoria: "embalagens",
    tag: "Preço por Caixa",
    precoUnitario: 8.9,
    precoAtacado: 6.7,
    minimoAtacado: 24,
    unidade: "un",
    imagem: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
  },
  {
    id: "p5",
    nome: "Caneta Esferográfica Azul — Caixa c/ 50",
    descricao: "Escrita macia, tinta de longa duração, padrão corporativo.",
    categoria: "escrita",
    tag: "Mais Vendido B2B",
    precoUnitario: 62.9,
    precoAtacado: 54.9,
    minimoAtacado: 10,
    unidade: "cx",
    imagem: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80",
  },
  {
    id: "p6",
    nome: "Marcador de Quadro Branco — Kit 4 cores",
    descricao: "Ponta resistente e apagamento limpo para salas de reunião.",
    categoria: "escrita",
    tag: "Pronta Entrega",
    precoUnitario: 28.9,
    precoAtacado: 24.5,
    minimoAtacado: 10,
    unidade: "kit",
    imagem: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
  },
  {
    id: "p7",
    nome: "Kit Escolar Completo — 24 itens",
    descricao: "Cadernos, lápis, borracha, régua e estojo em um único pacote.",
    categoria: "escolar",
    tag: "Volta às Aulas",
    precoUnitario: 149.9,
    precoAtacado: 129.9,
    minimoAtacado: 5,
    unidade: "kit",
    imagem: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&q=80",
  },
  {
    id: "p8",
    nome: "Tinta Guache 15ml — Caixa c/ 12 cores",
    descricao: "Cores vivas e atóxicas para atividades criativas e escolares.",
    categoria: "escolar",
    tag: "Pronta Entrega",
    precoUnitario: 18.9,
    precoAtacado: 15.4,
    minimoAtacado: 12,
    unidade: "cx",
    imagem: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
  },
  {
    id: "p9",
    nome: "Pasta Arquivo Suspensa — Pacote c/ 25",
    descricao: "Organização de documentos fiscais e contábeis com haste plástica.",
    categoria: "organizacao",
    tag: "Mais Vendido B2B",
    precoUnitario: 89.9,
    precoAtacado: 76.9,
    minimoAtacado: 6,
    unidade: "pct",
    imagem: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80",
  },
  {
    id: "p10",
    nome: "Suporte Ergonômico para Notebook",
    descricao: "Alumínio com regulagem de altura, reduz fadiga no home office.",
    categoria: "organizacao",
    tag: "Novidade",
    precoUnitario: 139.9,
    precoAtacado: 118.0,
    minimoAtacado: 5,
    unidade: "un",
    imagem: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80",
  },
  {
    id: "p11",
    nome: "Bloco Autoadesivo 76x76mm — Pacote c/ 12",
    descricao: "Adesivo reposicionável, cores sortidas para sinalização rápida.",
    categoria: "escritorio",
    tag: "Pronta Entrega",
    precoUnitario: 42.9,
    precoAtacado: 36.5,
    minimoAtacado: 10,
    unidade: "pct",
    imagem: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&q=80",
  },
  {
    id: "p12",
    nome: "Plástico Bolha 60cm x 100m",
    descricao: "Proteção reforçada para expedição de produtos frágeis.",
    categoria: "embalagens",
    tag: "Preço por Caixa",
    precoUnitario: 119.9,
    precoAtacado: 99.9,
    minimoAtacado: 4,
    unidade: "rolo",
    imagem: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&q=80",
  },
];

export const SEGMENTOS = [
  "Contabilidades",
  "Indústrias",
  "Escolas",
  "Escritórios de Advocacia",
  "Clínicas",
  "Construtoras",
  "Órgãos Públicos",
  "Startups",
];

export const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
