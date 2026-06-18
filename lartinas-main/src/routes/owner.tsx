import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useScopedTheme } from "@/hooks/use-theme";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { resolveDefaultPortal } from "@/lib/portal-access";

export const Route = createFileRoute("/owner")({ component: OwnerLayout });

function OwnerLayout() {
  useScopedTheme();
  const { user, authReady, rolesLoading, roles, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const isOwner = roles.includes("proprietario");
  const allowed = isOwner || isAdmin;

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      const redirect = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/owner";
      navigate({ to: "/auth", search: { redirect }, replace: true });
      return;
    }
    if (!rolesLoading && !allowed) {
      const dest = resolveDefaultPortal(roles);
      navigate({ to: dest === "/owner" ? "/" : dest, replace: true });
    }
  }, [authReady, user, rolesLoading, allowed, roles, navigate]);

  if (!authReady || !user || rolesLoading || !allowed) {
    return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
      <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</div>
    </div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-brand-paper">
        <OwnerSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col bg-brand-paper">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-brand-green/15 bg-brand-paper/85 px-3 backdrop-blur-xl">
            <SidebarTrigger className="text-brand-green hover:text-brand-orange" />
            <div className="ml-auto flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="rounded-full text-brand-green hover:text-brand-orange">
                <LogOut className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8"><Outlet /></main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
