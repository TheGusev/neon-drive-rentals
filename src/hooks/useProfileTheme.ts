import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ProfileTheme = "light" | "dark";

const DEFAULT_KEY = "nsk-rent-profile-theme";

type ProfileThemeValue = {
  theme: ProfileTheme;
  toggle: () => void;
  themeClass: string;
};

/**
 * Тема личного кабинета живёт отдельно от публичной (та всегда тёмная):
 * по умолчанию светлая, как в админке, выбор запоминается в браузере.
 */
export function useProfileTheme(storageKey: string = DEFAULT_KEY): ProfileThemeValue {
  const [theme, setTheme] = useState<ProfileTheme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, [storageKey]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: ProfileTheme = prev === "light" ? "dark" : "light";
      window.localStorage.setItem(storageKey, next);
      return next;
    });
  }, [storageKey]);

  return useMemo(
    () => ({ theme, toggle, themeClass: theme === "light" ? "clean-light" : "public-dark" }),
    [theme, toggle],
  );
}

const ProfileThemeContext = createContext<ProfileThemeValue | null>(null);

/** Общая тема кабинета: шапка, подвал и содержимое красятся одинаково. */
export function ProfileThemeProvider({ children }: { children: ReactNode }) {
  const value = useProfileTheme();
  return createElement(ProfileThemeContext.Provider, { value }, children);
}

export function useProfileThemeContext(): ProfileThemeValue {
  const ctx = useContext(ProfileThemeContext);
  if (ctx) return ctx;
  // Фолбэк для страниц вне провайдера.
  return { theme: "light", toggle: () => {}, themeClass: "clean-light" };
}
