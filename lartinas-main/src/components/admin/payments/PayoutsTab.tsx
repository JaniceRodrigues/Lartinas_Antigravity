import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";

const fmt = (n: number) => `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export function PayoutsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ owner_id: "", period_start: "", period_end: "", model: "percentual" as "percentual" | "liquido" | "fixo", percentage: "80", costs: "0", fixed_amount: "", notes: "" });
  const [preview, setPreview] = useState<{ revenue: number; payments: any[] } | null>(null);

  const load = async () => {
    const [p, o] = await Promise.all([
      supabase.from("owner_payouts").select("*, owners(profile_id, profiles:profile_id(full_name))").order("period_end", { ascending: false }),
      supabase.from("owners").select("id, profile_id, profiles:profile_id(full_name)"),
    ]);
    setRows(p.data || []);
    setOwners(o.data || []);
  };
  useEffect(() => { load(); }, []);

  const calcPreview = async () => {
    if (!form.owner_id || !form.period_start || !form.period_end) return toast.error("Preencha período e proprietário");
    const { data: contracts = [] } = await supabase.from("contracts").select("id").eq("owner_id", form.owner_id);
    const ids = (contracts || []).map((c: any) => c.id);
    if (ids.length === 0) { setPreview({ revenue: 0, payments: [] }); return; }
    const { data: pays = [] } = await supabase.from("payments").select("id, amount, kind, paid_at, contract_id").in("contract_id", ids).eq("status", "pago").gte("paid_at", `${form.period_start}T00:00:00`).lte("paid_at", `${form.period_end}T23:59:59`);
    const revenue = (pays || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
    setPreview({ revenue, payments: pays || [] });
  };

  const save = async () => {
    if (!preview && form.model !== "fixo") return toast.error("Calcule o preview primeiro");
    if (new Date(form.period_end) >= new Date()) return toast.error("Período ainda não fechou");
    const gross = form.model === "fixo" ? Number(form.fixed_amount) : (preview?.revenue || 0);
    const costs = Number(form.costs);
    let final = 0;
    if (form.model === "fixo") final = gross;
    else if (form.model === "liquido") final = gross - costs;
    else final = (gross * Number(form.percentage)) / 100;

    const { data: payout, error } = await supabase.from("owner_payouts").insert({
      owner_id: form.owner_id, period_start: form.period_start, period_end: form.period_end,
      model: form.model, percentage: form.model === "percentual" ? Number(form.percentage) : null,
      gross_revenue: gross, costs, final_amount: final, notes: form.notes || null,
    }).select("id").single();
    if (error) return toast.error(error.message);

    if (preview) {
      const items: any[] = preview.payments.map((p) => ({ payout_id: payout.id, kind: "receita", payment_id: p.id, description: p.kind, amount: Number(p.amount) }));
      if (costs > 0) items.push({ payout_id: payout.id, kind: "custo", payment_id: null, description: "Custos abatidos", amount: costs });
      if (items.length) await supabase.from("owner_payout_items").insert(items);
    }
    toast.success("Repasse criado");
    setOpen(false); setPreview(null);
    setForm({ owner_id: "", period_start: "", period_end: "", model: "percentual", percentage: "80", costs: "0", fixed_amount: "", notes: "" });
    load();
  };

  const markPaid = async (id: string, file?: File) => {
    let path = null;
    if (file) {
      path = `payouts/${id}-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("payment-proofs").upload(path, file);
      if (error) return toast.error(error.message);
    }
    const { error } = await supabase.from("owner_payouts").update({ status: "pago", paid_at: new Date().toISOString(), proof_url: path ?? undefined }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Repasse marcado como pago");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setPreview(null); }}>
          <DialogTrigger asChild><Button className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-1 h-4 w-4" />Novo repasse</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl">
            <DialogHeader><DialogTitle>Novo repasse ao proprietário</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Proprietário</Label>
                <select value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="">Selecione...</option>
                  {owners.map((o) => <option key={o.id} value={o.id}>{o.profiles?.full_name ?? o.id.slice(0, 6)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Início</Label><Input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} className="mt-1" /></div>
                <div><Label>Fim</Label><Input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} className="mt-1" /></div>
              </div>
              <div>
                <Label>Modelo</Label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {(["percentual", "liquido", "fixo"] as const).map((m) => (
                    <button key={m} onClick={() => setForm({ ...form, model: m })} className={`rounded-full border px-3 py-2 text-xs capitalize ${form.model === m ? "border-primary bg-primary/10" : "border-border"}`}>{m}</button>
                  ))}
                </div>
              </div>
              {form.model === "percentual" && <div><Label>% do proprietário</Label><Input type="number" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} className="mt-1" /></div>}
              {form.model === "liquido" && <div><Label>Custos a abater</Label><Input type="number" value={form.costs} onChange={(e) => setForm({ ...form, costs: e.target.value })} className="mt-1" /></div>}
              {form.model === "fixo" && <div><Label>Valor fixo</Label><Input type="number" value={form.fixed_amount} onChange={(e) => setForm({ ...form, fixed_amount: e.target.value })} className="mt-1" /></div>}

              {form.model !== "fixo" && (
                <div className="space-y-2">
                  <Button variant="outline" onClick={calcPreview} className="w-full rounded-full">Calcular receita do período</Button>
                  {preview && (
                    <div className="rounded-2xl bg-muted/40 p-3 text-sm">
                      <p>Receita bruta: <b>{fmt(preview.revenue)}</b> ({preview.payments.length} pagamento(s))</p>
                      {form.model === "liquido" && <p>Custos: <b>{fmt(Number(form.costs))}</b></p>}
                      <p className="mt-1 text-base">Final: <b>{fmt(form.model === "liquido" ? preview.revenue - Number(form.costs) : (preview.revenue * Number(form.percentage)) / 100)}</b></p>
                    </div>
                  )}
                </div>
              )}

              <div><Label>Notas</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" /></div>
              <Button onClick={save} className="w-full rounded-full bg-gradient-sunset shadow-warm">Criar repasse</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Proprietário</th>
              <th className="px-4 py-3 text-left">Período</th>
              <th className="px-4 py-3 text-left">Modelo</th>
              <th className="px-4 py-3 text-left">Receita</th>
              <th className="px-4 py-3 text-left">Final</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Nenhum repasse.</td></tr> :
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-medium">{r.owners?.profiles?.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{r.period_start} → {r.period_end}</td>
                  <td className="px-4 py-3 capitalize">{r.model}</td>
                  <td className="px-4 py-3">{fmt(r.gross_revenue)}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(r.final_amount)}</td>
                  <td className="px-4 py-3"><span className="capitalize">{r.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "pendente" && (
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1 text-xs">
                        <Upload className="h-3 w-3" />Pagar c/ comprovante
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && markPaid(r.id, e.target.files[0])} />
                      </label>
                    )}
                    {r.status === "pendente" && (
                      <Button size="sm" variant="ghost" className="ml-1 rounded-full" onClick={() => markPaid(r.id)}><CheckCircle2 className="h-3 w-3" /></Button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
