import { FileText, TrendingDown, Truck, Timer } from "lucide-react";

const ITENS = [
  {
    icone: FileText,
    titulo: "Faturamento para Empresas",
    texto: "Boleto a prazo de 28/45 dias e emissão instantânea de NF-e.",
  },
  {
    icone: TrendingDown,
    titulo: "Preço Progressivo de Atacado",
    texto: "Descontos escalonados conforme o volume da sua compra.",
  },
  {
    icone: Truck,
    titulo: "Entrega Própria & Expressa",
    texto: "Logística própria para reposição sem atraso na operação.",
  },
  {
    icone: Timer,
    titulo: "Cotação de Lista em 2 Horas",
    texto: "Envie sua planilha e receba a melhor proposta no mesmo dia.",
  },
];

export function TrustBar() {
  return (
    <section className="bg-ice py-12">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITENS.map(({ icone: Icone, titulo, texto }) => (
          <div
            key={titulo}
            className="group rounded-2xl border border-border bg-background p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-navy text-amber transition-colors group-hover:bg-amber group-hover:text-amber-foreground">
              <Icone className="size-5" />
            </div>
            <h3 className="font-display text-base font-bold text-navy">{titulo}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
