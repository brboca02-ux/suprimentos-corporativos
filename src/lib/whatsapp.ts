import { EMPRESA, brl, type Produto } from "@/data/catalogo";

/** Abre o WhatsApp com a mensagem já codificada (quebras de linha preservadas). */
export function abrirWhatsapp(mensagem: string) {
  const url = `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(mensagem)}`;
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export const MSG_CONSULTOR =
  "Olá! 👋\nGostaria de falar com um consultor corporativo sobre compras para a minha empresa.";

export const MSG_CATALOGO_PDF =
  "Olá! 📘\nGostaria de receber o catálogo completo em PDF da distribuidora.";

export const MSG_B2B =
  "Olá! 🏢\nSou de uma empresa e gostaria de saber sobre faturamento a prazo via boleto.";

export function msgCotacao(dados: {
  empresa: string;
  whatsapp: string;
  cnpj?: string;
  itens: string;
  arquivo?: string;
  corporativo: boolean;
}) {
  const linhas: string[] = [];
  linhas.push(
    dados.corporativo
      ? "Olá! 🏢 Gostaria de uma cotação para minha empresa."
      : "Olá! 🛒 Gostaria de uma cotação de materiais.",
  );
  linhas.push("");
  linhas.push(`*Empresa/Responsável:* ${dados.empresa}`);
  linhas.push(`*WhatsApp:* ${dados.whatsapp}`);
  if (dados.cnpj) linhas.push(`*CNPJ:* ${dados.cnpj}`);
  if (dados.arquivo) linhas.push(`*Arquivo anexo:* ${dados.arquivo} (envio na sequência)`);
  linhas.push("");
  linhas.push("*Itens:*");
  const itens = dados.itens
    .split("\n")
    .map((i) => i.trim())
    .filter(Boolean);
  for (const item of itens) linhas.push(`• ${item.replace(/^[-•*]\s*/, "")}`);
  linhas.push("");
  linhas.push("Aguardo a melhor proposta. Obrigado! 🙏");
  return linhas.join("\n");
}

export function msgPedido(itens: { produto: Produto; qtd: number }[], corporativo: boolean) {
  const linhas: string[] = [];
  linhas.push(
    corporativo
      ? "Olá! 🏢 Gostaria de fechar este pedido corporativo:"
      : "Olá! 🛒 Gostaria de fechar este pedido:",
  );
  linhas.push("");
  linhas.push("*Itens:*");
  for (const { produto, qtd } of itens) {
    linhas.push(`• ${qtd}x ${produto.nome} — ${brl(produto.precoUnitario)}/${produto.unidade}`);
  }
  linhas.push("");
  linhas.push("Pode confirmar disponibilidade e prazo de entrega? 🚚");
  return linhas.join("\n");
}

export function msgOrcarAtacado(produto: Produto) {
  return [
    "Olá! 📦 Gostaria de um orçamento de atacado para:",
    "",
    `• ${produto.nome}`,
    `Preço acima de ${produto.minimoAtacado} ${produto.unidade}: ${brl(produto.precoAtacado)}`,
    "",
    "Qual a condição para volume maior e faturamento a prazo?",
  ].join("\n");
}
