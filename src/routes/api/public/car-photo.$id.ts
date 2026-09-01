import { createFileRoute } from "@tanstack/react-router";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/public/car-photo/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id.replace(/\.(jpg|jpeg|png|webp)$/i, "");
        if (!UUID.test(id)) return new Response("Not found", { status: 404 });

        try {
          const { hasDatabase, query } = await import("@/lib/db.server");
          if (!hasDatabase()) return new Response("Not configured", { status: 503 });

          const rows = await query<{ data: Buffer; mime_type: string }>(
            `select data, mime_type from car_photos_blob where id = $1 limit 1`,
            [id],
          );
          const row = rows[0];
          if (!row) return new Response("Not found", { status: 404 });

          const bytes = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data as never);
          return new Response(new Uint8Array(bytes), {
            headers: {
              "Content-Type": row.mime_type || "image/jpeg",
              "Content-Length": String(bytes.length),
              // Файлы иммутабельны: id уникален для каждой загрузки.
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (error) {
          console.error("[car-photo] failed", error);
          return new Response("Storage error", { status: 500 });
        }
      },
    },
  },
});
