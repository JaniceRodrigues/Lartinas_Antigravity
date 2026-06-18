import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/portal/manual")({ component: Manual });

function Manual() {
  const [sections, setSections] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("house_manual_sections").select("*").order("order_index").then(({ data }) => setSections(data || []));
  }, []);

  const grouped = useMemo(() => {
    const filtered = sections.filter(
      (s) => !q || s.title.toLowerCase().includes(q.toLowerCase()) || s.body.toLowerCase().includes(q.toLowerCase()),
    );
    return filtered.reduce<Record<string, any[]>>((acc, s) => {
      (acc[s.category] = acc[s.category] || []).push(s);
      return acc;
    }, {});
  }, [sections, q]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Manual da casa" title="Como tudo funciona por aqui" description="Wi-Fi, regras, contatos e dicas práticas." />
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar no manual..." className="pl-9" />
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
          <BookOpen className="mx-auto mb-2 h-6 w-6 opacity-60" />
          Nada por aqui ainda. Em breve a operação publica o manual da sua casa.
        </div>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="mb-3 font-display text-lg font-semibold capitalize">{cat}</h2>
          <Accordion type="multiple">
            {items.map((s) => (
              <AccordionItem key={s.id} value={s.id}>
                <AccordionTrigger className="text-left">{s.title}</AccordionTrigger>
                <AccordionContent className="whitespace-pre-wrap text-sm text-foreground/80">{s.body}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
