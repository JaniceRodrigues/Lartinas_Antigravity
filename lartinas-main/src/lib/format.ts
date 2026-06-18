import i18n from "@/i18n";

function toDate(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  // Plain "YYYY-MM-DD" — parse as local date to avoid timezone shifting
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

function locale() {
  return i18n.language?.startsWith("en") ? "en-US" : "pt-BR";
}

export function formatDate(input: string | Date | null | undefined) {
  const d = toDate(input);
  if (!d) return "—";
  return new Intl.DateTimeFormat(locale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(input: string | Date | null | undefined) {
  const d = toDate(input);
  if (!d) return "—";
  return new Intl.DateTimeFormat(locale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatMoney(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale(), {
    style: "currency",
    currency: locale() === "en-US" ? "USD" : "BRL",
    minimumFractionDigits: 2,
  }).format(isNaN(n) ? 0 : n);
}

// Money formatter that always stays in BRL regardless of UI language (legal/financial context)
export function formatBRL(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(isNaN(n) ? 0 : n);
}
