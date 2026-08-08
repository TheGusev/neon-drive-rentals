import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/seo/LandingPage";
import { cars } from "@/mocks/cars";
import { faqItems } from "@/mocks/faq";
import { SITE_URL, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

const URL = `${SITE_URL}/rent/novosibirsk`;
const TITLE = "Аренда авто в Новосибирске — от 1 800 ₽/сутки | NSK-RENT";
const DESC =
  "Аренда авто в Новосибирске посуточно и на длительный срок. Японские кей-кары, выдача на ул. Доватора, 11, договор за 3 минуты, без крупного залога.";

export const Route = createFileRoute("/_public/rent/novosibirsk")({
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
          { name: "Аренда авто в Новосибирске", url: "/rent/novosibirsk" },
        ]),
      ),
    ],
  }),
});

function Page() {
  return (
    <LandingPage
      breadcrumb="Аренда авто в Новосибирске"
      h1="Аренда авто в Новосибирске"
      lead="NSK-RENT — прокат автомобилей в Новосибирске с посуточной оплатой от 1 800 ₽. В автопарке 8 японских кей-каров с правым рулём: Honda N-BOX, Suzuki Wagon R, Nissan Dayz. Единственный пункт выдачи — ул. Доватора, 11."
      bullets={[
        "От 1 800 ₽/сутки по городу, от 2 000 ₽ за пределы НСО",
        "Без крупного залога — страховой депозит от 5 000 ₽",
        "Договор онлайн за 3 минуты, подпись СМС-кодом",
        "Один пункт выдачи: ул. Доватора, 11",
        "ОСАГО, ТО и сезонная резина уже в цене",
        "Поддержка 24/7, замена авто при поломке",
      ]}
      sections={[
        {
          h: "Как арендовать авто в Новосибирске",
          body: "Выберите автомобиль в каталоге, укажите даты и точку выдачи. Заполните форму — паспорт и водительское удостоверение категории B. Подпишите договор СМС-кодом и оплатите картой через ЮKassa или наличными при получении. Ключи — сразу после проверки документов.",
        },
        {
          h: "Тарифы: посуточно, на неделю, на месяц",
          body: "Посуточная аренда — от 1 800 ₽ по городу. При аренде от 7 дней — скидка 10%, от 30 дней — 20%. Для выезда за пределы Новосибирской области действует тариф «За город» от 2 000 ₽/сутки с расширенным лимитом пробега.",
        },
        {
          h: "Где забрать автомобиль",
          body: "У NSK-RENT один пункт выдачи — Новосибирск, ул. Доватора, 11. Выдача и возврат автомобиля происходят только здесь, круглосуточно по предварительной записи. Доставку авто по адресу мы не осуществляем.",
        },
      ]}
      cars={cars.slice(0, 6)}
      faq={faqItems.slice(0, 6)}
    />
  );
}
