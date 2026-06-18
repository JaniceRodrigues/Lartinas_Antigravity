import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Roles a person can self-assign during public sign-up.
const SELF_ROLES = ["moradora", "proprietario"] as const;

const claimSchema = z.object({
  role: z.enum(SELF_ROLES),
});

export const claimSelfRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => claimSchema.parse(input))
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    // Reject if user already has any privileged role; prevent privilege escalation.
    const { data: existing } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const hasAdminish = (existing ?? []).some((r) =>
      ["admin", "operacao"].includes(r.role as string),
    );
    if (hasAdminish) {
      throw new Error("Conta administrativa não pode trocar de papel por aqui.");
    }

    // Idempotent insert (unique on user_id+role)
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);

    return { ok: true, role: data.role };
  });
