import { createFileRoute } from "@tanstack/react-router";
import heroDrive from "@/assets/cars/hero-drive.jpg";
import { HomeDesktop, HomeMobile } from "@/components/home/HomeStage";
import { FaqBlock } from "@/components/home/FaqBlock";
import { HomeIntro } from "@/components/home/HomeIntro";
import { SITE_URL, faqJsonLd, jsonLdScript, localBusinessJsonLd } from "@/lib/seo";
import { ThemeProvider, useTheme } from "@/components/layout/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FavoritesProvider } from "@/state/FavoritesContext";

const TITLE = "Аренда авто в Новосибирске от 1 800 ₽/сутки — японские кей-кары | NSK-RENT";
const DESC =
  "Прокат японских кей-каров в Новосибирске от 1 800 ₽/сутки. Пункт выдачи — ул. Доватора, 11, договор онлайн за 3 минуты, без крупного залога, поддержка 24/7.";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [jsonLdScript(localBusinessJsonLd()), jsonLdScript(faqJsonLd())],
  }),
});

function Home() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <HomeShell />
      </FavoritesProvider>
    </ThemeProvider>
  );
}

function HomeShell() {
  const { themeClass } = useTheme();

  return (
    <div className={`${themeClass} min-h-screen bg-background text-foreground transition-colors duration-300`}>
      <HomeControls />


      <div className="hidden md:block">
        <HomeDesktop heroImage={heroDrive} />
      </div>
      <div className="md:hidden">
        <HomeMobile heroImage={heroDrive} />
      </div>

      {/* SEO content below hero (both viewports scroll to reach it) */}
      <div className="bg-background text-foreground">
        <HomeIntro />
        <FaqBlock />
      </div>

      <SiteFooter />
    </div>
  );

}
