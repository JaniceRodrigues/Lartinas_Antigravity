import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { Home, Wrench, User, LogOut, Wallet, Loader2, BookOpen, Megaphone, CalendarHeart, Users2, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useScopedTheme } from "@/hooks/use-theme";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PortalBottomNav } from "@/components/portal/PortalBottomNav";
import { resolveDefaultPortal } from "@/lib/portal-access";
import logo from "@/assets/lartinas-logo.svg";

export const Route = createFileRoute("/portal")({
  component: PortalLayout,
});

const items = [
  { to: "/portal", label: "Início", icon: Home, hint: "Resumo da sua casa", exact: true },
  { to: "/portal/estadia", label: "Minha estadia", icon: CalendarHeart, hint: "Contrato e datas" },
  { to: "/portal/pagamentos", label: "Pagamentos", icon: Wallet, hint: "Boletos e recibos" },
  { to: "/portal/chamados", label: "Chamados", icon: Wrench, hint: "Pedidos de manutenção" },
  { to: "/portal/manual", label: "Manual da casa", icon: BookOpen, hint: "Como tudo funciona" },
  { to: "/portal/comunicados", label: "Comunicados", icon: Megaphone, hint: "Avisos da operação" },
  { to: "/portal/comunidade", label: "Comunidade", icon: Users2, hint: "Agenda e dicas" },
  { to: "/portal/renovacao", label: "Renovação / saída", icon: FileSignature, hint: "Solicitações" },
  { to: "/portal/perfil", label: "Perfil", icon: User, hint: "Seus dados" },
];

function PortalLayout() {
  useScopedTheme();
  const { user, authReady, rolesLoading, roles, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const isResident = roles.includes("moradora");
  const allowed = isResident || isAdmin;

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      const redirect = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/portal";
      navigate({ to: "/auth", search: { redirect }, replace: true });
      return;
    }
    if (!rolesLoading && !allowed) {
      const dest = resolveDefaultPortal(roles);
      navigate({ to: dest === "/portal" ? "/" : dest, replace: true });
    }
  }, [authReady, user, rolesLoading, allowed, roles, navigate]);

  if (!authReady || !user || rolesLoading || !allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-paper">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-brand-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Lartinas" className="h-10 w-auto" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-lg text-brand-green">Lartinas</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-green/60">Portal · Morador</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-full text-brand-green hover:text-brand-orange">
              <LogOut className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>


      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 pb-24 pt-8 sm:px-6 md:pb-8">
        <aside className="hidden w-64 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1.5">
            {items.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                activeOptions={{ exact: it.exact }}
                className="group flex items-start gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm transition-all hover:border-border/60 hover:bg-card hover:shadow-soft"
                activeProps={{ className: "border-border/60 bg-card text-foreground shadow-soft" }}
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <it.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{it.label}</span>
                  <span className="block text-xs text-muted-foreground">{it.hint}</span>
                </span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      <PortalBottomNav />
    </div>
  );
}
