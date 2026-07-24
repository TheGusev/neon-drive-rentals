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
    <div className="clean-light -mx-4 -my-8 min-h-[60vh] bg-background px-4 py-16 text-center text-foreground md:-mx-6 md:-my-12">
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
    <div className="clean-light -mx-4 -my-8 bg-background text-foreground md:-mx-6 md:-my-12">
      <article className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-16">
        <nav aria-label="breadcrumbs" className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Главная
          </Link>{" "}
          /{" "}
          <Link to="/blog" className="hover:text-foreground">
            Блог
          </Link>{" "}
          / <span className="text-foreground">{post.title}</span>
        </nav>

        <Button asChild variant="ghost" size="sm" className="mb-4 gap-2">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4" /> Ко всем статьям
          </Link>
        </Button>

        <h1 className="font-display text-3xl font-black leading-tight md:text-5xl">{post.title}</h1>

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

        <div className="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:mt-8 prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-strong:text-foreground prose-table:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>

        <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center md:p-8">
          <p className="font-display text-lg font-bold md:text-xl">Готовы забронировать авто?</p>
          <p className="mt-1 text-sm text-muted-foreground">От 1 800 ₽/сутки в Новосибирске</p>
          <Button asChild className="mt-4">
            <Link to="/cars">Выбрать авто</Link>
          </Button>
        </div>
      </article>

      {related.length > 0 && (
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 md:px-6">
          <h2 className="font-display text-xl font-bold md:text-2xl">Другие статьи</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary"
              >
                <p className="font-display text-sm font-bold group-hover:text-primary">{p.title}</p>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
