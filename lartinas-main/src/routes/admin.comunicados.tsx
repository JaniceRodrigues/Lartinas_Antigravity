import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/comunicados")({ component: Page });

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "all", pinned: false });

  const load = () => supabase.from("announcements").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.body) return toast.error("Preencha título e corpo");
    const { error } = await supabase.from("announcements").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Comunicado publicado");
    setOpen(false); setForm({ title: "", body: "", audience: "all", pinned: false });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-semibold">Comunicados</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-sunset shadow-warm"><Plus className="mr-2 h-4 w-4" />Novo</Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle className="font-display text-2xl">Novo comunicado</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div><Label>Mensagem</Label><Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="mt-1" /></div>
              <Button onClick={save} className="w-full rounded-full bg-gradient-sunset shadow-warm">Publicar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {rows.length === 0 && <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground shadow-soft">Nenhum comunicado.</div>}
        {rows.map((c) => (
          <div key={c.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <p className="font-medium">{c.title}</p>
            <p className="mt-1 text-sm text-foreground/70">{c.body}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString("pt-BR")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
