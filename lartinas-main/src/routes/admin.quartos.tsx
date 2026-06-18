import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/quartos")({ component: Page });

const STATUS_OPTIONS = [
  { value: "disponivel", label: "Disponível" },
  { value: "alugada", label: "Alugada" },
  { value: "aguardando_vistoria", label: "Aguardando vistoria" },
  { value: "desativado", label: "Desativado" },
] as const;
type RoomStatus = (typeof STATUS_OPTIONS)[number]["value"];

type FormState = {
  name: string;
  apartment_id: string;
  price_monthly: string;
  size_m2: string;
  description: string;
  status: RoomStatus;
};

const EMPTY_FORM: FormState = { name: "", apartment_id: "", price_monthly: "", size_m2: "", description: "", status: "disponivel" };

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const load = async () => {
    const [r, a] = await Promise.all([
      supabase.from("rooms").select("*, apartments(name)").order("created_at", { ascending: false }),
      supabase.from("apartments").select("id, name").order("name"),
    ]);
    setRows(r.data || []);
    setHouses(a.data || []);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setEditingId(null); setForm(EMPTY_FORM); };

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setForm({
      name: r.name ?? "",
      apartment_id: r.apartment_id ?? "",
      price_monthly: r.price_monthly != null ? String(r.price_monthly) : "",
      size_m2: r.size_m2 != null ? String(r.size_m2) : "",
      description: r.description ?? "",
      status: (r.status as RoomStatus) ?? "disponivel",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.apartment_id || !form.price_monthly) return toast.error("Preencha os campos obrigatórios");
    const payload = {
      name: form.name,
      apartment_id: form.apartment_id,
      price_monthly: Number(form.price_monthly),
      size_m2: form.size_m2 ? Number(form.size_m2) : null,
      description: form.description || null,
      status: form.status,
    };
    const { error } = editingId
      ? await supabase.from("rooms").update(payload).eq("id", editingId)
      : await supabase.from("rooms").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Quarto atualizado" : "Quarto criado");
    setOpen(false); reset(); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-semibold">Quartos</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button onClick={reset} className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-2 h-4 w-4" />Novo quarto</Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle className="font-display text-2xl">{editingId ? "Editar quarto" : "Novo quarto"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Casa</Label>
                <select value={form.apartment_id} onChange={(e) => setForm({ ...form, apartment_id: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="">Selecione...</option>
                  {houses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Valor/mês</Label><Input type="number" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: e.target.value })} className="mt-1" /></div>
                <div><Label>Tamanho (m²)</Label><Input type="number" value={form.size_m2} onChange={(e) => setForm({ ...form, size_m2: e.target.value })} className="mt-1" /></div>
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RoomStatus })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div><Label>Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
              <Button onClick={save} className="w-full rounded-full bg-gradient-sunset shadow-warm">{editingId ? "Salvar alterações" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        rows={rows}
        searchKeys={["name"]}
        columns={[
          { key: "name", header: "Quarto", render: (r) => <span className="font-medium">{r.name}</span> },
          { key: "apt", header: "Casa", render: (r: any) => r.apartments?.name ?? "—" },
          { key: "price", header: "Valor", render: (r) => `R$ ${Number(r.price_monthly).toLocaleString("pt-BR")}` },
          { key: "size", header: "m²", render: (r) => r.size_m2 ?? "—" },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "actions", header: "", render: (r) => (
            <Button size="sm" variant="outline" onClick={() => startEdit(r)} className="rounded-full">
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
            </Button>
          )},
        ]}
      />
    </div>
  );
}
