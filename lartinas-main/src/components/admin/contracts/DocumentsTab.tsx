import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Eye, FileSignature, Send, Upload, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { mdToHtml, renderTemplate, buildPrintableHtml, type TemplateContext } from "@/lib/contract-templates";

const STATUS_TONE: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  pendente_aprovacao: "bg-amber-100 text-amber-700",
  aprovado: "bg-blue-100 text-blue-700",
  enviado: "bg-indigo-100 text-indigo-700",
  assinado: "bg-emerald-100 text-emerald-700",
  vencido: "bg-rose-100 text-rose-700",
  cancelado: "bg-rose-100 text-rose-700",
  renovado: "bg-emerald-100 text-emerald-700",
};

export function DocumentsTab({ contractId, contract }: { contractId: string; contract: any }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [tplId, setTplId] = useState("");

  const load = async () => {
    const { data } = await supabase.from("contract_documents").select("*").eq("contract_id", contractId).order("created_at", { ascending: false });
    setDocs(data || []);
  };

  useEffect(() => {
    load();
    supabase.from("contract_templates").select("*").eq("active", true).then(({ data }) => setTemplates(data || []));
  }, [contractId]);

  const ctx: TemplateContext = {
    moradora: { nome: contract?.profiles?.full_name, email: contract?.profiles?.email },
    apartamento: { nome: contract?.rooms?.apartments?.name, endereco: contract?.rooms?.apartments?.address },
    quarto: { nome: contract?.rooms?.name },
    contrato: {
      valor_mensal: contract?.monthly_value,
      caucao: contract?.deposit_value,
      inicio: contract?.start_date,
      fim: contract?.end_date,
    },
    regras: contract?.rooms?.apartments?.rules ?? "",
  };

  const generate = async () => {
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return toast.error("Selecione um modelo");
    const rendered = renderTemplate(tpl.content, ctx);
    const { error } = await supabase.from("contract_documents").insert({
      contract_id: contractId, template_id: tpl.id, kind: tpl.kind, title: tpl.name, content_rendered: rendered, status: "rascunho",
    });
    if (error) return toast.error(error.message);
    toast.success("Documento criado em rascunho");
    setOpen(false); setTplId(""); load();
  };

  const updateStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "aprovado") { const { data: u } = await supabase.auth.getUser(); patch.approved_by = u.user?.id; patch.approved_at = new Date().toISOString(); }
    if (status === "assinado") patch.signed_at = new Date().toISOString();
    const { error } = await supabase.from("contract_documents").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado"); load();
  };

  const preview = (d: any) => {
    const html = mdToHtml(d.content_rendered);
    const w = window.open("", "_blank");
    if (w) { w.document.write(buildPrintableHtml(d.title, html)); w.document.close(); }
  };

  const uploadSigned = async (id: string, file: File) => {
    const path = `${contractId}/${id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("contract-pdfs").upload(path, file);
    if (error) return toast.error(error.message);
    await supabase.from("contract_documents").update({ pdf_path: path, status: "assinado", signed_at: new Date().toISOString() }).eq("id", id);
    toast.success("PDF assinado anexado"); load();
  };

  const downloadPdf = async (path: string) => {
    const { data, error } = await supabase.storage.from("contract-pdfs").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">Documentos do contrato</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-1 h-3 w-3" />Gerar documento</Button></DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle>Gerar documento a partir de modelo</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Modelo</Label>
                <select value={tplId} onChange={(e) => setTplId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="">Selecione...</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.kind}</option>)}
                </select>
              </div>
              <Button onClick={generate} className="w-full rounded-full bg-gradient-sunset shadow-warm">Gerar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="space-y-2">
        {docs.length === 0 && <li className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">Nenhum documento ainda.</li>}
        {docs.map((d) => (
          <li key={d.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">{d.kind} · criado em {new Date(d.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_TONE[d.status] ?? "bg-muted"}`}>{d.status.replace("_", " ")}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => preview(d)}><Eye className="mr-1 h-3 w-3" />Visualizar</Button>
              {d.status === "rascunho" && <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateStatus(d.id, "pendente_aprovacao")}>Submeter aprovação</Button>}
              {d.status === "pendente_aprovacao" && <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateStatus(d.id, "aprovado")}><CheckCircle2 className="mr-1 h-3 w-3" />Aprovar</Button>}
              {d.status === "aprovado" && <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateStatus(d.id, "enviado")}><Send className="mr-1 h-3 w-3" />Enviar</Button>}
              {(d.status === "enviado" || d.status === "aprovado") && <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateStatus(d.id, "assinado")}><FileSignature className="mr-1 h-3 w-3" />Marcar assinado</Button>}
              {d.status !== "assinado" && (
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1 text-xs">
                  <Upload className="h-3 w-3" /> Anexar PDF assinado
                  <input type="file" accept="application/pdf" hidden onChange={(e) => e.target.files?.[0] && uploadSigned(d.id, e.target.files[0])} />
                </label>
              )}
              {d.pdf_path && <Button size="sm" variant="outline" className="rounded-full" onClick={() => downloadPdf(d.pdf_path)}><Download className="mr-1 h-3 w-3" />Baixar</Button>}
              {d.status !== "assinado" && d.status !== "cancelado" && <Button size="sm" variant="ghost" className="rounded-full text-rose-600" onClick={() => updateStatus(d.id, "cancelado")}>Cancelar</Button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
