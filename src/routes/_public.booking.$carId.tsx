import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

import { getCarById } from "@/mocks/cars";
import { PICKUP_POINT } from "@/mocks/pickupPoints";
import { tariffs, getTariff } from "@/mocks/tariffs";
import {
  calcPrice,
  createDraft,
  formatRub,
  getDraft,
  saveDraft,
} from "@/lib/bookingDraft";
import type { BookingDraft, BookingTariff } from "@/types/domain";

import { SectionCard } from "@/components/checkout/SectionCard";
import { StickyBottomBar } from "@/components/checkout/StickyBottomBar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";

export const Route = createFileRoute("/_public/booking/$carId")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { from?: string; to?: string; tariff?: BookingTariff } => ({
    from: typeof search.from === "string" ? search.from : undefined,
    to: typeof search.to === "string" ? search.to : undefined,
    tariff:
      search.tariff === "city" || search.tariff === "region" || search.tariff === "outside"
        ? (search.tariff as BookingTariff)
        : undefined,
  }),
  loader: ({ params }) => {
    const car = getCarById(params.carId);
    if (!car) throw notFound();
    return { car };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.car;
    const title = c
      ? `Бронирование ${c.brand} ${c.model} — NSK-RENT`
      : "Бронирование — NSK-RENT";
    return {
      meta: [
        { title },
        { name: "description", content: "Выберите даты и тариф — расчёт стоимости в реальном времени. Выдача на ул. Доватора, 11." },
        { property: "og:title", content: title },
        { property: "og:description", content: "Онлайн-бронирование авто в Новосибирске: даты, тариф, выдача на Доватора, 11." },
      ],
    };
  },
  component: BookingPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-xl font-bold">Авто не найдено</h1>
      <Button asChild className="mt-4"><Link to="/cars">К каталогу</Link></Button>
    </div>
  ),
});


