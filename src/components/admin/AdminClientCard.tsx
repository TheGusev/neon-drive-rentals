import { Star, Ban, Phone, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { EntityCard } from "@/components/admin/EntityCard";
import type { Client } from "@/types/domain";

interface Props {
  client: Client;
  index: number;
  onToggleBlacklist: (value: boolean) => void;
}

export function AdminClientCard({ client, index, onToggleBlacklist }: Props) {
  const initials = client.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

  return (
    <EntityCard index={index} className={client.blacklisted ? "border-rose-300" : undefined}>
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="truncate text-sm font-semibold">{client.name}</div>
            <span className="admin-nums flex shrink-0 items-center gap-1 text-sm font-semibold">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {client.rating.toFixed(1)}
            </span>
          </div>
          <div className="admin-nums mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{client.phone}</span>
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{client.email ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="admin-nums text-xs text-muted-foreground">
          Заказов: <span className="font-semibold text-foreground">{client.ordersCount}</span>
        </span>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Ban className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Чёрный список</span>
          <Switch
            checked={!!client.blacklisted}
            onCheckedChange={onToggleBlacklist}
            aria-label="Чёрный список"
          />
        </label>
      </div>
    </EntityCard>
  );
}
