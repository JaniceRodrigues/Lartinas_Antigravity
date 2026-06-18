import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { resolveDefaultPortal, isSafeRedirect, type PortalPath } from "@/lib/portal-access";
import type { AppRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Entrar — Lartinas" }] }),
});

function getRedirectParam(): string | null {
  if (typeof window === "undefined") return null;
  const r = new URLSearchParams(window.location.search).get("redirect");
  return isSafeRedirect(r) ? r : null;
}

function canAccess(path: string, roles: AppRole[]): boolean {
  const isAdmin = roles.includes("admin") || roles.includes("operacao");
  if (path.startsWith("/admin")) return isAdmin;
  if (path.startsWith("/owner")) return isAdmin || roles.includes("proprietario");
  if (path.startsWith("/portal")) return isAdmin || roles.includes("moradora");
  return true;
}

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const goAfterAuth = async (userId: string) => {
    const { data: rolesData } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = (rolesData || []).map((r: any) => r.role as AppRole);
    const redirect = getRedirectParam();
    const target: PortalPath | string =
      redirect && canAccess(redirect, roles) ? redirect : resolveDefaultPortal(roles);
    navigate({ to: target, replace: true });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) goAfterAuth(data.session.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vinda de volta!");
    if (data.user) await goAfterAuth(data.user.id);
  };

  return (
    <SiteLayout>
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="text-center">
            <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-primary" /> Sua conta Lartinas
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold">Entrar</h1>
          </div>

          <div className="mt-6 space-y-4">
            <div><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
            <div><Label>Senha</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" /></div>
            <Button onClick={signIn} disabled={loading} className="w-full rounded-full bg-gradient-sunset shadow-warm">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="underline">Voltar</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
