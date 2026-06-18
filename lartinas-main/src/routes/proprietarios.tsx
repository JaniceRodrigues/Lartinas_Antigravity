import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/proprietarios")({
  component: Proprietarios,
  head: () => ({ meta: [{ title: "Para proprietários — Lartinas" }] }),
});

function Proprietarios() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <section className="bg-gradient-warm">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Para proprietários</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold sm:text-6xl">
            Seu imóvel transformado em <span className="italic text-primary">renda previsível</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground/70">
            A Lartinas opera coliving feminino com gestão completa: curadoria de moradoras, manutenção, comunidade e repasse mensal garantido.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="font-display text-3xl font-semibold">Por que escolher a Lartinas</h2>
          <ul className="mt-6 space-y-4">
            {[
              "Gestão integral: você não toca em nada do dia a dia",
              "Curadoria rigorosa de moradoras",
              "Manutenção preventiva e relatórios mensais",
              "Repasse fixo mensal, independentemente da ocupação",
              "Sua marca preservada, sua reputação cuidada",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 text-primary" /><span>{b}</span></li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Recebemos seu contato! Te chamamos em breve."); setSent(true); }}
          className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
        >
          <h3 className="font-display text-2xl font-semibold">Vamos conversar?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Conte sobre o seu imóvel e nossa equipe entra em contato.</p>
          {sent ? (
            <div className="mt-6 rounded-2xl bg-secondary p-4 text-sm">Obrigada! Em breve entramos em contato.</div>
          ) : (
            <div className="mt-5 space-y-4">
              <div><Label>Nome</Label><Input required className="mt-1" /></div>
              <div><Label>E-mail</Label><Input type="email" required className="mt-1" /></div>
              <div><Label>Telefone</Label><Input className="mt-1" /></div>
              <div><Label>Endereço do imóvel</Label><Input className="mt-1" /></div>
              <div><Label>Conte um pouco</Label><Textarea rows={4} className="mt-1" /></div>
              <Button type="submit" className="w-full rounded-full bg-gradient-sunset shadow-warm">Enviar</Button>
            </div>
          )}
        </form>
      </section>
    </SiteLayout>
  );
}
