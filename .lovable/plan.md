# Landing page + catálogo inteligente — Distribuidora & Papelaria

Uma única página de alta conversão em `/`, atendendo empresas (B2B) e consumidor final, com modal de cotação, catálogo filtrável e integração direta com WhatsApp.

## Identidade visual

- Azul marinho profundo (#0F172A) como base, branco gelo / cinza suave (#F8FAFC) para superfícies.
- Âmbar/laranja (#F59E0B) para CTAs de conversão e verde esmeralda para ações de WhatsApp.
- Tipografia Plus Jakarta Sans (títulos) + Inter (texto).
- Cantos arredondados suaves, sombras leves, badges elegantes, microinterações em hover.

## Seções da página

1. Barra de aviso superior com faturamento a prazo + link WhatsApp B2B.
2. Header fixo: logo com selo "Soluções Corporativas & Varejo", menu (Linha Corporativa, Catálogo Geral, Cotação Express, Sobre Nós, Contato), busca preditiva simulada, botão "Área da Empresa / Cotação B2B" e botão WhatsApp. Menu em drawer no mobile.
3. Hero com headline, subheadline, dois CTAs e seletor de perfil (Corporativo CNPJ / Varejo) que troca destaques, textos e preços exibidos.
4. Barra de 4 vantagens (faturamento, preço progressivo, entrega própria, cotação em 2h).
5. Módulo "Cotação Express": card destacado com empresa/responsável, WhatsApp, CNPJ opcional, área para colar a lista e anexo de PDF/Excel (mockup); envio monta mensagem estruturada e abre o WhatsApp, com confirmação via toast.
6. Vitrine de catálogo: filtros em pílulas por categoria, grid responsivo de cards com tag, imagem, nota 5 estrelas, descrição, preço unitário e preço de atacado, botões "Adicionar ao Pedido" e "Orçar no Atacado". Rodapé do grid com "Ver Catálogo Completo em PDF / WhatsApp".
7. Prova social: contadores animados (+15 anos, +1.200 empresas, +5.000 itens, 99,4% no prazo) e faixa de segmentos atendidos.
8. Rodapé em 4 colunas (empresa/CNPJ, categorias e política B2B, atendimento, endereço com botão "Como Chegar") + barra inferior com direitos e selos.
9. Botão flutuante de WhatsApp com mensagem pré-configurada.

## Interatividade

- Modal de cotação rápida reutilizado pelo header e pelo hero, com validação e toast de sucesso.
- "Adicionar ao Pedido" acumula itens em um pedido local (contador no header) que pode ser enviado inteiro pelo WhatsApp.
- Scroll suave entre seções, filtros instantâneos, layout mobile-first.

## Detalhes técnicos

- Rota única em `src/routes/index.tsx`, componentes em `src/components/landing/*`, dados de produtos e categorias em `src/data/catalogo.ts`.
- Tokens de cor/tipografia em `src/styles.css` (@theme), fontes via `<link>` no `__root.tsx`; sem classes de cor fixas nos componentes.
- Estado local com `useState`, toasts com sonner (`<Toaster />` montado no root), ícones Lucide.
- SEO: title, description, og e twitter próprios na rota inicial.
- Imagens dos produtos geradas como fotos limpas sobre fundo neutro.

## Preciso de você

Vou usar dados de exemplo (nome fantasia, CNPJ, telefone, endereço e número do WhatsApp fictícios) e marcar onde trocar. Se já tiver o nome real da empresa e o número de WhatsApp, me envie que eu já coloco os verdadeiros.
