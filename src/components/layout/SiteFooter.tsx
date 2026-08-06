import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
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
      <div className="road-line w-full opacity-60" />
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6 md:py-12">
        <div>
          <p className="font-display text-xl font-black tracking-widest">RENTSIB</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Прокат японских кей-каров в Новосибирске. Доставка по городу и области, договор онлайн.
          </p>
          <p className="mt-4 inline-flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{CONTACTS.city}</span>
          </p>
          <p className="mt-2 inline-flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{CONTACTS.hours}</span>
          </p>
        </div>

        <nav aria-label="Разделы сайта">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest">Разделы</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {sections.map((s) => (
              <li key={s.to}>
                <Link to={s.to} className="text-muted-foreground transition hover:text-accent">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest">Контакты</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={CONTACTS.phoneHref} className="inline-flex items-center gap-2 text-foreground transition hover:text-accent">
                <Phone className="h-4 w-4 text-accent" /> {CONTACTS.phone}
              </a>
            </li>
            <li>
              <a href={CONTACTS.emailHref} className="inline-flex items-center gap-2 text-foreground transition hover:text-accent">
                <Mail className="h-4 w-4 text-accent" /> {CONTACTS.email}
              </a>
            </li>
            <li>
              <a href={CONTACTS.telegram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-foreground transition hover:text-accent">
                <Send className="h-4 w-4 text-accent" /> Telegram {CONTACTS.telegramLabel}
              </a>
            </li>
            <li>
              <a href={CONTACTS.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-foreground transition hover:text-accent">
                <MessageCircle className="h-4 w-4 text-accent" /> WhatsApp {CONTACTS.whatsappLabel}
              </a>
            </li>
            <li>
              <a href={CONTACTS.max} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-foreground transition hover:text-accent">
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
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/privacy" className="text-muted-foreground transition hover:text-accent">
                Политика конфиденциальности
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-muted-foreground transition hover:text-accent">
                Пользовательское соглашение
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground md:px-6">
          <p>{LEGAL.offerNote}</p>
          <p>{LEGAL.ageNote}</p>
          <p>© {new Date().getFullYear()} RentSib — аренда авто в Новосибирске. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
