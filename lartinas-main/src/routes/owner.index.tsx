import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Building2, Wallet, Wrench, TrendingUp, MapPin, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL, formatDate } from "@/lib/format";

export const Route = createFileRoute("/owner/")({ component: OwnerHome });

function fullAddress(a: any) {
  const line1 = [a.street, a.number].filter(Boolean).join(", ");
  const line2 = [a.complement, a.neighborhood].filter(Boolean).join(" · ");
  const line3 = [a.city, a.state].filter(Boolean).join("/");
  return [line1, line2, line3, a.cep].filter(Boolean).join(" — ") || a.address || "Endereço não informado";
}

function OwnerHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [apartments, setApartments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [stats, setStats] = useState({ apartments: 0, pendingReceivable: 0, openTickets: 0, monthly: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    (async () => {
      const { data: ownerRows } = await supabase.from("owners").select("id").eq("profile_id", user.id);
      const ownerIds = (ownerRows || []).map((o: any) => o.id);
      if (!ownerIds.length) return;
      const { data: apts } = await supabase.from("apartments").select("*").in("owner_id", ownerIds);
      setApartments(apts || []);

      const aptIds = (apts || []).map((a: any) => a.id);
      const [{ data: fin }, { data: tk }, { data: pc }, { data: po }] = await Promise.all([
        supabase.from("financial_entries").select("amount,status,type").in("owner_id", ownerIds),
        aptIds.length ? supabase.from("tickets").select("id,status").in("apartment_id", aptIds) : Promise.resolve({ data: [] } as any),
        supabase.from("party_contracts").select("*").eq("party_type", "proprietario").in("owner_id", ownerIds).order("created_at", { ascending: false }),
        supabase.from("owner_payouts").select("*").in("owner_id", ownerIds).order("period_end", { ascending: false }),
      ]);
      setContracts(pc || []);
      setPayouts(po || []);

      const pending = (fin || []).filter((f: any) => f.status === "pendente" && f.type === "pagar").reduce((s: number, f: any) => s + Number(f.amount), 0);
      const monthly = (fin || []).filter((f: any) => f.type === "pagar").reduce((s: number, f: any) => s + Number(f.amount), 0);
      const open = (tk || []).filter((t: any) => t.status !== "resolvido" && t.status !== "cancelado").length;
      setStats({ apartments: apts?.length || 0, pendingReceivable: pending, openTickets: open, monthly });
    })();
  }, [user]);

  const pendingPayoutTotal = useMemo(
    () => payouts.filter((p) => p.status === "pendente").reduce((s, p) => s + Number(p.final_amount || 0), 0),
    [payouts]
  );

  const downloadPdf = async (path: string) => {
    const { data } = await supabase.storage.from("contract-pdfs").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Portal do proprietário"
        title={(profile?.full_name || user?.email || "").split(" ")[0]}
        description="Acompanhe seu portfólio, repasses e operação."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Imóveis ativos" value={stats.apartments} tone="primary" />
        <StatCard icon={Wallet} label="A repassar (pendente)" value={formatBRL(pendingPayoutTotal)} tone="amber" />
        <StatCard icon={TrendingUp} label="Repasses (total)" value={formatBRL(stats.monthly)} tone="leaf" />
        <StatCard icon={Wrench} label="Chamados em aberto" value={stats.openTickets} tone="grape" />
      </div>

      {/* Imóveis */}
      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Seus imóveis</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {apartments.length === 0 && <p className="text-sm text-muted-foreground">Nenhum imóvel vinculado ao seu cadastro.</p>}
          {apartments.map((a) => (
            <div key={a.id} className="overflow-hidden rounded-2xl border border-border/60">
              {a.cover_photo_url && (
                <img src={a.cover_photo_url} alt={a.name} className="h-40 w-full object-cover" />
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{a.name}</p>
                    {a.code && <p className="text-xs text-muted-foreground">Código: {a.code}</p>}
                  </div>
                  <Badge variant={a.active ? "default" : "secondary"}>{a.active ? "Ativo" : "Inativo"}</Badge>
                </div>
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {fullAddress(a)}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {a.house_type && <Badge variant="outline" className="text-[10px]">{a.house_type}</Badge>}
                  {a.gender && <Badge variant="outline" className="text-[10px]">{a.gender}</Badge>}
                  {(a.amenities || []).slice(0, 4).map((x: string) => (
                    <Badge key={x} variant="secondary" className="text-[10px]">{x}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contratos */}
      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Contratos do imóvel</h2>
        <div className="mt-4 space-y-3">
          {contracts.length === 0 && <p className="text-sm text-muted-foreground">Nenhum contrato registrado.</p>}
          {contracts.map((c) => {
            const apt = apartments.find((a) => a.id === c.apartment_id);
            return (
              <div key={c.id} className="rounded-2xl border border-border/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <FileText className="h-4 w-4 text-primary" /> {c.title}
                    </p>
                    {apt && <p className="text-xs text-muted-foreground">{apt.name}</p>}
                  </div>
                  <Badge variant="outline">{c.status}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <div><span className="text-foreground/70">Vigência:</span> {formatDate(c.start_date)} → {formatDate(c.end_date)}</div>
                  <div><span className="text-foreground/70">Valor total:</span> {formatBRL(c.total_value)}</div>
                  <div><span className="text-foreground/70">Parcelas:</span> {c.installments_count}</div>
                </div>
                {c.pdf_path && (
                  <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={() => downloadPdf(c.pdf_path)}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Baixar PDF
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Repasses */}
      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-xl font-semibold">Repasses</h2>
          <p className="text-sm text-muted-foreground">
            Pendente: <span className="font-semibold text-foreground">{formatBRL(pendingPayoutTotal)}</span>
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {payouts.length === 0 && <p className="text-sm text-muted-foreground">Nenhum repasse registrado ainda.</p>}
          {payouts.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{formatDate(p.period_start)} → {formatDate(p.period_end)}</p>
                  <p className="text-xs text-muted-foreground">Modelo: {p.model}{p.percentage ? ` · ${p.percentage}%` : ""}</p>
                </div>
                <Badge variant={p.status === "pendente" ? "default" : p.status === "pago" ? "secondary" : "outline"}>
                  {p.status}
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
                <div><span className="text-muted-foreground">Receita bruta:</span> {formatBRL(p.gross_revenue)}</div>
                <div><span className="text-muted-foreground">Custos:</span> {formatBRL(p.costs)}</div>
                <div className="font-semibold text-foreground"><span className="text-muted-foreground font-normal">A repassar:</span> {formatBRL(p.final_amount)}</div>
                <div><span className="text-muted-foreground">Pago em:</span> {p.paid_at ? formatDate(p.paid_at) : "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
