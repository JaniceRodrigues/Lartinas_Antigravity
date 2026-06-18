import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: "receber" | "pagar";
  entry?: any | null;
  onSaved: () => void;
};

const empty = { category: "", description: "", amount: 0, due_date: "", payment_method: "", notes: "" };

export function NewManualEntryDialog({ open, onOpenChange, type, entry, onSaved }: Props) {
  const isEdit = !!entry?.id;
  const fromContract = entry?.origin === "contrato_morador" || entry?.origin === "contrato_proprietario";
  const [form, setForm] = useState<any>(empty);

  useEffect(() => {
    if (!open) return;
    if (entry) {
      setForm({
        category: entry.category ?? "",
        description: entry.description ?? "",
        amount: entry.amount ?? 0,
        due_date: entry.due_date ?? "",
        payment_method: entry.payment_method ?? "",
        notes: entry.notes ?? "",
      });
    } else {
      setForm(empty);
    }
  }, [open, entry]);

  async function save() {
    if (!form.due_date) return toast.error("Informe o vencimento");
    if (!Number(form.amount)) return toast.error("Informe o valor");

    const payload: any = {
      category: form.category || null,
      description: form.description || null,
      amount: Number(form.amount),
      due_date: form.due_date,
      payment_method: form.payment_method || null,
      notes: form.notes || null,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("financial_entries").update(payload).eq("id", entry.id));
    } else {
      ({ error } = await supabase.from("financial_entries").insert({
        ...payload,
        type,
        origin: type === "receber" ? "receita_avulsa" : "despesa_avulsa",
        status: "pendente",
      }));
    }
    if (error) return toast.error(error.message);
    toast.success(isEdit ? "Lançamento atualizado" : "Lançamento criado");
    onSaved();
    onOpenChange(false);
  }

  const title = isEdit
    ? "Editar lançamento"
    : type === "receber" ? "Nova receita avulsa" : "Nova despesa avulsa";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
        </DialogHeader>
        {fromContract && (
          <div className="rounded-xl bg-muted/40 p-2 text-xs text-muted-foreground">
            Lançamento gerado de contrato. Tipo e origem não podem ser alterados aqui.
          </div>
        )}
        <div className="space-y-3">
          <div>
            <Label>Categoria</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Vencimento</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Forma de pagamento</Label>
            <Input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} placeholder="Pix, transferência..." className="mt-1" />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Cancelar</Button>
            <Button onClick={save} className="rounded-full bg-gradient-sunset shadow-warm">Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
