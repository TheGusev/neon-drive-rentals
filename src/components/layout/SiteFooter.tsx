import { Link } from "@tanstack/react-router";
import { ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { CONTACTS, LEGAL } from "@/lib/contacts";

const sections = [
  { to: "/cars" as const, label: "Автопарк" },
  { to: "/rent/novosibirsk" as const, label: "Аренда в Новосибирске" },
  { to: "/rent/bez-zaloga" as const, label: "Аренда без залога" },
  { to: "/kei-cars" as const, label: "Кей-кары из Японии" },
  { to: "/blog" as const, label: "Блог" },
  { to: "/profile" as const, label: "Личный кабинет" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="road-line road-line-run w-full opacity-60" />
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6 md:py-12">
        <div>
          <p className="font-display text-xl font-black tracking-widest">NSK-RENT</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Прокат японских кей-каров в Новосибирске. Пункт выдачи — ул. Доватора, 11, договор онлайн.
          </p>
          <p className="mt-4 inline-flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{CONTACTS.address} · {CONTACTS.city}</span>
          </p>
          <p className="mt-2 inline-flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{CONTACTS.hours}</span>
          </p>
        </div>

        <nav aria-label="Разделы сайта">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest">Разделы</h2>
          <ul className="mt-3 space-y-2">
            {sections.map((s) => (
              <li key={s.to}>
                <Link to={s.to} className="dash-btn font-semibold text-foreground hover:text-accent">
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="truncate">{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest">Контакты</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <a href={CONTACTS.phoneHref} className="dash-btn font-semibold text-foreground hover:text-accent">
                <Phone className="h-4 w-4 text-accent" /> {CONTACTS.phone}
              </a>
            </li>
            <li>
              <a href={CONTACTS.emailHref} className="dash-btn font-semibold text-foreground hover:text-accent">
                <Mail className="h-4 w-4 text-accent" /> {CONTACTS.email}
              </a>
            </li>
            <li>
              <a href={CONTACTS.telegram} target="_blank" rel="noreferrer" className="dash-btn font-semibold text-foreground hover:text-accent">
                <Send className="h-4 w-4 text-accent" /> Telegram {CONTACTS.telegramLabel}
              </a>
            </li>
            <li>
              <a href={CONTACTS.whatsapp} target="_blank" rel="noreferrer" className="dash-btn font-semibold text-foreground hover:text-accent">
                <MessageCircle className="h-4 w-4 text-accent" /> WhatsApp {CONTACTS.whatsappLabel}
              </a>
            </li>
            <li>
              <a href={CONTACTS.max} target="_blank" rel="noreferrer" className="dash-btn font-semibold text-foreground hover:text-accent">
                <MessageCircle className="h-4 w-4 text-accent" /> {CONTACTS.maxLabel}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest">Реквизиты</h2>
          <address className="mt-3 space-y-1 text-sm not-italic text-muted-foreground">
            <p>{LEGAL.entity}</p>
            <p>{LEGAL.ogrnip}</p>
            <p>{LEGAL.inn}</p>
            <p>{LEGAL.address}</p>
          </address>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/privacy" className="dash-chip text-muted-foreground hover:text-accent">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="dash-chip text-muted-foreground hover:text-accent">
              Пользовательское соглашение
            </Link>
            <Link to="/admin/login" rel="nofollow" className="dash-chip text-muted-foreground/70 hover:text-accent">
              Вход для сотрудников
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground md:px-6">
          <p>{LEGAL.offerNote}</p>
          <p>{LEGAL.ageNote}</p>
          <p>© {new Date().getFullYear()} NSK-RENT — аренда авто в Новосибирске. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
