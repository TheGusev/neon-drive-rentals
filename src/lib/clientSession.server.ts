import { useSession } from "@tanstack/react-start/server";

export type ClientSessionData = { clientId?: string; phone?: string; role?: "client" };

export function clientSessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "nsk-client",
    maxAge: 60 * 60 * 24 * 30,
    cookie: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export async function setClientSession(clientId: string, phone: string): Promise<void> {
  const session = await useSession<ClientSessionData>(clientSessionConfig());
  await session.update({ clientId, phone, role: "client" });
}

export async function getClientSession(): Promise<ClientSessionData> {
  const session = await useSession<ClientSessionData>(clientSessionConfig());
  return session.data ?? {};
}

export async function clearClientSession(): Promise<void> {
  const session = await useSession<ClientSessionData>(clientSessionConfig());
  await session.clear();
}
