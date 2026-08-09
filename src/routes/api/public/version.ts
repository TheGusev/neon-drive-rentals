import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { BUILD_COMMIT, BUILD_TIME } from "@/lib/build-info";

export const Route = createFileRoute("/api/public/version")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(
          {
            commit: BUILD_COMMIT,
            builtAt: BUILD_TIME || null,
            servedAt: new Date().toISOString(),
          },
          {
            headers: {
              "Cache-Control": "no-store, max-age=0",
            },
          },
        );
      },
    },
  },
});
