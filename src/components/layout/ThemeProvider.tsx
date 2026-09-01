import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "nsk-rent-theme";

export const THEME_COLORS: Record<Theme, string> = {
  dark: "#0b0d16",
  light: "#fbfcfe",
};

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  themeClass: string;
}

const Ctx = createContext<ThemeCtx>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
  themeClass: "public-dark",
});

export function useTheme() {
  return useContext(Ctx);
}

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  // Сохранённый выбор пользователя важнее класса на <html>: при гидратации
  // React может вернуть серверный класс и «сбросить» тему.
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  if (document.documentElement.classList.contains("clean-light")) return "light";
  if (document.documentElement.classList.contains("public-dark")) return "dark";
  return window.matchMedia("(max-width: 767px)").matches ? "light" : "dark";
}


function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("public-dark", theme === "dark");
  root.classList.toggle("clean-light", theme === "light");
  root.style.colorScheme = theme;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", THEME_COLORS[theme]);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR renders the dark default; the inline boot script in <head> already set
  // the real class on <html>, so we sync to it right after hydration.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(readInitialTheme());
  }, []);

  useEffect(() => {
    applyTheme(theme);
    const root = document.documentElement;
    // Заглушаем переходы/анимации на момент смены темы — без «моргания».
    root.classList.add("theme-switching");
    const id = window.setTimeout(() => root.classList.remove("theme-switching"), 200);
    return () => {
      window.clearTimeout(id);
      root.classList.remove("theme-switching");
    };
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <Ctx.Provider
      value={{
        theme,
        toggle,
        setTheme,
        themeClass: theme === "dark" ? "public-dark" : "clean-light",
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
