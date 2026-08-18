import { Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";

import stellaFront from "@/assets/cars/real/subaru-stella-front-real.jpg";
import stellaSide from "@/assets/cars/real/subaru-stella-side-real.jpg";
import stellaRear from "@/assets/cars/real/subaru-stella-rear-real.jpg";
import stellaDetail from "@/assets/cars/real/subaru-stella-detail-real.jpg";
import nBoxBlack from "@/assets/cars/real/honda-n-box-black-real.jpg";
import dayzBrown from "@/assets/cars/real/nissan-dayz-brown-real.jpg";

const PHOTOS = [
  { src: nBoxBlack, alt: "Honda N-BOX чёрный на площадке NSK-RENT в Новосибирске", caption: "Honda N-BOX" },
  { src: dayzBrown, alt: "Nissan Dayz коричневый на площадке проката в Новосибирске", caption: "Nissan Dayz" },
  { src: stellaFront, alt: "Subaru Stella в парке NSK-RENT, вид спереди", caption: "Subaru Stella" },
  { src: stellaSide, alt: "Subaru Stella, вид сбоку, парк NSK-RENT", caption: "Наш парк" },
  { src: stellaRear, alt: "Subaru Stella, вид сзади, площадка на Доватора, 11", caption: "Доватора, 11" },
  { src: stellaDetail, alt: "Оптика японского кей-кара крупным планом", caption: "Состояние авто" },
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PHOTOS.map((photo) => (
            <figure
              key={photo.src}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                width={1400}
                height={1050}
                className="aspect-[4/3] w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
              />
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
