import { useSession } from "@tanstack/react-start/server";

type GateSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "nsk-admin",
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

/** Throws unless the admin password gate session is unlocked. */
export async function requireAdmin(): Promise<void> {
  const session = await useSession<GateSession>(sessionConfig());
  if (!session.data.unlocked) {
    throw new Error("Требуется вход в панель управления");
  }
}
