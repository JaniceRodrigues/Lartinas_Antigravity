import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Facebook, Mail, MapPin } from "lucide-react";
import logo from "@/assets/lartinas-logo.svg";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-white pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid gap-12 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Lartinas" className="h-12 w-auto" />
              <span className="font-display text-xl text-brand-green">Lartinas</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm italic leading-relaxed text-muted-foreground">
              Brazilian soul, global people.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com/lartinas"
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-brand-green transition-colors hover:border-brand-orange hover:bg-brand-orange hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-brand-green transition-colors hover:border-brand-orange hover:bg-brand-orange hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-brand-green transition-colors hover:border-brand-orange hover:bg-brand-orange hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h5 className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-green">Links Rápidos</h5>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/sobre" className="transition-colors hover:text-brand-orange">Sobre a Lartinas</Link></li>
              <li><Link to="/casas" className="transition-colors hover:text-brand-orange">Casas Disponíveis</Link></li>
              <li><Link to="/proprietarios" className="transition-colors hover:text-brand-orange">Comunidade</Link></li>
              <li><Link to="/contato" className="transition-colors hover:text-brand-orange">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-green">Portais</h5>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/portal" className="transition-colors hover:text-brand-orange">Portal da Moradora</Link></li>
              <li><Link to="/owner" className="transition-colors hover:text-brand-orange">Portal do Proprietário</Link></li>
              <li><Link to="/admin" className="transition-colors hover:text-brand-orange">Área Administrativa</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-green">Contato</h5>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                <span>Rio de Janeiro, Brasil</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                <a href="mailto:contato@lartinas.com" className="transition-colors hover:text-brand-orange">contato@lartinas.com</a>
              </li>
              <li className="flex items-start gap-2">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                <a href="https://instagram.com/lartinas" className="transition-colors hover:text-brand-orange">@lartinas</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-border/60 pt-8 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:flex-row sm:justify-between">
          <p>© 2026 Lartinas. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-orange">Privacidade</a>
            <a href="#" className="hover:text-brand-orange">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
