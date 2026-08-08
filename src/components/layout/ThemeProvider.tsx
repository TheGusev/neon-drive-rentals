import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "nsk-rent-theme";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  themeClass: string;
}

const Ctx = createContext<ThemeCtx>({ theme: "dark", toggle: () => {}, themeClass: "public-dark" });

export function useTheme() {
  return useContext(Ctx);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <Ctx.Provider
      value={{ theme, toggle, themeClass: theme === "dark" ? "public-dark" : "clean-light" }}
    >
      {children}
    </Ctx.Provider>
  );
}
