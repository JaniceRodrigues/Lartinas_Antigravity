import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileSignature, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/portal/renovacao")({ component: Renovacao });

function Renovacao() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [kind, setKind] = useState<"renovacao" | "saida">("renovacao");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("stay_requests").select("*").eq("profile_id", user.id).order("created_at", { ascending: false });
    setItems(data || []);
  };
  useEffect(() => { load(); }, [user]);

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    const { data: c } = await supabase.from("contracts").select("id").eq("tenant_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    const { error } = await supabase.from("stay_requests").insert({
      profile_id: user.id,
      contract_id: c?.id ?? null,
      kind,
      payload: { target_date: targetDate, notes },
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Solicitação enviada");
    setTargetDate(""); setNotes("");
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Renovação / saída" title="Solicitações da sua estadia" description="Peça renovação ou comunique sua saída." />

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4"><FileSignature className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-semibold">Nova solicitação</h2></div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Tipo</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as any)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="renovacao">Renovação</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data desejada</Label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="mt-4">
          <Label>Observações</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={3} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={submit} disabled={saving} className="rounded-full bg-gradient-sunset shadow-warm">
            <Plus className="mr-2 h-4 w-4" /> {saving ? "Enviando..." : "Enviar solicitação"}
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold mb-3">Minhas solicitações</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma solicitação ainda.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((s) => (
              <li key={s.id} className="py-3 text-sm flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">{s.kind}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.created_at)} · alvo: {s.payload?.target_date ? formatDate(s.payload.target_date) : "—"}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs">{s.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
