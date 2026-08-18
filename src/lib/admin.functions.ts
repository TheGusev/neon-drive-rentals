import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Car } from "@/types/domain";

const fleetStatus = z.enum(["free", "busy", "maintenance"]);
const bookingStatus = z.enum(["paid", "pending", "active", "completed", "cancelled"]);

const carInputSchema = z.object({
  slug: z.string().max(120).optional(),
  brand: z.string().min(1).max(60),
  model: z.string().min(1).max(80),
  year: z.number().int().min(1990).max(2100),
  transmission: z.enum(["AT", "MT", "CVT"]),
  seats: z.number().int().min(2).max(9),
  priceCity: z.number().int().min(0).max(1_000_000),
  priceOut: z.number().int().min(0).max(1_000_000),
  status: fleetStatus,
  plate: z.string().max(20),
  color: z.string().max(40),
  power: z.number().int().min(0).max(2000).optional(),
  consumption: z.number().min(0).max(50).optional(),
  engineVolume: z.number().min(0).max(10).optional(),
  deposit: z.number().int().min(0).max(1_000_000).optional(),
  vin: z.string().max(40).optional(),
  image: z.string().max(300).optional(),
});

export const getCarsAdmin = createServerFn({ method: "GET" }).handler(async (): Promise<Car[]> => {
  const { requireAdmin } = await import("@/lib/adminGuard.server");
  await requireAdmin();
  const { fetchCarsAdmin } = await import("@/lib/carsRepo.server");
  return fetchCarsAdmin();
});

export const createCar = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => carInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { insertCar } = await import("@/lib/carsRepo.server");
    const car = await insertCar(data);
    return car ? { ok: true as const, car } : { ok: false as const };
  });

export const updateCar = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1).max(120), patch: carInputSchema }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { updateCarInDb } = await import("@/lib/carsRepo.server");
    const car = await updateCarInDb(data.id, data.patch);
    return car ? { ok: true as const, car } : { ok: false as const };
  });

export const updateCarStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1).max(120), status: fleetStatus }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { updateCarStatusInDb } = await import("@/lib/carsRepo.server");
    const car = await updateCarStatusInDb(data.id, data.status);
    return car ? { ok: true as const, car } : { ok: false as const };
  });

export const deleteCar = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { deleteCarInDb } = await import("@/lib/carsRepo.server");
    return deleteCarInDb(data.id);
  });

export const uploadCarPhoto = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        fileName: z.string().min(1).max(120),
        contentBase64: z.string().min(10).max(8_000_000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { saveCarPhoto } = await import("@/lib/uploads.server");
    return saveCarPhoto(data.fileName, data.contentBase64);
  });

export const getBookingsAdmin = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        status: bookingStatus.optional(),
        dateFrom: z.string().max(40).optional(),
        dateTo: z.string().max(40).optional(),
      })
      .partial()
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { fetchBookingsAdmin } = await import("@/lib/bookingsRepo.server");
    return fetchBookingsAdmin(data);
  });

export const getClientsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/adminGuard.server");
  await requireAdmin();
  const { fetchClientsAdmin } = await import("@/lib/clientsRepo.server");
  return fetchClientsAdmin();
});

export const toggleClientBlock = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1).max(80), blocked: z.boolean() }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { setClientBlocked } = await import("@/lib/clientsRepo.server");
    return { ok: await setClientBlocked(data.id, data.blocked) };
  });

export const getPaymentsAdmin = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ from: z.string().max(40).optional(), to: z.string().max(40).optional() }).partial().parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { fetchPaymentsAdmin } = await import("@/lib/paymentsRepo.server");
    return fetchPaymentsAdmin(data);
  });

export const runDbMigrations = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/adminGuard.server");
  await requireAdmin();
  const { runMigrationsNow } = await import("@/lib/migrations.server");
  return { applied: await runMigrationsNow() };
});

export const updateCarImages = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().min(1).max(120),
        images: z.array(z.string().min(1).max(500)).max(12),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { updateCarImagesInDb } = await import("@/lib/carsRepo.server");
    const car = await updateCarImagesInDb(data.id, data.images);
    return car ? { ok: true as const, car } : { ok: false as const };
  });
