import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AddressFields, type AddressValue } from "@/components/forms/AddressFields";
import { toast } from "sonner";

export const Route = createFileRoute("/candidatura")({
  component: Candidatura,
  head: () => ({ meta: [{ title: "Candidatar-se — Lartinas" }] }),
});

type FormData = {
  full_name: string; email: string; phone: string; age: string; occupation: string;
  move_in_date: string; stay_months: string; budget_max: string;
  gender_preference: "feminina" | "mista" | "sem_preferencia";
  routine: string; sociability: string; pets: string; smoker: string; about: string;
};

const empty: FormData = {
  full_name: "", email: "", phone: "", age: "", occupation: "",
  move_in_date: "", stay_months: "", budget_max: "",
  gender_preference: "feminina",
  routine: "", sociability: "", pets: "", smoker: "", about: "",
};

function Candidatura() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(empty);
  const [address, setAddress] = useState<AddressValue>({});
  
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof FormData, v: string) => setData((d) => ({ ...d, [k]: v }));

  const steps = [
    { title: "Quem é você?", subtitle: "Vamos começar pelo básico." },
    { title: "Quando e quanto?", subtitle: "Datas e orçamento." },
    { title: "Sua vibe", subtitle: "Pra encontrarmos a casa certa." },
    { title: "Quase lá!", subtitle: "Conta um pouquinho mais." },
  ];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!user) {
      toast.error("Faça login para enviar sua candidatura.");
      navigate({ to: "/auth" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      age: data.age ? Number(data.age) : null,
      occupation: data.occupation,
      move_in_date: data.move_in_date || null,
      stay_months: data.stay_months ? Number(data.stay_months) : null,
      budget_max: data.budget_max ? Number(data.budget_max) : null,
      gender_preference: data.gender_preference,
      lifestyle: { routine: data.routine, sociability: data.sociability, pets: data.pets, smoker: data.smoker },
      answers: { about: data.about },
      status: "nova",
      cep: address.cep || null,
      street: address.street || null,
      number: address.number || null,
      complement: address.complement || null,
      neighborhood: address.neighborhood || null,
      city: address.city || null,
      state: address.state || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao enviar: " + error.message);
      return;
    }
    toast.success("Candidatura enviada!");
    setDone(true);
  };

  if (loading) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
          <p className="text-foreground/70">Carregando…</p>
        </section>
      </SiteLayout>
    );
  }


  if (done) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-sunset shadow-warm">
            <Check className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">Recebemos sua candidatura!</h1>
          <p className="mt-4 text-foreground/70">
            Em até 48h te chamamos no e-mail <strong>{data.email}</strong> com as casas que mais combinam com você.
          </p>
          <Button onClick={() => navigate({ to: "/casas" })} className="mt-8 rounded-full bg-gradient-sunset shadow-warm">Explorar casas</Button>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3 w-3 text-primary" /> Etapa {step + 1} de {steps.length}
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{steps[step].title}</h1>
          <p className="mt-2 text-foreground/70">{steps[step].subtitle}</p>
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-sunset transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Nome completo"><Input value={data.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
              <Field label="E-mail"><Input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="WhatsApp"><Input value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(21) 9..." /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Idade"><Input type="number" value={data.age} onChange={(e) => set("age", e.target.value)} /></Field>
                <Field label="Ocupação"><Input value={data.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="Designer, dev, estudante..." /></Field>
              </div>
              <div className="space-y-2 pt-2">
                <Label className="text-sm font-medium">Endereço atual</Label>
                <AddressFields value={address} onChange={setAddress} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Quando quer entrar?"><Input type="date" value={data.move_in_date} onChange={(e) => set("move_in_date", e.target.value)} /></Field>
                <Field label="Por quantos meses?"><Input type="number" value={data.stay_months} onChange={(e) => set("stay_months", e.target.value)} placeholder="6" /></Field>
              </div>
              <Field label="Orçamento máximo (R$/mês)">
                <Input type="number" value={data.budget_max} onChange={(e) => set("budget_max", e.target.value)} placeholder="3000" />
              </Field>
              <Field label="Preferência de casa">
                <Select value={data.gender_preference} onValueChange={(v) => set("gender_preference", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feminina">Só mulheres</SelectItem>
                    <SelectItem value="mista">Mista</SelectItem>
                    <SelectItem value="sem_preferencia">Sem preferência</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="Sua rotina">
                <Select value={data.routine} onValueChange={(v) => set("routine", v)}>
                  <SelectTrigger><SelectValue placeholder="Como é seu dia?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Acordo cedo, sou da manhã</SelectItem>
                    <SelectItem value="flexivel">Flexível, varia muito</SelectItem>
                    <SelectItem value="noite">Sou da noite, durmo tarde</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Sociabilidade">
                <Select value={data.sociability} onValueChange={(v) => set("sociability", v)}>
                  <SelectTrigger><SelectValue placeholder="Como você convive?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intro">Mais reservada, gosto do meu canto</SelectItem>
                    <SelectItem value="balanceada">Equilibrada</SelectItem>
                    <SelectItem value="extro">Adoro conviver, fazer planos juntas</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tem pet?">
                  <Select value={data.pets} onValueChange={(v) => set("pets", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nao">Não</SelectItem>
                      <SelectItem value="pequeno">Sim, pequeno</SelectItem>
                      <SelectItem value="grande">Sim, grande</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Fuma?">
                  <Select value={data.smoker} onValueChange={(v) => set("smoker", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nao">Não</SelectItem>
                      <SelectItem value="social">Socialmente</SelectItem>
                      <SelectItem value="sim">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Field label="Conte um pouco mais sobre você (opcional)">
                <Textarea rows={5} value={data.about} onChange={(e) => set("about", e.target.value)} placeholder="O que você procura em uma casa? O que te faz feliz?" />
              </Field>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={prev} disabled={step === 0} className="rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next} className="rounded-full bg-gradient-sunset shadow-warm" disabled={step === 0 && (!data.full_name || !data.email)}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting} className="rounded-full bg-gradient-sunset shadow-warm">
                {submitting ? "Enviando..." : "Enviar candidatura"}
              </Button>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
