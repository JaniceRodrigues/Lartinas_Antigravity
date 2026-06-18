import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Undo2 } from "lucide-react";
import { toast } from "sonner";

const fmt = (n: number) => `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const STATUS_TONE: Record<string, string> = {
  retido: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  devolvido: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  parcial: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  usado: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
};

export function DepositsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<any>(null);
  const [form, setForm] = useState({ contract_id: "", mode: "fixo" as "fixo" | "multiplo", amount: "", multiplier: "1", expected_return_date: "" });
  const [returnForm, setReturnForm] = useState({ amount: "", justification: "", new_status: "devolvido" as "devolvido" | "parcial" | "usado" });

  const load = async () => {
    const [d, c] = await Promise.all([
      supabase.from("deposits").select("*, contracts(monthly_value, rooms(name, apartments(name)), profiles:tenant_id(full_name))").order("created_at", { ascending: false }),
      supabase.from("contracts").select("id, monthly_value, rooms(name, apartments(name)), profiles:tenant_id(full_name)").in("status", ["ativo", "rascunho"]),
    ]);
    setRows(d.data || []);
    setContracts(c.data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.contract_id) return toast.error("Selecione um contrato");
    const contract = contracts.find((c) => c.id === form.contract_id);
    const amount = form.mode === "fixo" ? Number(form.amount) : Number(form.multiplier) * Number(contract?.monthly_value || 0);
    if (!amount) return toast.error("Valor inválido");
    const { error } = await supabase.from("deposits").insert({
      contract_id: form.contract_id, amount, multiplier: form.mode === "multiplo" ? Number(form.multiplier) : null,
      expected_return_date: form.expected_return_date || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Caução registrada");
    setOpen(false); setForm({ contract_id: "", mode: "fixo", amount: "", multiplier: "1", expected_return_date: "" });
    load();
  };

  const doReturn = async () => {
    if (!returnTarget) return;
    const amt = Number(returnForm.amount);
    const partial = returnForm.new_status !== "devolvido";
    if (partial && !returnForm.justification.trim()) return toast.error("Justificativa obrigatória");
    if (amt > Number(returnTarget.amount)) return toast.error("Valor excede o depósito");
    const { error } = await supabase.from("deposits").update({
      returned_amount: amt, status: returnForm.new_status, justification: returnForm.justification || null,
    }).eq("id", returnTarget.id);
    if (error) return toast.error(error.message);
    toast.success("Movimentação registrada");
    setReturnTarget(null); setReturnForm({ amount: "", justification: "", new_status: "devolvido" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-1 h-4 w-4" />Nova caução</Button></DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle>Nova caução</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Contrato</Label>
                <select value={form.contract_id} onChange={(e) => setForm({ ...form, contract_id: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="">Selecione...</option>
                  {contracts.map((c) => <option key={c.id} value={c.id}>{c.profiles?.full_name ?? c.id.slice(0, 6)} · {c.rooms?.apartments?.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setForm({ ...form, mode: "fixo" })} className={`flex-1 rounded-full border px-3 py-2 text-sm ${form.mode === "fixo" ? "border-primary bg-primary/10" : "border-border"}`}>Valor fixo</button>
                <button onClick={() => setForm({ ...form, mode: "multiplo" })} className={`flex-1 rounded-full border px-3 py-2 text-sm ${form.mode === "multiplo" ? "border-primary bg-primary/10" : "border-border"}`}>Múltiplo do aluguel</button>
              </div>
              {form.mode === "fixo" ? (
                <div><Label>Valor</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1" /></div>
              ) : (
                <div><Label>Quantos aluguéis</Label><Input type="number" step="0.5" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: e.target.value })} className="mt-1" /></div>
              )}
              <div><Label>Devolução prevista</Label><Input type="date" value={form.expected_return_date} onChange={(e) => setForm({ ...form, expected_return_date: e.target.value })} className="mt-1" /></div>
              <Button onClick={save} className="w-full rounded-full bg-gradient-sunset shadow-warm">Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Moradora / Casa</th>
              <th className="px-4 py-3 text-left">Valor</th>
              <th className="px-4 py-3 text-left">Devolvido</th>
              <th className="px-4 py-3 text-left">Entrada</th>
              <th className="px-4 py-3 text-left">Devolução prevista</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Nenhuma caução.</td></tr> :
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.contracts?.profiles?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{r.contracts?.rooms?.apartments?.name}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{fmt(r.amount)} {r.multiplier && <span className="text-xs text-muted-foreground">({r.multiplier}x)</span>}</td>
                  <td className="px-4 py-3">{fmt(r.returned_amount)}</td>
                  <td className="px-4 py-3">{r.entry_date}</td>
                  <td className="px-4 py-3">{r.expected_return_date ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_TONE[r.status] ?? "bg-muted"}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "retido" && (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => { setReturnTarget(r); setReturnForm({ amount: String(r.amount), justification: "", new_status: "devolvido" }); }}>
                        <Undo2 className="mr-1 h-3 w-3" />Devolver
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!returnTarget} onOpenChange={(o) => { if (!o) setReturnTarget(null); }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>Movimentar caução</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(["devolvido", "parcial", "usado"] as const).map((s) => (
                <button key={s} onClick={() => setReturnForm({ ...returnForm, new_status: s })} className={`rounded-full border px-3 py-2 text-xs capitalize ${returnForm.new_status === s ? "border-primary bg-primary/10" : "border-border"}`}>{s}</button>
              ))}
            </div>
            <div><Label>Valor a devolver</Label><Input type="number" value={returnForm.amount} onChange={(e) => setReturnForm({ ...returnForm, amount: e.target.value })} className="mt-1" /></div>
            <div>
              <Label>Justificativa {returnForm.new_status !== "devolvido" && <span className="text-rose-600">*</span>}</Label>
              <Textarea value={returnForm.justification} onChange={(e) => setReturnForm({ ...returnForm, justification: e.target.value })} className="mt-1" />
            </div>
            <Button onClick={doReturn} className="w-full rounded-full bg-gradient-sunset shadow-warm">Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
