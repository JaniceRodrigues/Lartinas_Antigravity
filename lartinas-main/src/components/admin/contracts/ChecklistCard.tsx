import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

const DEFAULTS = [
  { kind: "pagamento_reserva", label: "Pagamento de reserva confirmado" },
  { kind: "documentos", label: "Documentos da moradora recebidos" },
  { kind: "vistoria_inicial", label: "Vistoria inicial concluída" },
];

export function ChecklistCard({ contractId }: { contractId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [adding, setAdding] = useState("");

  const load = async () => {
    const { data } = await supabase.from("contract_checklist_items").select("*").eq("contract_id", contractId).order("created_at");
    setItems(data || []);
  };

  useEffect(() => { (async () => {
    const { data } = await supabase.from("contract_checklist_items").select("id").eq("contract_id", contractId).limit(1);
    if (!data || data.length === 0) {
      await supabase.from("contract_checklist_items").insert(DEFAULTS.map((d) => ({ contract_id: contractId, kind: d.kind, label: d.label, required: true })));
    }
    load();
  })(); }, [contractId]);

  const toggle = async (item: any) => {
    const { data: u } = await supabase.auth.getUser();
    const completed = !item.completed;
    const { error } = await supabase.from("contract_checklist_items").update({
      completed, completed_at: completed ? new Date().toISOString() : null, completed_by: completed ? u.user?.id : null,
    }).eq("id", item.id);
    if (error) return toast.error(error.message);
    load();
  };

  const addItem = async () => {
    if (!adding.trim()) return;
    const { error } = await supabase.from("contract_checklist_items").insert({ contract_id: contractId, kind: "custom", label: adding, required: true });
    if (error) return toast.error(error.message);
    setAdding(""); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover item?")) return;
    await supabase.from("contract_checklist_items").delete().eq("id", id);
    load();
  };

  const pendingRequired = items.filter((i) => i.required && !i.completed).length;
  const total = items.length;
  const done = items.filter((i) => i.completed).length;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl">Checklist de aprovação</h2>
          <p className="text-sm text-muted-foreground">Obrigatório antes de enviar documentos para assinatura.</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${pendingRequired === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {done}/{total} {pendingRequired === 0 ? "✓ pronto" : `· ${pendingRequired} obrigatório(s) pendente(s)`}
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2">
            <button onClick={() => toggle(i)} className="flex flex-1 items-center gap-3 text-left">
              <span className={`grid h-5 w-5 place-items-center rounded-md border ${i.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"}`}>
                {i.completed && <Check className="h-3 w-3" />}
              </span>
              <span className={`text-sm ${i.completed ? "text-muted-foreground line-through" : ""}`}>{i.label}</span>
              {i.required && <span className="text-xs text-rose-600">*</span>}
            </button>
            {i.kind === "custom" && (
              <Button size="sm" variant="ghost" onClick={() => remove(i.id)} className="rounded-full text-rose-600"><X className="h-3 w-3" /></Button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <Input placeholder="Novo item personalizado" value={adding} onChange={(e) => setAdding(e.target.value)} className="h-9" />
        <Button size="sm" onClick={addItem} variant="outline" className="rounded-full"><Plus className="mr-1 h-3 w-3" />Adicionar</Button>
      </div>
    </div>
  );
}
