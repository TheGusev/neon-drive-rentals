import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPendingScreen() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-background text-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function AdminErrorScreen({
  error,
  onRetry,
  title = "Раздел не загрузился",
  extra,
}: {
  error: unknown;
  onRetry: () => void;
  title?: string;
  extra?: ReactNode;
}) {
  const message = error instanceof Error ? error.message : String(error ?? "Неизвестная ошибка");
  return (
    <div className="grid min-h-[60vh] place-items-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md rounded-xl border bg-card p-5 text-center shadow-sm">
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <h2 className="text-base font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Данные не пришли с сервера. Остальные разделы панели продолжают работать.
        </p>
        <p className="mt-2 break-words rounded-md bg-muted px-3 py-2 text-left text-xs text-muted-foreground">
          {message}
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <Button size="sm" onClick={onRetry}>
            Повторить
          </Button>
          {extra}
        </div>
      </div>
    </div>
  );
}
