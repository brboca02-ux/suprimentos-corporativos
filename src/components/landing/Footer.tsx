import { Boxes, Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { CATEGORIAS, EMPRESA } from "@/data/catalogo";
import { abrirWhatsapp, MSG_B2B } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer id="contato" className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-navy text-amber">
              <Boxes className="size-5" />
            </span>
            <span className="font-display text-lg font-extrabold text-navy">{EMPRESA.nome}</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Distribuidora e papelaria multissetorial: suprimentos corporativos, embalagens e
            material escolar com atendimento consultivo.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {EMPRESA.razaoSocial}
            <br />
            CNPJ {EMPRESA.cnpj}
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy">
            Categorias
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {CATEGORIAS.filter((c) => c.id !== "todos").map((c) => (
              <li key={c.id}>
                <a href="#catalogo" className="transition-colors hover:text-amber">
                  {c.label}
                </a>
              </li>
            ))}
            <li>
              <button onClick={() => abrirWhatsapp(MSG_B2B)} className="hover:text-amber">
                Política de faturamento B2B
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy">
            Central de atendimento
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-amber" /> {EMPRESA.telefone}
            </li>
            <li>
              <button
                onClick={() => abrirWhatsapp(MSG_B2B)}
                className="flex items-center gap-2 hover:text-amber"
              >
                <MessageCircle className="size-4 shrink-0 text-emerald" /> WhatsApp exclusivo B2B
              </button>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-amber" /> {EMPRESA.email}
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-amber" /> {EMPRESA.horario}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy">
            Loja física & depósito
          </h3>
          <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-amber" /> {EMPRESA.endereco}
          </p>
          <a
            href={EMPRESA.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-ice transition-transform hover:scale-[1.03]"
          >
            Como chegar
          </a>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {EMPRESA.nome}. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald" /> Site seguro • NF-e autorizada • Dados
            protegidos (LGPD)
          </p>
        </div>
      </div>
    </footer>
  );
}
