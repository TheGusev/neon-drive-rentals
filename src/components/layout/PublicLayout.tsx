import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getClientSessionStatus } from "@/lib/auth.functions";
import { Mail, Menu, MessageCircle, Phone, Send, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";
import { SiteFooter } from "./SiteFooter";
import { CONTACTS, LEGAL } from "@/lib/contacts";
import { FavoritesProvider } from "@/state/FavoritesContext";

const nav = [
  { to: "/", label: "Главная" },
  { to: "/cars", label: "Автопарк" },
  { to: "/blog", label: "Блог" },
  { to: "/profile", label: "Кабинет" },
] as const;

const mobileNav = [
  { to: "/", label: "Главная" },
  { to: "/cars", label: "Автопарк" },
  { to: "/rent/novosibirsk", label: "Аренда в Новосибирске" },
  { to: "/rent/bez-zaloga", label: "Аренда без залога" },
  { to: "/kei-cars", label: "Кей-кары из Японии" },
  { to: "/blog", label: "Блог" },
  { to: "/profile", label: "Личный кабинет" },
] as const;

export function PublicLayout() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <PublicShell />
      </FavoritesProvider>
    </ThemeProvider>
  );
}

function PublicShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { themeClass } = useTheme();
  const sessionStatus = useServerFn(getClientSessionStatus);
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => sessionStatus(),
    staleTime: 60_000,
  });
  const signedIn = Boolean(me?.authenticated);


  // Close the mobile menu on route change so it never persists across pages.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div
      suppressHydrationWarning
      className={`${themeClass} min-h-screen bg-background text-foreground transition-colors duration-300`}
    >
      <header className="safe-top sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] md:flex md:justify-between md:gap-4 md:px-6 md:py-4 md:pt-4">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="font-display text-xl font-black tracking-widest md:neon-text md:text-2xl">
              NSK-RENT
            </span>
            <span className="hidden text-xs tracking-[0.3em] text-muted-foreground md:inline">
              DRIVE THE NIGHT
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`text-sm font-semibold uppercase tracking-widest transition-colors ${
                    active ? "text-accent" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a href={CONTACTS.phoneHref} className="flex items-center gap-2 text-sm text-foreground">
              <Phone className="h-4 w-4 text-accent" />
              <span className="font-semibold">{CONTACTS.phone}</span>
            </a>
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to={signedIn ? "/profile" : "/login"}>
                <User className="h-4 w-4" />
                {signedIn ? (me?.name?.split(" ")[0] ?? "Кабинет") : "Войти"}
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle className="h-14 w-14 rounded-2xl border-2 border-border/70" />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Открыть меню"
                  className="menu-pulse relative z-50 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-accent/70 bg-background/90 text-foreground shadow-[0_0_24px_color-mix(in_oklab,var(--neon-blue)_55%,transparent)] backdrop-blur transition hover:scale-105 hover:border-accent active:scale-95"
                >
                  <Menu className="h-7 w-7 text-accent" />
                </button>
              </SheetTrigger>

              <SheetContent side="right" className={`${themeClass} w-[86vw] max-w-sm overflow-y-auto bg-background p-5 text-foreground`}>
                <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground">Меню</p>
                <p className="mt-1 font-display text-2xl font-black tracking-widest">NSK-RENT</p>

                <nav className="mt-6 flex flex-col gap-1">
                  {mobileNav.map((n) => {
                    const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
                    return (
                      <Link
                        key={n.to}
                        to={n.to}
                        className={`rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                          active ? "bg-muted text-accent" : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {n.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6">
                  <ThemeToggle withLabel className="w-full justify-center" />
                </div>

                <div className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
                  <a href={CONTACTS.phoneHref} className="flex items-center gap-2 font-semibold">
                    <Phone className="h-4 w-4 text-accent" /> {CONTACTS.phone}
                  </a>
                  <a href={CONTACTS.emailHref} className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-accent" /> {CONTACTS.email}
                  </a>
                  <a href={CONTACTS.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-accent" /> Telegram
                  </a>
                  <a href={CONTACTS.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-accent" /> WhatsApp
                  </a>
                  <a href={CONTACTS.max} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-accent" /> {CONTACTS.maxLabel}
                  </a>
                  <div className="space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
                    <p>{LEGAL.entity}</p>
                    <p>{CONTACTS.city}</p>
                    <p>{CONTACTS.hours}</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
