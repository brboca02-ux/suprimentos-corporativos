import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="bg-ink py-12 text-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 lg:flex-row lg:justify-between">
        <div className="flex items-center gap-4 text-center lg:text-left">
          <span className="hidden size-12 place-items-center rounded-full bg-brand text-brand-foreground sm:grid">
            <Mail className="size-6" />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold sm:text-2xl">
              Receba as ofertas antes de todo mundo
            </h2>
            <p className="text-sm text-background/70">
              Promoções de atacado, novidades e volta às aulas no seu e-mail.
            </p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes("@")) {
              toast.error("Informe um e-mail válido.");
              return;
            }
            setEmail("");
            toast.success("Pronto! Você receberá nossas ofertas.");
          }}
          className="flex w-full max-w-md gap-2"
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail"
            className="w-full rounded-full border border-background/20 bg-background/10 px-5 py-3 text-sm text-background outline-none placeholder:text-background/50 focus:border-brand"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-brand-foreground transition-transform hover:scale-105"
          >
            <Send className="size-4" /> Assinar
          </button>
        </form>
      </div>
    </section>
  );
}
