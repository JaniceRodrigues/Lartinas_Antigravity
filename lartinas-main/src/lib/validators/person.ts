import { z } from "zod";

export function isValidCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i);
  let d1 = 11 - (s % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(c[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i);
  let d2 = 11 - (s % 11);
  if (d2 >= 10) d2 = 0;
  return d2 === parseInt(c[10]);
}

export const formatCPF = (v: string) =>
  v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

export const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};

export const personSchema = z.object({
  full_name: z.string().trim().min(2, "Nome obrigatório").max(120),
  last_name: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z.string().trim().max(30).optional().nullable(),
  cpf: z.string().trim().optional().nullable().refine(
    (v) => !v || isValidCPF(v),
    "CPF inválido"
  ),
  rg: z.string().trim().max(30).optional().nullable(),
  passport: z.string().trim().max(30).optional().nullable(),
  birth_date: z.string().optional().nullable(),
  nationality: z.string().trim().max(80).optional().nullable(),
  marital_status: z.string().trim().max(40).optional().nullable(),
  occupation: z.string().trim().max(120).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  cep: z.string().trim().max(10).optional().nullable(),
  street: z.string().trim().max(200).optional().nullable(),
  number: z.string().trim().max(20).optional().nullable(),
  complement: z.string().trim().max(120).optional().nullable(),
  neighborhood: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().max(2).optional().nullable(),
  emergency_contact_name: z.string().trim().max(120).optional().nullable(),
  emergency_contact_phone: z.string().trim().max(30).optional().nullable(),
  internal_notes: z.string().trim().max(2000).optional().nullable(),
});

export type PersonInput = z.infer<typeof personSchema>;
