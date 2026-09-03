import { Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";

/** Публичные пути: рядом лежат WebP-версии, отдаём их через <picture>. */
const nBoxBlack = "/assets/cars/real/honda-n-box-black-real-3.jpg";
const nBoxPair = "/assets/cars/real/honda-n-box-black-pair-real.jpg";
const ekWagonBlack = "/assets/cars/real/mitsubishi-ek-wagon-black-real.jpg";
const ekWagonSilver = "/assets/cars/real/mitsubishi-ek-wagon-silver-real.jpg";
const nWgnBlue = "/assets/cars/real/honda-n-wgn-blue-real.jpg";
const dayzBlack = "/assets/cars/real/nissan-dayz-black-real.jpg";
const keiVanRear = "/assets/cars/real/kei-van-black-rear-real.jpg";
const fleetYard = "/assets/cars/real/fleet-yard-real.jpg";
const dashboard = "/assets/cars/real/kei-dashboard-real.jpg";

const PHOTOS = [
  {
    src: nBoxBlack,
    alt: "Honda N-BOX чёрный на площадке NSK-RENT в Новосибирске",
    caption: "Honda N-BOX",
  },
  {
    src: ekWagonBlack,
    alt: "Mitsubishi eK Wagon чёрный, аренда в Новосибирске",
    caption: "Mitsubishi eK Wagon",
  },
  {
    src: nWgnBlue,
    alt: "Honda N-WGN голубой на парковке проката NSK-RENT",
    caption: "Honda N-WGN",
  },
  { src: dayzBlack, alt: "Nissan Dayz чёрный, вид сбоку, парк NSK-RENT", caption: "Nissan Dayz" },
  {
    src: ekWagonSilver,
    alt: "Mitsubishi eK Wagon серебристый на площадке на Доватора, 11",
    caption: "Наш парк",
  },
  {
    src: nBoxPair,
    alt: "Японские кей-кары в прокате NSK-RENT в Новосибирске",
    caption: "Доватора, 11",
  },
  {
    src: keiVanRear,
    alt: "Кей-вэн чёрный, задняя часть кузова, состояние авто",
    caption: "Состояние кузова",
  },
  {
    src: fleetYard,
    alt: "Площадка проката японских авто в Новосибирске",
    caption: "Площадка выдачи",
  },
  {
    src: dashboard,
    alt: "Приборная панель японского кей-кара с запасом хода 511 км",
    caption: "Экономичный расход",
  },
];

export function RealPhotoStrip() {
  return (
    <section className="border-t border-border/60 bg-background py-10">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
              <Camera className="h-5 w-5 text-primary" aria-hidden />
              Живые фото парка
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Снято на нашей площадке — Новосибирск, ул. Доватора, 11. Без стоковых картинок.
            </p>
          </div>
          <Link to="/cars" className="text-sm font-medium text-primary hover:underline">
            Смотреть весь автопарк →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PHOTOS.map((photo) => (
            <figure
              key={photo.src}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card"
            >
              <picture>
                <source srcSet={photo.src.replace(/\.jpg$/, ".webp")} type="image/webp" />
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  width={1400}
                  height={1050}
                  className="aspect-[4/3] w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                />
              </picture>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-[11px] font-medium text-white">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
