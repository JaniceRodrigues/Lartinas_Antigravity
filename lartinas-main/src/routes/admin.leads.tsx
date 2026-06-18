import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/leads")({ component: Page });

const STATUSES = ["novo", "qualificado", "descartado", "convertido"] as const;

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", origin: "", country: "", language: "", notes: "" });

  const load = () => supabase.from("leads").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.full_name) return toast.error("Nome obrigatório");
    const { error } = await supabase.from("leads").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Lead criado");
    setOpen(false); setForm({ full_name: "", email: "", phone: "", origin: "", country: "", language: "", notes: "" });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">Leads</h1>
          <p className="text-muted-foreground">Captação inicial — antes da candidatura.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-2 h-4 w-4" />Novo lead</Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle className="font-display text-2xl">Novo lead</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
                <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Origem</Label><Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="mt-1" /></div>
                <div><Label>País</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1" /></div>
                <div><Label>Idioma</Label><Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="mt-1" /></div>
              </div>
              <div><Label>Notas</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" /></div>
              <Button onClick={save} className="w-full rounded-full bg-gradient-sunset shadow-warm">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        rows={rows}
        searchKeys={["full_name", "email", "origin"]}
        columns={[
          { key: "name", header: "Nome", render: (r) => <span className="font-medium">{r.full_name}</span> },
          { key: "email", header: "Contato", render: (r) => <span className="text-muted-foreground">{r.email || r.phone || "—"}</span> },
          { key: "origin", header: "Origem", render: (r) => r.origin || "—" },
          { key: "country", header: "País / Idioma", render: (r) => `${r.country || "—"} · ${r.language || "—"}` },
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
