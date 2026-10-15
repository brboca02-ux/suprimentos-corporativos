import { MessageCircle } from "lucide-react";
import { abrirWhatsapp, MSG_CONSULTOR } from "@/lib/whatsapp";

export function FloatingWhatsapp() {
  return (
    <button
      onClick={() => abrirWhatsapp(MSG_CONSULTOR)}
      aria-label="Falar com um consultor no WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-emerald px-4 py-3.5 text-sm font-semibold text-emerald-foreground shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">Falar com consultor</span>
    </button>
  );
}
