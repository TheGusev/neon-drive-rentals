import { CalendarDays, KeyRound, Phone, Mail, MapPin, Trash2, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarImage } from "@/components/car/CarImage";
import type { AdminBookingRow } from "@/types/domain";
import type { BookingStatus, Car } from "@/types/domain";

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачена",
  active: "Активная аренда",
  completed: "Завершена",
  cancelled: "Отменена",
};

const fmtDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

function days(from: string, to: string) {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

interface Props {
  booking: AdminBookingRow | null;
  car?: Car | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIssueKeys: () => void;
  onAcceptReturn: () => void;
  onStatusChange: (status: BookingStatus) => void;
  onDelete: () => void;
  pending?: boolean;
}

export function AdminBookingDetailSheet({
  booking,
  car,
  open,
  onOpenChange,
  onIssueKeys,
  onAcceptReturn,
  onStatusChange,
  onDelete,
  pending,
}: Props) {
  if (!booking) return null;
  const journey = [
    { label: "Оплата", at: ["paid", "active", "completed"].includes(booking.status) ? "Подтверждена" : "Ожидается" },
    { label: "Договор", at: booking.signedAt ? fmtDateTime(booking.signedAt) : "Не подписан" },
    { label: "Ключи выданы", at: booking.keysIssuedAt ? fmtDateTime(booking.keysIssuedAt) : "Ещё нет" },
    { label: "Авто возвращено", at: booking.returnedAt ? fmtDateTime(booking.returnedAt) : "Ещё нет" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Бронь № {booking.id}</SheetTitle>
          <SheetDescription>{STATUS_LABEL[booking.status]}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex gap-3">
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
            <CarImage src={car?.image} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold">{booking.carName}</div>
            <div className="text-xs text-muted-foreground">
              {car?.year ? `${car.year} · ` : ""}
              {car?.transmission ?? ""}
            </div>
            {booking.carPlate && (
              <Badge variant="secondary" className="mt-1">
                {booking.carPlate}
              </Badge>
            )}
          </div>
        </div>

        <section className="mt-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4 text-muted-foreground" /> Клиент
          </h3>
          <Row label="Имя" value={booking.clientName} />
          <Row
            label="Телефон"
            value={
              booking.clientPhone ? (
                <a className="inline-flex items-center gap-1 text-primary" href={`tel:${booking.clientPhone}`}>
                  <Phone className="h-3.5 w-3.5" /> {booking.clientPhone}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row
            label="E-mail"
            value={
              booking.clientEmail ? (
                <a className="inline-flex items-center gap-1 text-primary" href={`mailto:${booking.clientEmail}`}>
                  <Mail className="h-3.5 w-3.5" /> {booking.clientEmail}
                </a>
              ) : (
                "—"
              )
            }
          />
        </section>

        <section className="mt-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="h-4 w-4 text-muted-foreground" /> Аренда
          </h3>
          <Row label="Выдача" value={fmtDateTime(booking.startDate)} />
          <Row label="Возврат" value={fmtDateTime(booking.endDate)} />
          <Row label="Срок" value={`${days(booking.startDate, booking.endDate)} сут.`} />
          <Row
            label="Адрес"
            value={
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {booking.pickupAddress ?? "—"}
              </span>
            }
          />
          <Row label="Сумма" value={`${booking.totalPrice.toLocaleString("ru-RU")} ₽`} />
        </section>

        <section className="mt-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="h-4 w-4 text-muted-foreground" /> Маршрут аренды
          </h3>
          {journey.map((s) => (
            <Row key={s.label} label={s.label} value={s.at} />
          ))}
          {booking.handledBy && <Row label="Ответственный" value={booking.handledBy} />}
        </section>

        <div className="mt-6 grid gap-2">
          {!booking.keysIssuedAt && (
            <Button onClick={onIssueKeys} disabled={pending}>
              Выдать ключи
            </Button>
          )}
          {booking.keysIssuedAt && !booking.returnedAt && (
            <Button onClick={onAcceptReturn} disabled={pending}>
              Принять возврат
            </Button>
          )}
          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <Button variant="outline" onClick={() => onStatusChange("cancelled")} disabled={pending}>
              Отменить бронь
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={pending}>
                <Trash2 className="mr-2 h-4 w-4" /> Удалить бронь
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить бронь № {booking.id}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Бронь исчезнет из админки и из личного кабинета клиента, а даты снова станут
                  свободными. Действие необратимо.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Удалить</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
