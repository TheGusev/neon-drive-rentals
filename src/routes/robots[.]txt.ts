import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = [
          "User-agent: *",
          "Allow: /",
          "Allow: /cars",
          "Allow: /blog",
          "Allow: /rent/",
          "Allow: /kei-cars",
          "Allow: /terms",
          "Allow: /privacy",
          "Disallow: /admin",
          "Disallow: /api/",
          "Disallow: /booking/",
          "Disallow: /payment/",
          "Disallow: /contract/",
          "Disallow: /profile",
          "Disallow: /login",
          "Disallow: /lovable/",
          "",
          `Sitemap: ${SITE_URL}/sitemap.xml`,
          "",
        ].join("\n");


        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
