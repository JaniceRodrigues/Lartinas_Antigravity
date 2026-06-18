import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CheckCircle2, XCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import { NewManualEntryDialog } from "./NewManualEntryDialog";
import { formatBRL, formatDate } from "@/lib/format";

const fmt = formatBRL;

const ORIGIN_LABEL: Record<string, string> = {
  contrato_morador: "Contrato morador",
  contrato_proprietario: "Contrato proprietário",
  receita_avulsa: "Receita avulsa",
  despesa_avulsa: "Despesa avulsa",
};

export function FinancialEntriesTable({
  entries,
  onChanged,
  showType = false,
}: {
  entries: any[];
  onChanged: () => void;
  showType?: boolean;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [origin, setOrigin] = useState("all");
  const [editing, setEditing] = useState<any | null>(null);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (origin !== "all" && e.origin !== origin) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return [e.description, e.category, e.notes].some((v) => String(v ?? "").toLowerCase().includes(s));
    });
  }, [entries, q, status, origin]);

  async function markPaid(id: string) {
    const { error } = await supabase
      .from("financial_entries")
      .update({ status: "pago", paid_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marcado como pago");
    onChanged();
  }

  async function cancel(id: string) {
    if (!confirm("Cancelar este lançamento?")) return;
    const { error } = await supabase.from("financial_entries").update({ status: "cancelado" }).eq("id", id);
    if (error) return toast.error(error.message);
    onChanged();
  }

  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar descrição..." className="h-9 max-w-xs" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-border bg-background px-2 text-sm">
          <option value="all">Todos status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="vencido">Vencido</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="h-9 rounded-md border border-border bg-background px-2 text-sm">
          <option value="all">Todas origens</option>
          {Object.entries(ORIGIN_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} lançamentos</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              {showType && <th className="px-4 py-3 text-left font-medium">Tipo</th>}
              <th className="px-4 py-3 text-left font-medium">Descrição</th>
              <th className="px-4 py-3 text-left font-medium">Origem</th>
              <th className="px-4 py-3 text-left font-medium">Vencimento</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={showType ? 7 : 6} className="px-4 py-10 text-center text-muted-foreground">
                  Sem lançamentos.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="border-t border-border/60">
                  {showType && (
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${e.type === "receber" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/15 text-rose-700 dark:text-rose-300"}`}>
                        {e.type === "receber" ? "Receber" : "Pagar"}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="font-medium">{e.description ?? "—"}</div>
                    {e.installment_number && (
                      <div className="text-xs text-muted-foreground">Parcela {e.installment_number}/{e.installments_total}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{ORIGIN_LABEL[e.origin] ?? e.origin}</td>
                  <td className="px-4 py-3">{formatDate(e.due_date)}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(e.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(e)} className="rounded-full">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {(e.status === "pendente" || e.status === "vencido") && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => markPaid(e.id)} className="rounded-full">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />Pagar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => cancel(e.id)} className="rounded-full text-destructive">
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <NewManualEntryDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        type={editing?.type ?? "receber"}
        entry={editing}
        onSaved={() => { setEditing(null); onChanged(); }}
      />
    </div>
  );
}
