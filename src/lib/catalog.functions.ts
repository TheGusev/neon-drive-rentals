import { createServerFn } from "@tanstack/react-start";
import type { Car } from "@/types/domain";

export const getCars = createServerFn({ method: "GET" }).handler(async (): Promise<Car[]> => {
  const { fetchCars } = await import("@/lib/carsRepo.server");
  return fetchCars();
});

export const getCarBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data?.slug ?? "").slice(0, 200) }))
  .handler(async ({ data }): Promise<Car | null> => {
    const { fetchCarBySlug } = await import("@/lib/carsRepo.server");
    return fetchCarBySlug(data.slug);
  });
