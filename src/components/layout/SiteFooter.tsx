import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Clock,
  Cookie,
  FileText,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { CONTACTS, LEGAL } from "@/lib/contacts";
import { useHydrated } from "@/hooks/useHydrated";

const sections = [
  { to: "/cars" as const, label: "Автопарк" },
  { to: "/rent/novosibirsk" as const, label: "Аренда в Новосибирске" },
  { to: "/arenda-avto-bez-zaloga" as const, label: "Аренда без залога" },
  { to: "/arenda-avto-bez-voditelya" as const, label: "Аренда без водителя" },
  { to: "/arenda-avto-bez-stazha" as const, label: "Требования к стажу" },
  { to: "/arenda-avto-na-sutki" as const, label: "Аренда на сутки" },
  { to: "/arenda-avto-na-nedelyu" as const, label: "Аренда на неделю" },
  { to: "/arenda-avto-na-mesyac" as const, label: "Аренда на месяц" },
  { to: "/arenda-avto-s-pravym-rulem" as const, label: "Праворульные авто" },
  { to: "/arenda-avto-vyhodnye" as const, label: "Аренда на выходные" },
  { to: "/arenda-avto-poezdka-altay" as const, label: "Поездка на Алтай" },
  { to: "/arenda-probeg-i-platezhi" as const, label: "Пробег и платежи" },
  { to: "/kei-cars" as const, label: "Кей-кары из Японии" },
  { to: "/blog" as const, label: "Блог" },
  { to: "/profile" as const, label: "Личный кабинет" },
];

const headingClass = "font-display text-sm font-bold uppercase tracking-widest text-foreground";
const plateClass = "dash-btn font-semibold text-foreground hover:text-accent";

export function SiteFooter() {
  const hydrated = useHydrated();
  const year = hydrated ? new Date().getFullYear() : 2026;

  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="road-line road-line-run w-full opacity-60" />

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 md:px-6 md:py-12">
        {/* Row 1: company / contacts / legal entity */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0">
            <h2 className={headingClass}>О компании</h2>
            <div className="mt-3 space-y-2">
              <p className="font-display text-xl font-black tracking-widest">NSK-RENT</p>
              <p className="text-sm text-muted-foreground">
                Прокат японских кей-каров в Новосибирске. Пункт выдачи — ул. Доватора, 11, договор онлайн.
              </p>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="min-w-0">{CONTACTS.address} · {CONTACTS.city}</span>
              </p>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="min-w-0">{CONTACTS.hours}</span>
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <h2 className={headingClass}>Контакты</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              <li className="min-w-0">
                <a href={CONTACTS.phoneHref} className={plateClass}>
                  <Phone className="h-4 w-4 shrink-0 text-accent" />
                  <span className="min-w-0 truncate">{CONTACTS.phone}</span>
                </a>
              </li>
              <li className="min-w-0">
                <a href={CONTACTS.emailHref} className={plateClass}>
                  <Mail className="h-4 w-4 shrink-0 text-accent" />
                  <span className="min-w-0 truncate">{CONTACTS.email}</span>
                </a>
              </li>
              <li className="min-w-0">
                <a href={CONTACTS.telegram} target="_blank" rel="noreferrer" className={plateClass}>
                  <Send className="h-4 w-4 shrink-0 text-accent" />
                  <span className="min-w-0 truncate">Telegram</span>
                </a>
              </li>
              <li className="min-w-0">
                <a href={CONTACTS.whatsapp} target="_blank" rel="noreferrer" className={plateClass}>
                  <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
                  <span className="min-w-0 truncate">WhatsApp</span>
                </a>
              </li>
              <li className="min-w-0 sm:col-span-2">
                <a href={CONTACTS.max} target="_blank" rel="noreferrer" className={plateClass}>
                  <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
                  <span className="min-w-0 truncate">{CONTACTS.maxLabel}</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <h2 className={headingClass}>Реквизиты</h2>
            <address className="mt-3 space-y-1.5 text-sm not-italic leading-relaxed text-muted-foreground">
              <p>{LEGAL.entity}</p>
              <p>{LEGAL.inn}</p>
              <p>{LEGAL.ogrnip}</p>
              <p>{LEGAL.registrationAddress}</p>
              <p>{LEGAL.address}</p>
            </address>
          </div>
        </div>

        {/* Row 2: sections as a compact plate grid */}
        <nav aria-label="Разделы сайта" className="min-w-0">
          <h2 className={headingClass}>Разделы</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {sections.map((s) => (
              <li key={s.to} className="min-w-0">
                <Link to={s.to} className={plateClass}>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="min-w-0 truncate">{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Row 3: documents and staff access */}
        <div className="min-w-0">
          <h2 className={headingClass}>Документы и доступ</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/privacy" className={plateClass}>
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
              <span className="min-w-0 truncate">Политика конфиденциальности</span>
            </Link>
            <Link to="/terms" className={plateClass}>
              <FileText className="h-4 w-4 shrink-0 text-accent" />
              <span className="min-w-0 truncate">Пользовательское соглашение</span>
            </Link>
            <Link to="/consent" className={plateClass}>
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
              <span className="min-w-0 truncate">Согласие на обработку ПДн</span>
            </Link>
            <Link to="/cookies" className={plateClass}>
              <Cookie className="h-4 w-4 shrink-0 text-accent" />
              <span className="min-w-0 truncate">Политика cookie</span>
            </Link>
            <Link to="/admin/login" rel="nofollow" className={plateClass}>
              <Lock className="h-4 w-4 shrink-0 text-accent" />
              <span className="min-w-0 truncate">Вход для сотрудников</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1.5 px-4 py-6 text-xs leading-relaxed text-muted-foreground md:px-6">
          <p>{LEGAL.offerNote}</p>
          <p>{LEGAL.ageNote}</p>
          <p>{LEGAL.dataNote}</p>
          <p>{`© ${year} NSK-RENT — аренда авто в Новосибирске. Все права защищены.`}</p>
        </div>
      </div>
    </footer>
  );
}
