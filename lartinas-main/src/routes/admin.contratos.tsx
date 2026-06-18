import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, FileSignature, MoreHorizontal, Pencil, CheckCircle2, Clock, Ban, Printer, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PartyContractForm } from "@/components/admin/finance/PartyContractForm";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/contratos")({ component: Page });

const FILTERS = ["all", "pendente", "ativo", "cancelado"] as const;
type StatusFilter = (typeof FILTERS)[number];

const PENDING_STATUSES = ["rascunho", "enviado", "assinado"];

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, { paid: number; total: number }>>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [partyFilter, setPartyFilter] = useState<"all" | "morador" | "proprietario">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  async function load() {
    const { data } = await supabase
      .from("party_contracts")
      .select("*, profiles(full_name, email), owners(profiles:profile_id(full_name, email))")
      .order("created_at", { ascending: false });
    setRows(data || []);
    const ids = (data || []).map((r: any) => r.id);
    if (ids.length) {
      const { data: ents } = await supabase
        .from("financial_entries")
        .select("party_contract_id, status")
        .in("party_contract_id", ids);
      const map: Record<string, { paid: number; total: number }> = {};
      (ents || []).forEach((e: any) => {
        const k = e.party_contract_id;
        if (!map[k]) map[k] = { paid: 0, total: 0 };
        if (e.status !== "cancelado") map[k].total += 1;
        if (e.status === "pago") map[k].paid += 1;
      });
      setCounts(map);
    } else setCounts({});
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (partyFilter !== "all" && r.party_type !== partyFilter) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "pendente") return PENDING_STATUSES.includes(r.status);
      return r.status === statusFilter;
    });
  }, [rows, partyFilter, statusFilter]);

  async function changeStatus(id: string, status: string, label: string) {
    const { error } = await supabase.from("party_contracts").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Contrato marcado como ${label}`);
    load();
  }

  async function activate(row: any) {
    const { error } = await supabase.from("party_contracts").update({ status: "ativo" as any }).eq("id", row.id);
    if (error) return toast.error(error.message);
    const c = counts[row.id];
    if (!c || c.total === 0) {
      const { data, error: rpcErr } = await supabase.rpc("generate_contract_financial_entries", { _contract_id: row.id });
      if (rpcErr) toast.error(rpcErr.message);
      else toast.success(`Contrato ativado · ${data ?? 0} parcelas geradas`);
    } else {
      toast.success("Contrato ativado");
    }
    load();
  }

  async function cancelContract(id: string) {
    if (!confirm("Cancelar este contrato? Lançamentos financeiros pendentes serão cancelados.")) return;
    await changeStatus(id, "cancelado", "cancelado");
  }

  function printContract(id: string) {
    window.open(`/imprimir-contrato/${id}`, "_blank");
  }

  async function sendEmail(row: any) {
    const email = row.party_type === "morador" ? row.profiles?.email : row.owners?.profiles?.email;
    if (!email) return toast.error("Destinatário sem e-mail cadastrado");
    const t = toast.loading("Enviando e-mail...");
    const { data, error } = await supabase.functions.invoke("send-party-contract-email", {
      body: { contract_id: row.id },
    });
    toast.dismiss(t);
    if (error) return toast.error(error.message);
    if (data?.ok) toast.success(`E-mail enviado para ${email}`);
    else toast.error(data?.error ?? "Falha ao enviar");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">Contratos</h1>
          <p className="text-muted-foreground">Contratos com moradores e proprietários, integrados ao financeiro.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="rounded-full bg-gradient-sunset shadow-warm">
          <Plus className="mr-2 h-4 w-4" />Novo contrato
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Parte:</span>
        {(["all", "morador", "proprietario"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setPartyFilter(t)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
              partyFilter === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted/40"
            }`}
          >
            {t === "all" ? "Todos" : t}
          </button>
        ))}
        <span className="ml-4 text-xs uppercase tracking-widest text-muted-foreground">Status:</span>
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
              statusFilter === s
                ? "border-primary bg-primary/10 text-primary"
                : s === "ativo"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-border bg-background hover:bg-muted/40"
            }`}
          >
            {s === "all" ? "Todos" : s}
          </button>
        ))}
      </div>

      <DataTable
        rows={filtered}
        columns={[
          {
            key: "title",
            header: "Contrato",
            render: (r: any) => (
              <Link to="/admin/contratos/$id" params={{ id: r.id }} className="flex items-center gap-2 font-medium text-foreground hover:text-primary">
                <FileSignature className="h-4 w-4 text-muted-foreground" />
                {r.title}
              </Link>
            ),
          },
          {
            key: "party",
            header: "Parte",
            render: (r: any) => {
              const name = r.party_type === "morador" ? r.profiles?.full_name : r.owners?.profiles?.full_name;
              return (
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{r.party_type}</div>
                  <div>{name ?? "—"}</div>
                </div>
              );
            },
          },
          {
            key: "value",
            header: "Valor",
            render: (r: any) => `R$ ${Number(r.total_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} · ${r.installments_count}x`,
          },
          {
            key: "parcelas",
            header: "Parcelas",
            render: (r: any) => {
              const c = counts[r.id];
              if (!c || c.total === 0) return <span className="text-xs text-muted-foreground">—</span>;
              return <span className="text-sm">{c.paid}/{c.total} pagas</span>;
            },
          },
          { key: "start", header: "Início", render: (r: any) => formatDate(r.start_date) },
          { key: "status", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          {
            key: "actions",
            header: "",
            render: (r: any) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(r)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => printContract(r.id)}>
                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => sendEmail(r)}
                    disabled={!(r.party_type === "morador" ? r.profiles?.email : r.owners?.profiles?.email)}
                  >
                    <Send className="mr-2 h-4 w-4" /> Enviar por e-mail
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={r.status === "ativo"} onClick={() => activate(r)}>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Ativar
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={PENDING_STATUSES.includes(r.status)} onClick={() => changeStatus(r.id, "rascunho", "pendente")}>
                    <Clock className="mr-2 h-4 w-4" /> Marcar como pendente
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={r.status === "cancelado"} onClick={() => cancelContract(r.id)} className="text-destructive focus:text-destructive">
                    <Ban className="mr-2 h-4 w-4" /> Cancelar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      <PartyContractForm open={open} onOpenChange={setOpen} onSaved={load} />
      <PartyContractForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} contract={editing} onSaved={load} />
    </div>
  );
}
