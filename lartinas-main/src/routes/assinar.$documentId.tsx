import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { mdToHtml } from "@/lib/contract-templates";
import { ArrowLeft, FileSignature } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assinar/$documentId")({ component: Page });

function Page() {
  const { documentId } = Route.useParams();
  const [doc, setDoc] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("contract_documents").select("*").eq("id", documentId).maybeSingle().then(({ data }) => setDoc(data));
  }, [documentId]);

  const sign = async () => {
    if (!agreed) return toast.error("Confirme a leitura");
    setLoading(true);
    let ip = "";
    try { const r = await fetch("https://api.ipify.org?format=json"); ip = (await r.json()).ip; } catch {}
    const { error } = await supabase.from("contract_documents").update({ status: "assinado", signed_at: new Date().toISOString(), signed_by_ip: ip }).eq("id", documentId);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Documento assinado");
    setDoc({ ...doc, status: "assinado" });
  };

  if (!doc) return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando documento...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/portal/contratos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Voltar</Link>
      <div className="mt-6 rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold">{doc.title}</h1>
          <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">{doc.status.replace("_", " ")}</span>
        </div>
        <article className="prose prose-sm mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: mdToHtml(doc.content_rendered) }} />

        {doc.status === "enviado" ? (
          <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-4">
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
              <span>Li e concordo com os termos acima. Ao assinar, registro digitalmente meu aceite.</span>
            </label>
            <Button onClick={sign} disabled={!agreed || loading} className="mt-4 w-full rounded-full bg-gradient-sunset shadow-warm">
              <FileSignature className="mr-2 h-4 w-4" />{loading ? "Assinando..." : "Assinar agora"}
            </Button>
          </div>
        ) : doc.status === "assinado" ? (
          <p className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">✓ Assinado em {doc.signed_at ? new Date(doc.signed_at).toLocaleString("pt-BR") : "—"}{doc.signed_by_ip ? ` · IP ${doc.signed_by_ip}` : ""}</p>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">Documento ainda não está disponível para assinatura (status: {doc.status}).</p>
        )}
      </div>
    </div>
  );
}
