import { Star } from "lucide-react";
import { currentClient } from "@/mocks/profile";

export function ProfileHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-1">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Личный кабинет</h1>
        <p className="mt-1 text-sm text-muted-foreground">{currentClient.name}</p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-sm ring-1 ring-border">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-semibold text-foreground">{currentClient.rating.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">· {currentClient.reviewsCount}</span>
      </div>
    </header>
  );
}
