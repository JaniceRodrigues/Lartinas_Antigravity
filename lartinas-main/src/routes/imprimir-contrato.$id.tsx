import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatBRL } from "@/lib/format";

export const Route = createFileRoute("/imprimir-contrato/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("party_contracts")
      .select("*, profiles(full_name, email, cpf, phone), owners(profiles:profile_id(full_name, email, cpf, phone))")
      .eq("id", id)
      .single()
      .then(({ data }) => setContract(data));
  }, [id]);

  useEffect(() => {
    if (contract) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [contract]);

  useEffect(() => {
    const html = document.documentElement;
    const hadDark = html.classList.contains("dark");
    html.classList.remove("dark");
    html.style.colorScheme = "light";
    return () => {
      if (hadDark) html.classList.add("dark");
      html.style.colorScheme = "";
    };
  }, []);

  if (!contract) return <div style={{ padding: 40, fontFamily: "sans-serif", color: "#111", background: "#fff" }}>Carregando...</div>;

  const party = contract.party_type === "morador" ? contract.profiles : contract.owners?.profiles;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px", fontFamily: "Georgia, serif", color: "#111", lineHeight: 1.6, background: "#fff" }}>
      <style>{`
        html, body { background: #ffffff !important; color: #111 !important; }
        @media print {
          @page { margin: 20mm; }
          html, body { background: #ffffff !important; }
          * { color: #111 !important; background: transparent !important; box-shadow: none !important; }
        }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 13px; margin: 16px 0 24px; }
        .meta b { color: #555; font-weight: 600; }
        h1 { font-size: 24px; margin: 0 0 4px; }
        h2 { font-size: 14px; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; }
        pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
        .sign { margin-top: 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .sign div { border-top: 1px solid #333; padding-top: 6px; font-size: 12px; text-align: center; }
      `}</style>

      <h1>{contract.title}</h1>
      <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Contrato com {contract.party_type}
      </div>

      <div className="meta">
        <div><b>Parte:</b> {party?.full_name ?? "—"}</div>
        <div><b>E-mail:</b> {party?.email ?? "—"}</div>
        <div><b>CPF:</b> {party?.cpf ?? "—"}</div>
        <div><b>Telefone:</b> {party?.phone ?? "—"}</div>
        <div><b>Início:</b> {formatDate(contract.start_date)}</div>
        <div><b>Fim:</b> {formatDate(contract.end_date)}</div>
        <div><b>Valor total:</b> {formatBRL(contract.total_value)}</div>
        <div><b>Parcelas:</b> {contract.installments_count}x · 1º venc. {formatDate(contract.first_due_date)}</div>
      </div>

      <h2>Cláusulas</h2>
      <pre>{contract.content_rendered || "—"}</pre>

      {contract.notes && (<><h2>Observações</h2><pre>{contract.notes}</pre></>)}

      <div className="sign">
        <div>{party?.full_name ?? "Parte"}</div>
        <div>Lar Tinas</div>
      </div>
    </div>
  );
}
