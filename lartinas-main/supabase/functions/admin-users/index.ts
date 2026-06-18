// Supabase Edge Function: admin-users
// Handles privileged user management (list/create/setRoles/delete) using the service role.
// JWT is verified by Supabase; we additionally check the caller has the 'admin' role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const HARDCODED_SUPER_ADMINS = ["janicecustodiorodrigues@gmail.com", "contato@lartinas.com"];
const SUPER_ADMIN_EMAILS = new Set([
  ...HARDCODED_SUPER_ADMINS,
  ...(Deno.env.get("SUPER_ADMIN_EMAILS") ?? Deno.env.get("SUPER_ADMIN_EMAIL") ?? "")
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
]);
const ROLES = ["admin", "operacao", "financeiro", "comercial", "moradora", "proprietario", "fornecedor"] as const;
const PRIVILEGED_ROLES = new Set(["admin", "operacao", "financeiro"]);
type AppRole = (typeof ROLES)[number];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizeEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

async function resolveCallerEmail(admin: ReturnType<typeof createClient>, callerId: string, tokenEmail: string) {
  const normalizedTokenEmail = normalizeEmail(tokenEmail);
  if (normalizedTokenEmail) return normalizedTokenEmail;

  const { data, error } = await admin.auth.admin.getUserById(callerId);
  if (error) {
    console.error("[admin-users] failed to resolve caller email", { callerId, message: error.message });
    return "";
  }

  return normalizeEmail(
    data.user?.email ??
      (typeof data.user?.user_metadata?.email === "string" ? data.user.user_metadata.email : "")
  );
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function err(message: string, status = 400) {
  return json({ error: message }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return err("Unauthorized", 401);
    const token = authHeader.slice("Bearer ".length);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Decode JWT payload (gateway already verified the signature via verify_jwt)
    const payload = decodeJwtPayload(token);
    const callerId = typeof payload?.sub === "string" ? payload.sub : "";
    const tokenEmail = typeof payload?.email === "string" ? payload.email : "";
    if (!callerId) return err("Unauthorized", 401);

    // Confirm caller is admin
    const { data: callerRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);
    const isAdmin = (callerRoles ?? []).some((r: { role: string }) => r.role === "admin");
    if (!isAdmin) return err("Acesso negado: apenas administradores.", 403);

    const callerEmail = await resolveCallerEmail(admin, callerId, tokenEmail);
    const isSuperAdmin = SUPER_ADMIN_EMAILS.has(callerEmail);
    const requireSuper = () => {
      if (!isSuperAdmin) {
        throw new Response(
          JSON.stringify({ error: "Somente o super administrador pode atribuir o papel de Admin." }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }
    };

    const body = await req.json().catch(() => ({}));
    const action = body?.action as string;

    if (action === "me") {
      return json({ isSuperAdmin });
    }

    if (action === "list") {
      const { data: profiles, error: pErr } = await admin
        .from("profiles")
        .select("id, full_name, phone, avatar_url, created_at")
        .order("created_at", { ascending: false });
      if (pErr) return err(pErr.message, 500);

      const { data: roles, error: rErr } = await admin
        .from("user_roles")
        .select("user_id, role");
      if (rErr) return err(rErr.message, 500);

      const { data: authUsers, error: aErr } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (aErr) return err(aErr.message, 500);

      const emailById = new Map(authUsers.users.map((u: any) => [u.id, u.email ?? ""]));
      const rolesById = new Map<string, string[]>();
      for (const r of roles ?? []) {
        const arr = rolesById.get(r.user_id) ?? [];
        arr.push(r.role);
        rolesById.set(r.user_id, arr);
      }

      const out = (profiles ?? []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        phone: p.phone,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        email: emailById.get(p.id) ?? "",
        roles: rolesById.get(p.id) ?? [],
      }));
      return json(out);
    }

    if (action === "create") {
      const { email, password, full_name, phone, roles } = body;
      if (!email || !password || !full_name || !Array.isArray(roles) || roles.length === 0) {
        return err("Campos obrigatórios faltando", 400);
      }
      const validRoles = (roles as string[]).filter((r) => (ROLES as readonly string[]).includes(r)) as AppRole[];
      if (validRoles.length === 0) return err("Papéis inválidos", 400);

      if (validRoles.some((r) => PRIVILEGED_ROLES.has(r))) requireSuper();

      let userId: string;
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });
      if (cErr || !created.user) {
        // If email already exists, locate the existing user and reuse
        const msg = cErr?.message ?? "";
        if (/already|registered|exist/i.test(msg)) {
          const { data: list, error: lErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          if (lErr) return err(lErr.message, 500);
          const existing = list.users.find((u: any) => (u.email ?? "").toLowerCase() === String(email).toLowerCase());
          if (!existing) return err(msg || "Usuário existente não encontrado", 400);
          userId = existing.id;
        } else {
          return err(msg || "Falha ao criar usuário", 400);
        }
      } else {
        userId = created.user.id;
      }

      await admin.from("profiles").upsert({ id: userId, full_name, phone: phone ?? null });
      const rows = validRoles.map((role) => ({ user_id: userId, role }));
      const { error: iErr } = await admin.from("user_roles").upsert(rows, { onConflict: "user_id,role" });
      if (iErr) return err(iErr.message, 500);
      return json({ id: userId });
    }

    if (action === "setRoles") {
      const { user_id, roles } = body;
      if (!user_id || !Array.isArray(roles)) return err("Parâmetros inválidos", 400);
      const validRoles = (roles as string[]).filter((r) => (ROLES as readonly string[]).includes(r));

      if (user_id === callerId && !validRoles.includes("admin")) {
        return err("Você não pode remover seu próprio papel de admin.", 400);
      }

      const { data: current } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", user_id);
      const currentRoles = new Set((current ?? []).map((r: { role: string }) => r.role));
      const nextRoles = new Set(validRoles);
      const touchesPrivileged =
        [...currentRoles, ...nextRoles].some((r) => PRIVILEGED_ROLES.has(r as string)) &&
        [...PRIVILEGED_ROLES].some((r) => currentRoles.has(r) !== nextRoles.has(r));
      if (touchesPrivileged) requireSuper();

      const { error: dErr } = await admin.from("user_roles").delete().eq("user_id", user_id);
      if (dErr) return err(dErr.message, 500);
      if (validRoles.length > 0) {
        const rows = validRoles.map((role) => ({ user_id, role }));
        const { error: iErr } = await admin.from("user_roles").insert(rows);
        if (iErr) return err(iErr.message, 500);
      }
      return json({ ok: true });
    }

    if (action === "delete") {
      const { user_id } = body;
      if (!user_id) return err("user_id obrigatório", 400);
      if (user_id === callerId) return err("Você não pode excluir a si mesma.", 400);
      const { data: current } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", user_id);
      if ((current ?? []).some((r: { role: string }) => r.role === "admin")) requireSuper();
      const { error } = await admin.auth.admin.deleteUser(user_id);
      if (error) return err(error.message, 500);
      return json({ ok: true });
    }

    return err("Ação desconhecida", 400);
  } catch (e: any) {
    if (e instanceof Response) return e;
    console.error("[admin-users] error:", e);
    return err(e?.message ?? "Erro interno", 500);
  }
});
