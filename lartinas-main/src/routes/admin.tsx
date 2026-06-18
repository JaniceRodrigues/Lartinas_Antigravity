import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useScopedTheme } from "@/hooks/use-theme";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { resolveDefaultPortal } from "@/lib/portal-access";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  useScopedTheme();
  const { authReady, rolesLoading, user, isAdmin, roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      const redirect = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/admin";
      navigate({ to: "/auth", search: { redirect }, replace: true });
      return;
    }
    if (!rolesLoading && !isAdmin) {
      const dest = resolveDefaultPortal(roles);
      navigate({ to: dest === "/admin" ? "/" : dest, replace: true });
    }
  }, [authReady, user, rolesLoading, isAdmin, roles, navigate]);

  if (!authReady || !user || rolesLoading || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-brand-paper">
        <AdminSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col bg-brand-paper">
          <AdminTopbar />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
