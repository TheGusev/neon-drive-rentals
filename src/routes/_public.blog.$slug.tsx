import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { blogPosts, getBlogPost } from "@/mocks/blog";
import { SITE_URL, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export const Route = createFileRoute("/_public/blog/$slug")({
  loader: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  component: Page,
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Статья не найдена — RentSib" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    const url = `${SITE_URL}/blog/${params.slug}`;
    return {
      meta: [
        { title: `${post.title} | RentSib` },
        { name: "description", content: post.description },
        { name: "keywords", content: post.keywords.join(", ") },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: post.date },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        jsonLdScript(
          breadcrumbJsonLd([
            { name: "Главная", url: "/" },
            { name: "Блог", url: "/blog" },
            { name: post.title, url: `/blog/${params.slug}` },
          ]),
        ),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { "@type": "Organization", name: "RentSib" },
          publisher: { "@type": "Organization", name: "RentSib", url: SITE_URL },
          mainEntityOfPage: url,
          keywords: post.keywords.join(", "),
        }),
      ],
    };
  },
  notFoundComponent: PostNotFound,
});

function PostNotFound() {
  return (
    <div className="min-h-[60vh] bg-background px-4 py-16 text-center text-foreground">
      <h1 className="font-display text-3xl font-black">Статья не найдена</h1>
      <p className="mt-3 text-muted-foreground">Возможно, она была перемещена или удалена.</p>
      <Button asChild className="mt-6">
        <Link to="/blog">Вернуться в блог</Link>
      </Button>
    </div>
  );
}

function Page() {
  const { post } = Route.useLoaderData();
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="bg-background text-foreground">
      <article className="mx-auto w-full max-w-3xl py-4 md:py-8">
        <nav aria-label="breadcrumbs" className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Главная
          </Link>{" "}
          /{" "}
          <Link to="/blog" className="hover:text-foreground">
            Блог
          </Link>{" "}
          / <span className="line-clamp-1 inline text-foreground">{post.title}</span>
        </nav>

        <Button asChild variant="ghost" size="sm" className="mb-4 gap-2">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4" /> Ко всем статьям
          </Link>
        </Button>

        <div className="relative overflow-hidden rounded-2xl border border-border">
          <img
            src={post.cover}
            alt={post.title}
            width={1200}
            height={675}
            className="ken-burns h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        <h1 className="mt-6 font-display text-3xl font-black leading-tight md:text-5xl">{post.title}</h1>
        <div className="road-line mt-4 w-24" />

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {post.readMinutes} мин чтения
          </span>
        </div>

        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{post.description}</p>

        <div className="prose prose-theme mt-8 max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:mt-8 prose-h2:text-2xl prose-h3:text-xl prose-table:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>

        <div className="mt-12 rounded-2xl border border-accent/40 bg-accent/10 p-6 text-center md:p-8">
          <p className="font-display text-lg font-bold md:text-xl">Готовы забронировать авто?</p>
          <p className="mt-1 text-sm text-muted-foreground">От 1 800 ₽/сутки в Новосибирске</p>
          <Button asChild className="mt-4">
            <Link to="/cars">Выбрать авто</Link>
          </Button>
        </div>
      </article>

      {related.length > 0 && (
        <div className="mx-auto w-full max-w-5xl pb-8">
          <h2 className="font-display text-xl font-bold md:text-2xl">Другие статьи</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="lift group overflow-hidden rounded-xl border border-border bg-card transition hover:border-accent"
              >
                <img
                  src={p.cover}
                  alt={p.title}
                  loading="lazy"
                  width={1200}
                  height={675}
                  className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="p-4">
                  <p className="font-display text-sm font-bold group-hover:text-accent">{p.title}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

