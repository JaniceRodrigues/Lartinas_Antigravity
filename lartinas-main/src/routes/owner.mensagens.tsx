import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import { Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/owner/mensagens")({ component: OwnerMessages });

function OwnerMessages() {
  const { user } = useAuth();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const load = async (oid?: string) => {
    const id = oid || ownerId;
    if (!id) return;
    const { data } = await supabase.from("owner_messages").select("*").eq("owner_id", id).order("created_at");
    setMsgs(data || []);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: o } = await supabase.from("owners").select("id").eq("profile_id", user.id).maybeSingle();
      if (o) { setOwnerId(o.id); load(o.id); }
    })();
  }, [user]);

  const send = async () => {
    if (!user || !ownerId || !body.trim()) return;
    const { error } = await supabase.from("owner_messages").insert({
      owner_id: ownerId, sender_id: user.id, from_staff: false, body: body.trim(),
    });
    if (error) return toast.error(error.message);
    setBody(""); load();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Mensagens" title="Fale com a operação" description="Histórico de comunicação." />
      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-soft">
        <div className="flex h-[55vh] flex-col">
          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {msgs.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Sem mensagens ainda.</p>}
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.from_staff ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-soft ${m.from_staff ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-70">{formatDateTime(m.created_at)}</p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="mt-3 flex items-end gap-2 border-t border-border/40 pt-3">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Digite uma mensagem..." rows={2} className="flex-1" />
            <Button onClick={send} className="rounded-full bg-gradient-sunset shadow-warm"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
