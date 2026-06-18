import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { renderPartyContractTemplate } from "@/lib/contract-templates";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contract?: any;
  onSaved: (createdId?: string) => void;
};

const PROFILE_COLS =
  "id, full_name, email, phone, cpf, rg, passport, nationality, marital_status, occupation, cep, street, number, complement, neighborhood, city, state";

export function PartyContractForm({ open, onOpenChange, contract, onSaved }: Props) {
  const [partyType, setPartyType] = useState<"morador" | "proprietario">("morador");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [manuallyEdited, setManuallyEdited] = useState(false);
  const lastAutoRef = useRef<string>("");
  const [form, setForm] = useState<any>({
    profile_id: "",
    owner_id: "",
    apartment_id: "",
    room_id: "",
    template_id: "",
    title: "",
    content_rendered: "",
    total_value: 0,
    installments_count: 1,
    first_due_date: "",
    start_date: "",
    end_date: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) {
      setSaving(false);
      return;
    }
    (async () => {
      const [p, o, t, ap, rm] = await Promise.all([
        supabase.from("profiles").select(PROFILE_COLS).order("full_name"),
        supabase
          .from("owners")
          .select(`id, document, profile_id, profiles(${PROFILE_COLS})`),
        supabase.from("contract_templates").select("id, name, content, kind").eq("active", true),
        supabase
          .from("apartments")
          .select("id, name, address, cep, street, number, complement, neighborhood, city, state, gender")
          .order("name"),
        supabase.from("rooms").select("id, name, apartment_id").order("name"),
      ]);
      setProfiles(p.data || []);
      setOwners(o.data || []);
      setTemplates(t.data || []);
      setApartments(ap.data || []);
      setRooms(rm.data || []);
    })();
    if (contract) {
      setPartyType(contract.party_type);
      setForm({
        profile_id: contract.profile_id ?? "",
        owner_id: contract.owner_id ?? "",
        apartment_id: contract.apartment_id ?? "",
        room_id: "",
        template_id: contract.template_id ?? "",
        title: contract.title ?? "",
        content_rendered: contract.content_rendered ?? "",
        total_value: contract.total_value ?? 0,
        installments_count: contract.installments_count ?? 1,
        first_due_date: contract.first_due_date ?? "",
        start_date: contract.start_date ?? "",
        end_date: contract.end_date ?? "",
        notes: contract.notes ?? "",
      });
      setManuallyEdited(true); // do not overwrite saved content
    } else {
      setPartyType("morador");
      setForm({
        profile_id: "",
        owner_id: "",
        apartment_id: "",
        room_id: "",
        template_id: "",
        title: "",
        content_rendered: "",
        total_value: 0,
        installments_count: 1,
        first_due_date: "",
        start_date: "",
        end_date: "",
        notes: "",
      });
      setManuallyEdited(false);
      lastAutoRef.current = "";
    }
  }, [open, contract]);

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === form.profile_id) || null,
    [profiles, form.profile_id],
  );
  const selectedOwner = useMemo(
    () => owners.find((o) => o.id === form.owner_id) || null,
    [owners, form.owner_id],
  );
  const selectedApartment = useMemo(
    () => apartments.find((a) => a.id === form.apartment_id) || null,
    [apartments, form.apartment_id],
  );
  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === form.room_id) || null,
    [rooms, form.room_id],
  );
  const filteredRooms = useMemo(
    () => (form.apartment_id ? rooms.filter((r) => r.apartment_id === form.apartment_id) : rooms),
    [rooms, form.apartment_id],
  );
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === form.template_id) || null,
    [templates, form.template_id],
  );

  function buildRendered(templateContent: string): string {
    return renderPartyContractTemplate(templateContent, {
      profile: selectedProfile,
      ownerProfile: selectedOwner?.profiles ?? null,
      ownerDoc: selectedOwner?.document ?? null,
      apartment: selectedApartment,
      room: selectedRoom,
      contract: {
        total_value: form.total_value,
        installments_count: form.installments_count,
        first_due_date: form.first_due_date,
        start_date: form.start_date,
        end_date: form.end_date,
      },
    });
  }

  // Auto-render when template + relevant fields change (unless manually edited)
  useEffect(() => {
    if (manuallyEdited) return;
    if (!selectedTemplate?.content) return;
    const next = buildRendered(selectedTemplate.content);
    lastAutoRef.current = next;
    setForm((f: any) => ({ ...f, content_rendered: next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTemplate?.id,
    selectedProfile?.id,
    selectedOwner?.id,
    selectedApartment?.id,
    selectedRoom?.id,
    form.total_value,
    form.installments_count,
    form.first_due_date,
    form.start_date,
    form.end_date,
    manuallyEdited,
  ]);

  function applyTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    setManuallyEdited(false);
    setForm((f: any) => ({ ...f, template_id: id, title: f.title || t?.name || "" }));
  }

  function regenerate() {
    if (!selectedTemplate?.content) {
      toast.error("Selecione um modelo de contrato");
      return;
    }
    const next = buildRendered(selectedTemplate.content);
    lastAutoRef.current = next;
    setForm((f: any) => ({ ...f, content_rendered: next }));
    setManuallyEdited(false);
    toast.success("Conteúdo regenerado a partir do modelo");
  }

  function onContentChange(v: string) {
    if (v !== lastAutoRef.current) setManuallyEdited(true);
    setForm((f: any) => ({ ...f, content_rendered: v }));
  }

  async function save() {
    if (saving) return;
    if (!form.title) return toast.error("Informe o título");
    if (partyType === "morador" && !form.profile_id) return toast.error("Selecione o morador");
    if (partyType === "proprietario" && !form.owner_id) return toast.error("Selecione o proprietário");

    const payload: any = {
      party_type: partyType,
      profile_id: partyType === "morador" ? form.profile_id : null,
      owner_id: partyType === "proprietario" ? form.owner_id : null,
      apartment_id: form.apartment_id || null,
      template_id: form.template_id || null,
      title: form.title,
      content_rendered: form.content_rendered,
      total_value: Number(form.total_value),
      installments_count: Number(form.installments_count),
      first_due_date: form.first_due_date || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      notes: form.notes || null,
    };

    setSaving(true);
    try {
      if (contract) {
        const { error } = await supabase.from("party_contracts").update(payload).eq("id", contract.id);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Contrato atualizado");
        onSaved(contract.id);
      } else {
        const { data, error } = await supabase
          .from("party_contracts")
          .insert(payload)
          .select("id")
          .single();
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Contrato criado");
        onSaved(data?.id);
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{contract ? "Editar contrato" : "Novo contrato"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["morador", "proprietario"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => !contract && setPartyType(t)}
                disabled={!!contract}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-medium capitalize transition ${
                  partyType === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted/40"
                } ${contract ? "cursor-not-allowed opacity-60" : ""}`}
              >
                Contrato com {t}
              </button>
            ))}
          </div>

          {partyType === "morador" ? (
            <div>
              <Label>Morador</Label>
              <select
                value={form.profile_id}
                onChange={(e) => setForm({ ...form, profile_id: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} {p.email ? `· ${p.email}` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <Label>Proprietário</Label>
              <select
                value={form.owner_id}
                onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.profiles?.full_name ?? "—"} {o.profiles?.email ? `· ${o.profiles.email}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Apartamento</Label>
              <select
                value={form.apartment_id}
                onChange={(e) => setForm({ ...form, apartment_id: e.target.value, room_id: "" })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Quarto</Label>
              <select
                value={form.room_id}
                onChange={(e) => setForm({ ...form, room_id: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                disabled={!form.apartment_id}
              >
                <option value="">Selecione...</option>
                {filteredRooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Modelo de contrato</Label>
            <select
              value={form.template_id}
              onChange={(e) => applyTemplate(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Sem modelo (em branco)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>Conteúdo / cláusulas</Label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {manuallyEdited && selectedTemplate ? <span>Editado manualmente</span> : null}
                {selectedTemplate ? (
                  <button
                    type="button"
                    onClick={regenerate}
                    className="rounded-full border border-border px-3 py-1 hover:bg-muted/40"
                  >
                    Regenerar do modelo
                  </button>
                ) : null}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Os campos do morador, proprietário, apartamento e datas preenchem o contrato automaticamente.
            </p>
            <Textarea
              value={form.content_rendered}
              onChange={(e) => onContentChange(e.target.value)}
              rows={12}
              className="mt-2 font-mono text-xs"
              placeholder="Selecione um modelo ou edite as cláusulas aqui..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor total (R$)</Label>
              <Input type="number" step="0.01" value={form.total_value} onChange={(e) => setForm({ ...form, total_value: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Nº de parcelas</Label>
              <Input type="number" min={1} value={form.installments_count} onChange={(e) => setForm({ ...form, installments_count: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>1º vencimento</Label>
              <Input type="date" value={form.first_due_date} onChange={(e) => setForm({ ...form, first_due_date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Início</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Fim</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="rounded-full">Cancelar</Button>
            <Button onClick={save} disabled={saving} className="rounded-full bg-gradient-sunset shadow-warm">{saving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
