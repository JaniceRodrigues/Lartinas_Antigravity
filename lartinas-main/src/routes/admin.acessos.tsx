import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, ShieldCheck, Save, Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  listUsersWithRoles,
  createUserWithRoles,
  setUserRoles,
  deleteUser,
  getAdminMe,
} from "@/lib/admin-users.functions";

export const Route = createFileRoute("/admin/acessos")({
  component: Acessos,
});

const ALL_ROLES = ["admin", "operacao", "financeiro", "comercial", "moradora", "proprietario", "fornecedor"] as const;
type Role = (typeof ALL_ROLES)[number];

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  operacao: "Operação",
  financeiro: "Financeiro",
  comercial: "Comercial",
  moradora: "Morador",
  proprietario: "Proprietário",
  fornecedor: "Fornecedor",
};

type Row = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string;
  created_at: string;
  roles: string[];
};

function Acessos() {
  const { user, loading: authLoading } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const visibleRoles = isSuperAdmin ? ALL_ROLES : (ALL_ROLES.filter((r) => r !== "admin") as readonly Role[]);
  const list = listUsersWithRoles;
  const create = createUserWithRoles;
  const setRoles = setUserRoles;
  const remove = deleteUser;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<Role[]>([]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    roles: ["moradora"] as Role[],
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await list();
      if (!Array.isArray(data)) throw new Error("Sessão expirada. Recarregue a página.");
      setRows(data as Row[]);
    } catch (e: any) {
      setRows([]);
      toast.error(e?.message ?? "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    getAdminMe().then((m) => setIsSuperAdmin(!!m.isSuperAdmin)).catch(() => setIsSuperAdmin(false));
    load();
  }, [authLoading, user?.id]);

  const toggleRole = (target: Role[], r: Role) =>
    target.includes(r) ? target.filter((x) => x !== r) : [...target, r];

  const submitCreate = async () => {
    if (!form.email || !form.password || !form.full_name || form.roles.length === 0) {
      return toast.error("Preencha nome, e-mail, senha e ao menos um papel.");
    }
    setSaving(true);
    try {
      await create({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        roles: form.roles,
      });
      toast.success("Usuário criado!");
      setOpen(false);
      setForm({ email: "", password: "", full_name: "", phone: "", roles: ["moradora"] });
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao criar usuário");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row: Row) => {
    setEditing(row.id);
    setEditRoles(row.roles.filter((r): r is Role => (ALL_ROLES as readonly string[]).includes(r)));
  };

  const saveRoles = async (userId: string) => {
    setSaving(true);
    try {
      await setRoles({ user_id: userId, roles: editRoles });
      toast.success("Permissões atualizadas!");
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (userId: string, name: string) => {
    if (!confirm(`Excluir ${name || "este usuário"} permanentemente?`)) return;
    try {
      await remove({ user_id: userId });
      toast.success("Usuário excluído.");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao excluir");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" /> Acessos
          </h1>
          <p className="text-muted-foreground">
            Cadastre usuários e defina suas permissões no sistema.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-sunset shadow-warm">
              <Plus className="mr-2 h-4 w-4" /> Novo usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Novo usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome completo</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Senha inicial</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1" placeholder="mínimo 8 caracteres" />
              </div>
              <div>
                <Label>WhatsApp (opcional)</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="mb-2 block">Papéis de acesso</Label>
                <div className="grid grid-cols-2 gap-2">
                  {visibleRoles.map((r) => (
                    <label key={r} className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm">
                      <Checkbox
                        checked={form.roles.includes(r)}
                        onCheckedChange={() => setForm({ ...form, roles: toggleRole(form.roles, r) })}
                      />
                      {roleLabels[r]}
                    </label>
                  ))}
                </div>
                {!isSuperAdmin && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Apenas o super administrador pode atribuir o papel <strong>Admin</strong>.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submitCreate} disabled={saving} className="w-full rounded-full bg-gradient-sunset shadow-warm">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...</> : "Criar usuário"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4">Pessoa</th>
              <th className="p-4">E-mail</th>
              <th className="p-4">Permissões</th>
              <th className="p-4">Desde</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">Sem usuários ainda.</td></tr>
            )}
            {rows.map((p) => {
              const isEditing = editing === p.id;
              return (
                <tr key={p.id} className="border-t border-border/40 align-top">
                  <td className="p-4">
                    <div className="font-medium">{p.full_name || "—"}</div>
                    {p.phone && <div className="text-xs text-muted-foreground">{p.phone}</div>}
                  </td>
                  <td className="p-4">{p.email || "—"}</td>
                  <td className="p-4">
                    {isEditing ? (
                      <div className="flex flex-wrap gap-1.5">
                        {visibleRoles.map((r) => (
                          <label key={r} className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs">
                            <Checkbox
                              checked={editRoles.includes(r)}
                              onCheckedChange={() => setEditRoles(toggleRole(editRoles, r))}
                            />
                            {roleLabels[r]}
                          </label>
                        ))}
                        {!isSuperAdmin && p.roles.includes("admin") && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-900">
                            <Crown className="h-3 w-3" /> Admin (somente super admin pode alterar)
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {p.roles.length === 0 && <span className="text-xs text-muted-foreground">sem permissão</span>}
                        {p.roles.map((r) => (
                          <span key={r} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                            {roleLabels[r as Role] ?? r}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="rounded-full">Cancelar</Button>
                          <Button size="sm" onClick={() => saveRoles(p.id)} disabled={saving} className="rounded-full bg-gradient-sunset shadow-warm">
                            <Save className="mr-1.5 h-3.5 w-3.5" /> Salvar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(p)} className="rounded-full">
                            Editar permissões
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteRow(p.id, p.full_name || p.email)} className="rounded-full text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
