import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText, Mail, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

import { getCarById } from "@/mocks/cars";
import { getPickupPoint } from "@/mocks/pickupPoints";
import { getTariff } from "@/mocks/tariffs";
import {
  calcPrice,
  formatRub,
  getDraft,
  saveDraft,
} from "@/lib/bookingDraft";
import type { BookingDraft, PaymentMethod } from "@/types/domain";

import { SectionCard } from "@/components/checkout/SectionCard";
import { StickyBottomBar } from "@/components/checkout/StickyBottomBar";
import { PriceSummary } from "@/components/checkout/PriceSummary";
import { PaymentMethodRadio } from "@/components/checkout/PaymentMethodRadio";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/payment/$bookingId")({
  head: () => ({
    meta: [
      { title: "Оплата бронирования — NSK-RENT" },
      { name: "description", content: "Оплата аренды авто картой или через СБП. Безопасно и мгновенно." },
      { property: "og:title", content: "Оплата бронирования — NSK-RENT" },
      { property: "og:description", content: "Оплата аренды авто картой или через СБП." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BookingDraft | null | undefined>(undefined);
  const [method, setMethod] = useState<PaymentMethod>("card");

  useEffect(() => {
    const d = getDraft(bookingId);
    setDraft(d);
    if (d?.paymentMethod) setMethod(d.paymentMethod);
  }, [bookingId]);

  const car = draft ? getCarById(draft.carId) : null;
  const tariff = draft ? getTariff(draft.tariff) : null;
  const pickup = draft ? getPickupPoint(draft.pickupPointId) : null;

  const breakdown = useMemo(() => {
    if (!draft || !car || !tariff) return null;
    return calcPrice({
      pricePerDay: car.pricePerDay,
      deposit: car.deposit ?? 5000,
      draft,
      tariffMultiplier: tariff.multiplier,
    });
  }, [draft, car, tariff]);

  const proceed = () => {
    if (!draft) return;
    saveDraft({ ...draft, paymentMethod: method });
    navigate({ to: "/contract/$bookingId", params: { bookingId: draft.id } });
  };

  if (draft === undefined) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!draft || !car || !breakdown) {
    return (
      <div>
        <div className="min-h-screen bg-card p-8 text-center text-foreground">
          <h1 className="text-xl font-bold">Бронирование не найдено</h1>
          <p className="mt-2 text-sm text-muted-foreground">Возможно, сессия истекла. Начните оформление заново.</p>
          <Button asChild className="mt-4 bg-accent hover:bg-accent">
            <Link to="/cars">К каталогу</Link>
          </Button>
        </div>
      </div>
    );
  }

  const startLabel = draft.startDate ? format(parseISO(draft.startDate), "d MMM", { locale: ru }) : "—";
  const endLabel = draft.endDate ? format(parseISO(draft.endDate), "d MMM", { locale: ru }) : "—";

  return (
    <div>
      <div className="min-h-screen bg-card text-foreground">
        <div className="mx-auto max-w-xl px-4 py-5 pb-4 space-y-4">
          <div>
            <Link
              to="/booking/$carId"
              params={{ carId: car.id }}
              search={{ from: undefined, to: undefined, tariff: undefined }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Изменить бронь
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Оплата</h1>
          </div>

          <SectionCard>
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-muted text-xs text-muted-foreground">
                {car.brand.slice(0, 3).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{car.brand} {car.model}</div>
                <div className="text-xs text-muted-foreground">
                  {startLabel} {draft.startTime} — {endLabel} {draft.endTime}
                </div>
                {pickup && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" />{pickup.address}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Детализация">
            <PriceSummary breakdown={breakdown} />
          </SectionCard>

          <SectionCard title="Способ оплаты">
            <PaymentMethodRadio value={method} onChange={setMethod} />
          </SectionCard>

          <SectionCard title="Вы получите">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Mail className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-medium text-foreground">Чек на email</span>
                  <span className="block text-xs text-muted-foreground">Фискальный документ придёт сразу после оплаты</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <FileText className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-medium text-foreground">Договор аренды</span>
                  <span className="block text-xs text-muted-foreground">Подпишете электронно на следующем шаге</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-medium text-foreground">Инструкцию по получению</span>
                  <span className="block text-xs text-muted-foreground">Адрес пункта выдачи, контакты менеджера и время получения</span>
                </span>
              </li>
            </ul>
          </SectionCard>

          <div className="h-2" />
        </div>

        <StickyBottomBar>
          <Button
            onClick={proceed}
            className="h-12 w-full rounded-2xl bg-accent text-base font-semibold text-primary-foreground hover:bg-accent"
          >
            Оплатить {formatRub(breakdown.total)}
          </Button>
        </StickyBottomBar>
      </div>
    </div>
  );
}
