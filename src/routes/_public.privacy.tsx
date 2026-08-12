import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACTS, LEGAL } from "@/lib/contacts";
import { SITE_URL, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

const URL = `${SITE_URL}/privacy`;
const TITLE = "Политика конфиденциальности — NSK-RENT";
const DESC =
  "Политика обработки персональных данных NSK-RENT: какие данные собираем при аренде авто, зачем и как их защищаем (152-ФЗ).";

export const Route = createFileRoute("/_public/privacy")({
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
          { name: "Политика конфиденциальности", url: "/privacy" },
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
        / <span className="text-foreground">Политика конфиденциальности</span>
      </nav>

      <h1 className="font-display text-3xl font-black md:text-4xl">Политика конфиденциальности</h1>
      <div className="road-line mt-4 w-24" />

      <div className="prose prose-theme mt-6 max-w-none prose-headings:font-display">
        <p>
          Настоящая Политика описывает порядок обработки персональных данных пользователей сайта
          nsk-rent.ru оператором — {LEGAL.entity} ({LEGAL.ogrnip}, {LEGAL.inn}, {LEGAL.address}) — в
          соответствии с Федеральным законом № 152-ФЗ «О персональных данных».
        </p>

        <h2>1. Какие данные обрабатываются</h2>
        <p>
          Фамилия, имя, отчество, дата рождения, номер телефона, адрес электронной почты, данные
          паспорта и водительского удостоверения, сведения о бронировании и оплате, а также
          технические данные (IP-адрес, cookie, сведения о браузере).
        </p>

        <h2>2. Цели обработки</h2>
        <ul>
          <li>заключение и исполнение договора аренды транспортного средства;</li>
          <li>идентификация арендатора и проверка права управления ТС;</li>
          <li>приём платежей и возврат страхового депозита;</li>
          <li>информирование о статусе брони и сервисные уведомления;</li>
          <li>исполнение требований законодательства РФ.</li>
        </ul>

        <h2>3. Правовые основания</h2>
        <p>
          Согласие субъекта персональных данных, договор аренды, а также требования нормативных актов
          РФ. Согласие может быть отозвано письменным обращением на {CONTACTS.email}.
        </p>

        <h2>4. Передача третьим лицам</h2>
        <p>
          Данные могут передаваться платёжным сервисам, страховым компаниям и государственным органам
          в объёме, необходимом для исполнения договора и требований закона. Продажа данных не
          осуществляется.
        </p>

        <h2>5. Сроки хранения и защита</h2>
        <p>
          Данные хранятся в течение срока действия договора и последующих 5 лет, если иное не
          установлено законом. Применяются организационные и технические меры защиты, включая
          шифрование канала передачи и разграничение доступа.
        </p>

        <h2>6. Cookie</h2>
        <p>
          Сайт использует cookie для работы сессии, сохранения выбранной темы и аналитики. Вы можете
          отключить cookie в настройках браузера — часть функций может стать недоступной.
        </p>

        <h2>7. Права пользователя</h2>
        <p>
          Вы вправе получить сведения об обработке своих данных, требовать их уточнения, блокирования
          или уничтожения, а также обжаловать действия оператора в Роскомнадзоре.
        </p>

        <h2>8. Контакты оператора</h2>
        <p>
          Телефон: {CONTACTS.phone}. Электронная почта: {CONTACTS.email}. Адрес: {LEGAL.address}.
        </p>
      </div>
    </article>
  );
}
