import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "red" | "amber" | "gray";

const PALETTE: Record<Tone, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  red: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  gray: "bg-muted text-muted-foreground",
};

const STATUS_TONE: Record<string, Tone> = {
  // generic
  novo: "blue", nova: "blue", em_analise: "blue", em_andamento: "blue", aberto: "blue",
  qualificado: "blue", agendada: "blue", rascunho: "amber", pendente: "amber",
  aguardando: "amber", em_proposta: "amber", pendencias: "amber",
  ativo: "green", ativa: "green", aprovada: "green", pago: "green", convertido: "green",
  resolvido: "green", realizada: "green", disponivel: "green", devolvido: "green",
  atrasado: "red", recusada: "red", cancelado: "red", cancelada: "red", descartado: "red",
  estornado: "red", expirado: "red", usado: "red",
  encerrado: "gray", fechado: "gray", inativa: "gray", saida: "gray",
  retido: "blue", parcial: "amber",
  alugada: "blue", aguardando_vistoria: "amber", desativado: "gray",
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const tone = STATUS_TONE[status] ?? "gray";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", PALETTE[tone])}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
