import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import heroDrive from "@/assets/cars/hero-drive.jpg";
import { getIsMobileDevice } from "@/lib/device.functions";
import { HomeDesktop, HomeMobile } from "@/components/home/HomeStage";
import { FaqBlock } from "@/components/home/FaqBlock";
import { HomeIntro } from "@/components/home/HomeIntro";
import { RealPhotoStrip } from "@/components/home/RealPhotoStrip";
import { SITE_URL, faqJsonLd, jsonLdScript, localBusinessJsonLd, socialMeta } from "@/lib/seo";
import { ThemeProvider, useTheme } from "@/components/layout/ThemeProvider";
import { HomeControls } from "@/components/home/HomeControls";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FavoritesProvider } from "@/state/FavoritesContext";

const TITLE = "Аренда авто в Новосибирске от 1 800 ₽/сутки — японские кей-кары | NSK-RENT";
const DESC =
  "Прокат японских кей-каров в Новосибирске от 1 800 ₽/сутки. Пункт выдачи — ул. Доватора, 11, договор онлайн за 3 минуты, без крупного залога, поддержка 24/7.";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getIsMobileDevice(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      ...socialMeta("/assets/cars/hero-garage.jpg"),
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [jsonLdScript(localBusinessJsonLd()), jsonLdScript(faqJsonLd())],
  }),
});

function Home() {
  return (
    <ThemeProvider fixed="dark">
      <FavoritesProvider>
        <HomeShell />
      </FavoritesProvider>
    </ThemeProvider>
  );
}

/**
 * Ширина экрана после гидратации; до неё используется догадка по User-Agent.
 * Первый клиентский рендер обязан совпадать с серверным, поэтому реальная
 * ширина читается только в эффекте и только если она отличается от догадки.
 */
function useIsMobileViewport(initial: boolean) {
  const [isMobile, setIsMobile] = useState(initial);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile((prev) => (prev === mq.matches ? prev : mq.matches));
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

function HomeShell() {
  const { themeClass } = useTheme();
  const { isMobile: ssrIsMobile } = Route.useLoaderData();
  const isMobile = useIsMobileViewport(ssrIsMobile);

  return (
    <div className={`${themeClass} min-h-screen bg-background text-foreground transition-colors duration-300`}>
      <HomeControls />

      {isMobile ? <HomeMobile heroImage={heroDrive} /> : <HomeDesktop heroImage={heroDrive} />}

      {/* SEO content below hero (both viewports scroll to reach it) */}
      <div className="bg-background text-foreground">
        <HomeIntro />
        <RealPhotoStrip />
        <FaqBlock />
      </div>

      <SiteFooter />
    </div>
  );
}

