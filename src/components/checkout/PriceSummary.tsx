import { formatRub, type PriceBreakdown } from "@/lib/bookingDraft";

interface PriceSummaryProps {
  breakdown: PriceBreakdown;
}

export function PriceSummary({ breakdown }: PriceSummaryProps) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <dt>
          Аренда {breakdown.days} сут × {formatRub(breakdown.pricePerDay)}
          {breakdown.tariffMultiplier !== 1 && (
            <span className="ml-1 text-xs text-muted-foreground">
              × {breakdown.tariffMultiplier.toFixed(2)}
            </span>
          )}
        </dt>
        <dd className="font-medium text-foreground">{formatRub(breakdown.rental)}</dd>
      </div>
      <div className="flex items-center justify-between text-muted-foreground">
        <dt>Залог (возвращается)</dt>
        <dd className="font-medium text-foreground">{formatRub(breakdown.deposit)}</dd>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base">
        <dt className="font-semibold text-foreground">Итого к оплате</dt>
        <dd className="text-lg font-bold text-foreground">{formatRub(breakdown.total)}</dd>
      </div>
    </dl>
  );
}
