import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/fornecedores")({ component: Page });

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", contact_name: "", contact_email: "", contact_phone: "" });

  const load = () => supabase.from("vendors").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return toast.error("Nome obrigatório");
    const { error } = await supabase.from("vendors").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Fornecedor criado");
    setOpen(false); setForm({ name: "", category: "", contact_name: "", contact_email: "", contact_phone: "" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-semibold">Fornecedores</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-2 h-4 w-4" />Novo</Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle className="font-display text-2xl">Novo fornecedor</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Contato</Label><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="mt-1" /></div>
                <div><Label>Telefone</Label><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="mt-1" /></div>
              </div>
              <div><Label>Email</Label><Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="mt-1" /></div>
              <Button onClick={save} className="w-full rounded-full bg-gradient-sunset shadow-warm">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        rows={rows}
        searchKeys={["name", "category"]}
        columns={[
          { key: "name", header: "Nome", render: (r) => <span className="font-medium">{r.name}</span> },
          { key: "cat", header: "Categoria", render: (r) => r.category ?? "—" },
          { key: "contact", header: "Contato", render: (r) => `${r.contact_name ?? "—"} · ${r.contact_email ?? r.contact_phone ?? "—"}` },
          { key: "active", header: "Ativo", render: (r) => r.active ? "Sim" : "Não" },
        ]}
      />
    </div>
  );
}
