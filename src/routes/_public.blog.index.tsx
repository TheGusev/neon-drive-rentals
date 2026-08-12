import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/mocks/blog";
import { SITE_URL, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

const URL = `${SITE_URL}/blog`;
const TITLE = "Блог NSK-RENT — гайды и советы по аренде авто в Новосибирске";
const DESC =
  "Полезные статьи про аренду авто в Новосибирске: как выбрать машину, что нужно для аренды без залога, маршруты по НСО, обзоры японских кей-каров.";

export const Route = createFileRoute("/_public/blog/")({
  component: Page,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Главная", url: "/" },
          { name: "Блог", url: "/blog" },
        ]),
      ),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: TITLE,
        url: URL,
        blogPost: blogPosts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${SITE_URL}/blog/${p.slug}`,
          datePublished: p.date,
          description: p.description,
        })),
      }),
    ],
  }),
});

function Page() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl py-4 md:py-8">
        <nav aria-label="breadcrumbs" className="text-soft mb-4 text-xs">
          <Link to="/" className="link-quiet">
            Главная
          </Link>{" "}
          / <span className="text-foreground">Блог</span>
        </nav>

        <h1 className="font-display text-3xl font-black md:text-5xl">Блог NSK-RENT</h1>
        <div className="road-line mt-4 w-28" />
        <p className="text-soft mt-3 max-w-2xl text-base md:text-lg">
          Гайды и советы по аренде авто в Новосибирске: как выбрать машину, куда съездить, что нужно для
          аренды без залога.
        </p>

        <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2">
          {blogPosts.map((post, i) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="nfs-tile lift group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-accent"
              style={{ animationDelay: `${100 + i * 70}ms` }}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={post.cover}
                  alt={post.title}
                  loading="lazy"
                  width={1200}
                  height={675}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              </div>
              <article className="flex flex-1 flex-col p-5 md:p-6">
                <div className="text-soft flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readMinutes} мин
                  </span>
                </div>
                <h2 className="mt-3 font-display text-xl font-bold group-hover:text-accent">{post.title}</h2>
                <p className="text-soft mt-2 flex-1 text-sm">{post.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  Читать <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

