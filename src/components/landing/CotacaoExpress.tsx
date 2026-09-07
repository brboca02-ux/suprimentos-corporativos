import { useState } from "react";
import { FileUp, Loader2, Paperclip, Send, Zap } from "lucide-react";
import { toast } from "sonner";
import type { Perfil } from "@/data/catalogo";
import { abrirWhatsapp, msgCotacao } from "@/lib/whatsapp";

export function CotacaoExpress({ perfil }: { perfil: Perfil }) {
  const corporativo = perfil === "corporativo";
  const [empresa, setEmpresa] = useState("");
  const [whats, setWhats] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [itens, setItens] = useState("");
  const [arquivo, setArquivo] = useState<string>("");
  const [enviando, setEnviando] = useState(false);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.trim() || !whats.trim() || !itens.trim()) {
      toast.error("Preencha nome, WhatsApp e a lista de itens.");
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      abrirWhatsapp(
        msgCotacao({ empresa, whatsapp: whats, cnpj, itens, arquivo, corporativo }),
      );
      setEnviando(false);
      toast.success("Lista pronta! Conclua o envio no WhatsApp.");
    }, 600);
  };

  const campo =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-amber focus:ring-2 focus:ring-amber/25";

  return (
    <section id="cotacao" className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-3xl border border-border bg-navy shadow-xl">
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber px-3 py-1 text-xs font-bold text-amber-foreground">
                <Zap className="size-3.5" /> Cotação Express
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-ice">
                {corporativo
                  ? "Envie a lista de suprimentos da sua empresa"
                  : "Não perca tempo na fila: envie a lista de material escolar ou de escritório pelo WhatsApp"}
              </h2>
              <p className="mt-4 text-sm text-ice/70">
                Não perca tempo adicionando item por item. Cole sua lista de materiais, anexe seu
                arquivo ou envie diretamente para nossos consultores. Resposta em até 2 horas úteis.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-ice/70">
                <li>• Proposta com preço de atacado escalonado</li>
                <li>• {corporativo ? "Faturamento a prazo via boleto" : "Pix, cartão ou balcão"}</li>
                <li>• Confirmação de pronta entrega item a item</li>
              </ul>
            </div>

            <form
              onSubmit={enviar}
              className="space-y-3 rounded-2xl bg-background p-5 shadow-lg sm:p-6"
            >
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
                className={`${campo} min-h-32 resize-y`}
                placeholder={"Cole seus itens, um por linha:\n10x Papel A4 75g\n3x Caixa de canetas azuis"}
                value={itens}
                onChange={(e) => setItens(e.target.value)}
              />
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-amber hover:text-navy">
                <span className="flex min-w-0 items-center gap-2">
                  <Paperclip className="size-4 shrink-0" />
                  <span className="truncate">{arquivo || "Anexar PDF ou Excel da sua lista"}</span>
                </span>
                <FileUp className="size-4 shrink-0" />
                <input
                  type="file"
                  accept=".pdf,.xls,.xlsx,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setArquivo(f.name);
                      toast.success("Arquivo selecionado: " + f.name);
                    }
                  }}
                />
              </label>
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald px-5 py-3.5 text-sm font-bold text-emerald-foreground shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-70"
              >
                {enviando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Enviar lista pelo WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
