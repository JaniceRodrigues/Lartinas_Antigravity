import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarHeart, Home, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { formatDate, formatBRL } from "@/lib/format";

export const Route = createFileRoute("/portal/estadia")({ component: Estadia });

function Estadia() {
  const { user } = useAuth();
  const [contract, setContract] = useState<any>(null);
  const [apartment, setApartment] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: c } = await supabase
        .from("contracts")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setContract(c);
      if (c?.apartment_id) {
        const { data: a } = await supabase.from("apartments").select("*").eq("id", c.apartment_id).maybeSingle();
        setApartment(a);
      }
      if (c?.room_id) {
        const { data: r } = await supabase.from("rooms").select("*").eq("id", c.room_id).maybeSingle();
        setRoom(r);
      }
    })();
  }, [user]);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Minha estadia" title="Sua casa, em um só lugar" description="Resumo do seu contrato, quarto e endereço." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarHeart} label="Status" value={contract?.status ?? "—"} tone="primary" />
        <StatCard icon={CalendarHeart} label="Início" value={formatDate(contract?.start_date)} tone="amber" />
        <StatCard icon={CalendarHeart} label="Término" value={formatDate(contract?.end_date)} tone="leaf" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary"><Home className="h-5 w-5" /></span>
            <h2 className="font-display text-xl font-semibold">Casa & quarto</h2>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Casa</dt><dd className="font-medium">{apartment?.name ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Endereço</dt><dd className="text-right">{apartment?.address ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Quarto</dt><dd className="font-medium">{room?.name ?? "—"}</dd></div>
          </dl>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></span>
            <h2 className="font-display text-xl font-semibold">Contrato</h2>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Mensalidade</dt><dd className="font-medium">{formatBRL(contract?.monthly_value)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Caução</dt><dd>{formatBRL(contract?.deposit_value)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Renovação automática</dt><dd>{contract?.auto_renewal ? "Sim" : "Não"}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
