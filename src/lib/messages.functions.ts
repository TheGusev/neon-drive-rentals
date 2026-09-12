import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ChatMessage, ChatThread } from "@/lib/messagesRepo.server";

const bodySchema = z.object({ body: z.string().min(1).max(2000) });

/** Лента переписки текущего клиента (и пометка админских сообщений прочитанными). */
export const getMyMessages = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ authenticated: boolean; messages: ChatMessage[] }> => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const { clientId } = await getClientSession();
    if (!clientId) return { authenticated: false, messages: [] };
    const repo = await import("@/lib/messagesRepo.server");
    const messages = await repo.fetchThreadMessages(clientId);
    await repo.markThreadRead(clientId, "client");
    return { authenticated: true, messages };
  },
);

export const sendMyMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bodySchema.parse(data))
  .handler(async ({ data }) => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const { clientId } = await getClientSession();
    if (!clientId) return { ok: false as const };

    const repo = await import("@/lib/messagesRepo.server");
    const message = await repo.sendMessage({ clientId, sender: "client", body: data.body.trim() });
    if (!message) return { ok: false as const };

    const { notifyAdmins } = await import("@/lib/notificationsRepo.server");
    await notifyAdmins({
      kind: "message",
      title: "Новое сообщение от клиента",
      body: data.body.trim().slice(0, 140),
      link: `/admin/messages?client=${clientId}`,
      entityId: clientId,
    });

    return { ok: true as const, message };
  });

export const listMessageThreads = createServerFn({ method: "GET" }).handler(
  async (): Promise<ChatThread[]> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { fetchThreads } = await import("@/lib/messagesRepo.server");
    return fetchThreads();
  },
);

export const getThreadMessages = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ clientId: z.string().min(1).max(80) }).parse(data))
  .handler(async ({ data }): Promise<ChatMessage[]> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const repo = await import("@/lib/messagesRepo.server");
    const messages = await repo.fetchThreadMessages(data.clientId);
    await repo.markThreadRead(data.clientId, "admin");
    return messages;
  });

export const sendAdminMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ clientId: z.string().min(1).max(80), body: z.string().min(1).max(2000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { sendMessage } = await import("@/lib/messagesRepo.server");
    const message = await sendMessage({
      clientId: data.clientId,
      sender: "admin",
      body: data.body.trim(),
    });
    return { ok: Boolean(message), message };
  });
