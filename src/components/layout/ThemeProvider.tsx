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
  return "dark";
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

/**
 * `fixed` — жёстко заданная тема (публичная часть сайта всегда тёмная).
 * Переключение темы доступно только в админке.
 */
export function ThemeProvider({ children, fixed }: { children: ReactNode; fixed?: Theme }) {
  // SSR renders the dark default; the inline boot script in <head> already set
  // the real class on <html>, so we read it synchronously on the client
  // (lazy initializer) — no flash of the wrong theme after hydration.
  const [theme, setThemeState] = useState<Theme>(() =>
    fixed ?? (typeof document === "undefined" ? "dark" : readInitialTheme()),
  );

  const effective = fixed ?? theme;

  useEffect(() => {
    applyTheme(effective);
    const root = document.documentElement;
    // Заглушаем переходы/анимации на момент смены темы — без «моргания».
    root.classList.add("theme-switching");
    const id = window.setTimeout(() => root.classList.remove("theme-switching"), 200);
    return () => {
      window.clearTimeout(id);
      root.classList.remove("theme-switching");
    };
  }, [effective]);

  const setTheme = useCallback(
    (next: Theme) => {
      if (fixed) return;
      window.localStorage.setItem(STORAGE_KEY, next);
      setThemeState(next);
    },
    [fixed],
  );

  const toggle = useCallback(() => {
    if (fixed) return;
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, [fixed]);

  return (
    <Ctx.Provider
      value={{
        theme: effective,
        toggle,
        setTheme,
        themeClass: effective === "dark" ? "public-dark" : "clean-light",
      }}
    >
      {children}
    </Ctx.Provider>
  );

}
