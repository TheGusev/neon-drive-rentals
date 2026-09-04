import { Check, CircleDashed, KeyRound, FileSignature, CreditCard, Star, Undo2 } from "lucide-react";
import type { Booking } from "@/types/domain";
import { cn } from "@/lib/utils";

type Step = {
  key: string;
  title: string;
  hint: string;
  icon: typeof Check;
  done: boolean;
};

/** Маршрут аренды: оплата → договор → ключи → возврат → отзыв. */
export function RentalJourney({
  booking,
  hasReview,
}: {
  booking: Booking;
  hasReview: boolean;
}) {
  const paid = ["paid", "active", "completed"].includes(booking.status);
  const signed = booking.contractStatus === "signed";
  const keys = Boolean(booking.keysIssuedAt);
  const returned = Boolean(booking.returnedAt) || booking.status === "completed";

  const steps: Step[] = [
    { key: "paid", title: "Бронь оплачена", hint: "Оплата подтверждена", icon: CreditCard, done: paid },
    { key: "signed", title: "Договор подписан", hint: "Подпишите по SMS-коду", icon: FileSignature, done: signed },
    { key: "keys", title: "Ключи выданы", hint: "Подтверждает менеджер при выдаче", icon: KeyRound, done: keys },
    { key: "returned", title: "Авто возвращено", hint: "Менеджер принимает авто", icon: Undo2, done: returned },
    { key: "review", title: "Отзыв оставлен", hint: "Оцените авто и сервис", icon: Star, done: hasReview },
  ];

  const currentIndex = steps.findIndex((s) => !s.done);

  return (
    <ol className="mt-4 space-y-2">
      {steps.map((step, index) => {
        const Icon = step.done ? Check : step.icon;
        const current = index === currentIndex;
        return (
          <li
            key={step.key}
            className={cn(
              "flex items-start gap-3 rounded-2xl px-3 py-2 text-sm",
              step.done ? "bg-emerald-500/10" : current ? "bg-muted" : "opacity-60",
            )}
          >
            <span
              className={cn(
                "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                step.done
                  ? "bg-emerald-500/20 text-emerald-600 public-dark:text-emerald-400"
                  : "bg-background text-muted-foreground ring-1 ring-border",
              )}
            >
              {step.done ? <Icon className="h-4 w-4" /> : current ? <Icon className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}
            </span>
            <span className="min-w-0">
              <span className="block font-medium text-foreground">{step.title}</span>
              <span className="block text-xs text-muted-foreground">
                {step.done && step.key === "keys" && booking.keysIssuedAt
                  ? `Выданы ${new Date(booking.keysIssuedAt).toLocaleString("ru-RU")}`
                  : step.done && step.key === "returned" && booking.returnedAt
                    ? `Принято ${new Date(booking.returnedAt).toLocaleString("ru-RU")}`
                    : step.hint}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
