import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/mocks/blog";
import { SITE_URL, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

const URL = `${SITE_URL}/blog`;
const TITLE = "Блог RentSib — гайды и советы по аренде авто в Новосибирске";
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
    <div className="clean-light -mx-4 -my-8 bg-background text-foreground md:-mx-6 md:-my-12">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-16">
        <nav aria-label="breadcrumbs" className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Главная
          </Link>{" "}
          / <span className="text-foreground">Блог</span>
        </nav>

        <h1 className="font-display text-3xl font-black md:text-5xl">Блог RentSib</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
          Гайды и советы по аренде авто в Новосибирске: как выбрать машину, куда съездить, что нужно для
          аренды без залога.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary"
            >
              <article className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readMinutes} мин
                  </span>
                </div>
                <h2 className="mt-3 font-display text-xl font-bold group-hover:text-primary">{post.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Читать <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
