import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, UserPlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useCarLookup } from "@/state/AppDataContext";
import { getPickupPoint } from "@/mocks/pickupPoints";
import { getTariff } from "@/mocks/tariffs";
import { calcPrice, formatRub, getDraft } from "@/lib/bookingDraft";
import type { BookingDraft } from "@/types/domain";
import { createPasswordForSession, getClientSessionStatus } from "@/lib/auth.functions";

import { SectionCard } from "@/components/checkout/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_public/contract/$bookingId")({
  head: () => ({
    meta: [
      { title: "Договор аренды — NSK-RENT" },
      { name: "description", content: "Подписанный договор аренды автомобиля: детали брони и скачивание документа." },
      { property: "og:title", content: "Договор аренды — NSK-RENT" },
      { property: "og:description", content: "Детали брони и договор аренды NSK-RENT." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ContractPage,
});

function ContractPage() {
  const { bookingId } = Route.useParams();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<BookingDraft | null | undefined>(undefined);

  const sessionStatus = useServerFn(getClientSessionStatus);
  const savePassword = useServerFn(createPasswordForSession);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => sessionStatus(), staleTime: 60_000 });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    const d = getDraft(bookingId);
    setDraft(d);
    if (d?.email) setEmail(d.email);
  }, [bookingId]);

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

  if (draft === undefined) return <div className="min-h-screen bg-background" />;

  // Договор появляется только после оформления — иначе возвращаем на счёт.
  if (draft && !draft.signed) {
    return <Navigate to="/invoice/$bookingId" params={{ bookingId: draft.bookingId ?? draft.id }} replace />;
  }

  if (!draft || !car || !breakdown) {
    return (
      <div className="min-h-screen bg-card p-8 text-center text-foreground">
        <h1 className="text-xl font-bold">Бронирование не найдено</h1>
        <p className="mt-2 text-sm text-muted-foreground">Все ваши брони доступны в личном кабинете.</p>
        <Button asChild className="mt-4"><Link to="/profile">В личный кабинет</Link></Button>
      </div>
    );
  }

  const startLabel = draft.startDate ? format(parseISO(draft.startDate), "d MMM yyyy", { locale: ru }) : "—";
  const endLabel = draft.endDate ? format(parseISO(draft.endDate), "d MMM yyyy", { locale: ru }) : "—";

  const downloadContract = () => {
    const lines = [
      "ДОГОВОР АРЕНДЫ ТРАНСПОРТНОГО СРЕДСТВА",
      `Номер брони: ${draft.bookingId ?? draft.id}`,
      `Автомобиль: ${car.brand} ${car.model}, ${car.year}, ${car.color}`,
      `Период: ${startLabel} ${draft.startTime} — ${endLabel} ${draft.endTime}`,
      `Тариф: ${tariff?.title ?? "—"}`,
      `Пункт выдачи: ${pickup?.address ?? "Новосибирск, ул. Доватора, 11"}`,
      `Залог: ${formatRub(car.deposit ?? 0)}`,
      `Итого к оплате: ${formatRub(breakdown.total)}`,
      `Арендатор: ${draft.name ?? "—"}, ${draft.phone}`,
      "",
      "Договор подписан простой электронной подписью (код из SMS) на сайте nsk-rent.ru.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dogovor-${draft.bookingId ?? draft.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Договор скачан");
  };

  const createAccount = async () => {
    if (password.length < 8 || !email.includes("@")) {
      toast.error("Укажите e-mail и пароль от 8 символов");
      return;
    }
    setCreating(true);
    try {
      const res = await savePassword({
        data: { email: email.trim(), password, ...(draft.name ? { name: draft.name } : {}) },
      });
      if (!res.ok) {
        toast.error(
          res.reason === "email_taken"
            ? "Такой e-mail уже занят — войдите под ним"
            : "Сначала войдите по SMS, чтобы привязать пароль",
        );
        return;
      }
      setCreated(true);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Пароль сохранён — теперь можно входить по e-mail");
    } catch {
      toast.error("Сервис временно недоступен");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-card text-foreground">
      <div className="mx-auto max-w-xl space-y-4 px-4 py-6 pb-10">
        <div className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/5 p-4">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-accent" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Бронь оформлена</h1>
            <p className="text-xs text-muted-foreground">
              Договор подписан по SMS. Детали отправлены на ваши контакты.
            </p>
          </div>
        </div>

        <SectionCard title="Резюме аренды">
          <dl className="space-y-2 text-sm">
            <Row label="Номер брони" value={String(draft.bookingId ?? draft.id)} mono />
            <Row label="Автомобиль" value={`${car.brand} ${car.model}, ${car.year}`} />
            <Row label="Период" value={`${startLabel} ${draft.startTime} — ${endLabel} ${draft.endTime}`} />
            {pickup && <Row label="Пункт выдачи" value={pickup.address} />}
            {tariff && <Row label="Тариф" value={tariff.title} />}
            <Row label="Итого" value={formatRub(breakdown.total)} strong />
          </dl>
        </SectionCard>

        <button
          type="button"
          onClick={downloadContract}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground/80"
        >
          <FileText className="h-4 w-4 text-accent" />
          Скачать договор
        </button>

        {!me?.authenticated && !created && (
          <SectionCard title="Создайте пароль">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Чтобы отслеживать аренду и бронировать в один клик, задайте пароль — телефон уже подтверждён.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="acc-email">E-mail</Label>
                <Input id="acc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acc-password">Пароль</Label>
                <Input id="acc-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="минимум 8 символов" />
              </div>
              <Button className="w-full" disabled={creating} onClick={() => void createAccount()}>
                <UserPlus className="mr-2 h-4 w-4" />
                {creating ? "Сохраняем…" : "Создать аккаунт"}
              </Button>
            </div>
          </SectionCard>
        )}

        <Button asChild variant="accent" size="xl" className="w-full">
          <Link to="/profile">В личный кабинет</Link>
        </Button>
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
