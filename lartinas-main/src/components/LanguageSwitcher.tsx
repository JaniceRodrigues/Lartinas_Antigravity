import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const languages = [
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
];

export function LanguageSwitcher({
  className,
  variant = "ghost",
}: {
  className?: string;
  variant?: "ghost" | "outline" | "white";
}) {
  const { i18n } = useTranslation();
  const current = languages.find((l) => i18n.language?.startsWith(l.code.split("-")[0])) ?? languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "white" ? (
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10",
              className,
            )}
            aria-label="Language"
          >
            <span className="text-base leading-none">{current.flag}</span>
            <span className="hidden sm:inline">{current.code.split("-")[0].toUpperCase()}</span>
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-full hover:bg-muted/60", className)}
            aria-label="Language"
          >
            <Languages className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            className={cn("rounded-xl", current.code === l.code && "bg-accent/40")}
          >
            <span className="mr-2 text-base leading-none">{l.flag}</span>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
