import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/chamados")({
  component: AdminChamados,
});

const statuses = ["aberto", "em_andamento", "aguardando", "resolvido", "fechado"];

function AdminChamados() {
  const [tickets, setTickets] = useState<any[]>([]);

  const load = () => supabase.from("tickets").select("*").order("created_at", { ascending: false }).then(({ data }) => setTickets(data || []));
  useEffect(() => { load(); }, []);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("tickets").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold">Chamados</h1>
      <div className="space-y-3">
        {tickets.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground shadow-soft">
            Sem chamados no momento.
          </div>
        )}
        {tickets.map((t) => (
          <div key={t.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t.title}</p>
                <p className="mt-1 text-sm text-foreground/70">{t.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5">{t.category}</span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5">{t.priority}</span>
                </div>
              </div>
              <select value={t.status} onChange={(e) => update(t.id, e.target.value)} className="rounded-full border border-border bg-background px-3 py-1 text-xs">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
