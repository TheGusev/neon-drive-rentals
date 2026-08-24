import { SITE_URL, breadcrumbJsonLd, jsonLdScript, socialMeta } from "@/lib/seo";
import type { FaqItem } from "@/mocks/faq";

interface LandingHeadInput {
  path: string;
  title: string;
  description: string;
  breadcrumb: string;
  image?: string;
  faq?: FaqItem[];
}

/** Единый head() для SEO-лендингов: мета, canonical, крошки и FAQ-разметка. */
export const landingHead = ({
  path,
  title,
  description,
  breadcrumb,
  image = "/assets/cars/hero-drive.jpg",
  faq,
}: LandingHeadInput) => {
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      ...socialMeta(image),
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Главная", url: "/" },
          { name: "Автопарк", url: "/cars" },
          { name: breadcrumb, url: path },
        ]),
      ),
      ...(faq && faq.length
        ? [
            jsonLdScript({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faq.map((it) => ({
                "@type": "Question",
                name: it.q,
                acceptedAnswer: { "@type": "Answer", text: it.a },
              })),
            }),
          ]
        : []),
    ],
  };
};
