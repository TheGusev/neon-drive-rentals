import { faqItems } from "@/mocks/faq";

export const SITE_URL = "https://nsk-rent.ru";
export const SITE_NAME = "NSK-RENT";
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

export const canonical = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/** Мета для приватных/служебных страниц. */
export const noindexMeta = { name: "robots", content: "noindex, nofollow" } as const;

/** Абсолютный адрес картинки предпросмотра. */
export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

/** Общие OG-теги: картинка предпросмотра, имя сайта и локаль. */
export const socialMeta = (imagePath: string) => {
  const image = absoluteUrl(imagePath);
  return [
    { property: "og:image", content: image },
    { name: "twitter:image", content: image },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "ru_RU" },
  ];
};

export const localBusinessJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "AutoRental",
  name: "NSK-RENT — Аренда авто в Новосибирске",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  image: `${SITE_URL}/icon-512.png`,
  telephone: SITE_PHONE,
  priceRange: "₽₽",
  areaServed: {
    "@type": "City",
    name: "Новосибирск",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Доватора, 11",
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

interface VehicleSeed {
  brand: string;
  model: string;
  year: number;
  color: string;
  pricePerDay: number;
  slug: string;
  image?: string;
  status?: string;
}

/** Vehicle + offer для карточки авто. */
export const vehicleJsonLd = (car: VehicleSeed) => ({
  "@context": "https://schema.org",
  "@type": "Vehicle",
  name: `${car.brand} ${car.model} ${car.year}`,
  brand: { "@type": "Brand", name: car.brand },
  model: car.model,
  vehicleModelDate: String(car.year),
  color: car.color,
  bodyType: "Kei car",
  steeringPosition: "https://schema.org/RightHandDriving",
  url: canonical(`/cars/${car.slug}`),
  ...(car.image ? { image: car.image.startsWith("http") ? car.image : `${SITE_URL}${car.image}` } : {}),
  offers: {
    "@type": "Offer",
    price: car.pricePerDay,
    priceCurrency: "RUB",
    availability:
      (car.status ?? "free") === "free" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
    url: canonical(`/cars/${car.slug}`),
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: car.pricePerDay,
      priceCurrency: "RUB",
      unitCode: "DAY",
    },
  },
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
