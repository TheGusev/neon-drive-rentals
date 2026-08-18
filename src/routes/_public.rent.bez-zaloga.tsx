import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/seo/LandingPage";
import { useCars } from "@/state/AppDataContext";
import { faqItems } from "@/mocks/faq";
import { SITE_URL, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

const URL = `${SITE_URL}/rent/bez-zaloga`;
const TITLE = "Аренда авто без залога в Новосибирске | NSK-RENT";
const DESC =
  "Аренда авто без крупного залога в Новосибирске. Страховой депозит от 5 000 ₽, для проверенных клиентов — без депозита. От 1 800 ₽/сутки.";

export const Route = createFileRoute("/_public/rent/bez-zaloga")({
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
          { name: "Аренда без залога", url: "/rent/bez-zaloga" },
        ]),
      ),
    ],
  }),
});

function Page() {
  const cars = useCars();

  return (
    <LandingPage
      breadcrumb="Аренда без залога"
      h1="Аренда авто без залога в Новосибирске"
      lead="Большинство прокатов требует 30–50 тысяч рублей залога. Мы работаем иначе: страховой депозит от 5 000 ₽ (возвращается при сдаче авто без повреждений), а для проверенных клиентов и длительной аренды — без депозита вообще."
      bullets={[
        "Страховой депозит от 5 000 ₽ вместо 30–50 тысяч",
        "Возврат депозита сразу после сдачи авто",
        "Оплата картой Мир, Visa, MasterCard, СБП",
        "Без блокировки суммы на карте",
        "Скидка постоянным клиентам — депозит 0 ₽",
        "Прозрачные условия в договоре",
      ]}
      sections={[
        {
          h: "Почему у нас минимальный депозит",
          body: "Мы страхуем каждое авто по ОСАГО и КАСКО, ведём электронный контроль состояния и работаем с проверенными клиентами. Это позволяет держать депозит на уровне 5 000 ₽ — только на случай мелких повреждений сверх страховки (например, царапина на бампере или пятно в салоне).",
        },
        {
          h: "Как получить аренду без депозита",
          body: "Для клиентов с историей аренды у нас 3+ поездок депозит обнуляется. Также без депозита — аренда от 14 дней и корпоративные клиенты по договору. Достаточно паспорта и водительского удостоверения категории B.",
        },
        {
          h: "Что покрывает страховка",
          body: "ОСАГО и базовая КАСКО включены в стоимость. При ДТП не по вашей вине вы не платите ничего. При ДТП по вашей вине — франшиза до 30 000 ₽ (или 0 ₽, если подключить расширенную страховку за 400 ₽/сутки).",
        },
      ]}
      cars={cars.filter((c) => (c.deposit ?? 0) <= 5000).slice(0, 6)}
      faq={[faqItems[1], faqItems[7], faqItems[9], faqItems[3]]}
    />
  );
}
