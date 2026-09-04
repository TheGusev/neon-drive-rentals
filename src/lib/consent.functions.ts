import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  kind: z.enum(["pdn_registration", "pdn_booking", "offer", "cookie"]),
  docVersion: z.string().max(20).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().max(160).optional(),
  page: z.string().max(200).optional(),
  payload: z.record(z.string(), z.union([z.string(), z.boolean(), z.number()])).optional(),
});

/** Публичная фиксация согласия: IP и User-Agent берём из запроса, не с клиента. */
export const recordConsent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const forwarded = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "";
    const ip = forwarded.split(",")[0]?.trim() || null;
    const userAgent = request.headers.get("user-agent");

    const { recordConsentRow } = await import("@/lib/consentRepo.server");
    const saved = await recordConsentRow({
      kind: data.kind,
      docVersion: data.docVersion ?? "1.0",
      phone: data.phone ?? null,
      email: data.email ?? null,
      ip,
      userAgent,
      page: data.page ?? null,
      payload: data.payload ?? {},
    });
    return { ok: saved };
  });

export const getConsents = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/adminGuard.server");
  await requireAdmin();
  const { fetchConsents } = await import("@/lib/consentRepo.server");
  return fetchConsents();
});
