import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/adminGate.functions";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Вход для сотрудников — NSK-RENT" },
      { name: "description", content: "Служебный вход в панель управления NSK-RENT." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const router = useRouter();
  const login = useServerFn(adminLogin);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | "bad-password" | "not-configured">(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login({ data: { password } });
      if (res.ok) {
        await router.navigate({ to: "/admin" });
        return;
      }
      setError(res.reason === "not-configured" ? "not-configured" : "bad-password");
    } catch {
      setError("bad-password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border bg-background p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              NSK-RENT
            </div>
            <h1 className="text-lg font-bold">Вход для сотрудников</h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Пароль</Label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error !== null}
              autoFocus
            />
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error === "not-configured"
                  ? "Вход не настроен на сервере: не заданы ADMIN_PASSWORD / SESSION_SECRET."
                  : "Неверный пароль"}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading || password.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Войти
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Доступ только для сотрудников NSK-RENT. Сессия действует 7 дней.
        </p>
      </div>
    </div>
  );
}
