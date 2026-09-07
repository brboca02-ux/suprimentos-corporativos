import { useMemo, useState } from "react";
import {
  Backpack,
  Boxes,
  FileText,
  MessageCircle,
  PenLine,
  Plus,
  Star,
  Armchair,
} from "lucide-react";
import { toast } from "sonner";
import {
  CATEGORIAS,
  PRODUTOS,
  brl,
  type Categoria,
  type Perfil,
  type Produto,
} from "@/data/catalogo";
import { abrirWhatsapp, MSG_CATALOGO_PDF, msgOrcarAtacado } from "@/lib/whatsapp";

const ICONE: Record<Categoria, typeof FileText> = {
  escritorio: FileText,
  embalagens: Boxes,
  escrita: PenLine,
  escolar: Backpack,
  organizacao: Armchair,
};

type Props = { perfil: Perfil; onAdicionar: (p: Produto) => void };

export function Catalogo({ perfil, onAdicionar }: Props) {
  const [filtro, setFiltro] = useState<Categoria | "todos">("todos");
  const corporativo = perfil === "corporativo";

  const lista = useMemo(
    () => (filtro === "todos" ? PRODUTOS : PRODUTOS.filter((p) => p.categoria === filtro)),
    [filtro],
  );

  return (
    <section id="catalogo" className="bg-ice py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
            Catálogo rápido
          </h2>
          <p className="mt-3 text-muted-foreground">
            {corporativo
              ? "Preços de atacado por caixa fechada, com faturamento a prazo para empresas."
              : "Compre por unidade com retirada no balcão ou entrega rápida na sua casa."}
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              onClick={() => setFiltro(c.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                filtro === c.id
                  ? "border-navy bg-navy text-ice shadow"
                  : "border-border bg-background text-foreground/70 hover:border-amber hover:text-navy"
              }`}
            >
              {c.emoji ? `${c.emoji} ` : ""}
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((p) => {
            const Icone = ICONE[p.categoria];
            return (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative grid h-40 place-items-center bg-gradient-to-br from-ice to-secondary">
                  <Icone className="size-14 text-navy/25 transition-transform group-hover:scale-110" />
                  <span className="absolute left-3 top-3 rounded-full bg-amber px-2.5 py-1 text-[11px] font-bold text-amber-foreground">
                    {p.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-1 text-amber">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">5,0</span>
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold leading-snug text-navy">
                    {p.nome}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.descricao}</p>

                  <div className="mt-4">
                    <p className="font-display text-xl font-extrabold text-navy">
                      {brl(p.precoUnitario)}{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        /{p.unidade}
                      </span>
                    </p>
                    <p className="text-xs font-semibold text-emerald">
                      {brl(p.precoAtacado)} acima de {p.minimoAtacado} {p.unidade}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        onAdicionar(p);
                        toast.success("Item adicionado ao seu pedido.");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-4 py-2.5 text-sm font-bold text-amber-foreground transition-transform hover:scale-[1.02]"
                    >
                      <Plus className="size-4" /> Adicionar ao Pedido
                    </button>
                    <button
                      onClick={() => abrirWhatsapp(msgOrcarAtacado(p))}
                      className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-ice"
                    >
                      Orçar no Atacado
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => abrirWhatsapp(MSG_CATALOGO_PDF)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-bold text-emerald-foreground shadow-sm transition-transform hover:scale-105"
          >
            <MessageCircle className="size-4" /> Ver catálogo completo em PDF / WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}
