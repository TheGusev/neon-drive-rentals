import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { AppDataProvider } from "@/state/AppDataContext";
import { carsQueryOptions, publicBookingsQueryOptions } from "@/lib/queries";

import { BUILD_ID } from "@/lib/build-info";



import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-lg text-center">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">NSK-RENT</p>
        <h1 className="mt-3 font-display text-7xl font-black md:neon-text">404</h1>
        <h2 className="mt-3 font-display text-xl font-bold">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Возможно, ссылка устарела или автомобиль уже снят с проката. Начните с автопарка — 21 японский кей-кар в
          Новосибирске, выдача на ул. Доватора, 11.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link to="/" className="dash-chip font-semibold hover:text-accent">Главная</Link>
          <Link to="/cars" className="dash-chip font-semibold hover:text-accent">Автопарк</Link>
          <Link to="/rent/novosibirsk" className="dash-chip font-semibold hover:text-accent">Аренда в Новосибирске</Link>
          <Link to="/blog" className="dash-chip font-semibold hover:text-accent">Блог</Link>
          <Link to="/profile" className="dash-chip font-semibold hover:text-accent">Личный кабинет</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(carsQueryOptions()),
      context.queryClient.ensureQueryData(publicBookingsQueryOptions()),
    ]);
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "NSK-RENT — Аренда авто в Новосибирске" },
      { name: "description", content: "NSK-RENT — прокат японских кей-каров и премиум-авто в Новосибирске. Онлайн-бронирование, честные цены, поддержка 24/7." },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "NSK-RENT" },
      { property: "og:title", content: "NSK-RENT — Drive the Night" },
      { property: "og:description", content: "Аренда авто в Новосибирске: онлайн-бронирование, электронный договор, выдача на Доватора, 11." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "yandex-verification", content: "5c5d5dcdc0336b12" },
      { name: "build-id", content: BUILD_ID },

    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png?v=2", type: "image/png" },
      { rel: "icon", href: "/icon-192.png?v=2", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=2", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap",
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const THEME_BOOT_SCRIPT = `(function(){try{
var k='nsk-rent-theme';var s=localStorage.getItem(k);
var t=(s==='light'||s==='dark')?s:(window.matchMedia('(max-width: 767px)').matches?'light':'dark');
var r=document.documentElement;
r.classList.remove('public-dark','clean-light');
r.classList.add(t==='dark'?'public-dark':'clean-light');
r.style.colorScheme=t;
var m=document.querySelector('meta[name="theme-color"]');
if(!m){m=document.createElement('meta');m.setAttribute('name','theme-color');document.head.appendChild(m);}
m.setAttribute('content',t==='dark'?'#0b0d16':'#fbfcfe');
}catch(e){}})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="public-dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}


function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppDataProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </AppDataProvider>
      <Toaster />
      <YandexMetrika />
    </QueryClientProvider>
  );
}


