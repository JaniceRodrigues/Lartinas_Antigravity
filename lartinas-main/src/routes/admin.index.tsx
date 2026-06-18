import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox, Wrench, Building2, FileText, CreditCard, ClipboardCheck, UserPlus, AlertCircle, BadgeCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [stats, setStats] = useState({
    leads: 0, apps: 0, contracts: 0, mrr: 0,
    overdue: 0, inspections: 0, tickets: 0, rooms: 0,
  });
  const [alerts, setAlerts] = useState<{ renewals: any[]; proofs: any[] }>({ renewals: [], proofs: [] });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
  }, [user]);

  useEffect(() => {
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const today = new Date();
    const in30 = new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);

    Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "novo"),
      supabase.from("applications").select("id", { count: "exact", head: true }).in("status", ["nova", "em_analise"]),
      supabase.from("contracts").select("id", { count: "exact", head: true }).eq("status", "ativo"),
      supabase.from("payments").select("amount").eq("status", "pago").gte("paid_at", monthStart.toISOString()),
      supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "atrasado"),
      supabase.from("inspections").select("id", { count: "exact", head: true }).in("status", ["agendada", "pendencias"]),
      supabase.from("tickets").select("id", { count: "exact", head: true }).in("status", ["aberto", "em_andamento"]),
      supabase.from("rooms").select("id", { count: "exact", head: true }).eq("status", "disponivel"),
      supabase.from("contracts").select("id, end_date, profiles:tenant_id(full_name), rooms(name, apartments(name))").eq("status", "ativo").not("end_date", "is", null).gte("end_date", todayStr).lte("end_date", in30),
      supabase.from("payments").select("id, amount, due_date, contracts(profiles:tenant_id(full_name))").not("proof_url", "is", null).or("proof_validation_status.is.null,proof_validation_status.eq.pendente").limit(10),
    ]).then(([l, a, c, mrr, od, ins, t, r, ren, pr]) => {
      const mrrSum = (mrr.data ?? []).reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
      setStats({
        leads: l.count || 0, apps: a.count || 0, contracts: c.count || 0, mrr: mrrSum,
        overdue: od.count || 0, inspections: ins.count || 0, tickets: t.count || 0, rooms: r.count || 0,
      });
      setAlerts({ renewals: ren.data || [], proofs: pr.data || [] });
    });
  }, []);

  const cards = [
    { icon: UserPlus, label: "Leads novos", value: stats.leads, tone: "primary" as const },
    { icon: Inbox, label: "Candidaturas em análise", value: stats.apps, tone: "accent" as const },
    { icon: FileText, label: "Contratos ativos", value: stats.contracts, tone: "leaf" as const },
    { icon: CreditCard, label: "Recebido no mês", value: `R$ ${stats.mrr.toLocaleString("pt-BR")}`, tone: "amber" as const },
    { icon: CreditCard, label: "Pagamentos atrasados", value: stats.overdue, tone: "primary" as const },
    { icon: ClipboardCheck, label: "Vistorias pendentes", value: stats.inspections, tone: "grape" as const },
    { icon: Wrench, label: "Chamados abertos", value: stats.tickets, tone: "accent" as const },
    { icon: Building2, label: "Quartos disponíveis", value: stats.rooms, tone: "leaf" as const },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Painel"
        title={profile?.full_name || user?.email}
      />

      {(alerts.renewals.length > 0 || alerts.proofs.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {alerts.renewals.length > 0 && (
            <div className="rounded-3xl border border-amber-300/70 bg-amber-50/60 p-5 shadow-soft dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-4 w-4" />
                <h3 className="font-display text-lg font-semibold">Contratos vencendo em 30 dias ({alerts.renewals.length})</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {alerts.renewals.slice(0, 5).map((c: any) => (
                  <li key={c.id} className="flex justify-between rounded-xl border border-amber-200/60 bg-background/60 px-3 py-2 dark:border-amber-900/30">
                    <span>{c.profiles?.full_name ?? "—"} · {c.rooms?.apartments?.name}</span>
                    <span className="text-xs text-muted-foreground">vence {c.end_date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {alerts.proofs.length > 0 && (
            <div className="rounded-3xl border border-blue-300/70 bg-blue-50/60 p-5 shadow-soft dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <BadgeCheck className="h-4 w-4" />
                <h3 className="font-display text-lg font-semibold">Comprovantes a validar ({alerts.proofs.length})</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {alerts.proofs.slice(0, 5).map((p: any) => (
                  <li key={p.id} className="flex justify-between rounded-xl border border-blue-200/60 bg-background/60 px-3 py-2 dark:border-blue-900/30">
                    <span>{p.contracts?.profiles?.full_name ?? "—"}</span>
                    <span className="text-xs text-muted-foreground">venc. {p.due_date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} tone={c.tone} />
        ))}
      </div>
    </div>
  );
}
