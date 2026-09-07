import { useState } from "react";
import { Boxes, Menu, MessageCircle, Search, ShoppingCart, X } from "lucide-react";
import { EMPRESA, PRODUTOS } from "@/data/catalogo";
import { abrirWhatsapp, MSG_CONSULTOR } from "@/lib/whatsapp";

const LINKS = [
  { label: "Linha Corporativa", href: "#vantagens" },
  { label: "Catálogo Geral", href: "#catalogo" },
  { label: "Cotação Express", href: "#cotacao" },
  { label: "Sobre Nós", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

type Props = { onCotacao: () => void; itensPedido: number; onVerPedido: () => void };

export function Header({ onCotacao, itensPedido, onVerPedido }: Props) {
  const [busca, setBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  const sugestoes = busca.trim()
    ? PRODUTOS.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 4)
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:grid-cols-[auto_1fr_auto]">
        <a href="#topo" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy text-amber">
            <Boxes className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-extrabold text-navy">
              {EMPRESA.nome}
            </span>
            <span className="block truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {EMPRESA.selo}
            </span>
          </span>
        </a>

        <nav className="hidden justify-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-amber"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden xl:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-52 rounded-full border border-border bg-ice py-2 pl-9 pr-3 text-sm outline-none transition-all focus:w-64 focus:border-amber"
            />
            {sugestoes.length > 0 && (
              <ul className="absolute mt-2 w-72 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
                {sugestoes.map((p) => (
                  <li key={p.id}>
                    <a
                      href="#catalogo"
                      onClick={() => setBusca("")}
                      className="block px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-ice"
                    >
                      {p.nome}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {itensPedido > 0 && (
            <button
              onClick={onVerPedido}
              className="relative inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-ice"
            >
              <ShoppingCart className="size-4" />
              <span className="hidden sm:inline">Pedido</span>
              <span className="grid size-5 place-items-center rounded-full bg-amber text-[11px] font-bold text-amber-foreground">
                {itensPedido}
              </span>
            </button>
          )}

          <button
            onClick={onCotacao}
            className="hidden rounded-full bg-amber px-4 py-2.5 text-sm font-semibold text-amber-foreground shadow-sm transition-transform hover:scale-105 sm:inline-flex"
          >
            Área da Empresa / Cotação B2B
          </button>

          <button
            onClick={() => abrirWhatsapp(MSG_CONSULTOR)}
            aria-label="WhatsApp"
            className="inline-flex items-center justify-center rounded-full bg-emerald p-2.5 text-emerald-foreground transition-transform hover:scale-105"
          >
            <MessageCircle className="size-5" />
          </button>

          <button
            onClick={() => setMenuAberto((v) => !v)}
            aria-label="Menu"
            className="inline-flex items-center justify-center rounded-full border border-border p-2.5 text-navy lg:hidden"
          >
            {menuAberto ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuAberto && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuAberto(false)}
              className="block rounded-lg px-2 py-2.5 text-sm font-medium text-foreground/80 hover:bg-ice"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMenuAberto(false);
              onCotacao();
            }}
            className="mt-2 w-full rounded-xl bg-amber px-4 py-2.5 text-sm font-semibold text-amber-foreground"
          >
            Área da Empresa / Cotação B2B
          </button>
        </nav>
      )}
    </header>
  );
}
