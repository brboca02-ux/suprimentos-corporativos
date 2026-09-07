import { useState } from "react";
import { Building2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { abrirWhatsapp, msgCotacao } from "@/lib/whatsapp";
import type { Perfil } from "@/data/catalogo";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfil: Perfil;
};

export function QuoteModal({ open, onOpenChange, perfil }: Props) {
  const corporativo = perfil === "corporativo";
  const [empresa, setEmpresa] = useState("");
  const [whats, setWhats] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [itens, setItens] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.trim() || !whats.trim() || !itens.trim()) {
      toast.error("Preencha nome, WhatsApp e os itens desejados.");
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      abrirWhatsapp(msgCotacao({ empresa, whatsapp: whats, cnpj, itens, corporativo }));
      setEnviando(false);
      onOpenChange(false);
      toast.success("Cotação montada! Finalize o envio no WhatsApp.");
    }, 600);
  };

  const campo =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-amber focus:ring-2 focus:ring-amber/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl text-navy">
            <Building2 className="size-5 text-amber" />
            {corporativo ? "Cotação B2B em 1 minuto" : "Cotação rápida"}
          </DialogTitle>
          <DialogDescription>
            {corporativo
              ? "Envie sua lista e receba a melhor proposta com faturamento a prazo."
              : "Envie sua lista de materiais e receba o preço no WhatsApp."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-3">
          <input
            className={campo}
            placeholder={corporativo ? "Empresa / Responsável" : "Seu nome"}
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={campo}
              placeholder="WhatsApp com DDD"
              value={whats}
              onChange={(e) => setWhats(e.target.value)}
            />
            <input
              className={campo}
              placeholder="CNPJ (opcional)"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
          </div>
          <textarea
            className={`${campo} min-h-28 resize-y`}
            placeholder={"Cole os itens, um por linha:\n5x Papel A4 Chamex\n2x Fita Crepe 48mm"}
            value={itens}
            onChange={(e) => setItens(e.target.value)}
          />
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-semibold text-amber-foreground shadow-sm transition-all hover:brightness-105 disabled:opacity-70"
          >
            {enviando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Enviar cotação pelo WhatsApp
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
