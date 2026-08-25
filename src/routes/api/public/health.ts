import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { BUILD_COMMIT } from "@/lib/build-info";

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const checkedAt = new Date().toISOString();
        const { hasDatabase, query } = await import("@/lib/db.server");
        const { inspectUploadStorage } = await import("@/lib/uploads.server");
        const storage = await inspectUploadStorage();

        if (!hasDatabase()) {
          return Response.json(
            {
              ok: false,
              build: BUILD_COMMIT,
              checkedAt,
              database: { configured: false, reachable: false, tablesReady: false, cars: null },
              uploads: storage,
            },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }

        try {
          const rows = await query<{
            cars_table: string | null;
            bookings_table: string | null;
            clients_table: string | null;
            car_count: string;
          }>(`select to_regclass('public.cars')::text as cars_table,
                     to_regclass('public.bookings')::text as bookings_table,
                     to_regclass('public.clients')::text as clients_table,
                     case when to_regclass('public.cars') is null then '0'
                          else (select count(*)::text from cars) end as car_count`);
          const state = rows[0];
          const tablesReady = Boolean(state?.cars_table && state.bookings_table && state.clients_table);
          const ok = tablesReady && storage.writable;
          return Response.json(
            {
              ok,
              build: BUILD_COMMIT,
              checkedAt,
              database: {
                configured: true,
                reachable: true,
                tablesReady,
                cars: Number(state?.car_count ?? 0),
              },
              uploads: storage,
            },
            { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
          );
        } catch (error) {
          console.error("[health] database check failed", error);
          return Response.json(
            {
              ok: false,
              build: BUILD_COMMIT,
              checkedAt,
              database: { configured: true, reachable: false, tablesReady: false, cars: null },
              uploads: storage,
            },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});