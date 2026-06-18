import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/vistorias")({ component: Page });

const STATUSES = ["agendada", "realizada", "pendencias"] as const;
const KINDS = ["entrada", "periodica", "saida"] as const;

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ apartment_id: "", kind: "entrada", scheduled_for: "", notes: "" });

  const load = async () => {
    const [r, a] = await Promise.all([
      supabase.from("inspections").select("*, apartments(name)").order("scheduled_for", { ascending: false, nullsFirst: false }),
      supabase.from("apartments").select("id, name").order("name"),
    ]);
    setRows(r.data || []);
    setHouses(a.data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.apartment_id || !form.kind) return toast.error("Preencha os campos");
    const { error } = await supabase.from("inspections").insert({
      apartment_id: form.apartment_id,
      kind: form.kind as any,
      scheduled_for: form.scheduled_for || null,
      notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Vistoria agendada");
    setOpen(false); setForm({ apartment_id: "", kind: "entrada", scheduled_for: "", notes: "" });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const update: any = { status };
    if (status === "realizada") update.performed_at = new Date().toISOString();
    const { error } = await supabase.from("inspections").update(update).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-semibold">Vistorias</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-2 h-4 w-4" />Nova vistoria</Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle className="font-display text-2xl">Nova vistoria</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Casa</Label>
                <select value={form.apartment_id} onChange={(e) => setForm({ ...form, apartment_id: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="">Selecione...</option>
                  {houses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Tipo</Label>
                <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div><Label>Agendada para</Label><Input type="datetime-local" value={form.scheduled_for} onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })} className="mt-1" /></div>
              <div><Label>Notas</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" /></div>
              <Button onClick={save} className="w-full rounded-full bg-gradient-sunset shadow-warm">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: "apt", header: "Casa", render: (r: any) => r.apartments?.name ?? "—" },
          { key: "kind", header: "Tipo", render: (r) => <span className="capitalize">{r.kind}</span> },
          { key: "when", header: "Quando", render: (r) => r.scheduled_for ? new Date(r.scheduled_for).toLocaleString("pt-BR") : "—" },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="rounded-full border border-border bg-background px-2 py-1 text-xs">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ),
          },
          { key: "badge", header: "", render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
