import { useCallback, useEffect, useState } from "react";

export type ProfileTheme = "light" | "dark";

const DEFAULT_KEY = "nsk-rent-profile-theme";

/**
 * Тема личного кабинета живёт отдельно от публичной (та всегда тёмная):
 * по умолчанию светлая, как в админке, выбор запоминается в браузере.
 */
export function useProfileTheme(storageKey: string = DEFAULT_KEY) {
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

  return {
    theme,
    toggle,
    themeClass: theme === "light" ? "clean-light" : "public-dark",
  };
}
