import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Inbox, Building2, Users, Wrench, ShieldCheck,
  UserPlus, BedDouble, ClipboardCheck, Megaphone, Briefcase, Truck, FileStack,
  FileSignature, Wallet,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/lartinas-logo.svg";

type Item = { to: string; labelKey: string; icon: any; exact?: boolean };

const groups: { labelKey: string; items: Item[] }[] = [
  {
    labelKey: "groups.ops",
    items: [
      { to: "/admin", labelKey: "admin.home", icon: LayoutDashboard, exact: true },
      { to: "/admin/leads", labelKey: "admin.leads", icon: UserPlus },
      { to: "/admin/candidaturas", labelKey: "admin.applications", icon: Inbox },
    ],
  },
  {
    labelKey: "groups.properties",
    items: [
      { to: "/admin/casas", labelKey: "admin.houses", icon: Building2 },
      { to: "/admin/quartos", labelKey: "admin.rooms", icon: BedDouble },
    ],
  },
  {
    labelKey: "groups.contracts",
    items: [
      { to: "/admin/contratos", labelKey: "admin.contracts", icon: FileSignature },
      { to: "/admin/modelos-contrato", labelKey: "admin.contractTemplates", icon: FileStack },
      { to: "/admin/financeiro", labelKey: "admin.finance", icon: Wallet },
    ],
  },
  {
    labelKey: "groups.support",
    items: [
      { to: "/admin/vistorias", labelKey: "admin.inspections", icon: ClipboardCheck },
      { to: "/admin/chamados", labelKey: "admin.tickets", icon: Wrench },
      { to: "/admin/comunicados", labelKey: "admin.announcements", icon: Megaphone },
    ],
  },
  {
    labelKey: "groups.people",
    items: [
      { to: "/admin/moradoras", labelKey: "admin.residents", icon: Users },
      { to: "/admin/proprietarios", labelKey: "admin.owners", icon: Briefcase },
      { to: "/admin/fornecedores", labelKey: "admin.vendors", icon: Truck },
      { to: "/admin/acessos", labelKey: "admin.access", icon: ShieldCheck },
    ],
  },
];


export function AdminSidebar() {
  const { state } = useSidebar();
  const { t } = useTranslation();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (it: Item) => (it.exact ? currentPath === it.to : currentPath === it.to || currentPath.startsWith(it.to + "/"));

  return (
    <Sidebar collapsible="icon" className="border-r border-brand-green/15">
      <SidebarHeader className="border-b border-brand-green/15 bg-brand-paper">
        <Link to="/" className="flex items-center gap-2 px-1 py-1.5">
          <img src={logo} alt="Lartinas" className="h-9 w-auto shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-base leading-none text-brand-green">Lartinas</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-green/60">Painel · Administração</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-brand-paper px-1">
        {groups.map((g) => (
          <SidebarGroup key={g.labelKey}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-green/60">
                {t(g.labelKey)}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((it) => {
                  const active = isActive(it);
                  const label = t(it.labelKey);
                  return (
                    <SidebarMenuItem key={it.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={label}
                        className={
                          active
                            ? "relative bg-brand-orange/10 text-brand-orange font-medium hover:bg-brand-orange/15 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-r-full before:bg-brand-orange"
                            : "text-brand-green/80 hover:bg-brand-green/5 hover:text-brand-green"
                        }
                      >
                        <Link to={it.to}>
                          <it.icon className="h-4 w-4" />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-brand-green/15 bg-brand-paper p-3">
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-green/50">© Lartinas · Coliving</p>
        )}
      </SidebarFooter>
    </Sidebar>

  );
}
