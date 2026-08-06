import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, MapPin, Truck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

import { getCarById } from "@/mocks/cars";
import { pickupPoints } from "@/mocks/pickupPoints";
import { tariffs, DELIVERY_PRICE, getTariff } from "@/mocks/tariffs";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_public/booking/$carId")({
  validateSearch: (search: Record<string, unknown>) => ({
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
      ? `Бронирование ${c.brand} ${c.model} — RentSib`
      : "Бронирование — RentSib";
    return {
      meta: [
        { title },
        { name: "description", content: "Выберите даты, точку выдачи и тариф — расчёт стоимости в реальном времени." },
        { property: "og:title", content: title },
        { property: "og:description", content: "Онлайн-бронирование авто в Новосибирске: даты, тариф, доставка." },
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
      deliveryPrice: DELIVERY_PRICE,
      tariffMultiplier: tariff.multiplier,
    });
  }, [draft, car.pricePerDay, car.deposit, tariff.multiplier]);

  const valid = !!(draft?.startDate && draft?.endDate && draft?.pickupPointId && (!draft.delivery || draft.deliveryAddress?.trim()));

  const goPay = () => {
    if (!draft || !valid) return;
    navigate({ to: "/payment/$bookingId", params: { bookingId: draft.id } });
  };

  return (
    <div>
      <div className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto max-w-xl px-4 py-5 pb-4 space-y-4">
          <div>
            <Link to="/cars/$carId" params={{ carId: car.id }} className="text-xs text-slate-500 hover:text-slate-900">
              ← Назад к авто
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Оформление аренды</h1>
          </div>

          <SectionCard>
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-200 text-xs text-slate-500">
                {car.brand.slice(0, 3).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{car.brand} {car.model}</div>
                <div className="text-xs text-slate-500">{car.year} · {car.transmission} · {car.engineVolume.toFixed(2)} л</div>
              </div>
              <div className="text-right text-sm font-bold text-[#2f80ed]">
                {formatRub(car.pricePerDay)}<span className="block text-[10px] font-normal text-slate-400">/ сутки</span>
              </div>
            </div>
          </SectionCard>

          {draft && (
            <>
              <SectionCard title="Даты и время">
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

              <SectionCard title="Точка выдачи">
                <div className="space-y-2">
                  {pickupPoints.map((p) => {
                    const active = draft.pickupPointId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => patch({ pickupPointId: p.id })}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-2xl border bg-white p-3 text-left transition",
                          active ? "border-[#2f80ed] ring-2 ring-[#2f80ed]/20" : "border-slate-200",
                        )}
                      >
                        <MapPin className={cn("mt-0.5 h-5 w-5 shrink-0", active ? "text-[#2f80ed]" : "text-slate-400")} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold">{p.title}</div>
                          <div className="text-xs text-slate-500">{p.address}</div>
                          <div className="text-[11px] text-slate-400">{p.hours}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-slate-500" />
                    <div>
                      <div className="text-sm font-semibold">Доставка по адресу</div>
                      <div className="text-xs text-slate-500">+{formatRub(DELIVERY_PRICE)} к заказу</div>
                    </div>
                  </div>
                  <Switch
                    checked={draft.delivery}
                    onCheckedChange={(v) => patch({ delivery: v })}
                  />
                </div>
                {draft.delivery && (
                  <Input
                    placeholder="Улица, дом, подъезд"
                    value={draft.deliveryAddress ?? ""}
                    onChange={(e) => patch({ deliveryAddress: e.target.value })}
                    className="mt-3 h-11 rounded-xl border-slate-200 bg-white"
                  />
                )}
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
                            ? "border-[#2f80ed] bg-[#2f80ed]/5"
                            : "border-slate-200 bg-white",
                        )}
                      >
                        <div className={cn("text-xs font-semibold", active ? "text-[#2f80ed]" : "text-slate-900")}>
                          {t.title}
                        </div>
                        <div className="mt-0.5 text-[10px] leading-tight text-slate-500">{t.description}</div>
                        {t.multiplier !== 1 && (
                          <div className="mt-1 text-[10px] font-medium text-slate-400">×{t.multiplier}</div>
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
          <Button
            onClick={goPay}
            disabled={!valid}
            className="h-12 w-full rounded-2xl bg-[#2f80ed] text-base font-semibold text-white hover:bg-[#256bd0] disabled:opacity-50"
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
      <label className="mb-1.5 block text-xs font-medium text-slate-500">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-900"
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
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
      <label className="mb-1.5 block text-xs font-medium text-slate-500">{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#2f80ed]"
      />
    </div>
  );
}
