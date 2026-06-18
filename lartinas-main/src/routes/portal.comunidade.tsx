import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Sparkles, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/portal/comunidade")({ component: Comunidade });

function Comunidade() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [category, setCategory] = useState("dica");

  const load = async () => {
    const [{ data: e }, { data: t }] = await Promise.all([
      supabase.from("community_events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at"),
      supabase.from("community_tips").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    setEvents(e || []); setTips(t || []);
  };
  useEffect(() => { load(); }, []);

  const submitTip = async () => {
    if (!user || !title.trim() || !body.trim()) return;
    const { error } = await supabase.from("community_tips").insert({ author_id: user.id, title, body, category });
    if (error) return toast.error(error.message);
    setTitle(""); setBody("");
    toast.success("Dica publicada");
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Comunidade" title="Agenda e dicas" description="Eventos da casa e recomendações entre moradoras." />

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><CalendarDays className="h-4 w-4 text-primary" /> Próximos eventos</h2>
        {events.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum evento agendado.</p> : (
          <ul className="space-y-3">
            {events.map((e) => (
              <li key={e.id} className="rounded-2xl border border-border/60 p-4">
                <p className="font-medium">{e.title}</p>
                {e.description && <p className="mt-1 text-sm text-foreground/70">{e.description}</p>}
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="h-3 w-3" /> {formatDateTime(e.starts_at)}
                  {e.location && <><MapPin className="ml-2 h-3 w-3" /> {e.location}</>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Compartilhar uma dica</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
          <div><Label>Categoria</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1" placeholder="dica, restaurante, evento..." /></div>
        </div>
        <div className="mt-3"><Label>Mensagem</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="mt-1" /></div>
        <div className="mt-3 flex justify-end"><Button onClick={submitTip} className="rounded-full bg-gradient-sunset shadow-warm">Publicar</Button></div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="mb-3 font-display text-lg font-semibold">Dicas da comunidade</h2>
        {tips.length === 0 ? <p className="text-sm text-muted-foreground">Seja a primeira a compartilhar.</p> : (
          <ul className="space-y-3">
            {tips.map((t) => (
              <li key={t.id} className="rounded-2xl border border-border/60 p-4">
                <p className="font-medium">{t.title} <span className="ml-2 text-xs text-muted-foreground">{t.category}</span></p>
                <p className="mt-1 text-sm text-foreground/70 whitespace-pre-wrap">{t.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
