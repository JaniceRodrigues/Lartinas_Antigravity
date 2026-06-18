import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/portal/contratos")({ component: Page });

function Page() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: cs = [] } = await supabase.from("contracts").select("*, rooms(name, apartments(name))").eq("tenant_id", u.user.id).order("created_at", { ascending: false });
      setContracts(cs || []);
      const ids = (cs || []).map((c: any) => c.id);
      if (ids.length) {
        const { data: ds = [] } = await supabase.from("contract_documents").select("*").in("contract_id", ids).order("created_at", { ascending: false });
        setDocs(ds || []);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Meus contratos</h1>
        <p className="mt-1 text-muted-foreground">Documentos, vigência e assinatura.</p>
      </div>

      {contracts.length === 0 && <p className="rounded-3xl border border-border bg-card p-6 text-center text-muted-foreground">Nenhum contrato vinculado.</p>}

      {contracts.map((c) => {
        const cdocs = docs.filter((d) => d.contract_id === c.id);
        return (
          <div key={c.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl">{c.rooms?.apartments?.name} · {c.rooms?.name}</p>
                <p className="text-sm text-muted-foreground">{c.start_date} → {c.end_date ?? "—"} · R$ {Number(c.monthly_value).toLocaleString("pt-BR")}/mês</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">{c.status}</span>
            </div>

            <div className="mt-4 space-y-2">
              {cdocs.length === 0 && <p className="text-sm text-muted-foreground">Nenhum documento disponível ainda.</p>}
              {cdocs.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{d.status.replace("_", " ")}</p>
                    </div>
                  </div>
                  {d.status === "enviado" ? (
                    <Link to="/assinar/$documentId" params={{ documentId: d.id }} className="inline-flex items-center gap-1 rounded-full bg-gradient-sunset px-3 py-1 text-xs text-primary-foreground shadow-warm">
                      Assinar <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <Link to="/assinar/$documentId" params={{ documentId: d.id }} className="text-xs text-primary underline">Visualizar</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
