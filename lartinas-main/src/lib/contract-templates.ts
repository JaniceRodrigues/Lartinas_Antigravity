// Variable substitution for contract templates.
// Usage: {{moradora.nome}}, {{contrato.valor_mensal}} etc.

export type TemplateContext = {
  moradora?: { nome?: string; documento?: string; email?: string; phone?: string };
  proprietario?: { nome?: string };
  apartamento?: { nome?: string; endereco?: string };
  quarto?: { nome?: string };
  contrato?: {
    valor_mensal?: number | string;
    caucao?: number | string;
    inicio?: string;
    fim?: string;
  };
  regras?: string;
};

const fmtMoney = (v: number | string | undefined) =>
  v == null || v === "" ? "—" : `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const fmtDate = (v: string | undefined) => (v ? new Date(v + "T00:00:00").toLocaleDateString("pt-BR") : "—");

export function renderTemplate(content: string, ctx: TemplateContext): string {
  const map: Record<string, string> = {
    "moradora.nome": ctx.moradora?.nome ?? "—",
    "moradora.documento": ctx.moradora?.documento ?? "—",
    "moradora.email": ctx.moradora?.email ?? "—",
    "moradora.phone": ctx.moradora?.phone ?? "—",
    "proprietario.nome": ctx.proprietario?.nome ?? "—",
    "apartamento.nome": ctx.apartamento?.nome ?? "—",
    "apartamento.endereco": ctx.apartamento?.endereco ?? "—",
    "quarto.nome": ctx.quarto?.nome ?? "—",
    "contrato.valor_mensal": fmtMoney(ctx.contrato?.valor_mensal),
    "contrato.caucao": fmtMoney(ctx.contrato?.caucao),
    "contrato.inicio": fmtDate(ctx.contrato?.inicio),
    "contrato.fim": fmtDate(ctx.contrato?.fim),
    regras: ctx.regras ?? "",
  };
  return content.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => map[k] ?? `{{${k}}}`);
}

export const TEMPLATE_VARIABLES = [
  "moradora.nome",
  "moradora.documento",
  "moradora.email",
  "moradora.phone",
  "proprietario.nome",
  "apartamento.nome",
  "apartamento.endereco",
  "quarto.nome",
];

// ---- Party contracts (modelos oficiais Hóspede/Proprietário) ----
export type PartyRenderCtx = {
  profile?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    cpf?: string | null;
    rg?: string | null;
    passport?: string | null;
    nationality?: string | null;
    marital_status?: string | null;
    occupation?: string | null;
    cep?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
  } | null;
  ownerProfile?: PartyRenderCtx["profile"];
  ownerDoc?: string | null;
  apartment?: {
    name?: string | null;
    address?: string | null;
    cep?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    gender?: string | null;
  } | null;
  room?: { name?: string | null } | null;
  contract?: {
    total_value?: number | string | null;
    installments_count?: number | string | null;
    first_due_date?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  };
};

function fullAddress(p?: PartyRenderCtx["profile"] | PartyRenderCtx["apartment"]): string {
  if (!p) return "—";
  const parts = [
    [p.street, p.number].filter(Boolean).join(", "),
    p.complement,
    p.neighborhood,
    [p.city, p.state].filter(Boolean).join("/"),
    p.cep,
  ].filter((x) => x && String(x).trim().length);
  return parts.length ? parts.join(" - ") : "—";
}

export function renderPartyContractTemplate(content: string, ctx: PartyRenderCtx): string {
  const h = ctx.profile || {};
  const o = ctx.ownerProfile || {};
  const ap = ctx.apartment || {};
  const room = ctx.room || {};
  const co = ctx.contract || {};

  const hospedeDoc = h.cpf || h.rg || h.passport || "—";
  const propDoc = ctx.ownerDoc || o.cpf || o.rg || o.passport || "—";
  const valorMensal =
    co.total_value && co.installments_count
      ? Number(co.total_value) / Number(co.installments_count)
      : undefined;

  const flat: Record<string, string> = {
    hospede_nome: h.full_name || "—",
    hospede_email: h.email || "—",
    hospede_telefone: h.phone || "—",
    hospede_nacionalidade: h.nationality || "brasileiro(a)",
    hospede_estado_civil: h.marital_status || "—",
    hospede_profissao: h.occupation || "—",
    hospede_rg: h.rg || "—",
    hospede_cpf: h.cpf || "—",
    hospede_documento: hospedeDoc,
    hospede_endereco: fullAddress(h),
    proprietario_nome: o.full_name || "—",
    proprietario_email: o.email || "—",
    proprietario_contato: o.phone || "—",
    proprietario_whatsapp: o.phone || "—",
    proprietario_nacionalidade: o.nationality || "brasileiro(a)",
    proprietario_estado_civil: o.marital_status || "—",
    proprietario_profissao: o.occupation || "—",
    proprietario_rg: o.rg || "—",
    proprietario_cpf: propDoc,
    proprietario_documento: propDoc,
    proprietario_endereco: fullAddress(o),
    apartamento_nome: ap.name || "—",
    apartamento_endereco: ap.address || fullAddress(ap),
    quarto_nome: room.name || "—",
    unidade_endereco: ap.address || fullAddress(ap),
    unidade_complemento: ap.complement || "—",
    unidade_cep: ap.cep || "—",
    unidade_cidade_uf: [ap.city, ap.state].filter(Boolean).join("/") || "—",
    unidade_descricao: ap.name || "—",
    unidade_matricula: "—",
    unidade_garagem: "—",
    unidade_deposito: "—",
    modalidade:
      ap.gender === "feminina"
        ? "Feminina"
        : ap.gender === "masculina"
          ? "Masculina"
          : ap.gender === "mista"
            ? "Mista"
            : "—",
    valor_total: fmtMoney(co.total_value ?? undefined),
    valor_mensal: fmtMoney(valorMensal),
    parcelas_qtd: co.installments_count ? String(co.installments_count) : "—",
    prazo_meses: co.installments_count ? String(co.installments_count) : "—",
    data_inicio: fmtDate(co.start_date || undefined),
    data_fim: fmtDate(co.end_date || undefined),
    data_ingresso: fmtDate(co.start_date || undefined),
    data_primeiro_vencimento: fmtDate(co.first_due_date || undefined),
    dia_repasse: co.first_due_date
      ? String(new Date(co.first_due_date + "T00:00:00").getDate())
      : "—",
    local_data: `Rio de Janeiro, ${new Date().toLocaleDateString("pt-BR")}`,
    foro_comarca: "Rio de Janeiro/RJ",
    // Compat com placeholders antigos
    "moradora.nome": h.full_name || "—",
    "moradora.documento": hospedeDoc,
    "moradora.email": h.email || "—",
    "moradora.phone": h.phone || "—",
    "proprietario.nome": o.full_name || "—",
    "apartamento.nome": ap.name || "—",
    "apartamento.endereco": ap.address || fullAddress(ap),
    "quarto.nome": room.name || "—",
    "contrato.valor_mensal": fmtMoney(valorMensal),
    "contrato.inicio": fmtDate(co.start_date || undefined),
    "contrato.fim": fmtDate(co.end_date || undefined),
  };

  return content.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => (k in flat ? flat[k] : `{{${k}}}`));
}


// Markdown -> HTML simples (sem dependências). Cobre h1-h3, **bold**, *italic*, listas, parágrafos.
export function mdToHtml(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const flushList = () => { if (inList) { out.push("</ul>"); inList = false; } };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^###\s+/.test(line)) { flushList(); out.push(`<h3>${esc(line.replace(/^###\s+/, ""))}</h3>`); continue; }
    if (/^##\s+/.test(line)) { flushList(); out.push(`<h2>${esc(line.replace(/^##\s+/, ""))}</h2>`); continue; }
    if (/^#\s+/.test(line)) { flushList(); out.push(`<h1>${esc(line.replace(/^#\s+/, ""))}</h1>`); continue; }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(esc(line.replace(/^[-*]\s+/, "")))}</li>`);
      continue;
    }
    if (line.trim() === "") { flushList(); out.push(""); continue; }
    flushList();
    out.push(`<p>${inline(esc(line))}</p>`);
  }
  flushList();
  return out.join("\n");

  function inline(s: string) {
    return s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }
}

export function buildPrintableHtml(title: string, htmlBody: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;max-width:780px;margin:40px auto;padding:0 32px;color:#1f1f1f;line-height:1.6}
  h1{font-size:26px;border-bottom:2px solid #333;padding-bottom:8px}
  h2{font-size:20px;margin-top:28px}
  h3{font-size:16px;margin-top:20px}
  p{margin:10px 0}
  ul{padding-left:22px}
  .signature{margin-top:60px;border-top:1px solid #999;padding-top:8px;font-size:13px;color:#555}
  @media print{body{margin:0}}
</style></head><body>${htmlBody}<div class="signature">Documento gerado por Lartinas</div></body></html>`;
}
