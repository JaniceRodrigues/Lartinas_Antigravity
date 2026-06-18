import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Plus, Zap, CheckCircle2, Calendar, DollarSign, Ban, Receipt, Upload } from "lucide-react";
import { toast } from "sonner";

const KINDS = ["mensalidade", "caucao", "reserva", "proporcional", "multa", "taxa", "repasse", "outro"];
const STATUSES = ["pendente", "pago", "atrasado", "cancelado", "estornado", "expirado"];

import { formatBRL, formatDate, formatDateTime } from "@/lib/format";
const fmt = formatBRL;

export function PaymentsTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({ kind: "", status: "", from: "", to: "", q: "" });
  const [openNew, setOpenNew] = useState(false);
  const [openBatch, setOpenBatch] = useState(false);
  const [openEdit, setOpenEdit] = useState<null | "amount" | "due_date" | "status">(null);
  const [editValue, setEditValue] = useState("");
  const [drawer, setDrawer] = useState<any>(null);

  const load = async () => {
    const [p, c] = await Promise.all([
      supabase.from("payments").select("*, contracts(id, tenant_id, monthly_value, rooms(name, apartments(name)), profiles:tenant_id(full_name))").order("due_date", { ascending: false }),
      supabase.from("contracts").select("id, monthly_value, status, rooms(name, apartments(name)), profiles:tenant_id(full_name)").in("status", ["ativo", "rascunho"]),
    ]);
    setRows(p.data || []);
    setContracts(c.data || []);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filters.kind && r.kind !== filters.kind) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.from && r.due_date < filters.from) return false;
      if (filters.to && r.due_date > filters.to) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const blob = `${r.contracts?.rooms?.apartments?.name ?? ""} ${r.contracts?.rooms?.name ?? ""} ${r.contracts?.profiles?.full_name ?? ""} ${r.description ?? ""}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters]);

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };
  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const logBatch = async (operation_type: string, ids: string[], details: any) => {
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("payment_batches").insert({ operation_type, actor_id: u.user?.id, affected_count: ids.length, details: { ...details, ids } });
  };

  const bulkMarkPaid = async () => {
    const ids = Array.from(selected);
    const { error } = await supabase.from("payments").update({ status: "pago", paid_at: new Date().toISOString() }).in("id", ids);
    if (error) return toast.error(error.message);
    await logBatch("editar_status", ids, { status: "pago" });
    toast.success(`${ids.length} pagamento(s) marcados como pagos`);
    setSelected(new Set()); load();
  };
  const bulkCancel = async () => {
    const ids = Array.from(selected);
    const reason = prompt("Motivo do cancelamento:");
    if (!reason) return;
    const { error } = await supabase.from("payments").update({ status: "cancelado", notes: reason }).in("id", ids);
    if (error) return toast.error(error.message);
    await logBatch("cancelar", ids, { reason });
    toast.success(`${ids.length} cancelado(s)`);
    setSelected(new Set()); load();
  };
  const bulkApplyEdit = async () => {
    const ids = Array.from(selected);
    if (!editValue) return;
    const patch: any = openEdit === "amount" ? { amount: Number(editValue) } : openEdit === "due_date" ? { due_date: editValue } : { status: editValue };
    const { error } = await supabase.from("payments").update(patch).in("id", ids);
    if (error) return toast.error(error.message);
    await logBatch(`editar_${openEdit}`, ids, patch);
    toast.success("Atualizado em lote");
    setOpenEdit(null); setEditValue(""); setSelected(new Set()); load();
  };

  const applyOverdue = async () => {
    const { error } = await supabase.rpc("apply_overdue_charges");
    if (error) return toast.error(error.message);
    toast.success("Encargos aplicados");
    load();
  };

  const expireReservations = async () => {
    const { data, error } = await supabase.rpc("expire_overdue_reservations");
    if (error) return toast.error(error.message);
    toast.success(`${data ?? 0} reserva(s) expirada(s)`);
    load();
  };

  // Generate monthly batch
  const [batchMonth, setBatchMonth] = useState(new Date().toISOString().slice(0, 7));
  const generateBatch = async () => {
    const [y, m] = batchMonth.split("-").map(Number);
    const due = new Date(y, m - 1, 10).toISOString().slice(0, 10);
    const monthStart = new Date(y, m - 1, 1).toISOString().slice(0, 10);
    const monthEnd = new Date(y, m, 0).toISOString().slice(0, 10);

    const activeContracts = contracts.filter((c) => c.status === "ativo");
    const { data: existing = [] } = await supabase.from("payments").select("contract_id").eq("kind", "mensalidade").gte("due_date", monthStart).lte("due_date", monthEnd);
    const existingIds = new Set((existing || []).map((e: any) => e.contract_id));
    const toCreate = activeContracts.filter((c) => !existingIds.has(c.id));
    if (toCreate.length === 0) { toast.info("Todos contratos já têm mensalidade neste mês"); return; }

    const inserts = toCreate.map((c) => ({
      contract_id: c.id,
      kind: "mensalidade" as const,
      amount: Number(c.monthly_value),
      original_amount: Number(c.monthly_value),
      due_date: due,
      description: `Mensalidade ${batchMonth}`,
    }));
    const { data: inserted, error } = await supabase.from("payments").insert(inserts).select("id");
    if (error) return toast.error(error.message);
    await logBatch("gerar_mensalidades", (inserted || []).map((i: any) => i.id), { reference_month: batchMonth });
    toast.success(`${inserted?.length || 0} mensalidades criadas`);
    setOpenBatch(false); load();
  };

  // New single payment
  const [form, setForm] = useState({ contract_id: "", kind: "mensalidade", amount: "", due_date: "", description: "" });
  const save = async () => {
    if (!form.contract_id || !form.amount || !form.due_date) return toast.error("Preencha os campos obrigatórios");
    const { error } = await supabase.from("payments").insert({
      contract_id: form.contract_id, kind: form.kind as any, amount: Number(form.amount),
      original_amount: Number(form.amount), due_date: form.due_date, description: form.description || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Pagamento criado");
    setOpenNew(false); setForm({ contract_id: "", kind: "mensalidade", amount: "", due_date: "", description: "" });
    load();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-border bg-card p-3 shadow-soft">
        <select value={filters.kind} onChange={(e) => setFilters({ ...filters, kind: e.target.value })} className="h-9 rounded-md border border-border bg-background px-2 text-sm">
          <option value="">Todos os tipos</option>
          {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="h-9 rounded-md border border-border bg-background px-2 text-sm">
          <option value="">Todos os status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="h-9 w-auto" />
        <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="h-9 w-auto" />
        <Input placeholder="Buscar moradora/casa..." value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className="h-9 max-w-xs" />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={applyOverdue} className="rounded-full"><Zap className="mr-1 h-3 w-3" />Encargos</Button>
          <Button variant="outline" size="sm" onClick={expireReservations} className="rounded-full"><Ban className="mr-1 h-3 w-3" />Expirar reservas</Button>
          <Dialog open={openBatch} onOpenChange={setOpenBatch}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="rounded-full"><Calendar className="mr-1 h-3 w-3" />Gerar lote</Button></DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader><DialogTitle>Gerar mensalidades em lote</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Label>Mês de referência</Label>
                <Input type="month" value={batchMonth} onChange={(e) => setBatchMonth(e.target.value)} />
                <p className="text-sm text-muted-foreground">{contracts.filter((c) => c.status === "ativo").length} contrato(s) ativo(s) — vencimento dia 10.</p>
                <Button onClick={generateBatch} className="w-full rounded-full bg-gradient-sunset shadow-warm">Gerar</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild><Button size="sm" className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-1 h-3 w-3" />Novo</Button></DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader><DialogTitle>Novo pagamento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Contrato</Label>
                  <select value={form.contract_id} onChange={(e) => setForm({ ...form, contract_id: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="">Selecione...</option>
                    {contracts.map((c) => <option key={c.id} value={c.id}>{c.profiles?.full_name ?? c.id.slice(0, 6)} · {c.rooms?.apartments?.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Tipo</Label>
                    <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                      {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div><Label>Valor</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1" /></div>
                </div>
                <div><Label>Vencimento</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="mt-1" /></div>
                <div><Label>Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
                <Button onClick={save} className="w-full rounded-full bg-gradient-sunset shadow-warm">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-primary/40 bg-primary/5 p-3 shadow-soft">
          <span className="text-sm font-medium">{selected.size} selecionado(s)</span>
          <Button size="sm" variant="outline" onClick={bulkMarkPaid} className="rounded-full"><CheckCircle2 className="mr-1 h-3 w-3" />Marcar pago</Button>
          <Button size="sm" variant="outline" onClick={() => setOpenEdit("amount")} className="rounded-full"><DollarSign className="mr-1 h-3 w-3" />Valor</Button>
          <Button size="sm" variant="outline" onClick={() => setOpenEdit("due_date")} className="rounded-full"><Calendar className="mr-1 h-3 w-3" />Vencimento</Button>
          <Button size="sm" variant="outline" onClick={() => setOpenEdit("status")} className="rounded-full">Status</Button>
          <Button size="sm" variant="outline" onClick={bulkCancel} className="rounded-full text-rose-600"><Ban className="mr-1 h-3 w-3" />Cancelar</Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                <th className="px-4 py-3 text-left font-medium">Moradora / Casa</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Valor</th>
                <th className="px-4 py-3 text-left font-medium">Encargos</th>
                <th className="px-4 py-3 text-left font-medium">Vencimento</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Nenhum pagamento.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-3 py-3"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} /></td>
                  <td className="cursor-pointer px-4 py-3" onClick={() => setDrawer(r)}>
                    <p className="font-medium">{r.contracts?.profiles?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{r.contracts?.rooms?.apartments?.name} · {r.contracts?.rooms?.name}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{r.kind}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(r.amount)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {(Number(r.late_fee) + Number(r.interest)) > 0 ? `+ ${fmt(Number(r.late_fee) + Number(r.interest))}` : "—"}
                  </td>
                  <td className="px-4 py-3">{formatDate(r.due_date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk edit dialog */}
      <Dialog open={!!openEdit} onOpenChange={(o) => { if (!o) { setOpenEdit(null); setEditValue(""); } }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>Editar em lote — {openEdit}</DialogTitle></DialogHeader>
          {openEdit === "status" ? (
            <select value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
              <option value="">Selecione...</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <Input type={openEdit === "due_date" ? "date" : "number"} value={editValue} onChange={(e) => setEditValue(e.target.value)} />
          )}
          <DialogFooter><Button onClick={bulkApplyEdit} className="rounded-full bg-gradient-sunset shadow-warm">Aplicar a {selected.size}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drawer */}
      {drawer && <PaymentDrawer payment={drawer} onClose={() => { setDrawer(null); load(); }} />}
    </div>
  );
}

function PaymentDrawer({ payment, onClose }: { payment: any; onClose: () => void }) {
  const [charges, setCharges] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from("payment_charges").select("*").eq("payment_id", payment.id).order("applied_at").then(({ data }) => setCharges(data || []));
  }, [payment.id]);

  const upload = async (file: File) => {
    setUploading(true);
    const path = `${payment.contract_id}/${payment.id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("payment-proofs").upload(path, file);
    if (error) { setUploading(false); return toast.error(error.message); }
    await supabase.from("payments").update({ proof_url: path }).eq("id", payment.id);
    toast.success("Comprovante anexado");
    setUploading(false);
    onClose();
  };

  const generateReceipt = async () => {
    const number = `REC-${new Date().getFullYear()}-${payment.id.slice(0, 8).toUpperCase()}`;
    await supabase.from("payments").update({ receipt_number: number }).eq("id", payment.id);
    const html = `<html><head><title>${number}</title><style>body{font-family:system-ui;padding:40px;max-width:600px;margin:auto}h1{font-size:24px}table{width:100%;margin-top:20px}td{padding:6px 0;border-bottom:1px solid #eee}</style></head><body><h1>Recibo ${number}</h1><table><tr><td>Tipo</td><td><b>${payment.kind}</b></td></tr><tr><td>Valor</td><td><b>${fmt(payment.amount)}</b></td></tr><tr><td>Vencimento</td><td>${formatDate(payment.due_date)}</td></tr><tr><td>Status</td><td>${payment.status}</td></tr><tr><td>Pago em</td><td>${payment.paid_at ? formatDateTime(payment.paid_at) : "—"}</td></tr></table><p style="margin-top:40px;color:#888;font-size:12px">Recibo interno — Lartinas</p></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
    toast.success(`Recibo ${number} gerado`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl">Detalhes</h2>
        <p className="mt-1 text-sm text-muted-foreground capitalize">{payment.kind} — {fmt(payment.amount)}</p>
        <StatusBadge status={payment.status} />

        <div className="mt-4 space-y-2 text-sm">
          <p><span className="text-muted-foreground">Vencimento:</span> {formatDate(payment.due_date)}</p>
          <p><span className="text-muted-foreground">Original:</span> {fmt(payment.original_amount ?? payment.amount)}</p>
          <p><span className="text-muted-foreground">Multa:</span> {fmt(payment.late_fee)}</p>
          <p><span className="text-muted-foreground">Juros:</span> {fmt(payment.interest)}</p>
          {payment.description && <p><span className="text-muted-foreground">Descrição:</span> {payment.description}</p>}
        </div>

        <h3 className="mt-6 font-semibold">Histórico de encargos</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {charges.length === 0 && <li className="text-muted-foreground">Nenhum encargo aplicado.</li>}
          {charges.map((c) => (
            <li key={c.id} className="flex justify-between rounded-xl border border-border/60 px-3 py-2">
              <span className="capitalize">{c.kind} — {c.reason}</span>
              <span>{fmt(c.amount)}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-6 font-semibold">Comprovante</h3>
        {payment.proof_url ? (
          <div className="space-y-2 text-sm">
            <p className="text-emerald-600">✓ Anexado</p>
            <p className="text-xs text-muted-foreground break-all">{payment.proof_url}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs">Validação:</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                payment.proof_validation_status === "validado" ? "bg-emerald-100 text-emerald-700" :
                payment.proof_validation_status === "rejeitado" ? "bg-rose-100 text-rose-700" :
                "bg-amber-100 text-amber-700"
              }`}>{payment.proof_validation_status ?? "pendente"}</span>
            </div>
            {payment.proof_validation_status !== "validado" && (
              <Button size="sm" onClick={async () => {
                const { data: u } = await supabase.auth.getUser();
                const { error } = await supabase.from("payments").update({
                  proof_validation_status: "validado", proof_validated_by: u.user?.id, proof_validated_at: new Date().toISOString(),
                  proof_rejection_reason: null,
                }).eq("id", payment.id);
                if (error) return toast.error(error.message);
                toast.success("Comprovante validado"); onClose();
              }} className="rounded-full">Validar</Button>
            )}
            {payment.proof_validation_status !== "rejeitado" && (
              <Button size="sm" variant="outline" onClick={async () => {
                const reason = prompt("Motivo da rejeição:");
                if (!reason) return;
                const { data: u } = await supabase.auth.getUser();
                const { error } = await supabase.from("payments").update({
                  proof_validation_status: "rejeitado", proof_validated_by: u.user?.id, proof_validated_at: new Date().toISOString(),
                  proof_rejection_reason: reason,
                }).eq("id", payment.id);
                if (error) return toast.error(error.message);
                toast.success("Comprovante rejeitado"); onClose();
              }} className="ml-2 rounded-full text-rose-600">Rejeitar</Button>
            )}
            {payment.proof_rejection_reason && <p className="text-xs text-rose-600">Motivo: {payment.proof_rejection_reason}</p>}
          </div>
        ) : (
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
            <Upload className="h-3 w-3" />
            {uploading ? "Enviando..." : "Anexar arquivo"}
            <input type="file" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        )}

        <div className="mt-6 flex gap-2">
          <Button onClick={generateReceipt} variant="outline" className="rounded-full"><Receipt className="mr-1 h-3 w-3" />Gerar recibo</Button>
          <Button onClick={onClose} variant="ghost" className="rounded-full">Fechar</Button>
        </div>
      </div>
    </div>
  );
}
