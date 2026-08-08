import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/seo/LandingPage";
import { cars } from "@/mocks/cars";
import { faqItems } from "@/mocks/faq";
import { SITE_URL, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

const URL = `${SITE_URL}/kei-cars`;
const TITLE = "Кей-кары из Японии в аренду — JDM автопарк | NSK-RENT";
const DESC =
  "Аренда японских кей-каров в Новосибирске: Honda N-BOX, Suzuki Wagon R, Nissan Dayz. Правый руль, оригинал из Японии, расход 3–4 л/100 км.";

export const Route = createFileRoute("/_public/kei-cars")({
  component: Page,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Главная", url: "/" },
          { name: "Кей-кары из Японии", url: "/kei-cars" },
        ]),
      ),
    ],
  }),
});

function Page() {
  return (
    <LandingPage
      breadcrumb="Кей-кары из Японии"
      h1="Кей-кары из Японии в аренду"
      lead="Кей-кары (kei car, 軽自動車) — уникальный японский класс компактных авто с моторами до 660 см³. Экономичные, маневренные, идеальные для города. Весь наш автопарк — оригинал из Японии с правым рулём, без распила и переварки."
      bullets={[
        "8 моделей: Honda, Suzuki, Nissan, Daihatsu, Mazda, Mitsubishi, Subaru",
        "Правый руль — оригинал, не восстановленный",
        "Расход 3.6–4.6 л/100 км",
        "Габариты 3.4×1.5 м — паркуется где угодно",
        "CVT или AT — только автомат",
        "Регулярное ТО у сертифицированных мастеров",
      ]}
      sections={[
        {
          h: "Почему кей-кары идеальны для Новосибирска",
          body: "Узкие улицы центра, вечные пробки, дефицит парковки — кей-кар решает всё это. При габаритах меньше Smart он вмещает 4 взрослых, багажник для сумок, полный привод у части моделей. Расход в городе — 4 литра, что вдвое меньше седана B-класса.",
        },
        {
          h: "Что такое JDM и почему это важно",
          body: "JDM (Japanese Domestic Market) — авто, произведённые для внутреннего рынка Японии. Они собраны для строгих японских техрегламентов: выше качество сборки, богаче комплектация, лучше шумоизоляция. Мы возим авто только напрямую из Японии, с полным пакетом документов и растаможкой.",
        },
        {
          h: "Особенности эксплуатации",
          body: "Кей-кары рассчитаны на японские условия — мягкая подвеска и малый клиренс. По Новосибирску это не проблема, но для загородных поездок по грунтовке рекомендуем брать модели с полным приводом (Suzuki, Daihatsu). Все наши авто на зимней резине с ноября по апрель.",
        },
      ]}
      cars={cars}
      faq={[faqItems[11], faqItems[6], faqItems[7], faqItems[5]]}
    />
  );
}
