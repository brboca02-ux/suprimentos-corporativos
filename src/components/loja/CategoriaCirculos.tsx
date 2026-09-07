import { Armchair, Backpack, Boxes, FileText, PenLine } from "lucide-react";
import { CATEGORIAS, type Categoria } from "@/data/catalogo";

const ICONE: Record<Categoria, typeof FileText> = {
  escritorio: FileText,
  embalagens: Boxes,
  escrita: PenLine,
  escolar: Backpack,
  organizacao: Armchair,
};

const CURTO: Record<Categoria, string> = {
  escritorio: "Escritório",
  embalagens: "Embalagens",
  escrita: "Escrita",
  escolar: "Escolar",
  organizacao: "Organização",
};

export function CategoriaCirculos({ onSelecionar }: { onSelecionar: (c: Categoria) => void }) {
  return (
    <section className="bg-background py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-center font-display text-2xl font-extrabold text-ink sm:text-3xl">
          Navegue por categoria
        </h2>
        <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-5">
          {CATEGORIAS.filter((c) => c.id !== "todos").map((c) => {
            const id = c.id as Categoria;
            const Icone = ICONE[id];
            return (
              <button
                key={c.id}
                onClick={() => onSelecionar(id)}
                className="group flex flex-col items-center gap-3"
              >
                <span className="grid size-20 place-items-center rounded-full bg-ice text-ink transition-all group-hover:-translate-y-1 group-hover:bg-brand group-hover:text-brand-foreground group-hover:shadow-lg sm:size-24">
                  <Icone className="size-8 sm:size-9" />
                </span>
                <span className="text-center text-xs font-semibold text-ink sm:text-sm">
                  {CURTO[id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
