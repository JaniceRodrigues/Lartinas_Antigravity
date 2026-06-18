import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { personSchema, formatCPF, formatPhone, type PersonInput } from "@/lib/validators/person";
import { AddressFields } from "@/components/forms/AddressFields";
import { toast } from "sonner";

export type PersonFormValues = PersonInput & {
  status?: string;
  financial_notes?: string | null;
};

export function PersonForm({
  initial,
  scope,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<PersonFormValues>;
  scope: "morador" | "proprietario";
  onSubmit: (v: PersonFormValues) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState<Partial<PersonFormValues>>(initial || {});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof PersonFormValues, val: any) => setV((s) => ({ ...s, [k]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = personSchema.safeParse(v);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ ...parsed.data, status: v.status, financial_notes: v.financial_notes });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Dados pessoais</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nome *"><Input value={v.full_name || ""} onChange={(e) => set("full_name", e.target.value)} /></Field>
          <Field label="Sobrenome"><Input value={v.last_name || ""} onChange={(e) => set("last_name", e.target.value)} /></Field>
          <Field label="E-mail *"><Input type="email" value={v.email || ""} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Telefone"><Input value={v.phone || ""} onChange={(e) => set("phone", formatPhone(e.target.value))} /></Field>
          <Field label="CPF"><Input value={v.cpf || ""} onChange={(e) => set("cpf", formatCPF(e.target.value))} /></Field>
          <Field label="RG"><Input value={v.rg || ""} onChange={(e) => set("rg", e.target.value)} /></Field>
          <Field label="Passaporte"><Input value={v.passport || ""} onChange={(e) => set("passport", e.target.value)} /></Field>
          <Field label="Data de nascimento"><Input type="date" value={v.birth_date || ""} onChange={(e) => set("birth_date", e.target.value)} /></Field>
          <Field label="Nacionalidade"><Input value={v.nationality || ""} onChange={(e) => set("nationality", e.target.value)} /></Field>
          <Field label="Estado civil">
            <select
              value={v.marital_status || ""}
              onChange={(e) => set("marital_status", e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">—</option>
              <option value="solteiro(a)">Solteiro(a)</option>
              <option value="casado(a)">Casado(a)</option>
              <option value="divorciado(a)">Divorciado(a)</option>
              <option value="viúvo(a)">Viúvo(a)</option>
              <option value="união estável">União estável</option>
              <option value="outro">Outro</option>
            </select>
          </Field>
          <Field label="Profissão"><Input value={v.occupation || ""} onChange={(e) => set("occupation", e.target.value)} /></Field>
          <Field label="Contato emergência (nome)"><Input value={v.emergency_contact_name || ""} onChange={(e) => set("emergency_contact_name", e.target.value)} /></Field>
          <Field label="Contato emergência (telefone)"><Input value={v.emergency_contact_phone || ""} onChange={(e) => set("emergency_contact_phone", formatPhone(e.target.value))} /></Field>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Endereço</h3>
        <AddressFields
          value={{
            cep: v.cep, street: v.street, number: v.number, complement: v.complement,
            neighborhood: v.neighborhood, city: v.city, state: v.state,
          }}
          onChange={(addr) => setV((s) => ({ ...s, ...addr }))}
        />
      </section>

      {scope === "proprietario" && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Status">
              <select
                value={v.status || "ativo"}
                onChange={(e) => set("status", e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
            <Field label="Observações financeiras" className="md:col-span-2">
              <Textarea rows={3} value={v.financial_notes || ""} onChange={(e) => set("financial_notes", e.target.value)} />
            </Field>
          </div>
        </section>
      )}

      <section className="space-y-2">
        <Label>Observações internas</Label>
        <Textarea rows={3} value={v.internal_notes || ""} onChange={(e) => set("internal_notes", e.target.value)} />
      </section>

      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" disabled={busy}>{busy ? "Salvando..." : "Salvar"}</Button>
      </div>
    </form>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
