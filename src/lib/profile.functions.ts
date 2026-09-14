import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ClientDocument, ClientProfile, ClientReview } from "@/types/domain";

export type MyProfileResult = {
  authenticated: boolean;
  profile: (ClientProfile & { ordersCount: number; createdAt?: string }) | null;
  documents: Array<ClientDocument & { comment?: string }>;
  reviews: ClientReview[];
  favorites: string[];
};

const empty: MyProfileResult = {
  authenticated: false,
  profile: null,
  documents: [],
  reviews: [],
  favorites: [],
};

/** Полный срез кабинета: профиль, документы, отзывы, избранное. */
export const getMyProfile = createServerFn({ method: "GET" }).handler(async (): Promise<MyProfileResult> => {
  const { getClientSession } = await import("@/lib/clientSession.server");
  const { clientId } = await getClientSession();
  if (!clientId) return empty;

  const repo = await import("@/lib/profileRepo.server");
  const [profile, documents, reviews, favorites] = await Promise.all([
    repo.fetchProfileByClientId(clientId),
    repo.fetchDocuments(clientId),
    repo.fetchReviews(clientId),
    repo.fetchFavorites(clientId),
  ]);

  return { authenticated: true, profile, documents, reviews, favorites };
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ name: z.string().min(1).max(120), email: z.string().max(160).optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const { clientId } = await getClientSession();
    if (!clientId) return { ok: false as const };
    const { updateProfileName } = await import("@/lib/profileRepo.server");
    return { ok: await updateProfileName(clientId, data.name.trim(), data.email?.trim()) };
  });

const documentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("passport"),
    number: z.string().trim().regex(/^\d{4}\s?\d{6}$/, "Укажите 10 цифр паспорта"),
    birthDate: z.string().date(),
    issuedBy: z.string().trim().min(3).max(300),
    issueDate: z.string().date(),
    departmentCode: z.string().trim().regex(/^\d{3}-\d{3}$/),
    registrationAddress: z.string().trim().min(5).max(400),
  }),
  z.object({
    type: z.literal("license"),
    number: z.string().trim().min(6).max(30),
    issueDate: z.string().date(),
    expiryDate: z.string().date(),
  }),
]);

export const saveMyDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    documentSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const { clientId } = await getClientSession();
    if (!clientId) return { ok: false as const, error: "Требуется вход" };

    const { upsertIdentityDocument } = await import("@/lib/profileRepo.server");
    const ok = await upsertIdentityDocument({ clientId, ...data });
    return ok ? { ok: true as const } : { ok: false as const, error: "База данных недоступна" };
  });

export const toggleMyFavorite = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ carId: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const { clientId } = await getClientSession();
    if (!clientId) return { ok: false as const, favorites: [] as string[] };
    const { resolveCarDbId } = await import("@/lib/carsRepo.server");
    const carDbId = await resolveCarDbId(data.carId);
    if (!carDbId) return { ok: false as const, favorites: [] as string[] };
    const { toggleFavoriteInDb } = await import("@/lib/profileRepo.server");
    return { ok: true as const, favorites: await toggleFavoriteInDb(clientId, carDbId) };
  });

/* --- админ: проверка документов клиентов --- */

export const getClientDocumentsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/adminGuard.server");
  await requireAdmin();
  const { fetchAllDocuments } = await import("@/lib/profileRepo.server");
  return fetchAllDocuments();
});

export const reviewClientDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().min(1).max(100),
        status: z.enum(["pending", "verified", "rejected"]),
        comment: z.string().max(400).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { setDocumentStatus } = await import("@/lib/profileRepo.server");
    return { ok: await setDocumentStatus(data.id, data.status, data.comment) };
  });
