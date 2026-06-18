import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatBRL } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/owner/manutencao")({ component: OwnerMaintenance });

function OwnerMaintenance() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    const { data: o } = await supabase.from("owners").select("id").eq("profile_id", user.id);
    const ids = (o || []).map((x: any) => x.id);
    if (!ids.length) return;
    const { data: apts } = await supabase.from("apartments").select("id,name").in("owner_id", ids);
    const aptIds = (apts || []).map((a: any) => a.id);
    if (!aptIds.length) return setTickets([]);
    const { data } = await supabase.from("tickets").select("*").in("apartment_id", aptIds).order("created_at", { ascending: false });
    const named = (data || []).map((t: any) => ({ ...t, apartmentName: apts?.find((a: any) => a.id === t.apartment_id)?.name }));
    setTickets(named);
  };
  useEffect(() => { load(); }, [user]);

  const decide = async (id: string, approval: "aprovado" | "recusado") => {
    const { error } = await supabase.from("tickets").update({ owner_approval: approval }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Decisão registrada");
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Manutenção" title="Chamados dos seus imóveis" description="Acompanhe e aprove orçamentos." />
      <div className="rounded-3xl border border-border/60 bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Casa</TableHead><TableHead>Chamado</TableHead><TableHead>Status</TableHead>
              <TableHead>Custo estimado</TableHead><TableHead>Aprovação</TableHead><TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Nenhum chamado.</TableCell></TableRow>}
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-sm">{t.apartmentName}</TableCell>
                <TableCell>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.created_at)} · {t.priority}</p>
                </TableCell>
                <TableCell><span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{t.status}</span></TableCell>
                <TableCell>{t.cost ? formatBRL(t.cost) : "—"}</TableCell>
                <TableCell>{t.owner_approval ?? "pendente"}</TableCell>
                <TableCell>
                  {t.cost && !t.owner_approval && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => decide(t.id, "aprovado")}>Aprovar</Button>
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => decide(t.id, "recusado")}>Recusar</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
