import { useEffect, useRef, useState } from "react";
import { SEGMENTOS } from "@/data/catalogo";

const METRICAS = [
  { valor: 15, sufixo: " anos", prefixo: "+", label: "de história no mercado" },
  { valor: 1200, sufixo: "", prefixo: "+", label: "empresas e escritórios atendidos" },
  { valor: 5000, sufixo: "", prefixo: "+", label: "itens disponíveis a pronta entrega" },
  { valor: 99.4, sufixo: "%", prefixo: "", label: "de entregas no prazo acordado" },
];

function Contador({ alvo, prefixo, sufixo }: { alvo: number; prefixo: string; sufixo: string }) {
  const [valor, setValor] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const inicio = performance.now();
        const passo = (agora: number) => {
          const t = Math.min((agora - inicio) / 1200, 1);
          setValor(alvo * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [alvo]);

  const formatado = Number.isInteger(alvo)
    ? Math.round(valor).toLocaleString("pt-BR")
    : valor.toFixed(1).replace(".", ",");

  return (
    <p ref={ref} className="font-display text-4xl font-extrabold text-amber">
      {prefixo}
      {formatado}
      {sufixo}
    </p>
  );
}

export function ProvaSocial() {
  return (
    <section id="sobre" className="bg-navy py-16 text-ice">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {METRICAS.map((m) => (
            <div key={m.label} className="text-center">
              <Contador alvo={m.valor} prefixo={m.prefixo} sufixo={m.sufixo} />
              <p className="mt-2 text-sm text-ice/65">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ice/45">
            Segmentos que confiam na nossa operação
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {SEGMENTOS.map((s) => (
              <span
                key={s}
                className="rounded-xl border border-ice/15 bg-ice/[0.06] px-5 py-3 text-sm font-semibold text-ice/80 transition-colors hover:border-amber/50 hover:text-ice"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
