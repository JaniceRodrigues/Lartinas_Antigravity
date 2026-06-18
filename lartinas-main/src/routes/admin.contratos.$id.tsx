import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Send, FileText, ListChecks, Mail, Ban, Pencil, RefreshCw, Printer, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractStatusTimeline } from "@/components/admin/finance/ContractStatusTimeline";
import { FinancialEntriesTable } from "@/components/admin/finance/FinancialEntriesTable";
import { PartyContractForm } from "@/components/admin/finance/PartyContractForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/contratos/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [edit, setEdit] = useState(false);
  const [sending, setSending] = useState(false);
  const [activating, setActivating] = useState(false);

  async function load() {
    const [{ data: c }, { data: e }, { data: h }] = await Promise.all([
      supabase.from("party_contracts").select("*, profiles(full_name, email), owners(profiles:profile_id(full_name, email))").eq("id", id).single(),
      supabase.from("financial_entries").select("*").eq("party_contract_id", id).order("installment_number"),
      supabase.from("party_contract_send_history").select("*").eq("party_contract_id", id).order("sent_at", { ascending: false }),
    ]);
    setContract(c);
    setEntries(e || []);
    setHistory(h || []);
  }
  useEffect(() => { load(); }, [id]);

  if (!contract) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const recipientEmail = contract.party_type === "morador" ? contract.profiles?.email : contract.owners?.profiles?.email;
  const recipientName = contract.party_type === "morador" ? contract.profiles?.full_name : contract.owners?.profiles?.full_name;

  async function generateEntries(silent = false) {
    const { data, error } = await supabase.rpc("generate_contract_financial_entries", { _contract_id: id });
    if (error) { if (!silent) toast.error(error.message); return 0; }
    if (!silent) {
      if (data === 0) toast.info("Parcelas já geradas");
      else toast.success(`${data} parcelas geradas`);
    }
    return data ?? 0;
  }

  async function setStatus(s: string) {
    const { error } = await supabase.from("party_contracts").update({ status: s as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    load();
  }

  async function activate() {
    setActivating(true);
    const { error } = await supabase.from("party_contracts").update({ status: "ativo" as any }).eq("id", id);
    if (error) { setActivating(false); return toast.error(error.message); }
    const activeEntries = entries.filter((e) => e.status !== "cancelado");
    if (activeEntries.length === 0) {
      const n = await generateEntries(true);
      toast.success(`Contrato ativado · ${n} parcelas criadas em Contas a ${contract.party_type === "morador" ? "Receber" : "Pagar"}`);
    } else {
      toast.success("Contrato ativado");
    }
    setActivating(false);
    load();
  }

  function printContract() {
    window.open(`/imprimir-contrato/${id}`, "_blank");
  }

  async function sendEmail() {
    if (!recipientEmail) return toast.error("Destinatário sem e-mail");
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-party-contract-email", {
      body: { contract_id: id },
    });
    setSending(false);
    if (error) return toast.error(error.message);
    if (data?.ok) toast.success("E-mail enviado");
    else toast.error(data?.error ?? "Falha ao enviar");
    load();
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate({ to: "/admin/contratos" })} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-semibold">{contract.title}</h1>
            <StatusBadge status={contract.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Contrato com {contract.party_type} · {recipientName ?? "—"} {recipientEmail ? `· ${recipientEmail}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEdit(true)} className="rounded-full"><Pencil className="mr-2 h-4 w-4" />Editar</Button>
          <Button variant="outline" onClick={printContract} className="rounded-full"><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
          <Button variant="outline" onClick={() => generateEntries(false)} className="rounded-full"><ListChecks className="mr-2 h-4 w-4" />Gerar parcelas</Button>
          {contract.status !== "ativo" && contract.status !== "cancelado" && (
            <Button onClick={activate} disabled={activating} className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
              {activating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Ativar
            </Button>
          )}
          <Button onClick={sendEmail} disabled={sending} className="rounded-full bg-gradient-sunset shadow-warm">
            {sending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {history.length ? "Reenviar" : "Enviar por e-mail"}
          </Button>
          {contract.status !== "cancelado" && (
            <Button variant="outline" onClick={() => setStatus("cancelado")} className="rounded-full text-destructive">
              <Ban className="mr-2 h-4 w-4" />Cancelar
            </Button>
          )}
        </div>
      </div>

      <ContractStatusTimeline status={contract.status} />

      <Tabs defaultValue="dados">
        <TabsList className="rounded-full">
          <TabsTrigger value="dados" className="rounded-full">Dados</TabsTrigger>
          <TabsTrigger value="conteudo" className="rounded-full">Conteúdo</TabsTrigger>
          <TabsTrigger value="parcelas" className="rounded-full">Parcelas ({entries.length})</TabsTrigger>
          <TabsTrigger value="envios" className="rounded-full">Envios ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-6">
          <div className="grid gap-3 rounded-3xl border border-border bg-card p-5 shadow-soft md:grid-cols-2">
            <Field label="Tipo de parte" value={contract.party_type} />
            <Field label="Valor total" value={`R$ ${Number(contract.total_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
            <Field label="Parcelas" value={String(contract.installments_count)} />
            <Field label="1º vencimento" value={formatDate(contract.first_due_date)} />
            <Field label="Início" value={formatDate(contract.start_date)} />
            <Field label="Fim" value={formatDate(contract.end_date)} />
            <Field label="Observações" value={contract.notes ?? "—"} full />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["rascunho","enviado","assinado","ativo","finalizado"] as const).map((s) => (
              <Button key={s} variant="outline" size="sm" onClick={() => setStatus(s)} className="rounded-full capitalize" disabled={contract.status === s}>
                {s}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conteudo" className="mt-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" /> Cláusulas do contrato
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{contract.content_rendered || "Sem conteúdo. Edite o contrato para adicionar cláusulas."}</pre>
          </div>
        </TabsContent>

        <TabsContent value="parcelas" className="mt-6">
          {entries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Nenhuma parcela gerada. Use "Gerar parcelas" ou "Ativar" para criar os lançamentos financeiros automaticamente.
            </div>
          ) : (
            <FinancialEntriesTable entries={entries} onChanged={load} />
          )}
        </TabsContent>

        <TabsContent value="envios" className="mt-6">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Destinatário</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Nenhum envio registrado.</td></tr>
                ) : history.map((h) => (
                  <tr key={h.id} className="border-t border-border/60">
                    <td className="px-4 py-3"><Mail className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />{new Date(h.sent_at).toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3">{h.recipient_email}</td>
                    <td className="px-4 py-3"><StatusBadge status={h.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{h.error_message ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <PartyContractForm open={edit} onOpenChange={setEdit} contract={contract} onSaved={load} />
    </div>
  );
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm capitalize">{value}</div>
    </div>
  );
}
