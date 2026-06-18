import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TEMPLATE_VARIABLES, mdToHtml, renderTemplate, buildPrintableHtml } from "@/lib/contract-templates";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/modelos-contrato")({ component: Page });

const KINDS = [
  { value: "moradora", label: "Contrato da moradora" },
  { value: "proprietario", label: "Contrato do proprietário" },
  { value: "regras_casa", label: "Regras da casa" },
  { value: "vistoria", label: "Termo de vistoria" },
  { value: "aditivo", label: "Aditivo" },
] as const;

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", kind: "moradora", content: "", active: true });

  const load = async () => {
    const { data } = await supabase.from("contract_templates").select("*").order("created_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", kind: "moradora", content: defaultContent(), active: true }); setOpen(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ name: r.name, kind: r.kind, content: r.content, active: r.active }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Informe o nome");
    const payload = { name: form.name, kind: form.kind as any, content: form.content, active: form.active };
    const res = editing
      ? await supabase.from("contract_templates").update(payload).eq("id", editing.id)
      : await supabase.from("contract_templates").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Modelo salvo");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover modelo?")) return;
    const { error } = await supabase.from("contract_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido"); load();
  };

  const previewSample = () => {
    const html = mdToHtml(renderTemplate(form.content, sampleCtx()));
    const w = window.open("", "_blank");
    if (w) { w.document.write(buildPrintableHtml(form.name || "Preview", html)); w.document.close(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">Modelos de contrato</h1>
          <p className="text-muted-foreground">Templates editáveis com variáveis dinâmicas.</p>
        </div>
        <Button onClick={openNew} className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-2 h-4 w-4" />Novo modelo</Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Nenhum modelo. Crie o primeiro.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="cursor-pointer border-t border-border/60 hover:bg-muted/30" onClick={() => openEdit(r)}>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 capitalize">{KINDS.find((k) => k.value === r.kind)?.label ?? r.kind}</td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${r.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{r.active ? "Ativo" : "Inativo"}</span></td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); remove(r.id); }} className="rounded-full text-rose-600"><Trash2 className="h-3 w-3" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Editar modelo" : "Novo modelo"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Tipo</Label>
                  <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Ativo
                  </label>
                </div>
              </div>
              <div>
                <Label>Conteúdo (markdown)</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1 min-h-[400px] font-mono text-xs" />
              </div>
              <div className="flex gap-2">
                <Button onClick={save} className="flex-1 rounded-full bg-gradient-sunset shadow-warm">Salvar</Button>
                <Button onClick={previewSample} variant="outline" className="rounded-full"><Eye className="mr-1 h-3 w-3" />Preview</Button>
              </div>
            </div>
            <aside className="space-y-2 rounded-2xl border border-border bg-muted/30 p-3 text-xs">
              <p className="font-semibold uppercase tracking-wider text-muted-foreground">Variáveis</p>
              <ul className="space-y-1 font-mono">
                {TEMPLATE_VARIABLES.map((v) => (
                  <li key={v}>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, content: f.content + ` {{${v}}}` }))} className="text-left text-primary hover:underline">{`{{${v}}}`}</button>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function defaultContent(): string {
  return `# Contrato de locação de quarto

Pelo presente instrumento, a moradora **{{moradora.nome}}** (documento {{moradora.documento}}) firma contrato com a Lartinas para o quarto **{{quarto.nome}}** localizado em **{{apartamento.nome}}** ({{apartamento.endereco}}).

## Vigência
De {{contrato.inicio}} até {{contrato.fim}}.

## Valores
- Valor mensal: {{contrato.valor_mensal}}
- Caução: {{contrato.caucao}}

## Regras da casa
{{regras}}

## Disposições gerais
A moradora declara estar ciente das regras e se compromete a cumpri-las.
`;
}

function sampleCtx() {
  return {
    moradora: { nome: "Maria Exemplo", documento: "123.456.789-00", email: "maria@exemplo.com" },
    proprietario: { nome: "Proprietário Exemplo" },
    apartamento: { nome: "Casa Vila Madalena", endereco: "Rua Exemplo, 100" },
    quarto: { nome: "Quarto Rosa" },
    contrato: { valor_mensal: 1800, caucao: 1800, inicio: "2026-06-01", fim: "2027-05-31" },
    regras: "Convivência respeitosa, silêncio após 22h, áreas comuns limpas.",
  };
}
