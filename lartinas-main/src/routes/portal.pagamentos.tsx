import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Download, Receipt } from "lucide-react";
import { toast } from "sonner";
import { formatBRL, formatDate } from "@/lib/format";

export const Route = createFileRoute("/portal/pagamentos")({ component: Page });

const fmt = formatBRL;

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: contracts = [] } = await supabase.from("contracts").select("id").eq("tenant_id", u.user.id);
      const ids = (contracts || []).map((c: any) => c.id);
      if (!ids.length) return;
      const [p, d] = await Promise.all([
        supabase.from("payments").select("*").in("contract_id", ids).order("due_date", { ascending: false }),
        supabase.from("deposits").select("*").in("contract_id", ids),
      ]);
      setRows(p.data || []);
      setDeposits(d.data || []);
    })();
  }, []);

  const downloadProof = async (path: string) => {
    const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Meus pagamentos</h1>
        <p className="mt-1 text-muted-foreground">Histórico de mensalidades, cauções e comprovantes.</p>
      </div>

      {deposits.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Caução</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {deposits.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2">
                <div>
                  <p className="font-medium">{fmt(d.amount)}</p>
                  <p className="text-xs text-muted-foreground">Entrada {d.entry_date} · status {d.status}</p>
                </div>
                {Number(d.returned_amount) > 0 && <span className="text-emerald-600">Devolvido {fmt(d.returned_amount)}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Valor</th>
              <th className="px-4 py-3 text-left">Encargos</th>
              <th className="px-4 py-3 text-left">Vencimento</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Sem pagamentos ainda.</td></tr> :
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-3 capitalize">{r.kind}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(r.amount)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{(Number(r.late_fee) + Number(r.interest)) > 0 ? `+ ${fmt(Number(r.late_fee) + Number(r.interest))}` : "—"}</td>
                  <td className="px-4 py-3">{formatDate(r.due_date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {r.proof_url && <Button size="sm" variant="ghost" onClick={() => downloadProof(r.proof_url)} className="rounded-full"><Download className="h-3 w-3" /></Button>}
                    {r.receipt_number && <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><Receipt className="h-3 w-3" />{r.receipt_number}</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
