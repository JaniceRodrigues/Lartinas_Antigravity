import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function ApartmentPayoutConfig({ ownerId }: { ownerId: string }) {
  const [apts, setApts] = useState<any[]>([]);
  const [configs, setConfigs] = useState<Record<string, any>>({});

  async function load() {
    const { data: a } = await supabase.from("apartments").select("id, name, neighborhood").eq("owner_id", ownerId);
    setApts(a || []);
    const { data: c } = await supabase.from("apartment_payout_config").select("*").eq("owner_id", ownerId);
    const map: Record<string, any> = {};
    (c || []).forEach((x) => { map[x.apartment_id] = x; });
    setConfigs(map);
  }

  useEffect(() => { load(); }, [ownerId]);

  async function save(aptId: string, patch: any) {
    const existing = configs[aptId];
    const payload = {
      apartment_id: aptId,
      owner_id: ownerId,
      payout_type: existing?.payout_type ?? "percentual",
      payout_value: existing?.payout_value ?? 0,
      active: existing?.active ?? true,
      ...patch,
    };
    const { data, error } = await supabase
      .from("apartment_payout_config")
      .upsert(payload, { onConflict: "apartment_id" })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setConfigs((s) => ({ ...s, [aptId]: data }));
    toast.success("Configuração salva");
  }

  if (apts.length === 0) {
    return <p className="rounded-xl border border-border/60 p-6 text-center text-sm text-muted-foreground">
      Nenhum imóvel vinculado a este proprietário.
    </p>;
  }

  return (
    <div className="space-y-3">
      {apts.map((a) => {
        const c = configs[a.id] || { payout_type: "percentual", payout_value: 0, active: true };
        return (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.neighborhood}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Ativo</span>
                <Switch checked={c.active} onCheckedChange={(v) => save(a.id, { active: v })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Tipo</label>
                <select
                  value={c.payout_type}
                  onChange={(e) => save(a.id, { payout_type: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="percentual">Percentual (%)</option>
                  <option value="fixo">Valor fixo (R$)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Valor</label>
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={c.payout_value}
                  onBlur={(e) => save(a.id, { payout_value: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
