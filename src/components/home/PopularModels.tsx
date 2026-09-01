import { Link } from "@tanstack/react-router";
import { ArrowRight, Fuel, Gauge } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useCars } from "@/state/AppDataContext";
import { CarImage } from "@/components/car/CarImage";

export function PopularModels() {
  const cars = useCars();
  const popular = cars.slice(0, 6);

  return (
    <section className="py-12 md:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Каталог</p>
          <h2 className="mt-1 font-display text-2xl font-black md:text-4xl md:neon-text">
            Популярные модели
          </h2>
        </div>
        <Button asChild variant="outline" className="hidden md:inline-flex">
          <Link to="/cars">
            Все авто <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Carousel opts={{ align: "start", loop: true }}>
        <CarouselContent className="-ml-4">
          {popular.map((car) => (
            <CarouselItem key={car.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition md:hover:neon-glow">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <CarImage
                    src={car.image}
                    alt={`${car.brand} ${car.model}, ${car.color}`}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 rounded-md bg-background/80 px-2 py-1 text-xs font-bold uppercase tracking-wider text-foreground backdrop-blur">
                    {car.class === "sport" ? "Sport" : "Econom"}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-bold">
                      {car.brand} {car.model}
                    </h3>
                    <span className="text-xs text-muted-foreground">{car.year}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="h-3.5 w-3.5" />
                      {car.power} л.с.
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Fuel className="h-3.5 w-3.5" />
                      {car.consumption} л
                    </span>
                    <span>{car.transmission}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="font-display text-xl font-black text-foreground md:text-primary">
                        {car.pricePerDay.toLocaleString("ru-RU")} ₽
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">/ сутки</span>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="gap-1">
                      <Link to="/cars/$carId" params={{ carId: car.id }}>
                        Подробнее <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>

      <div className="mt-6 flex md:hidden">
        <Button asChild variant="outline" className="w-full">
          <Link to="/cars">
            Все авто <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
