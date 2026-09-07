import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { TopBar } from "@/components/landing/TopBar";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { CotacaoExpress } from "@/components/landing/CotacaoExpress";
import { Catalogo } from "@/components/landing/Catalogo";
import { ProvaSocial } from "@/components/landing/ProvaSocial";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsapp } from "@/components/landing/FloatingWhatsapp";
import { QuoteModal } from "@/components/landing/QuoteModal";
import { EMPRESA, type Perfil, type Produto } from "@/data/catalogo";
import { abrirWhatsapp, msgPedido } from "@/lib/whatsapp";

const titulo = `${EMPRESA.nome} | Suprimentos Corporativos, Papelaria e Material Escolar`;
const descricao =
  "Distribuidora e papelaria multissetorial: papel A4, embalagens, escrita e material escolar. Faturamento a prazo para empresas e cotação de lista em 2 horas.";

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
  const [perfil, setPerfil] = useState<Perfil>("corporativo");
  const [modalAberto, setModalAberto] = useState(false);
  const [pedido, setPedido] = useState<{ produto: Produto; qtd: number }[]>([]);

  const adicionar = (produto: Produto) => {
    setPedido((atual) => {
      const existente = atual.find((i) => i.produto.id === produto.id);
      return existente
        ? atual.map((i) => (i.produto.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i))
        : [...atual, { produto, qtd: 1 }];
    });
  };

  const enviarPedido = () => {
    if (pedido.length === 0) return;
    abrirWhatsapp(msgPedido(pedido, perfil === "corporativo"));
    toast.success("Pedido montado! Conclua o envio no WhatsApp.");
  };

  const totalItens = pedido.reduce((s, i) => s + i.qtd, 0);

  return (
    <div className="min-h-screen bg-background font-sans">
      <TopBar />
      <Header
        onCotacao={() => setModalAberto(true)}
        itensPedido={totalItens}
        onVerPedido={enviarPedido}
      />
      <main>
        <Hero perfil={perfil} setPerfil={setPerfil} onCotacao={() => setModalAberto(true)} />
        <div id="vantagens">
          <TrustBar />
        </div>
        <CotacaoExpress perfil={perfil} />
        <Catalogo perfil={perfil} onAdicionar={adicionar} />
        <ProvaSocial />
      </main>
      <Footer />
      <FloatingWhatsapp />
      <QuoteModal open={modalAberto} onOpenChange={setModalAberto} perfil={perfil} />
    </div>
  );
}
