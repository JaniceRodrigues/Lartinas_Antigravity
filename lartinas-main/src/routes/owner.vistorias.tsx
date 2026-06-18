import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/owner/vistorias")({ component: OwnerInspections });

function OwnerInspections() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: o } = await supabase.from("owners").select("id").eq("profile_id", user.id);
      const ids = (o || []).map((x: any) => x.id);
      if (!ids.length) return;
      const { data: apts } = await supabase.from("apartments").select("id,name").in("owner_id", ids);
      const aptIds = (apts || []).map((a: any) => a.id);
      if (!aptIds.length) return setItems([]);
      const { data } = await supabase.from("inspections").select("*").in("apartment_id", aptIds).order("scheduled_for", { ascending: false });
      setItems((data || []).map((i: any) => ({ ...i, apartmentName: apts?.find((a: any) => a.id === i.apartment_id)?.name })));
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Vistorias" title="Vistorias dos imóveis" description="Histórico e agendamentos." />
      <div className="rounded-3xl border border-border/60 bg-card shadow-soft">
        <Table>
          <TableHeader><TableRow><TableHead>Casa</TableHead><TableHead>Tipo</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.length === 0 && <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">Nenhuma vistoria.</TableCell></TableRow>}
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.apartmentName}</TableCell>
                <TableCell>{i.kind}</TableCell>
                <TableCell>{formatDateTime(i.scheduled_for)}</TableCell>
                <TableCell><span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{i.status}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
