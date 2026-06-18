import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const fmt = (n: number) => `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export function ReportsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("payments")
        .select("id, amount, status, due_date, paid_at, kind, contracts(id, monthly_value, rooms(name, apartments(name)), profiles:tenant_id(full_name))")
        .order("due_date", { ascending: false })
        .limit(2000);
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const inadimplencia = useMemo(() => {
    const late = rows.filter((p) => p.status === "atrasado" || (p.status === "pendente" && p.due_date < todayStr));
    const map = new Map<string, { tenant: string; casa: string; total: number; count: number }>();
    late.forEach((p) => {
      const tenant = p.contracts?.profiles?.full_name ?? "—";
      const casa = `${p.contracts?.rooms?.apartments?.name ?? ""} · ${p.contracts?.rooms?.name ?? ""}`;
      const key = p.contracts?.id ?? p.id;
      const cur = map.get(key) ?? { tenant, casa, total: 0, count: 0 };
      cur.total += Number(p.amount); cur.count += 1;
      map.set(key, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [rows]);

  const receitaPorImovel = useMemo(() => {
    const start = new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString().slice(0, 10);
    const map = new Map<string, number>();
    rows.filter((p) => p.status === "pago" && p.paid_at && p.paid_at.slice(0, 10) >= start).forEach((p) => {
      const key = p.contracts?.rooms?.apartments?.name ?? "—";
      map.set(key, (map.get(key) ?? 0) + Number(p.amount));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const caixa90d = useMemo(() => {
    const end = new Date(today.getTime() + 90 * 86400000).toISOString().slice(0, 10);
    const buckets = [0, 30, 60, 90].map((d) => {
      const from = new Date(today.getTime() + (d - 30) * 86400000).toISOString().slice(0, 10);
      const to = new Date(today.getTime() + d * 86400000).toISOString().slice(0, 10);
      const sum = rows.filter((p) => p.status === "pendente" && p.due_date >= from && p.due_date <= to).reduce((s, p) => s + Number(p.amount), 0);
      return { label: d === 0 ? "vencido" : `+${d}d`, sum };
    });
    const total = rows.filter((p) => p.status === "pendente" && p.due_date <= end).reduce((s, p) => s + Number(p.amount), 0);
    return { buckets, total };
  }, [rows]);

  if (loading) return <p className="text-sm text-muted-foreground">Carregando relatórios…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl">Inadimplência por contrato</h2>
        <p className="text-sm text-muted-foreground">Pendentes vencidos + status atrasado.</p>
        <table className="mt-4 w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground"><tr><th className="text-left py-2">Moradora</th><th className="text-left">Casa</th><th className="text-right">Cobranças</th><th className="text-right">Total</th></tr></thead>
          <tbody>
            {inadimplencia.length === 0 ? <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Sem inadimplência 🎉</td></tr> :
              inadimplencia.map((r, i) => (
                <tr key={i} className="border-t border-border/60"><td className="py-2">{r.tenant}</td><td>{r.casa}</td><td className="text-right">{r.count}</td><td className="text-right font-semibold text-rose-600">{fmt(r.total)}</td></tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl">Receita por imóvel (6 meses)</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {receitaPorImovel.length === 0 ? <li className="text-muted-foreground">Sem receita registrada.</li> :
              receitaPorImovel.map(([k, v]) => (
                <li key={k} className="flex justify-between rounded-xl border border-border/60 px-3 py-2"><span>{k}</span><span className="font-semibold">{fmt(v)}</span></li>
              ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl">Previsão de caixa — 90 dias</h2>
          <p className="mt-1 text-sm text-muted-foreground">Total previsto: <span className="font-semibold">{fmt(caixa90d.total)}</span></p>
          <ul className="mt-4 space-y-2 text-sm">
            {caixa90d.buckets.map((b) => (
              <li key={b.label} className="flex justify-between rounded-xl border border-border/60 px-3 py-2">
                <span className="capitalize">{b.label}</span><span className="font-semibold">{fmt(b.sum)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
