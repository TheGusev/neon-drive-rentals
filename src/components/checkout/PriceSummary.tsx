import { formatRub, type PriceBreakdown } from "@/lib/bookingDraft";

interface PriceSummaryProps {
  breakdown: PriceBreakdown;
}

export function PriceSummary({ breakdown }: PriceSummaryProps) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex items-center justify-between text-slate-600">
        <dt>
          Аренда {breakdown.days} сут × {formatRub(breakdown.pricePerDay)}
          {breakdown.tariffMultiplier !== 1 && (
            <span className="ml-1 text-xs text-slate-400">
              × {breakdown.tariffMultiplier.toFixed(2)}
            </span>
          )}
        </dt>
        <dd className="font-medium text-slate-900">{formatRub(breakdown.rental)}</dd>
      </div>
      {breakdown.delivery > 0 && (
        <div className="flex items-center justify-between text-slate-600">
          <dt>Доставка</dt>
          <dd className="font-medium text-slate-900">{formatRub(breakdown.delivery)}</dd>
        </div>
      )}
      <div className="flex items-center justify-between text-slate-600">
        <dt>Залог (возвращается)</dt>
        <dd className="font-medium text-slate-900">{formatRub(breakdown.deposit)}</dd>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-base">
        <dt className="font-semibold text-slate-900">Итого к оплате</dt>
        <dd className="text-lg font-bold text-slate-900">{formatRub(breakdown.total)}</dd>
      </div>
    </dl>
  );
}
