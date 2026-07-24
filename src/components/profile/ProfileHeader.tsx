import { Star } from "lucide-react";
import { currentClient } from "@/mocks/profile";

export function ProfileHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-1">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Личный кабинет</h1>
        <p className="mt-1 text-sm text-slate-500">{currentClient.name}</p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-semibold text-slate-900">{currentClient.rating.toFixed(1)}</span>
        <span className="text-xs text-slate-400">· {currentClient.reviewsCount}</span>
      </div>
    </header>
  );
}
