import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialKPIs } from "@/components/admin/finance/FinancialKPIs";
import { FinancialEntriesTable } from "@/components/admin/finance/FinancialEntriesTable";
import { NewManualEntryDialog } from "@/components/admin/finance/NewManualEntryDialog";
import { PaymentsDashboard } from "@/components/admin/payments/PaymentsDashboard";
import { PaymentsTable } from "@/components/admin/payments/PaymentsTable";
import { DepositsTab } from "@/components/admin/payments/DepositsTab";
import { PayoutsTab } from "@/components/admin/payments/PayoutsTab";
import { ReportsTab } from "@/components/admin/payments/ReportsTab";

export const Route = createFileRoute("/admin/financeiro")({ component: Page });

function Page() {
  const [entries, setEntries] = useState<any[]>([]);
  const [tab, setTab] = useState("entries");
  const [entriesFilter, setEntriesFilter] = useState<"todos" | "receber" | "pagar" | "avulsos">("todos");
  const [newOpen, setNewOpen] = useState<null | "receber" | "pagar">(null);

  async function load() {
    try { await supabase.rpc("mark_overdue_financial_entries"); } catch {}
    const { data } = await supabase
      .from("financial_entries")
      .select("*")
      .order("due_date", { ascending: true });
    setEntries(data || []);
  }
  useEffect(() => { load(); }, []);

  const visible = entries.filter((e) => {
    if (entriesFilter === "receber") return e.type === "receber";
    if (entriesFilter === "pagar") return e.type === "pagar";
    if (entriesFilter === "avulsos") return e.origin === "receita_avulsa" || e.origin === "despesa_avulsa";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold">Financeiro</h1>
          <p className="mt-1 text-muted-foreground">Lançamentos, cobranças, cauções e repasses unificados.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setNewOpen("receber")} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />Receita
          </Button>
          <Button onClick={() => setNewOpen("pagar")} className="rounded-full bg-gradient-sunset shadow-warm">
            <Plus className="mr-2 h-4 w-4" />Despesa
          </Button>
        </div>
      </div>

      <FinancialKPIs entries={entries} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-full flex-wrap">
          <TabsTrigger value="overview" className="rounded-full">Visão geral</TabsTrigger>
          <TabsTrigger value="entries" className="rounded-full">Lançamentos ({entries.length})</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-full">Cobranças</TabsTrigger>
          <TabsTrigger value="deposits" className="rounded-full">Cauções</TabsTrigger>
          <TabsTrigger value="payouts" className="rounded-full">Repasses</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-full">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6"><PaymentsDashboard /></TabsContent>

        <TabsContent value="entries" className="mt-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtrar:</span>
            <select
              value={entriesFilter}
              onChange={(e) => setEntriesFilter(e.target.value as any)}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="receber">A receber</option>
              <option value="pagar">A pagar</option>
              <option value="avulsos">Avulsos</option>
            </select>
          </div>
          <FinancialEntriesTable entries={visible} onChanged={load} showType />
        </TabsContent>

        <TabsContent value="payments" className="mt-6"><PaymentsTable /></TabsContent>
        <TabsContent value="deposits" className="mt-6"><DepositsTab /></TabsContent>
        <TabsContent value="payouts" className="mt-6"><PayoutsTab /></TabsContent>
        <TabsContent value="reports" className="mt-6"><ReportsTab /></TabsContent>
      </Tabs>

      <NewManualEntryDialog
        open={newOpen !== null}
        onOpenChange={(v) => !v && setNewOpen(null)}
        type={newOpen ?? "receber"}
        onSaved={load}
      />
    </div>
  );
}
