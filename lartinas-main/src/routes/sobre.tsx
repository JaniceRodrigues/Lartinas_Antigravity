import { createFileRoute } from "@tanstack/react-router";
import { Heart, Users, MapPin, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/sobre")({
  component: Sobre,
  head: () => ({ meta: [{ title: "Sobre — Manifesto Lartinas" }] }),
});

function Sobre() {
  return (
    <SiteLayout>
      <section className="bg-gradient-warm">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Manifesto</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight sm:text-7xl">
            Casa não é endereço,<br /><span className="italic text-primary">é pertencimento.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/70">
            A Lartinas nasceu pra ser o lugar onde mulheres do mundo todo encontram alma brasileira, comunidade real e a liberdade de viver o Rio do seu jeito.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: Heart, t: "Acolhimento", d: "Cada chegada vira uma comemoração. Cada despedida, uma amizade pra vida." },
            { icon: Users, t: "Comunidade", d: "Mulheres reais, com histórias diferentes, vivendo juntas com respeito e leveza." },
            { icon: MapPin, t: "Bairros com alma", d: "Botafogo, Santa Teresa, Leblon. Cada casa é um convite a viver o Rio de verdade." },
            { icon: Sparkles, t: "Curadoria", d: "Casas, regras e moradoras escolhidas com carinho pra que tudo flua." },
          ].map((p) => (
            <div key={p.t} className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-sunset text-primary-foreground shadow-warm">
                <p.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold">{p.t}</h2>
              <p className="mt-2 text-foreground/70">{p.d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
