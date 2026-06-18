import { ArrowDownCircle, ArrowUpCircle, AlertTriangle, Wallet } from "lucide-react";

const fmt = (n: number) => `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export function FinancialKPIs({ entries }: { entries: any[] }) {
  const sum = (filter: (e: any) => boolean) => entries.filter(filter).reduce((a, b) => a + Number(b.amount || 0), 0);

  const aReceber = sum((e) => e.type === "receber" && (e.status === "pendente" || e.status === "vencido"));
  const aPagar = sum((e) => e.type === "pagar" && (e.status === "pendente" || e.status === "vencido"));
  const recebidoMes = sum((e) => e.type === "receber" && e.status === "pago");
  const vencidos = entries.filter((e) => e.status === "vencido").length;

  const cards = [
    { label: "A receber", value: fmt(aReceber), icon: ArrowDownCircle, tone: "from-emerald-500/20 to-emerald-500/5", color: "text-emerald-600" },
    { label: "A pagar", value: fmt(aPagar), icon: ArrowUpCircle, tone: "from-rose-500/20 to-rose-500/5", color: "text-rose-600" },
    { label: "Recebido", value: fmt(recebidoMes), icon: Wallet, tone: "from-primary/20 to-primary/5", color: "text-primary" },
    { label: "Vencidos", value: String(vencidos), icon: AlertTriangle, tone: "from-amber-500/20 to-amber-500/5", color: "text-amber-600" },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className={`rounded-3xl border border-border bg-gradient-to-br ${c.tone} p-5 shadow-soft`}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</span>
              <Icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div className="mt-3 font-display text-2xl font-semibold">{c.value}</div>
          </div>
        );
      })}
    </div>
  );
}
