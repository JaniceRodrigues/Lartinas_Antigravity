import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Search, User as UserIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

const LABELS: Record<string, string> = {
  admin: "Início",
  leads: "Leads",
  candidaturas: "Candidaturas",
  casas: "Casas",
  quartos: "Quartos",
  contratos: "Contratos",
  "modelos-contrato": "Modelos de contrato",
  financeiro: "Financeiro",
  vistorias: "Vistorias",
  chamados: "Chamados",
  comunicados: "Comunicados",
  moradoras: "Moradores",
  proprietarios: "Proprietários",
  fornecedores: "Fornecedores",
  acessos: "Acessos",
};

export function AdminTopbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setName(data?.full_name ?? null));
  }, [user]);

  const handleSignOut = async () => { await signOut(); navigate({ to: "/" }); };

  const parts = path.split("/").filter(Boolean);
  const crumbs = parts.map((p, i) => ({
    label: LABELS[p] ?? p,
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));

  const initials = (name ?? user?.email ?? "?")
    .split(/\s|@/).filter(Boolean).slice(0, 2)
    .map((s) => s[0]?.toUpperCase()).join("");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-brand-green/15 bg-brand-paper/85 px-3 backdrop-blur-xl sm:px-5">
      <SidebarTrigger className="rounded-full text-brand-green hover:text-brand-orange" />
      <nav className="hidden items-center gap-1 text-sm md:flex">
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-brand-green/40" />}
            <Link
              to={c.href}
              className={i === crumbs.length - 1 ? "font-semibold text-brand-green" : "text-brand-green/60 hover:text-brand-orange"}
            >
              {c.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-green/60" />
          <input
            placeholder="Buscar..."
            className="h-9 w-56 rounded-full border border-brand-green/20 bg-white/60 pl-9 pr-3 text-sm text-brand-green outline-none transition-all focus:w-72 focus:border-brand-orange/60 focus:bg-white"
          />
        </div>
        <LanguageSwitcher />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-full pl-1.5 pr-3 text-brand-green hover:bg-brand-green/5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-brand-green text-xs font-semibold text-white">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[140px] truncate text-sm font-medium sm:block">
                {name ?? user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 rounded-2xl">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{name ?? "Sem nome"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-xl">
              <Link to="/portal/perfil"><UserIcon className="mr-2 h-4 w-4" /> Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="rounded-xl text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
