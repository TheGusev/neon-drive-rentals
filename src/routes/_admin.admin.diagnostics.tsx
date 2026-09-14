import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminDiagnostics } from "@/lib/diagnostics.functions";

export const Route = createFileRoute("/_admin/admin/diagnostics")({
  head: () => ({
    meta: [
      { title: "Диагностика — Админ NSK-RENT" },
      { name: "description", content: "Состояние базы данных и обновлений схемы NSK-RENT." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DiagnosticsPage,
});

function Row({ ok, label, hint }: { ok: boolean; label: string; hint?: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5 text-sm">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      )}
      <div className="min-w-0">
        <div className="font-medium">{label}</div>
        {hint && <div className="break-words text-xs text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}

function DiagnosticsPage() {
  const run = useServerFn(adminDiagnostics);
  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["admin", "diagnostics"],
    queryFn: () => run({}),
    staleTime: 0,
  });

  return (
    <div className="space-y-4 py-4">
      <PageHeader title="Диагностика" description="Состояние базы данных и обновлений схемы." />

      <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        Обновить
      </Button>

      {error && (
        <Card className="border-destructive/40 p-4 text-sm text-destructive">
          Не удалось получить состояние: {String((error as Error).message ?? error)}
        </Card>
      )}

      {data && (
        <>
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">База данных</div>
            <Row ok={data.databaseConfigured} label="Подключение настроено (DATABASE_URL)" />
            <Row
              ok={data.databaseReachable}
              label="База отвечает"
              hint={data.databaseError ?? undefined}
            />
            {data.buildTime && (
              <div className="pt-2 text-xs text-muted-foreground">Сборка: {data.buildTime}</div>
            )}
          </Card>

          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">
              Обновления схемы ({data.appliedMigrations.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.appliedMigrations.map((name) => (
                <span key={name} className="rounded bg-muted px-2 py-0.5 text-xs">
                  {name}
                </span>
              ))}
            </div>
            {data.failedMigrations.length > 0 && (
              <div className="mt-3 space-y-2">
                {data.failedMigrations.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-start gap-2 rounded-md border border-destructive/40 p-2 text-xs"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <div className="min-w-0 break-words">
                      <div className="font-semibold">{f.name}</div>
                      <div className="text-muted-foreground">{f.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">Ключевые таблицы</div>
            {data.tables.map((t) => (
              <Row key={t.table} ok={t.present} label={t.table} />
            ))}
          </Card>

          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">Ключевые поля</div>
            {data.columns.map((c) => (
              <Row key={`${c.table}.${c.column}`} ok={c.present} label={`${c.table}.${c.column}`} />
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
