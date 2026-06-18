import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, Wallet, BookOpen, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/portal", label: "Início", icon: Home, exact: true },
  { to: "/portal/pagamentos", label: "Pagar", icon: Wallet },
  { to: "/portal/chamados", label: "Chamados", icon: Wrench },
  { to: "/portal/manual", label: "Manual", icon: BookOpen },
  { to: "/portal/comunicados", label: "Avisos", icon: Megaphone },
];

export function PortalBottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-green/15 bg-brand-paper/95 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-1.5">
        {items.map((it) => {
          const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                active ? "text-brand-orange" : "text-brand-green/60 hover:text-brand-green",
              )}
            >
              <it.icon className={cn("h-5 w-5", active && "drop-shadow-sm")} />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>

  );
}
