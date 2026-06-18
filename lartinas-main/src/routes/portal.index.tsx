import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, FileText, Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";

export const Route = createFileRoute("/portal/")({
  component: PortalHome,
});

function PortalHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3).then(({ data }) => setAnnouncements(data || []));
  }, [user]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Seu portal"
        title={(profile?.full_name || user?.email || "").split(" ")[0]}
        description="Aqui você acompanha contrato, pagamentos e novidades da casa."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Contrato" value="Ativo" hint="Renova em 6 meses" tone="primary" />
        <StatCard icon={Calendar} label="Próximo pagamento" value="—" hint="Em breve" tone="amber" />
        <StatCard icon={Megaphone} label="Avisos novos" value={announcements.length} hint="Confira abaixo" tone="leaf" />
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Comunicados</h2>
        <div className="mt-4 space-y-3">
          {announcements.length === 0 && <p className="text-sm text-muted-foreground">Nada por aqui ainda.</p>}
          {announcements.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border/60 p-4 transition-colors hover:bg-muted/30">
              <p className="font-medium">{a.title}</p>
              <p className="mt-1 text-sm text-foreground/70">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
