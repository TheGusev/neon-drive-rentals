import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { blogPosts } from "@/mocks/blog";
import { SITE_URL } from "@/lib/seo";

const BASE_URL = SITE_URL;

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { fetchCars } = await import("@/lib/carsRepo.server");
        const cars = await fetchCars();
        const today = new Date().toISOString().slice(0, 10);
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
          { path: "/cars", changefreq: "daily", priority: "0.9", lastmod: today },
          { path: "/rent/novosibirsk", changefreq: "weekly", priority: "0.9" },
          { path: "/rent/bez-zaloga", changefreq: "weekly", priority: "0.8" },
          { path: "/kei-cars", changefreq: "weekly", priority: "0.8" },
          { path: "/arenda-avto-bez-zaloga", changefreq: "weekly", priority: "0.8" },
          { path: "/arenda-avto-bez-voditelya", changefreq: "weekly", priority: "0.8" },
          { path: "/arenda-avto-bez-stazha", changefreq: "weekly", priority: "0.8" },
          { path: "/arenda-avto-na-sutki", changefreq: "weekly", priority: "0.8" },
          { path: "/arenda-avto-na-nedelyu", changefreq: "weekly", priority: "0.8" },
          { path: "/arenda-avto-na-mesyac", changefreq: "weekly", priority: "0.8" },
          { path: "/arenda-probeg-i-platezhi", changefreq: "monthly", priority: "0.7" },
          { path: "/arenda-avto-s-pravym-rulem", changefreq: "weekly", priority: "0.8" },
          { path: "/arenda-avto-vyhodnye", changefreq: "weekly", priority: "0.7" },
          { path: "/arenda-avto-poezdka-altay", changefreq: "weekly", priority: "0.7" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          ...cars.map<SitemapEntry>((c) => ({
            path: `/cars/${c.slug ?? c.id}`,
            changefreq: "weekly",
            priority: "0.7",
            lastmod: today,
          })),
          ...blogPosts.map<SitemapEntry>((p) => ({
            path: `/blog/${p.slug}`,
            changefreq: "monthly",
            priority: "0.6",
            lastmod: p.date.slice(0, 10),
          })),
        ];

        const urls = entries.map((e) =>
          [
            "  <url>",
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
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
