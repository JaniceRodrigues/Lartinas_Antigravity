import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/chamados")({
  component: Chamados,
});

const statusColors: Record<string, string> = {
  aberto: "bg-amber-100 text-amber-800",
  em_andamento: "bg-blue-100 text-blue-800",
  aguardando: "bg-purple-100 text-purple-800",
  resolvido: "bg-green-100 text-green-800",
  fechado: "bg-gray-100 text-gray-800",
};

function Chamados() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "manutencao", priority: "media" });

  const load = () => {
    supabase.from("tickets").select("*").order("created_at", { ascending: false }).then(({ data }) => setTickets(data || []));
  };

  useEffect(() => { if (user) load(); }, [user]);

  const submit = async () => {
    if (!user) return;
    const { error } = await supabase.from("tickets").insert({
      reporter_id: user.id,
      title: form.title,
      description: form.description,
      category: form.category as any,
      priority: form.priority as any,
    });
    if (error) return toast.error(error.message);
    toast.success("Chamado aberto!");
    setOpen(false); setForm({ title: "", description: "", category: "manutencao", priority: "media" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-semibold">Chamados</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-2 h-4 w-4" /> Abrir chamado</Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle className="font-display text-2xl">Novo chamado</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div><Label>Descrição</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["manutencao", "limpeza", "eletrica", "hidraulica", "internet", "mobilia", "outro"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["baixa", "media", "alta", "urgente"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={submit} className="w-full rounded-full bg-gradient-sunset shadow-warm">Enviar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {tickets.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground shadow-soft">
            Você ainda não abriu nenhum chamado.
          </div>
        )}
        {tickets.map((t) => (
          <div key={t.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="mt-1 text-sm text-foreground/70">{t.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5">{t.category}</span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5">{t.priority}</span>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[t.status] || "bg-secondary"}`}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
