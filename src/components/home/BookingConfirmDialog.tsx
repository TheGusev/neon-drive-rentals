import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { AlertTriangle, Calendar, MapPin, Shield } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { BookingTariff, Car } from "@/types/domain";
import { getTariff } from "@/mocks/tariffs";
import { calcPrice, formatRub } from "@/lib/bookingDraft";
import { getConflictingBookings } from "@/lib/availability";
import { useBookings } from "@/state/AppDataContext";

interface Props {
  open: boolean;
  car: Car | null;
  from: string | undefined;
  to: string | undefined;
  tariff: BookingTariff;
  locationLabel?: string;
  onClose: () => void;
}

export function BookingConfirmDialog({ open, car, from, to, tariff, locationLabel, onClose }: Props) {
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();

  const tariffInfo = car ? getTariff(tariff) : null;

  const price = useMemo(() => {
    if (!car || !tariffInfo) return null;
    return calcPrice({
      pricePerDay: car.pricePerDay,
      deposit: car.deposit ?? 0,
      draft: { startDate: from, endDate: to, tariff },
      tariffMultiplier: tariffInfo.multiplier,
    });
  }, [car, tariffInfo, from, to, tariff]);

  const conflicts = useMemo(
    () => (car ? getConflictingBookings(car.id, from, to, bookings) : []),
    [car, from, to],
  );
  const hasDates = !!(from && to);
  const blocked = !hasDates || conflicts.length > 0;

  const handleConfirm = () => {
    if (!car || blocked || !agree) return;
    onClose();
    setAgree(false);
    navigate({
      to: "/booking/$carId",
      params: { carId: car.id },
      search: { from, to, tariff },
    });
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setAgree(false);
      onClose();
    }
  };

  return (
    <Dialog open={open && !!car} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0 sm:rounded-2xl">
        {car && price && tariffInfo && (
          <div className="flex max-h-[85vh] flex-col overflow-y-auto">
            <div className="relative aspect-[16/8] w-full bg-muted">
              <img src={car.image} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <Badge variant="secondary" className="mb-1 uppercase tracking-wider">
                  Подтверждение брони
                </Badge>
                <p className="font-display text-2xl font-black leading-tight">
                  {car.brand} {car.model}
                </p>
              </div>
            </div>

            <div className="space-y-4 p-5 md:p-6">
              <DialogHeader className="sr-only">
                <DialogTitle>Подтверждение бронирования {car.brand} {car.model}</DialogTitle>
                <DialogDescription>Проверьте детали и итоговую стоимость перед подтверждением.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoRow
                  icon={Calendar}
                  label="Даты"
                  value={hasDates ? `${fmt(from!)} → ${fmt(to!)}` : "не выбраны"}
                />
                <InfoRow
                  icon={Calendar}
                  label="Срок"
                  value={`${price.days} ${plural(price.days, ["сутки", "суток", "суток"])}`}
                />
                <InfoRow icon={MapPin} label="Место" value={locationLabel ?? "Уточним при оформлении"} />
                <InfoRow icon={Shield} label="Тариф" value={tariffInfo.title} />
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <Row
                  label={`Аренда · ${price.days} × ${formatRub(Math.round(car.pricePerDay * tariffInfo.multiplier))}`}
                  value={formatRub(price.rental)}
                />
                <Row label="Залог (возвращается)" value={formatRub(price.deposit)} muted />
                <div className="mt-3 flex items-baseline justify-between border-t border-border/60 pt-3">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Итого к оплате</span>
                  <span className="font-display text-2xl font-black text-primary">{formatRub(price.total)}</span>
                </div>
              </div>

              {blocked && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {!hasDates
                      ? "Выберите даты аренды перед подтверждением."
                      : `Автомобиль занят на выбранный период: ${conflicts
                          .map((b) => `${fmt(b.startDate)}–${fmt(b.endDate)}`)
                          .join(", ")}. Смените даты или выберите другое авто.`}
                  </span>
                </div>
              )}

              <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={agree}
                  onCheckedChange={(v) => setAgree(v === true)}
                  className="mt-0.5"
                />
                <span>
                  Согласен с условиями аренды, политикой залога и обработкой персональных данных.
                </span>
              </label>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Изменить
                </Button>
                <Button
                  disabled={blocked || !agree}
                  onClick={handleConfirm}
                  className="gap-2 font-bold uppercase tracking-wider"
                >
                  Подтвердить и продолжить
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={muted ? "text-muted-foreground" : "font-semibold"}>{value}</span>
    </div>
  );
}

function fmt(iso: string) {
  try {
    return format(parseISO(iso), "d MMM", { locale: ru });
  } catch {
    return iso;
  }
}

function plural(n: number, forms: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
