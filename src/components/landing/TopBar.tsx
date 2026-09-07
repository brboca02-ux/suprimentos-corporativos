import { BadgeCheck, ArrowRight } from "lucide-react";
import { abrirWhatsapp, MSG_B2B } from "@/lib/whatsapp";

export function TopBar() {
  return (
    <div className="bg-navy text-ice">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-2.5 text-center text-xs sm:flex-row sm:justify-center sm:text-[13px]">
        <p className="flex items-center gap-2 text-ice/85">
          <BadgeCheck className="size-4 shrink-0 text-amber" />
          <span>
            Atendimento corporativo exclusivo com <strong>faturamento a prazo via boleto</strong> |
            resposta rápida no WhatsApp
          </span>
        </p>
        <button
          onClick={() => abrirWhatsapp(MSG_B2B)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber px-3 py-1 font-semibold text-amber-foreground transition-transform hover:scale-105"
        >
          Canal B2B <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
