import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import "@/i18n";


import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-semibold text-primary">404</p>
        <h1 className="mt-4 font-display text-2xl text-foreground">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esse cantinho ainda não existe na nossa casa.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lartinas — Coliving feminino no Rio de Janeiro" },
      { name: "description", content: "Brazilian soul, global people. Coliving feminino curado no Rio: casas com alma, comunidade que acolhe." },
      { name: "author", content: "Lartinas" },
      { property: "og:title", content: "Lartinas — Coliving feminino no Rio de Janeiro" },
      { property: "og:description", content: "Brazilian soul, global people. Coliving feminino curado no Rio: casas com alma, comunidade que acolhe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Lartinas — Coliving feminino no Rio de Janeiro" },
      { name: "twitter:description", content: "Brazilian soul, global people. Coliving feminino curado no Rio: casas com alma, comunidade que acolhe." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/86e007f6-5503-4cc8-8633-ab4b407cde8d/id-preview-3ea625c6--1a8d6e70-dc68-4693-9683-a76cb97d9386.lovable.app-1777915348140.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/86e007f6-5503-4cc8-8633-ab4b407cde8d/id-preview-3ea625c6--1a8d6e70-dc68-4693-9683-a76cb97d9386.lovable.app-1777915348140.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Fira+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ colorScheme: "light" }}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
