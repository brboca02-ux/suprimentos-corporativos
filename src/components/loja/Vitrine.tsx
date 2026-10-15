import { useMemo, useState } from "react";
import { PRODUTOS, CATEGORIAS, type Categoria, type Produto } from "@/data/catalogo";
import { abrirWhatsapp, MSG_CATALOGO_PDF } from "@/lib/whatsapp";
import { ProdutoCard } from "./ProdutoCard";

type Props = {
  filtro: Categoria | "todos";
  setFiltro: (c: Categoria | "todos") => void;
  onAdicionar: (p: Produto) => void;
};

export function Vitrine({ filtro, setFiltro, onAdicionar }: Props) {
  const [verTodos, setVerTodos] = useState(false);

  const lista = useMemo(
    () => (filtro === "todos" ? PRODUTOS : PRODUTOS.filter((p) => p.categoria === filtro)),
    [filtro],
  );
  const visiveis = verTodos ? lista : lista.slice(0, 8);

  return (
    <section id="vitrine" className="bg-ice py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand">
              Ofertas da semana
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Os mais vendidos da loja
            </h2>
          </div>
          <button
            onClick={() => abrirWhatsapp(MSG_CATALOGO_PDF)}
            className="rounded-full border border-ink/15 bg-background px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Ver catálogo completo em PDF
          </button>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              onClick={() => setFiltro(c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                filtro === c.id
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-background text-ink/70 hover:border-brand hover:text-brand"
              }`}
            >
              {c.emoji ? `${c.emoji} ` : ""}
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visiveis.map((p) => (
            <ProdutoCard key={p.id} produto={p} onAdicionar={onAdicionar} />
          ))}
        </div>

        {lista.length > 8 && !verTodos && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVerTodos(true)}
              className="rounded-full bg-ink px-8 py-3.5 text-sm font-bold text-background transition-transform hover:scale-105"
            >
              Ver mais produtos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
