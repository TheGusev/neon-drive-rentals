import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent active:scale-95",
        className,
      )}
    >
      <span className="relative grid h-5 w-5 place-items-center">
        <Sun
          className={cn(
            "absolute h-4 w-4 transition-all duration-300",
            dark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
          )}
        />
        <Moon
          className={cn(
            "absolute h-4 w-4 transition-all duration-300",
            dark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0",
          )}
        />
      </span>
      {withLabel && <span>{dark ? "Тёмная тема" : "Светлая тема"}</span>}
    </button>
  );
}
