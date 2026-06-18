import { supabase } from "@/integrations/supabase/client";

async function invoke<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action, ...payload },
  });
  if (error) {
    // Edge function may include a JSON {error} body
    const msg = (data as any)?.error ?? error.message ?? "Erro na função admin-users";
    throw new Error(msg);
  }
  if (data && typeof data === "object" && "error" in (data as any)) {
    throw new Error((data as any).error);
  }
  return data as T;
}

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  email: string;
  roles: string[];
};

export async function listUsersWithRoles(): Promise<AdminUserRow[]> {
  return invoke<AdminUserRow[]>("list");
}

export async function getAdminMe(): Promise<{ isSuperAdmin: boolean }> {
  return invoke<{ isSuperAdmin: boolean }>("me");
}

export async function createUserWithRoles(input: {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
  roles: string[];
}): Promise<{ id: string }> {
  return invoke("create", input);
}

export async function setUserRoles(input: { user_id: string; roles: string[] }): Promise<{ ok: true }> {
  return invoke("setRoles", input);
}

export async function deleteUser(input: { user_id: string }): Promise<{ ok: true }> {
  return invoke("delete", input);
}
