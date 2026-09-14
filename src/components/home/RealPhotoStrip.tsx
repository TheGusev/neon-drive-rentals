import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

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
const hondaNWgnSilver = "/assets/cars/real/fleet-honda-n-wgn-silver.webp";
const mitsubishiEkBlackNew = "/assets/cars/real/fleet-mitsubishi-ek-black.webp";
const hondaNBoxPairNew = "/assets/cars/real/fleet-honda-n-box-pair.webp";
const mitsubishiEkSilverNew = "/assets/cars/real/fleet-mitsubishi-ek-silver-new.webp";
const hondaNBoxLine = "/assets/cars/real/fleet-honda-n-box-line.webp";
const mitsubishiEkBrown = "/assets/cars/real/fleet-mitsubishi-ek-brown.webp";
const toyotaRoomy = "/assets/cars/real/fleet-toyota-roomy.webp";

const PHOTOS = [
  {
    src: hondaNWgnSilver,
    alt: "Серебристый Honda N-WGN из автопарка NSK-RENT, вид спереди",
    caption: "Honda N-WGN",
  },
  {
    src: mitsubishiEkBlackNew,
    alt: "Чёрный Mitsubishi eK Wagon из автопарка NSK-RENT",
    caption: "Mitsubishi eK Wagon",
  },
  {
    src: hondaNBoxPairNew,
    alt: "Два серебристых Honda N-BOX на площадке NSK-RENT",
    caption: "Honda N-BOX",
  },
  {
    src: hondaNBoxLine,
    alt: "Линия серебристых Honda N-BOX на площадке автопроката",
    caption: "Honda N-BOX",
  },
  {
    src: mitsubishiEkSilverNew,
    alt: "Серебристый Mitsubishi eK Wagon, крупный план передней части",
    caption: "Mitsubishi eK Wagon",
  },
  {
    src: mitsubishiEkBrown,
    alt: "Коричневый Mitsubishi eK Wagon из живого автопарка NSK-RENT",
    caption: "Mitsubishi eK Wagon",
  },
  {
    src: toyotaRoomy,
    alt: "Серебристый Toyota Roomy на площадке автопарка NSK-RENT",
    caption: "Toyota Roomy",
  },
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
  const [selected, setSelected] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api || selected === null) return;
    api.scrollTo(selected, true);
    setCurrent(selected);
    const sync = () => setCurrent(api.selectedScrollSnap());
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api, selected]);

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
          {PHOTOS.map((photo, index) => (
            <Button
              key={photo.src}
              type="button"
              variant="ghost"
              className="group relative block h-auto overflow-hidden rounded-xl border border-border/60 bg-card p-0 text-left"
              onClick={() => setSelected(index)}
              aria-label={`Открыть фото: ${photo.caption}`}
            >
              <picture>
                {photo.src.endsWith(".jpg") && (
                  <source srcSet={photo.src.replace(/\.jpg$/, ".webp")} type="image/webp" />
                )}
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
              <Maximize2 className="absolute right-2 top-2 h-4 w-4 text-primary-foreground opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-[11px] font-medium text-white">
                {photo.caption}
              </figcaption>
            </Button>
          ))}
        </div>
      </div>

      <Dialog open={selected !== null} onOpenChange={(next) => !next && setSelected(null)}>
        <DialogContent className="h-[100dvh] max-h-none max-w-none border-0 bg-background/95 p-0 shadow-none sm:h-[96dvh] sm:w-[96vw] sm:rounded-lg [&>button]:right-[max(1rem,env(safe-area-inset-right))] [&>button]:top-[max(1rem,env(safe-area-inset-top))] [&>button]:z-20 [&>button]:grid [&>button]:h-11 [&>button]:w-11 [&>button]:place-items-center [&>button]:rounded-full [&>button]:bg-card/90">
          <DialogTitle className="sr-only">Живые фото автопарка</DialogTitle>
          <DialogDescription className="sr-only">Листайте фотографии свайпом влево или вправо</DialogDescription>
          <Carousel
            setApi={setApi}
            opts={{ loop: true, startIndex: selected ?? 0 }}
            className="h-full w-full min-w-0 overflow-hidden"
          >
            <CarouselContent className="ml-0 h-full">
              {PHOTOS.map((photo) => (
                <CarouselItem key={photo.src} className="flex h-full items-center justify-center pl-0">
                  <figure className="flex h-full w-full flex-col items-center justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+4rem)] pt-[calc(env(safe-area-inset-top)+4rem)] sm:px-16 sm:py-10">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      decoding="async"
                      className="h-auto max-h-[calc(100dvh-9rem)] w-auto max-w-full object-contain sm:max-h-[calc(96dvh-7rem)]"
                    />
                    <figcaption className="mt-3 text-center text-sm font-medium text-foreground">
                      {photo.caption}
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-3 hidden border-border bg-card/90 sm:inline-flex" />
            <CarouselNext className="right-3 hidden border-border bg-card/90 sm:inline-flex" />
          </Carousel>
          <div className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 text-center text-xs font-medium text-muted-foreground">
            {current + 1} / {PHOTOS.length}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
