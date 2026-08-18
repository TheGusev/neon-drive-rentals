import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";

import { useCarLookup } from "@/state/AppDataContext";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { getPickupPoint } from "@/mocks/pickupPoints";
import { getTariff } from "@/mocks/tariffs";
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
      { title: "Подписание договора — NSK-RENT" },
      { name: "description", content: "Электронная подпись договора аренды авто по SMS." },
      { property: "og:title", content: "Подписание договора — NSK-RENT" },
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
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const submitBooking = useServerFn(createBooking);

  useEffect(() => {
    setDraft(getDraft(bookingId));
  }, [bookingId]);

  const getCarById = useCarLookup();
  const car = draft ? getCarById(draft.carId) ?? null : null;
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

  const downloadContract = () => {
    const lines = [
      "ДОГОВОР АРЕНДЫ ТРАНСПОРТНОГО СРЕДСТВА (демо-версия)",
      `Номер брони: ${draft.id}`,
      `Автомобиль: ${car.brand} ${car.model}, ${car.year}, ${car.color}`,
      `Период: ${startLabel} ${draft.startTime} — ${endLabel} ${draft.endTime}`,
      `Тариф: ${tariff?.title ?? "—"}`,
      `Пункт выдачи: ${pickup?.address ?? "Новосибирск, ул. Доватора, 11"}`,
      `Залог: ${formatRub(car.deposit ?? 0)}`,
      `Итого к оплате: ${formatRub(breakdown.total)}`,
      `Телефон арендатора: ${draft.phone}`,
      "",
      "Документ сформирован на сайте nsk-rent.ru и носит демонстрационный характер.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dogovor-${draft.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Договор скачан");
  };

  const sign = async () => {
    if (!canSign || saving) return;
    if (code !== "123456") {
      toast.error("Неверный код из SMS", { description: "Демо-код: 123456" });
      return;
    }
    setSaving(true);
    try {
      const res = await submitBooking({
        data: {
          carId: draft.carId,
          clientPhone: draft.phone ?? "",
          clientName: draft.name ?? undefined,
          clientEmail: draft.email ?? undefined,
          startDate: draft.startDate ?? "",
          endDate: draft.endDate ?? "",
          totalPrice: Math.round(breakdown?.total ?? 0),
        },
      });
      if (!res.ok) {
        toast.error(
          res.reason === "conflict"
            ? "Эти даты уже заняты"
            : "Не удалось сохранить бронирование",
        );
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      saveDraft({ ...draft, signed: true });
      toast.success("Договор подписан", { description: "Копия отправлена на email" });
      navigate({ to: "/profile" });
    } catch {
      toast.error("Сервис временно недоступен, попробуйте ещё раз");
    } finally {
      setSaving(false);
    }
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
              className="link-quiet text-xs"
            >
              ← Назад к оплате
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Подписание договора</h1>
          </div>

          <SectionCard title="Резюме аренды">
            <dl className="space-y-2 text-sm">
              <Row label="Автомобиль" value={`${car.brand} ${car.model}, ${car.year}`} />
              <Row label="Период" value={`${startLabel} ${draft.startTime} — ${endLabel} ${draft.endTime}`} />
              {pickup && <Row label="Пункт выдачи" value={pickup.address} />}
              <Row label="Тариф" value={tariff!.title} />
              <Row label="Итого" value={formatRub(breakdown.total)} strong />
            </dl>
          </SectionCard>

          <SectionCard title="Данные автомобиля">
            <dl className="space-y-2 text-sm">
              <Row label="Модель" value={`${car.brand} ${car.model}`} />
              <Row label="Цвет" value={car.color} />
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
              className="link-text mt-3 text-xs"
              onClick={() => toast("Код отправлен повторно")}
            >
              Отправить код ещё раз
            </button>
          </SectionCard>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); downloadContract(); }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground/80 hover:border-border"
          >
            <FileText className="h-4 w-4 text-accent" />
            Скачать договор
          </a>

          <div className="h-2" />
        </div>

        <StickyBottomBar>
          <Button
            onClick={sign}
            disabled={!canSign}
            variant="accent" size="xl" className="w-full"
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
