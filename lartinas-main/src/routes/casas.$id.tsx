import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, ArrowLeft, Check } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import room1 from "@/assets/room-1.jpg";
import room2 from "@/assets/room-2.jpg";
import room3 from "@/assets/room-3.jpg";

export const Route = createFileRoute("/casas/$id")({
  component: CasaDetalhe,
});

const demoData: Record<string, any> = {
  "demo-1": {
    name: "Casa Botafogo", neighborhood: "Botafogo",
    description: "Cobertura iluminada com vista pro Pão de Açúcar. Ambiente criativo com sala de coworking, terraço com vegetação e cozinha gourmet.",
    cover_photo_url: room1, photos: [room1, room2, room3], vibe: ["criativa", "calma", "luminosa"],
    rules: "Não fumantes. Pets de pequeno porte sob conversa. Visitas até 22h.",
    amenities: ["Wi-Fi 500MB", "Faxina semanal", "Cozinha equipada", "Terraço", "Coworking"],
    rooms: [
      { id: "r1", name: "Quarto Sol", price_monthly: 2800, size_m2: 14, status: "disponivel", photos: [room1] },
      { id: "r2", name: "Quarto Mar", price_monthly: 3200, size_m2: 16, status: "disponivel", photos: [room2] },
    ],
  },
  "demo-2": {
    name: "Casa Santa Teresa", neighborhood: "Santa Teresa",
    description: "Casarão histórico com pé-direito alto, jardim interno e ateliê compartilhado. Vibe artística e acolhedora.",
    cover_photo_url: room2, photos: [room2, room1, room3], vibe: ["artística", "boêmia"],
    rules: "Respeito ao silêncio das 23h às 8h. Espaço pet-friendly.",
    amenities: ["Wi-Fi", "Jardim", "Ateliê", "Lavanderia"],
    rooms: [{ id: "r3", name: "Quarto Bonde", price_monthly: 2400, size_m2: 12, status: "disponivel", photos: [room2] }],
  },
  "demo-3": {
    name: "Casa Leblon", neighborhood: "Leblon",
    description: "A duas quadras da praia, com sacada e clima sociável. Perfeito pra quem ama mar.",
    cover_photo_url: room3, photos: [room3, room1, room2], vibe: ["praiana", "sociável"],
    rules: "Limpeza compartilhada. Até 1 visitante por noite.",
    amenities: ["Wi-Fi", "Sacada", "Bicicletas", "Próximo à praia"],
    rooms: [{ id: "r4", name: "Quarto Onda", price_monthly: 3800, size_m2: 18, status: "disponivel", photos: [room3] }],
  },
};

function CasaDetalhe() {
  const { id } = Route.useParams();
  const [house, setHouse] = useState<any>(demoData[id] || demoData["demo-1"]);
  const [rooms, setRooms] = useState<any[]>(demoData[id]?.rooms || []);

  useEffect(() => {
    if (id.startsWith("demo-")) return;
    supabase.from("apartments").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) setHouse(data);
    });
    supabase.from("rooms").select("*").eq("apartment_id", id).then(({ data }) => {
      if (data) setRooms(data);
    });
  }, [id]);

  const photos = house.photos?.length ? house.photos : [house.cover_photo_url];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild size="sm" className="rounded-full">
          <Link to="/casas"><ArrowLeft className="mr-2 h-4 w-4" /> Todas as casas</Link>
        </Button>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> {house.neighborhood}
        </div>
        <h1 className="mt-2 font-display text-5xl font-semibold sm:text-6xl">{house.name}</h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(house.vibe || []).map((v: string) => (
            <span key={v} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{v}</span>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-4 gap-3">
          <img src={photos[0]} alt="" className="col-span-4 aspect-[16/9] rounded-3xl object-cover shadow-soft md:col-span-3 md:row-span-2 md:aspect-auto" />
          {photos.slice(1, 3).map((p: string, i: number) => (
            <img key={i} src={p} alt="" loading="lazy" className="hidden aspect-square w-full rounded-2xl object-cover shadow-soft md:block" />
          ))}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-display text-2xl font-semibold">Sobre a casa</h2>
              <p className="mt-3 text-foreground/70">{house.description}</p>
            </div>
            {house.amenities?.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold">O que está incluso</h2>
                <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {house.amenities.map((a: string) => (
                    <li key={a} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {house.rules && (
              <div>
                <h2 className="font-display text-2xl font-semibold">Regras da casa</h2>
                <p className="mt-3 text-foreground/70">{house.rules}</p>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-xl font-semibold">Quartos disponíveis</h3>
              <div className="mt-4 space-y-3">
                {rooms.length === 0 && <p className="text-sm text-muted-foreground">Nenhum quarto disponível no momento.</p>}
                {rooms.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-border/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{r.name}</p>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{r.size_m2}m²</span>
                    </div>
                    <p className="mt-1 font-display text-2xl font-semibold text-primary">
                      R$ {Number(r.price_monthly).toLocaleString("pt-BR")}<span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-5 w-full rounded-full bg-gradient-sunset shadow-warm">
                <Link to="/candidatura">Quero me candidatar</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
