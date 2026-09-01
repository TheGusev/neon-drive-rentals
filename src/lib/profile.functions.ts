import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ClientDocument, ClientProfile, ClientReview } from "@/types/domain";

export type MyProfileResult = {
  authenticated: boolean;
  profile: (ClientProfile & { ordersCount: number; createdAt?: string }) | null;
  documents: Array<ClientDocument & { fileUrl?: string; comment?: string }>;
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

export const uploadMyDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        type: z.enum(["passport", "license"]),
        number: z.string().max(60).optional(),
        fileName: z.string().max(200).optional(),
        contentBase64: z.string().max(9_000_000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const { clientId } = await getClientSession();
    if (!clientId) return { ok: false as const, error: "Требуется вход" };

    let fileUrl: string | undefined;
    if (data.fileName && data.contentBase64) {
      const { saveCarPhoto } = await import("@/lib/uploads.server");
      const saved = await saveCarPhoto(data.fileName, data.contentBase64);
      if (!saved.ok) return { ok: false as const, error: saved.error ?? "Не удалось сохранить файл" };
      fileUrl = saved.url;
    }

    const { insertDocument } = await import("@/lib/profileRepo.server");
    const ok = await insertDocument({ clientId, type: data.type, number: data.number, fileUrl });
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
