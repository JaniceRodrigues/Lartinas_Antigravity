import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type Entity = "pessoa" | "quarto" | "apartamento" | "contrato" | "candidatura";
type Event = { id: string; title: string; description: string | null; event_type: string; occurred_at: string };

export function Timeline({ entityType, entityId }: { entityType: Entity; entityId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("timeline_events")
      .select("id, title, description, event_type, occurred_at")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("occurred_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setEvents((data ?? []) as Event[]);
        setLoading(false);
      });
  }, [entityType, entityId]);

  if (loading) return <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando linha do tempo...</div>;
  if (!events.length) return <p className="p-4 text-sm text-muted-foreground">Sem eventos registrados.</p>;

  return (
    <ol className="relative space-y-4 border-l border-border/60 pl-5">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
          <p className="text-sm font-medium">{e.title}</p>
          {e.description ? <p className="text-xs text-muted-foreground">{e.description}</p> : null}
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {new Date(e.occurred_at).toLocaleString("pt-BR")} · {e.event_type}
          </p>
        </li>
      ))}
    </ol>
  );
}
