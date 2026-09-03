import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACTS, LEGAL } from "@/lib/contacts";
import { SITE_URL, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

const URL = `${SITE_URL}/cookies`;
const TITLE = "Политика использования cookie — NSK-RENT";
const DESC =
  "Какие cookie использует сайт nsk-rent.ru: технические и аналитические, сроки хранения и порядок отзыва согласия.";

export const Route = createFileRoute("/_public/cookies")({
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
          { name: "Политика cookie", url: "/cookies" },
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
        / <span className="text-foreground">Политика cookie</span>
      </nav>

      <h1 className="font-display text-3xl font-black md:text-4xl">Политика использования cookie</h1>
      <div className="road-line mt-4 w-24" />

      <div className="prose prose-theme mt-6 max-w-none prose-headings:font-display">
        <p>
          Оператор сайта — {LEGAL.entity} ({LEGAL.inn}, {LEGAL.ogrnip}). Настоящая политика поясняет,
          какие файлы cookie используются на сайте nsk-rent.ru и как управлять согласием.
        </p>

        <h2>1. Что такое cookie</h2>
        <p>
          Cookie — небольшие текстовые файлы, которые сайт сохраняет в браузере. Они позволяют
          поддерживать сессию, запоминать настройки и собирать обезличенную статистику.
        </p>

        <h2>2. Категории cookie</h2>
        <ul>
          <li>
            <strong>Технические (необходимые)</strong> — авторизация клиента и администратора, защита
            форм, хранение выбранного бронирования. Работают всегда, без них сайт неработоспособен.
            Срок хранения — до 7 дней.
          </li>
          <li>
            <strong>Аналитические</strong> — Яндекс.Метрика (счётчик 112132850): обезличенная
            статистика посещаемости и поведения. Подключаются только после вашего согласия. Срок
            хранения — до 12 месяцев.
          </li>
        </ul>
        <p>Рекламные и профилирующие cookie сторонних сетей на сайте не используются.</p>

        <h2>3. Согласие и его отзыв</h2>
        <p>
          При первом визите отображается баннер с выбором «Только необходимые» или «Принять все».
          Ваше решение и его дата фиксируются. Чтобы изменить выбор, очистите данные сайта в браузере
          — баннер появится снова. Отключить cookie полностью можно в настройках браузера; часть
          функций при этом станет недоступна.
        </p>

        <h2>4. Передача данных</h2>
        <p>
          Данные аналитических cookie обрабатываются ООО «ЯНДЕКС» на серверах, расположенных на
          территории Российской Федерации. Трансграничная передача данных не осуществляется.
        </p>

        <h2>5. Контакты</h2>
        <p>
          Вопросы по обработке cookie и персональных данных: {CONTACTS.email}, {CONTACTS.phone},{" "}
          {LEGAL.address}. Подробнее — в{" "}
          <Link to="/privacy" className="link-text">
            политике конфиденциальности
          </Link>{" "}
          и{" "}
          <Link to="/consent" className="link-text">
            согласии на обработку персональных данных
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
