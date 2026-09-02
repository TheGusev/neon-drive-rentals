import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText, Mail, MapPin, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useCarLookup } from "@/state/AppDataContext";
import { getPickupPoint } from "@/mocks/pickupPoints";
import { getTariff } from "@/mocks/tariffs";
import { calcPrice, formatRub, getDraft, saveDraft } from "@/lib/bookingDraft";
import type { BookingDraft, PaymentMethod } from "@/types/domain";
import { createBooking } from "@/lib/bookings.functions";
import { getClientSessionStatus, loginWithOtp, requestOtp } from "@/lib/auth.functions";
import { startPayment } from "@/lib/payments.functions";

import { SectionCard } from "@/components/checkout/SectionCard";
import { StickyBottomBar } from "@/components/checkout/StickyBottomBar";
import { PriceSummary } from "@/components/checkout/PriceSummary";
import { PaymentMethodRadio } from "@/components/checkout/PaymentMethodRadio";
import { SmsCodeInput, maskPhone } from "@/components/checkout/SmsCodeInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_public/payment/$bookingId")({
  head: () => ({
    meta: [
      { title: "Оформление и оплата — NSK-RENT" },
      { name: "description", content: "Контакты, договор и оплата аренды картой или через СБП. Безопасно и мгновенно." },
      { property: "og:title", content: "Оформление и оплата — NSK-RENT" },
      { property: "og:description", content: "Оплата аренды авто картой или через СБП." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState<BookingDraft | null | undefined>(undefined);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const [pep, setPep] = useState(false);
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const sendCode = useServerFn(requestOtp);
  // Код из SMS одновременно подтверждает договор и создаёт сессию клиента.
  const verifyCode = useServerFn(loginWithOtp);
  const submitBooking = useServerFn(createBooking);
  const beginPayment = useServerFn(startPayment);
  const sessionStatus = useServerFn(getClientSessionStatus);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => sessionStatus(),
    staleTime: 60_000,
  });

  useEffect(() => {
    const d = getDraft(bookingId);
    setDraft(d);
    if (d?.paymentMethod) setMethod(d.paymentMethod);
    if (d?.name) setName(d.name);
    if (d?.email) setEmail(d.email);
    setPhone(d?.phone && !d.phone.startsWith("+7 999 123") ? d.phone : "+7 ");
  }, [bookingId]);

  // Автозаполнение для вошедшего клиента.
  useEffect(() => {
    if (!me?.authenticated) return;
    setName((v) => (v ? v : me.name ?? ""));
    setEmail((v) => (v ? v : me.email ?? ""));
    setPhone((v) => (v && v.replace(/\D/g, "").length >= 10 ? v : me.phone ?? v));
  }, [me]);

  const getCarById = useCarLookup();
  const car = draft ? getCarById(draft.carId) ?? null : null;
  const tariff = draft ? getTariff(draft.tariff) : null;
  const pickup = draft ? getPickupPoint(draft.pickupPointId) : null;

  const breakdown = useMemo(() => {
    if (!draft || !car || !tariff) return null;
    return calcPrice({
      pricePerDay: car.pricePerDay,
      deposit: car.deposit ?? 2000,
      draft,
      tariffMultiplier: tariff.multiplier,
    });
  }, [draft, car, tariff]);

  const errors: string[] = [];
  if (name.trim().length < 2) errors.push("Укажите имя и фамилию");
  if (phone.replace(/\D/g, "").length < 10) errors.push("Укажите номер телефона");
  if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) errors.push("E-mail указан с ошибкой");
  if (!terms) errors.push("Подтвердите согласие с условиями аренды");
  if (!pep) errors.push("Подтвердите согласие на подпись договора по SMS (ПЭП)");
  if (code.trim().length < 4) errors.push("Введите код из SMS");
  const valid = errors.length === 0;

  const resendCode = async () => {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Сначала укажите номер телефона");
      return;
    }
    try {
      const res = await sendCode({ data: { phone } });
      if (!res.ok) {
        toast.error("Не удалось отправить код");
        return;
      }
      setCodeSent(true);
      const devCode = (res as { devCode?: string }).devCode;
      toast.success(devCode ? `Тестовый код: ${devCode}` : "Код отправлен по SMS");
    } catch {
      toast.error("Сервис временно недоступен");
    }
  };

  const pay = async () => {
    if (!draft || !car || !breakdown) return;
    if (!valid) {
      setShowErrors(true);
      toast.error("Проверьте форму", { description: errors[0] });
      return;
    }

    setSaving(true);
    try {
      const check = await verifyCode({ data: { phone, code } });
      if (!check.ok) {
        toast.error("Неверный или просроченный код из SMS");
        return;
      }

      const total = Math.round(breakdown.total);
      const res = await submitBooking({
        data: {
          carId: draft.carId,
          clientPhone: phone,
          clientName: name.trim(),
          clientEmail: email.trim() || undefined,
          startDate: draft.startDate ?? "",
          endDate: draft.endDate ?? "",
          totalPrice: total,
          signed: true,
        },
      });

      if (!res.ok) {
        toast.error(
          res.reason === "conflict"
            ? "Эти даты уже заняты — выберите другие"
            : "Не удалось сохранить бронирование",
        );
        return;
      }

      const saved: BookingDraft = {
        ...draft,
        phone,
        name: name.trim(),
        email: email.trim(),
        paymentMethod: method,
        signed: true,
        bookingId: res.booking.id,
      };
      saveDraft(saved);
      setDraft(saved);
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });

      const payment = await beginPayment({
        data: {
          bookingId: res.booking.id,
          amount: total,
          description: `Аренда ${car.brand} ${car.model}, бронь ${res.booking.id}`,
        },
      });

      if (payment.ok && payment.mode === "live" && payment.confirmationUrl) {
        toast.success("Бронь сохранена. Переходим к оплате");
        window.location.href = payment.confirmationUrl;
        return;
      }

      toast.success("Бронь оформлена", {
        description: "Договор подписан, детали отправлены на указанные контакты",
      });
      navigate({ to: "/contract/$bookingId", params: { bookingId: draft.id } });
    } catch {
      toast.error("Сервис временно недоступен, попробуйте ещё раз");
    } finally {
      setSaving(false);
    }
  };

  if (draft === undefined) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!draft || !car || !breakdown) {
    return (
      <div className="min-h-screen bg-card p-8 text-center text-foreground">
        <h1 className="text-xl font-bold">Бронирование не найдено</h1>
        <p className="mt-2 text-sm text-muted-foreground">Возможно, сессия истекла. Начните оформление заново.</p>
        <Button asChild className="mt-4">
          <Link to="/cars">К каталогу</Link>
        </Button>
      </div>
    );
  }

  const startLabel = draft.startDate ? format(parseISO(draft.startDate), "d MMM", { locale: ru }) : "—";
  const endLabel = draft.endDate ? format(parseISO(draft.endDate), "d MMM", { locale: ru }) : "—";

  return (
    <div className="min-h-screen bg-card text-foreground">
      <div className="mx-auto max-w-xl space-y-4 px-4 py-5 pb-4">
        <div>
          <Link
            to="/booking/$carId"
            params={{ carId: car.id }}
            search={{ from: undefined, to: undefined, tariff: undefined }}
            className="link-quiet text-xs"
          >
            ← Изменить бронь
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Оформление и оплата</h1>
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

        <SectionCard title="Ваши данные">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cust-name">Имя и фамилия</Label>
              <Input id="cust-name" value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-phone">Телефон</Label>
              <Input id="cust-phone" value={phone} inputMode="tel" autoComplete="tel" onChange={(e) => setPhone(e.target.value)} placeholder="+7 913 015-85-55" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-email">E-mail для чека и договора</Label>
              <Input id="cust-email" value={email} type="email" autoComplete="email" onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            {!me?.authenticated && (
              <p className="text-[11px] text-muted-foreground">
                Есть аккаунт?{" "}
                <Link to="/login" className="link-text">Войдите</Link>, чтобы данные подставились автоматически.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Способ оплаты">
          <PaymentMethodRadio value={method} onChange={setMethod} />
        </SectionCard>

        <SectionCard title="Договор и согласия">
          <div className="space-y-3">
            <AgreeRow
              checked={terms}
              onChange={setTerms}
              text="Ознакомлен с условиями договора аренды и правилами эксплуатации автомобиля"
            />
            <AgreeRow
              checked={pep}
              onChange={setPep}
              text="Согласен на подписание договора простой электронной подписью (код из SMS)"
            />
          </div>
        </SectionCard>

        <SectionCard title="Подтверждение по SMS">
          <p className="mb-3 text-xs text-muted-foreground">
            {codeSent
              ? `Код отправлен на ${maskPhone(phone)}`
              : "Нажмите «Отправить код» — SMS придёт на указанный номер"}
          </p>
          <SmsCodeInput value={code} onChange={setCode} />
          <button type="button" className="link-text mt-3 text-xs" onClick={() => void resendCode()}>
            {codeSent ? "Отправить код ещё раз" : "Отправить код"}
          </button>
        </SectionCard>

        <SectionCard title="Вы получите">
          <ul className="space-y-3 text-sm">
            <Perk icon={Mail} title="Чек на email" hint="Фискальный документ придёт сразу после оплаты" />
            <Perk icon={FileText} title="Договор аренды" hint="Подписывается кодом из SMS прямо здесь" />
            <Perk icon={MapPin} title="Инструкцию по получению" hint="Адрес пункта выдачи, контакты менеджера и время получения" />
          </ul>
        </SectionCard>

        <div className="h-2" />
      </div>

      <StickyBottomBar label="К оплате" value={formatRub(breakdown.total)}>
        {showErrors && !valid && (
          <div role="alert" className="mb-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-left">
            <p className="text-xs font-semibold text-destructive">Не заполнено: {errors.length}</p>
            <ul className="mt-1.5 space-y-1">
              {errors.map((e) => (
                <li key={e} className="text-xs text-destructive">{e}</li>
              ))}
            </ul>
          </div>
        )}
        <Button onClick={() => void pay()} disabled={saving} variant="accent" size="xl" className="w-full">
          <ShieldCheck className="mr-2 h-4 w-4" />
          {saving ? "Оформляем…" : `Оплатить ${formatRub(breakdown.total)}`}
        </Button>
      </StickyBottomBar>
    </div>
  );
}

function Perk({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Mail;
  title: string;
  hint: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </li>
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
