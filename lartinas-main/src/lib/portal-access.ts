import type { AppRole } from "@/hooks/use-auth";

export type PortalPath = "/admin" | "/owner" | "/portal" | "/";

export function resolveDefaultPortal(roles: AppRole[]): PortalPath {
  if (roles.includes("admin") || roles.includes("operacao")) return "/admin";
  if (roles.includes("proprietario")) return "/owner";
  if (roles.includes("moradora")) return "/portal";
  return "/";
}

export function isSafeRedirect(path: string | null | undefined): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}
