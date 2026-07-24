import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { cars } from "@/mocks/cars";
import { blogPosts } from "@/mocks/blog";

const BASE_URL = "https://neon-drive-rental.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/cars", changefreq: "daily", priority: "0.9" },
          { path: "/rent/novosibirsk", changefreq: "weekly", priority: "0.9" },
          { path: "/rent/bez-zaloga", changefreq: "weekly", priority: "0.8" },
          { path: "/kei-cars", changefreq: "weekly", priority: "0.8" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          ...cars.map<SitemapEntry>((c) => ({
            path: `/cars/${c.id}`,
            changefreq: "weekly",
            priority: "0.7",
          })),
          ...blogPosts.map<SitemapEntry>((p) => ({
            path: `/blog/${p.slug}`,
            changefreq: "monthly",
            priority: "0.6",
          })),
        ];

        const urls = entries.map((e) =>
          [
            "  <url>",
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            "  </url>",
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
