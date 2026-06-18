import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone, Pin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/portal/comunicados")({ component: Comunicados });

function Comunicados() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [reads, setReads] = useState<Set<string>>(new Set());

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false });
    setItems(data || []);
    if (user) {
      const { data: r } = await supabase.from("announcement_reads").select("announcement_id").eq("user_id", user.id);
      setReads(new Set((r || []).map((x: any) => x.announcement_id)));
    }
  };
  useEffect(() => { load(); }, [user]);

  const markRead = async (id: string) => {
    if (!user || reads.has(id)) return;
    await supabase.from("announcement_reads").upsert({ announcement_id: id, user_id: user.id });
    setReads(new Set([...reads, id]));
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Comunicados" title="Avisos da operação" description="O que está rolando na sua casa e na rede Lartinas." />
      {items.length === 0 && (
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
          <Megaphone className="mx-auto mb-2 h-6 w-6 opacity-60" /> Sem comunicados no momento.
        </div>
      )}
      <div className="space-y-3">
        {items.map((a) => {
          const isRead = reads.has(a.id);
          return (
            <div key={a.id} className={`rounded-2xl border p-4 shadow-soft transition-colors ${isRead ? "border-border/40 bg-muted/30" : "border-primary/40 bg-card"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    {a.pinned && <Pin className="h-3.5 w-3.5 text-primary" />} {a.title}
                  </p>
                  <p className="mt-1 text-sm text-foreground/70 whitespace-pre-wrap">{a.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(a.created_at)}</p>
                </div>
                {!isRead && (
                  <Button size="sm" variant="outline" className="rounded-full shrink-0" onClick={() => markRead(a.id)}>
                    Marcar lido
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
