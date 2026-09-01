import { Star } from "lucide-react";
import { SectionCard } from "@/components/checkout/SectionCard";
import type { ClientReview } from "@/types/domain";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });

export function ReviewsBlock({ reviews = [], rating = 0 }: { reviews?: ClientReview[]; rating?: number }) {
  return (
    <SectionCard title="Отзывы и рейтинг">
      <div className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
          <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-semibold leading-none text-foreground">
            {reviews.length > 0 ? rating.toFixed(1) : "—"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {reviews.length > 0 ? `на основе ${reviews.length} отзывов` : "отзывов пока нет"}
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <ul className="mt-3 space-y-2">
          {reviews.slice(0, 3).map((r) => (
            <li key={r.id} className="rounded-2xl bg-card p-3 ring-1 ring-border">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-foreground">{r.author}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {r.rating}
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
              <div className="mt-1 text-xs text-muted-foreground">{fmt(r.date)}</div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
