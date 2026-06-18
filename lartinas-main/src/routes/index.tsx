import { createFileRoute, Link } from "@tanstack/react-router";
import { Home as HomeIcon, Sparkles, ShieldCheck, CreditCard, Smartphone, Globe2, Check } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import heroCasa from "@/assets/home-hero-casa.jpg";
import communityImg from "@/assets/home-community.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lartinas — Coliving feminino curado no Rio de Janeiro" },
      {
        name: "description",
        content:
          "Sua casa no Rio com curadoria, suporte e comunidade. Coliving feminino com casas selecionadas, matching de perfis e suporte completo.",
      },
      { property: "og:title", content: "Lartinas — Coliving feminino curado no Rio de Janeiro" },
      {
        property: "og:description",
        content: "Brazilian soul, global people. Casas selecionadas, comunidade vibrante, suporte total.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: HomeIcon,
    title: "Casas Selecionadas",
    desc: "Curadoria rigorosa de imóveis em localizações estratégicas com estrutura completa para o seu bem-estar.",
    tone: "peach",
  },
  {
    icon: Sparkles,
    title: "Matching Inteligente",
    desc: "Conectamos você com casas e pessoas compatíveis com seu estilo de vida, rotina e preferências.",
    tone: "sage",
  },
  {
    icon: ShieldCheck,
    title: "Suporte Completo",
    desc: "Da assinatura do contrato à manutenção, cuidamos de tudo para que você foque apenas em viver a cidade.",
    tone: "terracotta",
  },
  {
    icon: CreditCard,
    title: "Pagamentos Simples",
    desc: "Mensalidades, cauções e reservas organizadas em um único lugar. Transparência total.",
    tone: "peach",
  },
  {
    icon: Smartphone,
    title: "Portal Pessoal",
    desc: "Acesse contrato, pagamentos, regras da casa e abra chamados de manutenção quando precisar.",
    tone: "sage",
  },
  {
    icon: Globe2,
    title: "Comunidade Global",
    desc: "Conecte-se com pessoas do mundo todo, participe de eventos e descubra o Rio como um local.",
    tone: "terracotta",
  },
] as const;

const stats = [
  { value: "250+", label: "Moradoras" },
  { value: "12", label: "Países" },
  { value: "05", label: "Anos de história" },
  { value: "100%", label: "Suporte ativo" },
];

const moradoras = [
  "Perfil compatível com a casa",
  "Processo 100% transparente e digital",
  "Suporte durante toda estadia",
  "Eventos e conexões locais",
];

const proprietarios = [
  "Gestão profissional ponta-a-ponta",
  "Relatórios mensais de performance",
  "Manutenção preventiva rigorosa",
  "Transparência total nos repasses",
];

const toneClass: Record<"peach" | "sage" | "terracotta", string> = {
  peach: "bg-brand-peach/25 text-brand-orange",
  sage: "bg-brand-sage/20 text-brand-green",
  terracotta: "bg-brand-orange/15 text-brand-orange",
};

function Home() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-paper">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-12 lg:grid-cols-12 lg:pt-20">
          <div className="lg:col-span-6 lg:pr-6">
            <span className="mb-4 block text-xs font-semibold uppercase italic tracking-[0.25em] text-brand-orange">
              Brazilian soul, global people
            </span>
            <h1 className="font-display text-5xl leading-[0.95] text-brand-green sm:text-6xl lg:text-7xl">
              Sua casa no Rio com{" "}
              <span className="italic text-brand-orange">curadoria</span>.
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-foreground/70">
              Mais do que um quarto: uma experiência completa de moradia compartilhada no Rio de Janeiro, com casas selecionadas e suporte em cada etapa.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/candidatura"
                className="rounded-xl bg-brand-green px-8 py-4 text-base font-semibold text-white shadow-xl shadow-brand-green/15 transition-all hover:-translate-y-0.5 hover:bg-brand-green/90"
              >
                Encontre Sua Casa
              </Link>
              <Link
                to="/proprietarios"
                className="rounded-xl border-2 border-brand-green/80 px-8 py-4 text-base font-semibold text-brand-green transition-all hover:bg-brand-green/5"
              >
                Sou Proprietário
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-brand-peach/40 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl shadow-2xl rotate-1 transition-transform duration-700 hover:rotate-0">
              <img
                src={heroCasa}
                alt="Sala iluminada de uma casa Lartinas no Rio de Janeiro com vista para o Corcovado"
                width={1280}
                height={896}
                className="h-[420px] w-full object-cover sm:h-[520px] lg:h-[600px]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent p-8">
                <p className="font-display text-2xl text-white">Casa Ipanema, Unidade 04</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 rounded-2xl bg-brand-sage p-6 text-white shadow-xl sm:-right-6 sm:p-8">
              <div className="flex flex-col gap-1">
                <span className="font-display text-3xl sm:text-4xl">15+</span>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-80">Casas ativas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/60 bg-white py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 text-center md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl text-brand-green sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-brand-paper py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="font-display text-4xl text-brand-green sm:text-5xl">Como Funciona</h2>
            <div className="mx-auto mt-6 h-1 w-20 bg-brand-orange" />
            <p className="mx-auto mt-8 max-w-xl text-base text-foreground/65">
              Uma jornada completa, do primeiro contato até a sua melhor experiência morando no Rio.
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-3xl border border-transparent p-8 transition-all hover:-translate-y-1 hover:border-border/60 hover:bg-white hover:shadow-2xl"
              >
                <div
                  className={`mb-7 grid h-14 w-14 place-items-center rounded-2xl transition-transform group-hover:scale-110 ${toneClass[f.tone]}`}
                >
                  <f.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="mb-3 font-display text-2xl text-brand-green">{f.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/70">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMUNIDADE */}
      <section className="relative overflow-hidden bg-brand-green py-28 text-white">
        <div className="absolute right-0 top-0 hidden h-full w-1/3 -skew-x-12 translate-x-20 bg-brand-orange/10 lg:block" />
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2">
          <div>
            <h2 className="mb-10 font-display text-4xl leading-tight sm:text-5xl">
              Faça parte da nossa comunidade vibrante
            </h2>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-brand-peach">
                  Para Moradoras
                </h3>
                <ul className="mb-8 space-y-3">
                  {moradoras.map((m) => (
                    <li key={m} className="flex items-start gap-3 text-sm font-light text-white/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-peach" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/candidatura"
                  className="block w-full rounded-lg bg-brand-orange py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-orange/90"
                >
                  Candidate-se Agora
                </Link>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
                <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-brand-sage">
                  Para Proprietários
                </h3>
                <ul className="mb-8 space-y-3">
                  {proprietarios.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm font-light text-white/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/proprietarios"
                  className="block w-full rounded-lg border border-white/40 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
                >
                  Cadastre seu Imóvel
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <img
              src={communityImg}
              alt="Moradoras Lartinas conversando em uma sala compartilhada no Rio"
              width={1024}
              height={1280}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-brand-paper py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-[3rem] bg-brand-orange p-12 text-center text-white shadow-2xl shadow-brand-orange/30 sm:p-16">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-brand-green/30 blur-3xl" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
                Pronto para encontrar sua casa no Rio?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed opacity-90">
                Comece sua jornada com a Lartinas hoje. Preencha seu perfil e descubra as melhores opções selecionadas para você.
              </p>
              <Link
                to="/candidatura"
                className="mt-10 inline-block rounded-full bg-white px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] text-brand-orange shadow-2xl transition-all hover:-translate-y-1"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
