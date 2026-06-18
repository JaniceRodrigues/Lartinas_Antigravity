import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import room1 from "@/assets/room-1.jpg";
import room2 from "@/assets/room-2.jpg";
import room3 from "@/assets/room-3.jpg";

export const Route = createFileRoute("/casas")({
  component: Casas,
  head: () => ({
    meta: [
      { title: "Casas — Lartinas Coliving" },
      { name: "description", content: "Conheça as casas Lartinas no Rio de Janeiro. Coliving feminino curado em bairros que a gente ama." },
    ],
  }),
});

const demoHouses = [
  { id: "demo-1", name: "Casa Botafogo", neighborhood: "Botafogo", description: "Cobertura cheia de luz com vista pro Pão de Açúcar.", cover_photo_url: room1, vibe: ["criativa", "calma"], gender: "feminina" },
  { id: "demo-2", name: "Casa Santa Teresa", neighborhood: "Santa Teresa", description: "Casarão histórico com terraço e ateliê.", cover_photo_url: room2, vibe: ["artística", "boêmia"], gender: "feminina" },
  { id: "demo-3", name: "Casa Leblon", neighborhood: "Leblon", description: "A duas quadras da praia, super sociável.", cover_photo_url: room3, vibe: ["praiana", "sociável"], gender: "feminina" },
];

function Casas() {
  const [houses, setHouses] = useState<any[]>(demoHouses);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.from("apartments").select("*").eq("active", true).then(({ data }) => {
      if (data && data.length) setHouses(data);
    });
  }, []);

  const filtered = houses.filter((h) =>
    [h.name, h.neighborhood, ...(h.vibe || [])].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SiteLayout>
      <section className="bg-gradient-warm">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Nossas casas</p>
          <h1 className="mt-2 font-display text-5xl font-semibold sm:text-6xl">Onde você quer morar?</h1>
          <p className="mx-auto mt-4 max-w-xl text-foreground/70">
            Cada casa Lartinas tem uma vibe única. Encontre a que mais combina com você.
          </p>
          <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por bairro, vibe..."
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => (
            <Link
              key={h.id}
              to="/casas/$id"
              params={{ id: h.id }}
              className="group overflow-hidden rounded-3xl bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-warm"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={h.cover_photo_url || room1}
                  alt={h.name}
                  loading="lazy"
                  width={1280}
                  height={1600}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {h.neighborhood}
                </div>
                <h3 className="mt-1 font-display text-xl font-semibold">{h.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{h.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(h.vibe || []).slice(0, 3).map((v: string) => (
                    <span key={v} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{v}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">Nenhuma casa encontrada com esses filtros.</p>
        )}
      </section>
    </SiteLayout>
  );
}
