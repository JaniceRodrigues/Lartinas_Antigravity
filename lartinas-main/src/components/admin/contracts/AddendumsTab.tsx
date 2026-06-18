import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const KINDS = [
  { value: "prorrogacao", label: "Prorrogação" },
  { value: "reajuste", label: "Reajuste" },
  { value: "troca_quarto", label: "Troca de quarto" },
  { value: "outro", label: "Outro" },
] as const;

export function AddendumsTab({ contractId }: { contractId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kind: "prorrogacao", description: "", effective_date: "" });

  const load = async () => {
    const { data } = await supabase.from("contract_addendums").select("*").eq("contract_id", contractId).order("created_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { load(); }, [contractId]);

  const save = async () => {
    if (!form.description.trim()) return toast.error("Descreva o aditivo");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("contract_addendums").insert({
      contract_id: contractId, kind: form.kind as any, description: form.description,
      effective_date: form.effective_date || null, created_by: u.user?.id, status: "ativo",
    });
    if (error) return toast.error(error.message);
    toast.success("Aditivo registrado");
    setOpen(false); setForm({ kind: "prorrogacao", description: "", effective_date: "" }); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">Aditivos</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-1 h-3 w-3" />Novo aditivo</Button></DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle>Novo aditivo</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Tipo</Label>
                <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              </div>
              <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 min-h-[120px]" /></div>
              <div><Label>Vigência a partir de</Label><Input type="date" value={form.effective_date} onChange={(e) => setForm({ ...form, effective_date: e.target.value })} className="mt-1" /></div>
              <Button onClick={save} className="w-full rounded-full bg-gradient-sunset shadow-warm">Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">Nenhum aditivo. O contrato original permanece inalterado.</p>
      ) : (
        <ol className="relative space-y-3 border-l-2 border-border pl-5">
          {rows.map((r) => (
            <li key={r.id} className="relative">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-gradient-sunset" />
              <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="font-medium capitalize">{KINDS.find((k) => k.value === r.kind)?.label ?? r.kind}</p>
                  <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                <p className="mt-1 text-sm text-foreground/80">{r.description}</p>
                {r.effective_date && <p className="mt-1 text-xs text-muted-foreground">Vigência: {r.effective_date}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
