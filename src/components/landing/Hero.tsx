import { ArrowRight, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import type { Perfil } from "@/data/catalogo";

type Props = {
  perfil: Perfil;
  setPerfil: (p: Perfil) => void;
  onCotacao: () => void;
};

const DESTAQUES: Record<Perfil, { icone: typeof Truck; titulo: string; texto: string }[]> = {
  corporativo: [
    { icone: ShieldCheck, titulo: "Boleto 28/45 dias", texto: "Crédito aprovado em até 24h" },
    { icone: PackageCheck, titulo: "Caixa fechada", texto: "Preço de atacado direto do depósito" },
    { icone: Truck, titulo: "Reposição programada", texto: "Entrega recorrente sem pedido manual" },
  ],
  varejo: [
    { icone: PackageCheck, titulo: "Kits escolares", texto: "Lista completa montada para você" },
    { icone: Truck, titulo: "Retirada no balcão", texto: "Separação em até 30 minutos" },
    { icone: ShieldCheck, titulo: "Pague no Pix", texto: "Desconto à vista em qualquer volume" },
  ],
};

export function Hero({ perfil, setPerfil, onCotacao }: Props) {
  const corporativo = perfil === "corporativo";

  return (
    <section id="topo" className="relative overflow-hidden bg-navy text-ice">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 size-[32rem] rounded-full bg-amber/15 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-ice/20 bg-ice/5 px-3 py-1 text-xs font-semibold text-amber">
              Distribuidora multissetorial • B2B e Varejo
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] text-ice sm:text-5xl lg:text-6xl">
              A solução completa em suprimentos para sua empresa e para o seu dia a dia.
            </h1>
            <p className="mt-5 max-w-xl text-base text-ice/75 sm:text-lg">
              De caixas fechadas de papel e insumos de escritório a materiais técnicos e escolares.
              Atendimento ágil, preços de atacado e entrega rápida para o seu negócio não parar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onCotacao}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-6 py-4 text-sm font-bold text-amber-foreground shadow-lg transition-transform hover:scale-[1.03]"
              >
                Solicitar Cotação B2B (em 1 min) <ArrowRight className="size-4" />
              </button>
              <a
                href="#catalogo"
                className="inline-flex items-center justify-center rounded-xl border border-ice/25 px-6 py-4 text-sm font-semibold text-ice transition-colors hover:bg-ice/10"
              >
                Explorar Catálogo de Produtos
              </a>
            </div>

            <div className="mt-9 inline-flex rounded-full border border-ice/20 bg-ice/5 p-1">
              {(
                [
                  ["corporativo", "🏢 Compras Corporativas (CNPJ)"],
                  ["varejo", "👤 Consumo Próprio / Varejo"],
                ] as [Perfil, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setPerfil(id)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                    perfil === id
                      ? "bg-amber text-amber-foreground shadow"
                      : "text-ice/70 hover:text-ice"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {DESTAQUES[perfil].map(({ icone: Icone, titulo, texto }) => (
              <div
                key={titulo}
                className="flex items-center gap-4 rounded-2xl border border-ice/10 bg-ice/[0.06] p-5 backdrop-blur transition-colors hover:border-amber/40"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber">
                  <Icone className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display font-bold text-ice">{titulo}</p>
                  <p className="text-sm text-ice/65">{texto}</p>
                </div>
              </div>
            ))}
            <p className="px-2 text-xs text-ice/50">
              {corporativo
                ? "Condições exibidas para compras com CNPJ."
                : "Condições exibidas para compras de consumo próprio."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
