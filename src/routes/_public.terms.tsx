import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACTS, LEGAL } from "@/lib/contacts";
import { SITE_URL, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

const URL = `${SITE_URL}/terms`;
const TITLE = "Пользовательское соглашение — NSK-RENT";
const DESC =
  "Условия пользования сайтом nsk-rent.ru и правила аренды автомобиля: требования к арендатору, оплата, депозит, отмена брони.";

export const Route = createFileRoute("/_public/terms")({
  component: Page,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Главная", url: "/" },
          { name: "Пользовательское соглашение", url: "/terms" },
        ]),
      ),
    ],
  }),
});

function Page() {
  return (
    <article className="mx-auto w-full max-w-3xl px-1 py-6 md:py-10">
      <nav aria-label="breadcrumbs" className="mb-4 text-xs text-muted-foreground">
        <Link to="/" className="link-quiet">
          Главная
        </Link>{" "}
        / <span className="text-foreground">Пользовательское соглашение</span>
      </nav>

      <h1 className="font-display text-3xl font-black md:text-4xl">Пользовательское соглашение</h1>
      <div className="road-line mt-4 w-24" />

      <div className="prose prose-theme mt-6 max-w-none prose-headings:font-display">
        <p>
          Соглашение регулирует использование сайта nsk-rent.ru, принадлежащего {LEGAL.entity} (
          {LEGAL.ogrnip}, {LEGAL.inn}). Начиная пользоваться сайтом, вы принимаете его условия.
        </p>

        <h2>1. Статус информации</h2>
        <p>{LEGAL.offerNote} Точные условия аренды фиксируются в договоре, подписываемом при выдаче авто.</p>

        <h2>2. Требования к арендатору</h2>
        <p>
          {LEGAL.ageNote} Необходимы действующие паспорт гражданина РФ и водительское удостоверение
          категории «B». Компания вправе отказать в аренде без объяснения причин.
        </p>

        <h2>3. Бронирование и оплата</h2>
        <ul>
          <li>бронь подтверждается после проверки документов и внесения оплаты;</li>
          <li>оплата возможна банковской картой онлайн или наличными при выдаче;</li>
          <li>страховой депозит возвращается в течение 5 рабочих дней после возврата автомобиля.</li>
        </ul>

        <h2>4. Отмена и изменение брони</h2>
        <p>
          Бесплатная отмена — не позднее чем за 24 часа до начала аренды. При более поздней отмене
          удерживается стоимость одних суток аренды.
        </p>

        <h2>5. Обязанности арендатора</h2>
        <p>
          Соблюдать ПДД, эксплуатировать автомобиль по назначению, не передавать управление третьим
          лицам, не выезжать за пределы согласованного региона без уведомления, возвращать авто в
          исходном состоянии с тем же уровнем топлива.
        </p>

        <h2>6. Ответственность</h2>
        <p>
          Штрафы и взыскания, наложенные в период аренды, оплачивает арендатор. Ущерб, не покрытый
          страховкой, возмещается в соответствии с договором и законодательством РФ.
        </p>

        <h2>7. Разрешение споров</h2>
        <p>
          Претензионный порядок обязателен, срок ответа — 10 рабочих дней. Неурегулированные споры
          рассматриваются судом по месту нахождения оператора.
        </p>

        <h2>8. Контакты</h2>
        <p>
          {CONTACTS.phone} · {CONTACTS.email} · {CONTACTS.hours}
        </p>
      </div>
    </article>
  );
}
