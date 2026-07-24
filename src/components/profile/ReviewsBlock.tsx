import { Star } from "lucide-react";
import { SectionCard } from "@/components/checkout/SectionCard";
import { clientReviews, currentClient } from "@/mocks/profile";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });

export function ReviewsBlock() {
  return (
    <SectionCard title="Отзывы и рейтинг">
      <div className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-semibold text-slate-900 leading-none">{currentClient.rating.toFixed(1)}</div>
          <div className="mt-1 text-xs text-slate-500">на основе {currentClient.reviewsCount} отзывов</div>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {clientReviews.slice(0, 3).map((r) => (
          <li key={r.id} className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-900">{r.author}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {r.rating}
              </div>
            </div>
            <p className="mt-1 text-sm text-slate-600">{r.text}</p>
            <div className="mt-1 text-xs text-slate-400">{fmt(r.date)}</div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
