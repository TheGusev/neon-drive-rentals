import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SurfaceTheme = "light" | "dark";

const CATALOG_KEY = "nsk-rent-catalog-theme";

type SurfaceThemeValue = {
  theme: SurfaceTheme;
  toggle: () => void;
  themeClass: string;
};

/**
 * Тема отдельной поверхности сайта (каталог). Кабинет всегда светлый,
 * публичные страницы — тёмные, поэтому переключатель живёт только здесь.
 */
export function useSurfaceTheme(storageKey: string): SurfaceThemeValue {
  const [theme, setTheme] = useState<SurfaceTheme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, [storageKey]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: SurfaceTheme = prev === "light" ? "dark" : "light";
      window.localStorage.setItem(storageKey, next);
      return next;
    });
  }, [storageKey]);

  return useMemo(
    () => ({ theme, toggle, themeClass: theme === "light" ? "clean-light" : "public-dark" }),
    [theme, toggle],
  );
}

const CatalogThemeContext = createContext<SurfaceThemeValue | null>(null);

/** Тема каталога: шапка, подвал и карточки красятся одинаково. */
export function CatalogThemeProvider({ children }: { children: ReactNode }) {
  const value = useSurfaceTheme(CATALOG_KEY);
  return createElement(CatalogThemeContext.Provider, { value }, children);
}

export function useCatalogTheme(): SurfaceThemeValue {
  const ctx = useContext(CatalogThemeContext);
  if (ctx) return ctx;
  return { theme: "dark", toggle: () => {}, themeClass: "public-dark" };
}
