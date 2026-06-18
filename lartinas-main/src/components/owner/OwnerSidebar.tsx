import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Wallet, Wrench, ClipboardCheck, Folder, MessageSquare } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/lartinas-logo.svg";

const items = [
  { to: "/owner", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/owner/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/owner/manutencao", label: "Manutenção", icon: Wrench },
  { to: "/owner/vistorias", label: "Vistorias", icon: ClipboardCheck },
  { to: "/owner/documentos", label: "Documentos", icon: Folder },
  { to: "/owner/mensagens", label: "Mensagens", icon: MessageSquare },
];

export function OwnerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-brand-green/15">
      <SidebarHeader className="border-b border-brand-green/15 bg-brand-paper">
        <Link to="/" className="flex items-center gap-2 px-1 py-1.5">
          <img src={logo} alt="Lartinas" className="h-9 w-auto shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-base leading-none text-brand-green">Lartinas</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-green/60">Portal · Proprietário</p>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-brand-paper px-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => {
                const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
                return (
                  <SidebarMenuItem key={it.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={it.label}
                      className={active
                        ? "relative bg-brand-orange/10 text-brand-orange font-medium hover:bg-brand-orange/15 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-r-full before:bg-brand-orange"
                        : "text-brand-green/80 hover:bg-brand-green/5 hover:text-brand-green"}>
                      <Link to={it.to}><it.icon className="h-4 w-4" /><span>{it.label}</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-brand-green/15 bg-brand-paper p-3">
        {!collapsed && <p className="text-[10px] uppercase tracking-[0.2em] text-brand-green/50">© Lartinas</p>}

      </SidebarFooter>
    </Sidebar>
  );
}
