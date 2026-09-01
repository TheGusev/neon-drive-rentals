import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { CarCard } from "@/components/catalog/CarCard";
import { CarGallery } from "@/components/car/CarGallery";
import { adminCarsQueryOptions } from "@/lib/queries";
import { updateCarImages } from "@/lib/admin.functions";
import { noindexMeta } from "@/lib/seo";
import type { Car } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/car-photos/$carId")({
  head: () => ({ meta: [{ title: "Фотографии авто — Панель управления" }, noindexMeta] }),
  component: CarPhotosPage,
});

function CarPhotosPage() {
  const { carId } = Route.useParams();
  const { data: cars } = useSuspenseQuery(adminCarsQueryOptions());
  const queryClient = useQueryClient();

  const car = useMemo(() => cars.find((c) => c.id === carId || c.slug === carId), [cars, carId]);

  const initial = useMemo(() => car?.gallery ?? (car?.image ? [car.image] : []), [car]);
  const [images, setImages] = useState<string[]>(initial);

  useEffect(() => setImages(initial), [initial]);

  const saveFn = useServerFn(updateCarImages);

  const saveMutation = useMutation({
    mutationFn: () => saveFn({ data: { id: carId, images } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "cars"] });
      await queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success("Фотографии обновлены");
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  if (!car) {
    return (
      <div className="w-full">
        <PageHeader title="Автомобиль не найден" description={carId} />
        <Button asChild variant="soft">
          <Link to="/admin/cars">
            <ArrowLeft className="mr-2 h-4 w-4" /> К автопарку
          </Link>
        </Button>
      </div>
    );
  }

  const dirty = JSON.stringify(images) !== JSON.stringify(initial);
  const previewCar: Car = { ...car, image: images[0], gallery: images.length ? images : undefined };

  return (
    <div className="w-full">
      <PageHeader
        title={`Фото · ${car.brand} ${car.model}`}
        description={`${car.year} · ${car.color} · ${images.length} фото в галерее`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="soft">
              <Link to="/admin/cars">
                <ArrowLeft className="mr-2 h-4 w-4" /> К автопарку
              </Link>
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!dirty || saveMutation.isPending}
            >
              Сохранить
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Галерея</h2>
            <PhotoUploader images={images} onChange={setImages} />
          </div>

        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Предпросмотр · каталог /cars</h2>
              <Button asChild variant="ghost" size="sm">
                <a href="/cars" target="_blank" rel="noreferrer">
                  Открыть <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
            <CarCard car={previewCar} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Предпросмотр · страница авто</h2>
              <Button asChild variant="ghost" size="sm">
                <a href={`/cars/${car.slug}`} target="_blank" rel="noreferrer">
                  Открыть <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
            <CarGallery alt={`${car.brand} ${car.model}`} images={images} />
            {dirty && (
              <p className="mt-3 text-xs text-muted-foreground">
                Изменения ещё не сохранены — на сайте показывается прежняя галерея.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
