import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, AlertCircle, Clock, Wallet } from "lucide-react";

const fmt = (n: number) => `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export function PaymentsDashboard() {
  const [data, setData] = useState<any>({ toReceive: 0, received: 0, lateCount: 0, lateAmount: 0, next30: 0, byStatus: {}, upcoming: [], lateList: [] });

  useEffect(() => {
    (async () => {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
      const next30 = new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10);
      const todayStr = today.toISOString().slice(0, 10);

      const { data: rows = [] } = await supabase
        .from("payments")
        .select("id, amount, status, due_date, kind, contract_id, contracts(rooms(name, apartments(name)))")
        .order("due_date", { ascending: true });

      const all = rows || [];
      const toReceive = all.filter((p: any) => p.status === "pendente" && p.due_date >= monthStart && p.due_date <= monthEnd).reduce((s: number, p: any) => s + Number(p.amount), 0);
      const received = all.filter((p: any) => p.status === "pago" && p.due_date >= monthStart && p.due_date <= monthEnd).reduce((s: number, p: any) => s + Number(p.amount), 0);
      const lateAll = all.filter((p: any) => (p.status === "atrasado") || (p.status === "pendente" && p.due_date < todayStr));
      const next30Sum = all.filter((p: any) => p.status === "pendente" && p.due_date >= todayStr && p.due_date <= next30).reduce((s: number, p: any) => s + Number(p.amount), 0);
      const byStatus: any = {};
      all.forEach((p: any) => { byStatus[p.status] = (byStatus[p.status] || 0) + Number(p.amount); });
      const upcoming = all.filter((p: any) => p.status === "pendente" && p.due_date >= todayStr).slice(0, 5);
      const lateList = lateAll.slice(0, 5);

      setData({ toReceive, received, lateCount: lateAll.length, lateAmount: lateAll.reduce((s: number, p: any) => s + Number(p.amount), 0), next30: next30Sum, byStatus, upcoming, lateList });
    })();
  }, []);

  const cards = [
    { label: "A receber este mês", value: fmt(data.toReceive), icon: Wallet, tone: "from-blue-500/20 to-blue-500/5 text-blue-700 dark:text-blue-300" },
    { label: "Recebido este mês", value: fmt(data.received), icon: TrendingUp, tone: "from-emerald-500/20 to-emerald-500/5 text-emerald-700 dark:text-emerald-300" },
    { label: `Atrasados (${data.lateCount})`, value: fmt(data.lateAmount), icon: AlertCircle, tone: "from-rose-500/20 to-rose-500/5 text-rose-700 dark:text-rose-300" },
    { label: "Previsão 30 dias", value: fmt(data.next30), icon: Clock, tone: "from-amber-500/20 to-amber-500/5 text-amber-700 dark:text-amber-300" },
  ];

  const totalByStatus = Object.values(data.byStatus).reduce((s: number, v: any) => s + Number(v), 0) || 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-3xl border border-border bg-gradient-to-br ${c.tone} p-5 shadow-soft`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider opacity-80">{c.label}</p>
              <c.icon className="h-4 w-4 opacity-70" />
            </div>
            <p className="mt-3 font-display text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft lg:col-span-1">
          <h3 className="font-display text-lg font-semibold">Por status</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(data.byStatus).map(([k, v]: [string, any]) => {
              const pct = (Number(v) / Number(totalByStatus)) * 100;
              return (
                <div key={k}>
                  <div className="flex justify-between text-xs">
                    <span className="capitalize">{k}</span>
                    <span className="text-muted-foreground">{fmt(v)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-sunset" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-display text-lg font-semibold">Próximos vencimentos</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.upcoming.length === 0 && <li className="text-muted-foreground">Nada próximo.</li>}
            {data.upcoming.map((p: any) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2">
                <div>
                  <p className="font-medium capitalize">{p.kind}</p>
                  <p className="text-xs text-muted-foreground">{p.contracts?.rooms?.apartments?.name} · {p.due_date}</p>
                </div>
                <span className="text-sm font-semibold">{fmt(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-5 shadow-soft dark:border-rose-900/40 dark:bg-rose-950/20">
          <h3 className="font-display text-lg font-semibold text-rose-700 dark:text-rose-300">Atrasados críticos</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.lateList.length === 0 && <li className="text-muted-foreground">Tudo em dia 🎉</li>}
            {data.lateList.map((p: any) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl border border-rose-200/60 bg-background px-3 py-2 dark:border-rose-900/40">
                <div>
                  <p className="font-medium capitalize">{p.kind}</p>
                  <p className="text-xs text-muted-foreground">{p.contracts?.rooms?.apartments?.name} · venceu {p.due_date}</p>
                </div>
                <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">{fmt(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
