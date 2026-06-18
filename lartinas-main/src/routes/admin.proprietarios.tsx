import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PersonForm, type PersonFormValues } from "@/components/admin/people/PersonForm";
import { createUserWithRoles } from "@/lib/admin-users.functions";
import { DocumentsUploader } from "@/components/admin/people/DocumentsUploader";
import { ApartmentPayoutConfig } from "@/components/admin/people/ApartmentPayoutConfig";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/proprietarios")({ component: Page });

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    const { data: owners } = await supabase
      .from("owners")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false });
    const list = owners || [];
    const profileIds = list.map((o: any) => o.profile_id).filter(Boolean);
    let countByProfile: Record<string, number> = {};
    if (profileIds.length > 0) {
      const { data: apts } = await supabase
        .from("apartments")
        .select("id, owner_id")
        .in("owner_id", profileIds);
      for (const a of apts || []) {
        if (!a.owner_id) continue;
        countByProfile[a.owner_id] = (countByProfile[a.owner_id] || 0) + 1;
      }
    }
    setRows(list.map((o: any) => ({ ...o, apartments_count: o.profile_id ? (countByProfile[o.profile_id] || 0) : 0 })));
  }

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    const p = r.profiles || {};
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return [p.full_name, p.last_name, p.email, p.cpf, p.phone].some((v) => String(v ?? "").toLowerCase().includes(s));
  });

  async function handleSave(values: PersonFormValues) {
    const profilePayload: any = {
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
      if (editing.profile_id) {
        const { error } = await supabase.from("profiles").update(profilePayload).eq("id", editing.profile_id);
        if (error) throw error;
      }
      const { error: e2 } = await supabase.from("owners").update({
        status: values.status || "ativo",
        financial_notes: values.financial_notes || null,
      }).eq("id", editing.id);
      if (e2) throw e2;
      toast.success("Proprietário atualizado");
    } else {
      if (!values.email) {
        toast.error("E-mail é obrigatório para criar o proprietário");
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
          roles: ["proprietario"],
        });
        createdId = created.id;
      } catch (e: any) {
        toast.error(e?.message ?? "Falha ao criar usuário");
        return;
      }
      const { error: upErr } = await supabase.from("profiles").update(profilePayload).eq("id", createdId);
      if (upErr) throw upErr;
      const { error: e2 } = await supabase.from("owners").insert({
        profile_id: createdId,
        status: values.status || "ativo",
        financial_notes: values.financial_notes || null,
      });
      if (e2) throw e2;
      toast.success("Proprietário cadastrado. Senha temporária: " + tempPassword);
    }
    setOpen(false);
    setEditing(null);
    setCreating(false);
    load();
  }

  async function remove(r: any) {
    if (!confirm("Excluir proprietário?")) return;
    const { error } = await supabase.from("owners").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Excluído");
    load();
  }

  function buildInitial(r: any): Partial<PersonFormValues> {
    const p = r.profiles || {};
    return {
      full_name: p.full_name,
      last_name: p.last_name,
      email: p.email,
      phone: p.phone,
      cpf: p.cpf,
      rg: p.rg,
      passport: p.passport,
      birth_date: p.birth_date,
      nationality: p.nationality,
      address: p.address,
      cep: p.cep,
      street: p.street,
      number: p.number,
      complement: p.complement,
      neighborhood: p.neighborhood,
      city: p.city,
      state: p.state,
      emergency_contact_name: p.emergency_contact_name,
      emergency_contact_phone: p.emergency_contact_phone,
      internal_notes: p.internal_notes,
      status: r.status,
      financial_notes: r.financial_notes,
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">Proprietários</h1>
          <p className="text-muted-foreground">Donos dos imóveis e regras de repasse.</p>
        </div>
        <Button onClick={() => { setEditing(null); setCreating(true); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo proprietário
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-soft">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="h-9 border-0 shadow-none focus-visible:ring-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">Contato</th>
                <th className="px-4 py-3 text-left font-medium">Imóveis</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Nenhum proprietário.</td></tr>
              ) : filtered.map((r) => {
                const p = r.profiles || {};
                return (
                  <tr key={r.id} className="border-t border-border/60 cursor-pointer hover:bg-muted/30" onClick={() => { setEditing(r); setCreating(false); setOpen(true); }}>
                    <td className="px-4 py-3 font-medium">{p.full_name ?? "—"} {p.last_name ?? ""}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{p.email || "—"}</div>
                      <div className="text-xs text-muted-foreground">{p.phone || ""}</div>
                    </td>
                    <td className="px-4 py-3">{r.apartments_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.status === "inativo" ? "secondary" : "default"}>{r.status ?? "ativo"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setCreating(false); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(r)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {creating ? "Novo proprietário" : `${editing?.profiles?.full_name ?? ""} ${editing?.profiles?.last_name ?? ""}`}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {creating || !editing ? (
              <PersonForm scope="proprietario" onSubmit={handleSave} onCancel={() => setOpen(false)} />
            ) : (
              <Tabs defaultValue="dados">
                <TabsList>
                  <TabsTrigger value="dados">Dados</TabsTrigger>
                  <TabsTrigger value="docs">Documentos</TabsTrigger>
                  <TabsTrigger value="repasse">Imóveis & Repasse</TabsTrigger>
                </TabsList>
                <TabsContent value="dados" className="mt-4">
                  <PersonForm scope="proprietario" initial={buildInitial(editing)} onSubmit={handleSave} onCancel={() => setOpen(false)} />
                </TabsContent>
                <TabsContent value="docs" className="mt-4">
                  {editing.profile_id
                    ? <DocumentsUploader profileId={editing.profile_id} scope="proprietario" />
                    : <p className="text-sm text-muted-foreground">Sem profile vinculado.</p>}
                </TabsContent>
                <TabsContent value="repasse" className="mt-4">
                  <ApartmentPayoutConfig ownerId={editing.id} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
