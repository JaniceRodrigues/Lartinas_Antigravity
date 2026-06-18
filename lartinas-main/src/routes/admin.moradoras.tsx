import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonForm, type PersonFormValues } from "@/components/admin/people/PersonForm";
import { createUserWithRoles } from "@/lib/admin-users.functions";
import { DocumentsUploader } from "@/components/admin/people/DocumentsUploader";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/moradoras")({ component: Page });

const PAGE_SIZE = 20;

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    // Tenants: profiles that have role 'moradora' OR have contracts as tenant
    const { data: roleRows } = await supabase.from("user_roles").select("user_id").eq("role", "moradora");
    const ids = Array.from(new Set((roleRows || []).map((r) => r.user_id)));
    const { data: contractTenants } = await supabase.from("contracts").select("tenant_id");
    (contractTenants || []).forEach((c) => { if (c.tenant_id && !ids.includes(c.tenant_id)) ids.push(c.tenant_id); });
    if (ids.length === 0) { setRows([]); return; }
    const { data } = await supabase.from("profiles").select("*").in("id", ids).order("created_at", { ascending: false });
    setRows(data || []);
  }

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [r.full_name, r.last_name, r.email, r.cpf, r.phone].some((v) => String(v ?? "").toLowerCase().includes(s));
  });
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function handleSave(values: PersonFormValues) {
    const payload: any = {
      full_name: values.full_name,
      last_name: values.last_name || null,
      email: values.email || null,
      phone: values.phone || null,
      cpf: values.cpf?.replace(/\D/g, "") || null,
      rg: values.rg || null,
      passport: values.passport || null,
      birth_date: values.birth_date || null,
      nationality: values.nationality || null,
      address: values.address || null,
      cep: values.cep || null,
      street: values.street || null,
      number: values.number || null,
      complement: values.complement || null,
      neighborhood: values.neighborhood || null,
      city: values.city || null,
      state: values.state || null,
      emergency_contact_name: values.emergency_contact_name || null,
      emergency_contact_phone: values.emergency_contact_phone || null,
      internal_notes: values.internal_notes || null,
    };
    if (editing) {
      const { error } = await supabase.from("profiles").update(payload).eq("id", editing.id);
      if (error) throw error;
      toast.success("Morador atualizado");
    } else {
      if (!values.email) {
        toast.error("E-mail é obrigatório para criar a moradora");
        return;
      }
      const tempPassword = `${crypto.randomUUID()}Aa1!`;
      let createdId: string;
      try {
        const created = await createUserWithRoles({
          email: values.email,
          password: tempPassword,
          full_name: values.full_name,
          phone: values.phone || null,
          roles: ["moradora"],
        });
        createdId = created.id;
      } catch (e: any) {
        toast.error(e?.message ?? "Falha ao criar usuário");
        return;
      }
      const { error: upErr } = await supabase.from("profiles").update(payload).eq("id", createdId);
      if (upErr) throw upErr;
      toast.success("Morador cadastrado. Senha temporária: " + tempPassword);
    }
    setOpen(false);
    setEditing(null);
    setCreating(false);
    load();
  }

  async function remove(r: any) {
    if (!confirm(`Excluir ${r.full_name}?`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Excluído");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">Moradores</h1>
          <p className="text-muted-foreground">Cadastro completo de moradores e seus documentos.</p>
        </div>
        <Button onClick={() => { setEditing(null); setCreating(true); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo morador
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-soft">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            placeholder="Buscar por nome, e-mail, CPF ou telefone..."
            className="h-9 border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">Contato</th>
                <th className="px-4 py-3 text-left font-medium">CPF</th>
                <th className="px-4 py-3 text-left font-medium">Nacionalidade</th>
                <th className="px-4 py-3 text-left font-medium">Cadastro</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Nenhum morador.</td></tr>
              ) : paged.map((r) => (
                <tr key={r.id} className="border-t border-border/60 cursor-pointer hover:bg-muted/30" onClick={() => { setEditing(r); setCreating(false); setOpen(true); }}>
                  <td className="px-4 py-3 font-medium">{r.full_name} {r.last_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{r.email || "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.phone || ""}</div>
                  </td>
                  <td className="px-4 py-3">{r.cpf || "—"}</td>
                  <td className="px-4 py-3">{r.nationality || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setCreating(false); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
            <span>{filtered.length} resultados</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              <Button size="sm" variant="ghost" disabled={(page + 1) * PAGE_SIZE >= filtered.length} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{creating ? "Novo morador" : `${editing?.full_name ?? ""} ${editing?.last_name ?? ""}`}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {creating || !editing ? (
              <PersonForm scope="morador" onSubmit={handleSave} onCancel={() => setOpen(false)} />
            ) : (
              <Tabs defaultValue="dados">
                <TabsList>
                  <TabsTrigger value="dados">Dados pessoais</TabsTrigger>
                  <TabsTrigger value="docs">Documentos</TabsTrigger>
                </TabsList>
                <TabsContent value="dados" className="mt-4">
                  <PersonForm scope="morador" initial={editing} onSubmit={handleSave} onCancel={() => setOpen(false)} />
                </TabsContent>
                <TabsContent value="docs" className="mt-4">
                  <DocumentsUploader profileId={editing.id} scope="morador" />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
