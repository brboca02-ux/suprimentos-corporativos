import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/banner-1.jpg", alt: "Mochilas que acompanham você" },
  { src: "/banner-2.jpg", alt: "Tudo para o seu escritório" },
  { src: "/banner-3.jpg", alt: "Compras com CNPJ ficam mais fáceis" },
];

export function HeroBanner({ onCta }: { onCta: () => void }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="topo" className="relative w-full overflow-hidden bg-white">
      {/* Slides */}
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === i ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            onClick={onCta}
            className="h-full w-full cursor-pointer object-fill"
          />
        </div>
      ))}

      {/* Espaçador — mantém proporção 16:5 (similar ao banner da Acapel) */}
      <div className="w-full" style={{ paddingBottom: "31.25%" }} />

      {/* Bolinhas de navegação */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Banner ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === i ? "w-8 bg-white shadow" : "w-2 bg-white/60 shadow"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
