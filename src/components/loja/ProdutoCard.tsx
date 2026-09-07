import { Armchair, Backpack, Boxes, FileText, PenLine, ShoppingBag, Star } from "lucide-react";
import { brl, type Categoria, type Produto } from "@/data/catalogo";

const ICONE: Record<Categoria, typeof FileText> = {
  escritorio: FileText,
  embalagens: Boxes,
  escrita: PenLine,
  escolar: Backpack,
  organizacao: Armchair,
};

export function ProdutoCard({
  produto,
  onAdicionar,
}: {
  produto: Produto;
  onAdicionar: (p: Produto) => void;
}) {
  const Icone = ICONE[produto.categoria];
  const precoDe = produto.precoUnitario * 1.28;
  const desconto = Math.round((1 - produto.precoUnitario / precoDe) * 100);
  const parcela = produto.precoUnitario / 3;

  return (
    <article className="group flex w-[16rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-xl sm:w-auto">
      <div className="relative grid h-44 place-items-center bg-ice">
        <span className="absolute left-3 top-3 rounded-full bg-pink px-2.5 py-1 text-[11px] font-bold text-background">
          -{desconto}%
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-background px-2.5 py-1 text-[10px] font-bold uppercase text-brand shadow-sm">
          {produto.tag}
        </span>
        <Icone className="size-16 text-ink/20 transition-transform group-hover:scale-110" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-0.5 text-brand">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-current" />
          ))}
          <span className="ml-1 text-[11px] text-muted-foreground">(5,0)</span>
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-ink">
          {produto.nome}
        </h3>

        <div className="mt-3">
          <p className="text-xs text-muted-foreground line-through">{brl(precoDe)}</p>
          <p className="font-display text-xl font-extrabold text-purple">
            {brl(produto.precoUnitario)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            ou 3x de {brl(parcela)} sem juros
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald">
            Atacado {brl(produto.precoAtacado)} acima de {produto.minimoAtacado} {produto.unidade}
          </p>
        </div>

        <button
          onClick={() => onAdicionar(produto)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-bold text-brand-foreground transition-transform hover:scale-[1.03]"
        >
          <ShoppingBag className="size-4" /> Comprar
        </button>
      </div>
    </article>
  );
}
