import { CreditCard, Smartphone, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/domain";

interface PaymentMethodRadioProps {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}

const options: Array<{ id: PaymentMethod; label: string; hint: string; icon: typeof CreditCard }> = [
  { id: "card", label: "Банковская карта", hint: "Visa, Mastercard, МИР", icon: CreditCard },
  { id: "sbp", label: "СБП", hint: "Оплата через приложение банка", icon: Smartphone },
];

export function PaymentMethodRadio({ value, onChange }: PaymentMethodRadioProps) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="Способ оплаты">
      {options.map((opt) => {
        const active = value === opt.id;
        const Icon = opt.icon;
        return (
          <button
            type="button"
            key={opt.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition",
              active
                ? "border-accent ring-2 ring-accent/20"
                : "border-border hover:border-border",
            )}
          >
            <span
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                active ? "bg-accent text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
              <span className="block text-xs text-muted-foreground">{opt.hint}</span>
            </span>
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                active ? "border-accent bg-accent text-primary-foreground" : "border-border bg-card",
              )}
            >
              {active && <Check className="h-3 w-3" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
