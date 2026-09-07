import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const SLIDES = [
  {
    titulo: "MOCHILAS QUE\nACOMPANHAM VOCÊ",
    sub: "Perfeitas para todos os estilos e idades",
    cta: "COMPRAR AQUI",
    tema: "pink" as const,
  },
  {
    titulo: "TUDO PARA O SEU\nESCRITÓRIO",
    sub: "Papel, toner e suprimentos com preço de atacado",
    cta: "VER OFERTAS",
    tema: "brand" as const,
  },
  {
    titulo: "COMPRAS COM CNPJ\nFICAM MAIS FÁCEIS",
    sub: "Faturamento a prazo e entrega própria para empresas",
    cta: "FALAR COM CONSULTOR",
    tema: "roxo" as const,
  },
];

const TEMA = {
  pink: { fundo: "from-ice to-secondary", titulo: "text-purple", sub: "text-blue", btn: "bg-pink" },
  brand: { fundo: "from-ice to-secondary", titulo: "text-brand", sub: "text-ink/70", btn: "bg-brand" },
  roxo: { fundo: "from-ice to-secondary", titulo: "text-purple", sub: "text-ink/70", btn: "bg-purple" },
};

export function HeroBanner({ onCta }: { onCta: () => void }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[i]!;
  const tema = TEMA[slide.tema];

  return (
    <section id="topo" className={`relative overflow-hidden bg-gradient-to-br ${tema.fundo}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-pink/10 blur-3xl"
      />
      <div className="relative mx-auto flex min-h-[380px] max-w-7xl flex-col justify-center px-4 py-14 sm:min-h-[460px] lg:items-end lg:text-right">
        <div key={i} className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1
            className={`whitespace-pre-line font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${tema.titulo}`}
          >
            {slide.titulo}
          </h1>
          <p className={`mt-4 text-lg sm:text-2xl ${tema.sub}`}>{slide.sub}</p>
          <button
            onClick={onCta}
            className={`mt-8 inline-flex items-center gap-2 rounded-full px-9 py-4 font-display text-sm font-extrabold uppercase tracking-wide text-background shadow-lg transition-transform hover:scale-105 sm:text-base ${tema.btn}`}
          >
            {slide.cta} <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="mt-10 flex gap-2 lg:self-center">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Banner ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-8 bg-ink" : "w-3 bg-ink/25"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
