import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["rascunho", "enviado", "assinado", "ativo", "finalizado"] as const;

export function ContractStatusTimeline({ status }: { status: string }) {
  if (status === "cancelado") {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Contrato cancelado
      </div>
    );
  }
  const idx = STEPS.indexOf(status as any);
  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-border bg-card/50 p-4">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        const current = i === idx;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full border text-xs font-medium transition",
                done
                  ? "border-transparent bg-gradient-sunset text-primary-foreground shadow-warm"
                  : "border-border bg-background text-muted-foreground",
                current && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
              )}
            >
              {done && !current ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("text-xs capitalize", done ? "text-foreground" : "text-muted-foreground")}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}
