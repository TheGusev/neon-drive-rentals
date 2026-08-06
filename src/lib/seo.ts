import { faqItems } from "@/mocks/faq";

export const SITE_URL = "https://rentsib.ru";
export const SITE_NAME = "RentSib";
export const SITE_PHONE = "+7 (800) 555-72-13";

export const faqJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
});

export const localBusinessJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "AutoRental",
  name: "RentSib — Аренда авто в Новосибирске",
  url: SITE_URL,
  telephone: SITE_PHONE,
  priceRange: "₽₽",
  areaServed: {
    "@type": "City",
    name: "Новосибирск",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Новосибирск",
    addressRegion: "Новосибирская область",
    addressCountry: "RU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 55.0084,
    longitude: 82.9357,
  },
  openingHours: "Mo-Su 00:00-24:00",
});

export const breadcrumbJsonLd = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.url.startsWith("http") ? it.url : `${SITE_URL}${it.url}`,
  })),
});

export const jsonLdScript = (data: unknown) => ({
  type: "application/ld+json",
  children: JSON.stringify(data),
});
