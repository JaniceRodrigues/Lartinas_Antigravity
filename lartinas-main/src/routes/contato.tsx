import { createFileRoute } from "@tanstack/react-router";
import { Mail, Instagram, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/contato")({
  component: Contato,
  head: () => ({ meta: [{ title: "Contato — Lartinas" }] }),
});

function Contato() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Fala com a gente</p>
        <h1 className="mt-3 font-display text-5xl font-semibold sm:text-6xl">Estamos por aqui.</h1>
        <p className="mt-4 text-foreground/70">A gente responde rapidinho, prometido.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Mail, label: "E-mail", value: "ola@lartinas.com.br", href: "mailto:ola@lartinas.com.br" },
            { icon: MessageCircle, label: "WhatsApp", value: "(21) 99999-9999", href: "#" },
            { icon: Instagram, label: "Instagram", value: "@lartinas", href: "https://instagram.com" },
          ].map((c) => (
            <a key={c.label} href={c.href} className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-warm">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-sunset text-primary-foreground shadow-warm">
                <c.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
              <p className="mt-1 font-medium">{c.value}</p>
            </a>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
