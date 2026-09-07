import { ArrowRight, Building2, Backpack } from "lucide-react";
import { abrirWhatsapp, MSG_B2B, MSG_CONSULTOR } from "@/lib/whatsapp";

export function BannersDuplos() {
  return (
    <section className="bg-background py-12">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 lg:grid-cols-2">
        <button
          onClick={() => abrirWhatsapp(MSG_B2B)}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple to-pink p-8 text-left text-background transition-transform hover:scale-[1.01]"
        >
          <Building2 className="mb-4 size-8" />
          <h3 className="font-display text-2xl font-extrabold leading-tight">
            Compre com CNPJ e pague depois
          </h3>
          <p className="mt-2 max-w-sm text-sm text-background/85">
            Faturamento a prazo em boleto 28/45 dias, preço de atacado e reposição programada.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-bold text-purple">
            Abrir cadastro empresarial <ArrowRight className="size-4" />
          </span>
        </button>

        <button
          onClick={() => abrirWhatsapp(MSG_CONSULTOR)}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand/70 p-8 text-left text-background transition-transform hover:scale-[1.01]"
        >
          <Backpack className="mb-4 size-8" />
          <h3 className="font-display text-2xl font-extrabold leading-tight">
            Volta às aulas: monte sua lista
          </h3>
          <p className="mt-2 max-w-sm text-sm text-background/90">
            Envie a lista da escola no WhatsApp e receba o kit completo separado em minutos.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-bold text-brand">
            Enviar minha lista <ArrowRight className="size-4" />
          </span>
        </button>
      </div>
    </section>
  );
}
