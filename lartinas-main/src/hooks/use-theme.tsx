import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type Ctx = {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  enableScopedTheme: () => void;
  disableScopedTheme: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "lartinas-theme";

function getSystem(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyToHtml(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return ((localStorage.getItem(STORAGE_KEY) as Theme) || "system");
  });
  const [scoped, setScoped] = useState(false);
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // Apply theme based on scope
  useEffect(() => {
    if (!scoped) {
      applyToHtml("light");
      setResolved("light");
      return;
    }
    const r = theme === "system" ? getSystem() : (theme as "light" | "dark");
    applyToHtml(r);
    setResolved(r);
  }, [theme, scoped]);

  // React to OS color-scheme change when in system mode and scoped
  useEffect(() => {
    if (!scoped || theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r = getSystem();
      applyToHtml(r);
      setResolved(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, scoped]);

  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  const enableScopedTheme = () => setScoped(true);
  const disableScopedTheme = () => setScoped(false);

  return (
    <ThemeContext.Provider
      value={{ theme, resolved, setTheme, enableScopedTheme, disableScopedTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** Use inside an internal portal layout to enable the user's saved theme preference. */
export function useScopedTheme() {
  const { enableScopedTheme, disableScopedTheme } = useTheme();
  useEffect(() => {
    enableScopedTheme();
    return () => disableScopedTheme();
  }, [enableScopedTheme, disableScopedTheme]);
}
