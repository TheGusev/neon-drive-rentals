import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";

import { getCarById } from "@/mocks/cars";
import { getPickupPoint } from "@/mocks/pickupPoints";
import { getTariff, DELIVERY_PRICE } from "@/mocks/tariffs";
import { calcPrice, formatRub, getDraft, saveDraft } from "@/lib/bookingDraft";
import type { BookingDraft } from "@/types/domain";

import { SectionCard } from "@/components/checkout/SectionCard";
import { StickyBottomBar } from "@/components/checkout/StickyBottomBar";
import { SmsCodeInput, maskPhone } from "@/components/checkout/SmsCodeInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_public/contract/$bookingId")({
  head: () => ({
    meta: [
      { title: "Подписание договора — RentSib" },
      { name: "description", content: "Электронная подпись договора аренды авто по SMS." },
      { property: "og:title", content: "Подписание договора — RentSib" },
      { property: "og:description", content: "ПЭП по SMS, скачивание PDF." },
    ],
  }),
  component: ContractPage,
});

function ContractPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BookingDraft | null | undefined>(undefined);
  const [terms, setTerms] = useState(false);
  const [dataOk, setDataOk] = useState(false);
  const [pep, setPep] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    setDraft(getDraft(bookingId));
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
      deliveryPrice: DELIVERY_PRICE,
      tariffMultiplier: tariff.multiplier,
    });
  }, [draft, car, tariff]);

  if (draft === undefined) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!draft || !car || !breakdown) {
    return (
      <div>
        <div className="min-h-screen bg-card p-8 text-center text-foreground">
          <h1 className="text-xl font-bold">Бронирование не найдено</h1>
          <Button asChild className="mt-4 bg-accent hover:bg-accent">
            <Link to="/cars">К каталогу</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canSign = terms && dataOk && pep && code.length === 6;

  const sign = () => {
    if (!canSign) return;
    saveDraft({ ...draft, signed: true });
    toast.success("Договор подписан", { description: "Копия отправлена на email" });
    navigate({ to: "/profile" });
  };

  const startLabel = draft.startDate ? format(parseISO(draft.startDate), "d MMM yyyy", { locale: ru }) : "—";
  const endLabel = draft.endDate ? format(parseISO(draft.endDate), "d MMM yyyy", { locale: ru }) : "—";

  return (
    <div>
      <div className="min-h-screen bg-card text-foreground">
        <div className="mx-auto max-w-xl px-4 py-5 pb-4 space-y-4">
          <div>
            <Link
              to="/payment/$bookingId"
              params={{ bookingId: draft.id }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Назад к оплате
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Подписание договора</h1>
          </div>

          <SectionCard title="Резюме аренды">
            <dl className="space-y-2 text-sm">
              <Row label="Автомобиль" value={`${car.brand} ${car.model}, ${car.year}`} />
              <Row label="Период" value={`${startLabel} ${draft.startTime} — ${endLabel} ${draft.endTime}`} />
              {pickup && <Row label="Точка выдачи" value={pickup.title} />}
              <Row label="Тариф" value={tariff!.title} />
              <Row label="Итого" value={formatRub(breakdown.total)} strong />
            </dl>
          </SectionCard>

          <SectionCard title="Данные автомобиля">
            <dl className="space-y-2 text-sm">
              <Row label="VIN" value={car.vin ?? "—"} mono />
              <Row label="Госномер" value={car.plate ?? "—"} mono />
              <Row label="Пробег" value={car.mileageLimit ? `${car.mileageLimit} км/сутки` : "Без лимита"} />
              <Row label="Залог" value={formatRub(car.deposit ?? 0)} />
            </dl>
          </SectionCard>

          <SectionCard title="Согласия">
            <div className="space-y-3">
              <AgreeRow
                checked={terms}
                onChange={setTerms}
                text="Ознакомлен с условиями договора аренды и правилами эксплуатации автомобиля"
              />
              <AgreeRow
                checked={dataOk}
                onChange={setDataOk}
                text="Подтверждаю корректность указанных персональных данных и водительского удостоверения"
              />
              <AgreeRow
                checked={pep}
                onChange={setPep}
                text="Согласен на использование простой электронной подписи (ПЭП) для подписания договора"
              />
            </div>
          </SectionCard>

          <SectionCard title="Код из SMS">
            <p className="mb-3 text-xs text-muted-foreground">
              Код отправлен на {maskPhone(draft.phone)}
            </p>
            <SmsCodeInput value={code} onChange={setCode} />
            <button
              type="button"
              className="mt-3 text-xs font-medium text-accent hover:underline"
              onClick={() => toast("Код отправлен повторно")}
            >
              Отправить код ещё раз
            </button>
          </SectionCard>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); toast("Договор скачивается…"); }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground/80 hover:border-border"
          >
            <FileText className="h-4 w-4 text-accent" />
            Скачать договор PDF
          </a>

          <div className="h-2" />
        </div>

        <StickyBottomBar>
          <Button
            onClick={sign}
            disabled={!canSign}
            className="h-12 w-full rounded-2xl bg-accent text-base font-semibold text-primary-foreground hover:bg-accent disabled:opacity-50"
          >
            Подписать договор
          </Button>
        </StickyBottomBar>
      </div>
    </div>
  );
}

function Row({ label, value, strong, mono }: { label: string; value: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={
          (strong ? "text-base font-bold text-foreground" : "text-sm font-medium text-foreground") +
          (mono ? " font-mono tracking-tight" : "")
        }
      >
        {value}
      </dd>
    </div>
  );
}

function AgreeRow({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  text: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        className="mt-0.5 h-5 w-5 rounded-md border-border data-[state=checked]:border-accent data-[state=checked]:bg-accent"
      />
      <span className="text-sm leading-snug text-foreground/80">{text}</span>
    </label>
  );
}
