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
              "flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left transition",
              active
                ? "border-[#2f80ed] ring-2 ring-[#2f80ed]/20"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            <span
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                active ? "bg-[#2f80ed] text-white" : "bg-slate-100 text-slate-600",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900">{opt.label}</span>
              <span className="block text-xs text-slate-500">{opt.hint}</span>
            </span>
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                active ? "border-[#2f80ed] bg-[#2f80ed] text-white" : "border-slate-300 bg-white",
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
