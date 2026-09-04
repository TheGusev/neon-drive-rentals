import { Star } from "lucide-react";

type Props = { name?: string; rating?: number; reviewsCount?: number };

export function ProfileHeader({ name, rating = 0, reviewsCount = 0 }: Props) {
  return (
    <header className="flex items-center justify-between gap-4 px-1">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Личный кабинет</h1>
        <p className="mt-1 text-sm text-muted-foreground">{name || "Клиент"}</p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-sm ring-1 ring-border">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-semibold text-foreground">
          {reviewsCount > 0 ? rating.toFixed(1) : "—"}
        </span>
        <span className="text-xs text-muted-foreground">· {reviewsCount}</span>
      </div>
    </header>
  );
}
