import { CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";

const ITENS = [
  { icone: Truck, titulo: "Entrega própria", texto: "Frete grátis acima de R$ 299" },
  { icone: CreditCard, titulo: "Parcele em 3x", texto: "Sem juros no cartão ou Pix" },
  { icone: ShieldCheck, titulo: "Compra segura", texto: "NF-e e dados protegidos" },
  { icone: Headphones, titulo: "Atendimento real", texto: "Consultor no WhatsApp" },
];

export function BeneficiosBar() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {ITENS.map(({ icone: Icone, titulo, texto }) => (
          <div key={titulo} className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ice text-brand">
              <Icone className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-ink">{titulo}</p>
              <p className="truncate text-xs text-muted-foreground">{texto}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
