import { useCallback, useEffect, useState } from "react";

export type ProfileTheme = "light" | "dark";

const KEY = "nsk-rent-profile-theme";

/**
 * Тема личного кабинета живёт отдельно от публичной (та всегда тёмная):
 * по умолчанию светлая, как в админке, выбор запоминается в браузере.
 */
export function useProfileTheme() {
  const [theme, setTheme] = useState<ProfileTheme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: ProfileTheme = prev === "light" ? "dark" : "light";
      window.localStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  return {
    theme,
    toggle,
    themeClass: theme === "light" ? "clean-light" : "public-dark",
  };
}
