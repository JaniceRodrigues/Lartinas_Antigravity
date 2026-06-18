import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL, formatDate } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/owner/financeiro")({ component: OwnerFinance });

function OwnerFinance() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: o } = await supabase.from("owners").select("id").eq("profile_id", user.id);
      const ids = (o || []).map((x: any) => x.id);
      if (!ids.length) return;
      const { data } = await supabase.from("financial_entries").select("*").in("owner_id", ids).order("due_date", { ascending: false });
      setEntries(data || []);
    })();
  }, [user]);

  const chart = useMemo(() => {
    const byMonth: Record<string, number> = {};
    entries.forEach((e) => {
      const k = (e.due_date || "").slice(0, 7);
      if (!k) return;
      byMonth[k] = (byMonth[k] || 0) + Number(e.amount);
    });
    return Object.entries(byMonth).sort().map(([month, total]) => ({ month, total }));
  }, [entries]);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Financeiro" title="Repasses e lançamentos" description="Histórico financeiro vinculado aos seus imóveis." />

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-semibold">Evolução mensal</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">Nenhum lançamento.</TableCell></TableRow>
            )}
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.description}</TableCell>
                <TableCell>{formatDate(e.due_date)}</TableCell>
                <TableCell>{formatBRL(e.amount)}</TableCell>
                <TableCell><span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{e.status}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
