import { useState } from "react";
import {
  Headphones,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import { CATEGORIAS, EMPRESA, PRODUTOS } from "@/data/catalogo";
import { abrirWhatsapp, MSG_CONSULTOR } from "@/lib/whatsapp";

type Props = { itensPedido: number; onVerPedido: () => void };

export function StoreHeader({ itensPedido, onVerPedido }: Props) {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);

  const sugestoes = busca.trim()
    ? PRODUTOS.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 5)
    : [];

  const categorias = CATEGORIAS.filter((c) => c.id !== "todos");

  return (
    <header className="sticky top-0 z-40 bg-background shadow-sm">
      <div className="bg-ink text-background">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-[11px] sm:text-xs">
          <Truck className="size-4 shrink-0 text-brand" />
          <span>
            Frete grátis acima de R$ 299 na região • Faturamento a prazo para empresas (CNPJ)
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
        <button
          onClick={() => setAberto((v) => !v)}
          aria-label="Abrir menu"
          className="grid size-10 shrink-0 place-items-center rounded-xl text-ink lg:hidden"
        >
          {aberto ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <a href="#topo" className="flex shrink-0 items-center gap-2">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand to-pink text-background">
            <ShoppingBag className="size-5" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-lg font-extrabold tracking-tight text-ink">
              {EMPRESA.nome}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Store
            </span>
          </span>
        </a>

        <div className="relative flex-1">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="O que você procura?"
            className="w-full rounded-full border border-border bg-ice py-3 pl-5 pr-12 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
          />
          <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          {sugestoes.length > 0 && (
            <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
              {sugestoes.map((p) => (
                <li key={p.id}>
                  <a
                    href="#vitrine"
                    onClick={() => setBusca("")}
                    className="block px-5 py-3 text-sm text-ink transition-colors hover:bg-ice"
                  >
                    {p.nome}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <button
            onClick={() => abrirWhatsapp(MSG_CONSULTOR)}
            className="flex items-center gap-2 text-xs font-medium text-ink transition-colors hover:text-brand"
          >
            <Headphones className="size-5" /> SAC
          </button>
          <a
            href="#contato"
            className="flex items-center gap-2 text-xs font-medium text-ink transition-colors hover:text-brand"
          >
            <User className="size-5" />
            <span className="leading-tight">
              Minha
              <br />
              conta
            </span>
          </a>
          <a
            href="#vitrine"
            className="flex items-center gap-2 text-xs font-medium text-ink transition-colors hover:text-brand"
          >
            <Heart className="size-5" /> Favoritos
          </a>
        </nav>

        <button
          onClick={onVerPedido}
          aria-label="Ver sacola"
          className="relative grid size-11 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-ice"
        >
          <ShoppingBag className="size-6" />
          <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-brand-foreground">
            {itensPedido}
          </span>
        </button>
      </div>

      <nav className="hidden border-t border-border lg:block">
        <ul className="mx-auto flex max-w-7xl items-center justify-between px-4">
          {categorias.map((c) => (
            <li key={c.id}>
              <a
                href="#vitrine"
                className="block border-b-2 border-transparent px-2 py-3.5 text-[13px] font-medium uppercase tracking-wide text-ink/80 transition-colors hover:border-brand hover:text-brand"
              >
                {c.label}
              </a>
            </li>
          ))}
          <li>
            <button
              onClick={() => abrirWhatsapp(MSG_CONSULTOR)}
              className="border-b-2 border-transparent px-2 py-3.5 text-[13px] font-bold uppercase tracking-wide text-pink transition-colors hover:border-pink"
            >
              Compras CNPJ
            </button>
          </li>
        </ul>
      </nav>

      {aberto && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          {categorias.map((c) => (
            <a
              key={c.id}
              href="#vitrine"
              onClick={() => setAberto(false)}
              className="block rounded-lg px-2 py-2.5 text-sm font-medium text-ink hover:bg-ice"
            >
              {c.emoji} {c.label}
            </a>
          ))}
          <button
            onClick={() => {
              setAberto(false);
              abrirWhatsapp(MSG_CONSULTOR);
            }}
            className="mt-2 w-full rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-brand-foreground"
          >
            Falar com um consultor
          </button>
        </nav>
      )}
    </header>
  );
}
