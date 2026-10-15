import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { StoreHeader } from "@/components/loja/StoreHeader";
import { HeroBanner } from "@/components/loja/HeroBanner";
import { BeneficiosBar } from "@/components/loja/BeneficiosBar";
import { CategoriaCirculos } from "@/components/loja/CategoriaCirculos";
import { Vitrine } from "@/components/loja/Vitrine";
import { BannersDuplos } from "@/components/loja/BannersDuplos";
import { Newsletter } from "@/components/loja/Newsletter";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsapp } from "@/components/landing/FloatingWhatsapp";
import { EMPRESA, type Categoria, type Produto } from "@/data/catalogo";
import { abrirWhatsapp, msgPedido } from "@/lib/whatsapp";

const titulo = `${EMPRESA.nome} Store | Papelaria, Escolar e Suprimentos de Escritório`;
const descricao =
  "Loja online de papelaria, material escolar, embalagens e suprimentos de escritório. Ofertas, parcelamento em 3x e faturamento a prazo para empresas.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: titulo },
      { name: "description", content: descricao },
      { property: "og:title", content: titulo },
      { property: "og:description", content: descricao },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [pedido, setPedido] = useState<{ produto: Produto; qtd: number }[]>([]);
  const [filtro, setFiltro] = useState<Categoria | "todos">("todos");

  const adicionar = (produto: Produto) => {
    setPedido((atual) => {
      const existente = atual.find((i) => i.produto.id === produto.id);
      return existente
        ? atual.map((i) => (i.produto.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i))
        : [...atual, { produto, qtd: 1 }];
    });
    toast.success("Adicionado à sacola: " + produto.nome);
  };

  const enviarPedido = () => {
    if (pedido.length === 0) {
      toast.info("Sua sacola está vazia. Escolha um produto para começar.");
      return;
    }
    abrirWhatsapp(msgPedido(pedido, false));
    toast.success("Pedido montado! Conclua o envio no WhatsApp.");
  };

  const irParaVitrine = (c: Categoria | "todos") => {
    setFiltro(c);
    document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth" });
  };

  const totalItens = pedido.reduce((s, i) => s + i.qtd, 0);

  return (
    <div className="min-h-screen bg-background font-sans">
      <StoreHeader itensPedido={totalItens} onVerPedido={enviarPedido} />
      <main>
        <HeroBanner onCta={() => irParaVitrine("todos")} />
        <BeneficiosBar />
        <CategoriaCirculos onSelecionar={irParaVitrine} />
        <Vitrine filtro={filtro} setFiltro={setFiltro} onAdicionar={adicionar} />
        <BannersDuplos />
        <Newsletter />
      </main>
      <Footer />
      <FloatingWhatsapp />
    </div>
  );
}