function BookingPage() {
  const { car } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    const overrides: Partial<BookingDraft> = {};
    if (search.from) overrides.startDate = search.from;
    if (search.to) overrides.endDate = search.to;
    if (search.tariff) overrides.tariff = search.tariff;
    setDraft(createDraft(car.id, overrides));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car.id]);



  const patch = (p: Partial<BookingDraft>) => {
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, ...p };
      saveDraft(next);
      return next;
    });
  };

  const tariff = getTariff(draft?.tariff ?? "city");
  const breakdown = useMemo(() => {
    if (!draft) return null;
    return calcPrice({
      pricePerDay: car.pricePerDay,
      deposit: car.deposit ?? 5000,
      draft,
      tariffMultiplier: tariff.multiplier,
    });
  }, [draft, car.pricePerDay, car.deposit, tariff.multiplier]);

  const [showErrors, setShowErrors] = useState(false);
  const hydrated = useHydrated();
  // Past-date validation is computed only after hydration so server and client
  // agree during the initial render (they may be in different timezones/days).
  const today = hydrated ? new Date().toISOString().slice(0, 10) : undefined;
  const errors: { key: string; anchor: string; label: string; message: string }[] = [];
  if (!draft?.startDate || !draft?.endDate) {
    errors.push({
      key: "dates",
      anchor: "section-dates",
      label: "Даты аренды",
      message: "Выберите даты получения и возврата",
    });
  } else if (today && draft.startDate < today) {
    errors.push({
      key: "dates",
      anchor: "section-dates",
      label: "Даты аренды",
      message: "Дата получения не может быть в прошлом",
    });
  } else if (draft.endDate <= draft.startDate) {
    errors.push({
      key: "dates",
      anchor: "section-dates",
      label: "Даты аренды",
      message: "Возврат должен быть позже получения — минимум 1 сутки",
    });
  }
  const valid = errors.length === 0;
  const errorFor = (key: string) =>
    showErrors ? (errors.find((e) => e.key === key)?.message ?? null) : null;

  const focusSection = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLElement).focus({ preventScroll: true });
  };

  const goPay = () => {
    if (!draft) return;
    if (!valid) {
      setShowErrors(true);
      const first = errors[0];
      if (first) requestAnimationFrame(() => focusSection(first.anchor));
      return;
    }
    navigate({ to: "/payment/$bookingId", params: { bookingId: draft.id } });
  };


  return (
    <div>
      <div className="min-h-screen bg-card text-foreground">
        <div className="mx-auto max-w-xl px-4 py-5 pb-4 space-y-4">
          <div>
            <Link to="/cars/$carId" params={{ carId: car.id }} className="link-quiet text-xs">
              ← Назад к авто
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Оформление аренды</h1>
          </div>

          <SectionCard>
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-muted text-xs text-muted-foreground">
                {car.brand.slice(0, 3).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{car.brand} {car.model}</div>
                <div className="text-xs text-muted-foreground">{car.year} · {car.transmission} · {car.engineVolume.toFixed(2)} л</div>
              </div>
              <div className="text-right text-sm font-bold text-accent">
                {formatRub(car.pricePerDay)}<span className="block text-[10px] font-normal text-muted-foreground">/ сутки</span>
              </div>
            </div>
          </SectionCard>

          {draft && (
            <>
              <SectionCard id="section-dates" title="Даты и время" error={errorFor("dates")}>
                <div className="grid grid-cols-2 gap-3">
                  <DateField
                    label="Получение"
                    value={draft.startDate}
                    onChange={(v) => patch({ startDate: v })}
                  />
                  <DateField
                    label="Возврат"
                    value={draft.endDate}
                    onChange={(v) => patch({ endDate: v })}
                  />
                  <TimeField
                    label="Время выдачи"
                    value={draft.startTime}
                    onChange={(v) => patch({ startTime: v })}
                  />
                  <TimeField
                    label="Время возврата"
                    value={draft.endTime}
                    onChange={(v) => patch({ endTime: v })}
                  />
                </div>
              </SectionCard>

              <SectionCard id="section-pickup" title="Выдача автомобиля">
                <div className="flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/5 p-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{PICKUP_POINT.address}</div>
                    <div className="text-xs text-muted-foreground">{PICKUP_POINT.hours}</div>
                    <a
                      href={PICKUP_POINT.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="link-text mt-1 inline-block text-xs underline"
                    >
                      Показать на карте
                    </a>
                    <p className="mt-2 text-[11px] leading-tight text-muted-foreground">
                      Это наш единственный пункт выдачи. Доставка автомобиля не осуществляется — забрать и вернуть авто можно только здесь.
                    </p>
                  </div>
                </div>
              </SectionCard>


              <SectionCard title="Тариф">
                <div className="grid grid-cols-3 gap-2">
                  {tariffs.map((t) => {
                    const active = draft.tariff === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => patch({ tariff: t.id as BookingTariff })}
                        className={cn(
                          "rounded-xl border p-2.5 text-left transition",
                          active
                            ? "border-accent bg-accent/5"
                            : "border-border bg-card",
                        )}
                      >
                        <div className={cn("text-xs font-semibold", active ? "text-accent" : "text-foreground")}>
                          {t.title}
                        </div>
                        <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{t.description}</div>
                        {t.multiplier !== 1 && (
                          <div className="mt-1 text-[10px] font-medium text-muted-foreground">×{t.multiplier}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            </>
          )}

          <div className="h-2" />
        </div>

        <StickyBottomBar
          label="Итого"
          value={breakdown ? formatRub(breakdown.total) : "—"}
        >
          {showErrors && !valid ? (
            <div
              role="alert"
              className="mb-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-left"
            >
              <p className="text-xs font-semibold text-destructive">
                Не заполнено: {errors.length}
              </p>
              <ul className="mt-1.5 space-y-1">
                {errors.map((e) => (
                  <li key={e.key}>
                    <button
                      type="button"
                      onClick={() => focusSection(e.anchor)}
                      className="text-left text-xs text-destructive underline underline-offset-2"
                    >
                      {e.label}: {e.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            !valid && (
              <p className="mb-2 text-center text-xs text-muted-foreground">
                Укажите {errors.map((e) => e.label.toLowerCase()).join(", ")}, чтобы продолжить
              </p>
            )
          )}
          <Button
            onClick={goPay}
            variant="accent" size="xl" className="w-full"
          >
            Перейти к оплате
          </Button>
        </StickyBottomBar>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  const date = value ? parseISO(value) : undefined;
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-11 w-full items-center gap-2 rounded-xl border border-border bg-card px-3 text-left text-sm text-foreground"
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {date ? format(date, "d MMM yyyy", { locale: ru }) : "Дата"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && onChange(d.toISOString().slice(0, 10))}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-accent"
      />
    </div>
  );
}
