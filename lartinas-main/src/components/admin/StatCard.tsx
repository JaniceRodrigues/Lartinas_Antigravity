import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "leaf" | "amber" | "grape";

const tones: Record<Tone, string> = {
  primary: "from-brand-orange to-brand-orange-soft text-white",
  accent: "from-brand-orange-soft to-brand-orange text-white",
  leaf: "from-brand-green-light to-brand-green text-white",
  amber: "from-brand-cream to-brand-amber text-brand-green",
  grape: "from-brand-green to-[oklch(0.38_0.05_140)] text-white",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-brand-green/10 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-orange/30 hover:shadow-warm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-green/60">{label}</p>
          <p className="font-display text-3xl tracking-tight text-brand-green">{value}</p>
          {hint && <p className="text-xs text-brand-green/60">{hint}</p>}
        </div>
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br shadow-warm transition-transform group-hover:scale-105",
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-brand-orange/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
    </div>

  );
}
