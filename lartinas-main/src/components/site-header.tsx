import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ChevronDown, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/lartinas-logo.svg";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const nav = [
    { to: "/sobre", label: t("nav.about") },
    { to: "/casas", label: t("nav.houses") },
    { to: "/proprietarios", label: t("nav.community") },
    { to: "/contato", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-brand-paper/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Lartinas" className="h-12 w-auto" />
          <span className="font-display text-xl text-brand-green">Lartinas</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-green/80 transition-colors hover:text-brand-orange"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-green/80 outline-none transition-colors hover:text-brand-orange">
              <Lock className="h-3.5 w-3.5" />
              {t("nav.restrictedAccess")} <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/owner">{t("nav.ownerPortal")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/portal">{t("nav.residentPortal")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin">{t("nav.adminPortal")}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            to="/candidatura"
            className="rounded-full bg-brand-orange px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-brand-orange/20 transition-all hover:-translate-y-0.5 hover:bg-brand-orange/90"
          >
            {t("nav.applyCta")}
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <button
            className="rounded-full p-2 text-brand-green hover:bg-brand-green/10"
            onClick={() => setOpen(!open)}
            aria-label={t("nav.menu")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-brand-paper md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-brand-green hover:bg-brand-green/5"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">
              {t("nav.restrictedAccess")}
            </div>
            <Link to="/owner" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-brand-green hover:bg-brand-green/5">
              {t("nav.ownerPortal")}
            </Link>
            <Link to="/portal" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-brand-green hover:bg-brand-green/5">
              {t("nav.residentPortal")}
            </Link>
            <Link to="/admin" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-brand-green hover:bg-brand-green/5">
              {t("nav.adminPortal")}
            </Link>
            <Link
              to="/candidatura"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brand-orange px-3 py-2.5 text-center text-xs font-bold uppercase tracking-[0.2em] text-white"
            >
              {t("nav.applyCta")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
