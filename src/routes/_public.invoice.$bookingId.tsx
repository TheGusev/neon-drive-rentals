import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileText, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { getBookingById } from "@/lib/bookings.functions";
import { getBookingPayment, startPayment } from "@/lib/payments.functions";
import { getDraft, saveDraft } from "@/lib/bookingDraft";
import type { BookingDraft } from "@/types/domain";
import { useCarLookup } from "@/state/AppDataContext";
import { CarImage } from "@/components/car/CarImage";
import { SectionCard } from "@/components/checkout/SectionCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/invoice/$bookingId")({
  head: () => ({
    meta: [
      { title: "Счёт на оплату аренды — NSK-RENT" },
      { name: "description", content: "Счёт, статус оплаты и документы по бронированию автомобиля NSK-RENT." },
      { property: "og:title", content: "Счёт на оплату аренды — NSK-RENT" },
      { property: "og:description", content: "Проверьте счёт и статус оплаты бронирования автомобиля." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InvoicePage,
});

function InvoicePage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const getBooking = useServerFn(getBookingById);
  const getPayment = useServerFn(getBookingPayment);
  const beginPayment = useServerFn(startPayment);
  const getCarById = useCarLookup();
  const [draft, setDraft] = useState<BookingDraft | null | undefined>(undefined);
  const [paying, setPaying] = useState(false);

  const bookingQuery = useQuery({
    queryKey: ["invoice", "booking", bookingId],
    queryFn: () => getBooking({ data: { id: bookingId } }),
    staleTime: 10_000,
  });
  const paymentQuery = useQuery({
    queryKey: ["invoice", "payment", bookingId],
    queryFn: () => getPayment({ data: { bookingId } }),
    staleTime: 10_000,
  });

  useEffect(() => {
    const stored = getDraft(bookingId);
    setDraft(stored);
  }, [bookingId]);

  const booking = bookingQuery.data;
  const car = booking ? getCarById(booking.carId) : undefined;
  const payment = paymentQuery.data;
  const paymentStatus = String(payment?.status ?? "pending").toLowerCase();
  const paid = paymentStatus === "succeeded" || paymentStatus === "success" || paymentStatus === "paid";
  const cancelled = paymentStatus === "cancelled" || paymentStatus === "canceled" || paymentStatus === "failed";
  const loading = bookingQuery.isLoading || paymentQuery.isLoading || draft === undefined;

  const period = useMemo(() => {
    if (!booking) return "—";
    return `${formatDate(booking.startDate)} — ${formatDate(booking.endDate)}`;
  }, [booking]);

  const refresh = async () => {
    await Promise.all([bookingQuery.refetch(), paymentQuery.refetch()]);
  };

  const payAgain = async () => {
    if (!booking || !payment) return;
    setPaying(true);
    try {
      const result = await beginPayment({
        data: {
          bookingId: booking.id,
          amount: Math.round(payment.amount || booking.totalPrice),
          description: `Аренда автомобиля, бронь ${booking.id}`,
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.mode === "live" && result.confirmationUrl) {
        window.location.href = result.confirmationUrl;
        return;
      }
      await refresh();
      toast.success("Оплата подтверждена", { description: "Бронь переведена в активную аренду" });
    } catch {
      toast.error("Не удалось повторить оплату");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загружаем счёт…
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <h1 className="text-xl font-bold">Счёт не найден</h1>
        <p className="mt-2 text-sm text-muted-foreground">Проверьте ссылку или откройте бронирования в кабинете.</p>
        <Button asChild className="mt-5"><Link to="/profile">В личный кабинет</Link></Button>
      </div>
    );
  }

  const status = paid
    ? { title: "Оплата подтверждена", text: "Бронь переведена в активную аренду.", Icon: CheckCircle2, tone: "text-emerald-600" }
    : cancelled
      ? { title: "Оплата не завершена", text: "Создайте новый платёж, чтобы активировать бронь.", Icon: XCircle, tone: "text-destructive" }
      : { title: "Ожидаем оплату", text: "После подтверждения платежа бронь автоматически станет активной.", Icon: Clock3, tone: "text-amber-600" };
  const StatusIcon = status.Icon;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-start gap-3 rounded-3xl border border-border bg-card p-5">
        <StatusIcon className={`mt-0.5 h-6 w-6 shrink-0 ${status.tone}`} />
        <div>
          <h1 className="text-xl font-bold tracking-tight">{status.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{status.text}</p>
        </div>
      </div>

      <SectionCard title="Счёт на оплату">
        <div className="flex items-center gap-3">
          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
            {car ? <CarImage src={car.image} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover" /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{car ? `${car.brand} ${car.model}` : "Аренда автомобиля"}</p>
            <p className="text-xs text-muted-foreground">Бронь № {booking.id}</p>
            <p className="text-xs text-muted-foreground">{period}</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <InvoiceRow label="Сумма к оплате" value={`${booking.totalPrice.toLocaleString("ru-RU")} ₽`} strong />
          <InvoiceRow label="Статус платежа" value={paymentLabel(paymentStatus)} />
          {payment?.providerId && <InvoiceRow label="Платёж" value={payment.providerId} mono />}
        </dl>
      </SectionCard>

      {!paid && (
        <Button onClick={() => void payAgain()} disabled={paying} variant="accent" size="xl" className="w-full">
          {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {paying ? "Создаём платёж…" : "Оплатить счёт"}
        </Button>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={() => void refresh()} disabled={paymentQuery.isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${paymentQuery.isFetching ? "animate-spin" : ""}`} /> Обновить статус
        </Button>
        {draft?.signed && (
          <Button asChild variant="outline">
            <Link to="/contract/$bookingId" params={{ bookingId: draft.id }}>
              <FileText className="mr-2 h-4 w-4" /> Договор
            </Link>
          </Button>
        )}
      </div>

      <Button asChild className="w-full" variant="soft">
        <Link to="/profile">В личный кабинет</Link>
      </Button>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

function paymentLabel(status: string) {
  if (status === "succeeded" || status === "success" || status === "paid") return "Оплачен";
  if (status === "cancelled" || status === "canceled" || status === "failed") return "Отменён";
  return "Ожидает оплаты";
}

function InvoiceRow({ label, value, strong, mono }: { label: string; value: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`${strong ? "text-base font-bold" : "font-medium"} ${mono ? "max-w-[60%] truncate font-mono text-xs" : ""} text-foreground`}>
        {value}
      </dd>
    </div>
  );
}
