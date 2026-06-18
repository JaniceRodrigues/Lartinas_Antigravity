import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/candidaturas")({
  component: Candidaturas,
});

const columns: { key: string; title: string }[] = [
  { key: "nova", title: "Novas" },
  { key: "em_analise", title: "Em análise" },
  { key: "entrevista", title: "Entrevista" },
  { key: "aprovada", title: "Aprovada" },
  { key: "recusada", title: "Recusada" },
];

function Candidaturas() {
  const [apps, setApps] = useState<any[]>([]);

  const load = () => supabase.from("applications").select("*").order("created_at", { ascending: false }).then(({ data }) => setApps(data || []));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("applications").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    load();
  };

  const viewDoc = async (path: string) => {
    const { data, error } = await supabase.storage.from("application-documents").createSignedUrl(path, 60);
    if (error || !data) return toast.error(error?.message || "Erro ao gerar link");
    window.open(data.signedUrl, "_blank");
  };

  const docLabel: Record<string, string> = {
    rg_cpf: "RG/CPF",
    comprovante_residencia: "Comp. residência",
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold">Candidaturas</h1>
      <div className="grid gap-4 lg:grid-cols-5">
        {columns.map((col) => {
          const items = apps.filter((a) => a.status === col.key);
          return (
            <div key={col.key} className="rounded-3xl border border-border bg-muted/40 p-3">
              <div className="flex items-center justify-between px-2 pb-3">
                <h2 className="font-display text-sm font-semibold">{col.title}</h2>
                <span className="rounded-full bg-card px-2 py-0.5 text-xs">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((a) => (
                  <div key={a.id} className="rounded-2xl bg-card p-3 shadow-soft">
                    <p className="text-sm font-medium">{a.full_name}</p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                    {a.budget_max && <p className="mt-1 text-xs">R$ {Number(a.budget_max).toLocaleString("pt-BR")}/mês</p>}
                    {a.document_path && (
                      <button onClick={() => viewDoc(a.document_path)} className="mt-1 block text-xs text-primary underline">
                        Ver {docLabel[a.document_type] ?? "documento"}
                      </button>
                    )}
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                      className="mt-2 w-full rounded-full border border-border bg-background px-2 py-1 text-xs"
                    >
                      {columns.map((c) => <option key={c.key} value={c.key}>{c.title}</option>)}
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
