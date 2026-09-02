import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/checkout/SectionCard";
import {
  loginWithOtp,
  loginWithPassword,
  requestOtp,
  resetPasswordWithOtp,
} from "@/lib/auth.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_public/login")({
  head: () => ({
    meta: [
      { title: "Вход в личный кабинет — NSK-RENT" },
      { name: "description", content: "Войдите в личный кабинет NSK-RENT по e-mail и паролю или по SMS-коду: аренды, документы и история поездок." },
      { property: "og:title", content: "Вход в личный кабинет — NSK-RENT" },
      { property: "og:description", content: "Авторизация по e-mail или SMS-коду для клиентов NSK-RENT." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://nsk-rent.ru/login" }],
  }),
  component: LoginPage,
});

type Mode = "password" | "sms" | "reset";

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("password");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("+7 ");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const send = useServerFn(requestOtp);
  const loginOtp = useServerFn(loginWithOtp);
  const loginPass = useServerFn(loginWithPassword);
  const resetPass = useServerFn(resetPasswordWithOtp);

  const enter = async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Вы вошли в личный кабинет");
    void navigate({ to: "/profile" });
  };

  const sendMutation = useMutation({
    mutationFn: () => send({ data: { phone } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error("Не удалось отправить код. Попробуйте позже.");
        return;
      }
      setSent(true);
      const devCode = (res as { devCode?: string }).devCode;
      toast.success(devCode ? `Тестовый код: ${devCode}` : "Код отправлен по SMS");
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  const passwordMutation = useMutation({
    mutationFn: () => loginPass({ data: { email, password } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error(
          res.reason === "rate_limited"
            ? "Слишком много попыток. Попробуйте через 15 минут"
            : "Неверный e-mail или пароль",
        );
        return;
      }
      await enter();
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  const otpMutation = useMutation({
    mutationFn: () => loginOtp({ data: { phone, code } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error("Неверный или просроченный код");
        return;
      }
      await enter();
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  const resetMutation = useMutation({
    mutationFn: () => resetPass({ data: { phone, code, password: newPassword } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error(
          res.reason === "not_found"
            ? "Аккаунт с таким телефоном не найден"
            : "Неверный или просроченный код",
        );
        return;
      }
      toast.success("Пароль обновлён");
      await enter();
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 pb-16 pt-10">
        <h1 className="text-2xl font-semibold tracking-tight">Вход в личный кабинет</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Войдите по e-mail и паролю или получите код по SMS.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1">
          {([
            { id: "password", label: "E-mail и пароль" },
            { id: "sms", label: "Код из SMS" },
          ] as Array<{ id: Mode; label: string }>).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium transition",
                mode === tab.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {mode === "password" && (
            <SectionCard title="E-mail и пароль">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={!email.includes("@") || password.length < 1 || passwordMutation.isPending}
                  onClick={() => passwordMutation.mutate()}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" /> Войти
                </Button>
                <div className="flex items-center justify-between text-xs">
                  <button type="button" className="link-text" onClick={() => setMode("reset")}>
                    Забыли пароль?
                  </button>
                  <Link to="/register" className="link-text">
                    Создать аккаунт
                  </Link>
                </div>
              </div>
            </SectionCard>
          )}

          {mode === "sms" && (
            <SectionCard title="Телефон">
              <div className="space-y-4">
                <PhoneField phone={phone} onChange={setPhone} />

                {sent && (
                  <div className="space-y-1.5">
                    <Label htmlFor="code">Код из SMS</Label>
                    <Input
                      id="code"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                    />
                  </div>
                )}

                {!sent ? (
                  <Button
                    className="w-full"
                    disabled={phone.replace(/\D/g, "").length < 10 || sendMutation.isPending}
                    onClick={() => sendMutation.mutate()}
                  >
                    Получить код
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      disabled={code.length < 4 || otpMutation.isPending}
                      onClick={() => otpMutation.mutate()}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" /> Войти
                    </Button>
                    <Button
                      variant="soft"
                      className="w-full"
                      disabled={sendMutation.isPending}
                      onClick={() => sendMutation.mutate()}
                    >
                      Отправить код повторно
                    </Button>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {mode === "reset" && (
            <SectionCard title="Восстановление пароля">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Пришлём код на телефон, указанный в аккаунте, и зададим новый пароль.
                </p>
                <PhoneField phone={phone} onChange={setPhone} />

                {sent && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="reset-code">Код из SMS</Label>
                      <Input
                        id="reset-code"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reset-password">Новый пароль</Label>
                      <Input
                        id="reset-password"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="минимум 8 символов"
                      />
                    </div>
                  </>
                )}

                {!sent ? (
                  <Button
                    className="w-full"
                    disabled={phone.replace(/\D/g, "").length < 10 || sendMutation.isPending}
                    onClick={() => sendMutation.mutate()}
                  >
                    Получить код
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    disabled={code.length < 4 || newPassword.length < 8 || resetMutation.isPending}
                    onClick={() => resetMutation.mutate()}
                  >
                    Сохранить новый пароль
                  </Button>
                )}

                <button type="button" className="link-text text-xs" onClick={() => setMode("password")}>
                  ← Вернуться ко входу
                </button>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function PhoneField({ phone, onChange }: { phone: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="phone">Номер телефона</Label>
      <div className="relative">
        <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="phone"
          inputMode="tel"
          className="pl-9"
          value={phone}
          onChange={(e) => onChange(e.target.value)}
          placeholder="+7 913 015-85-55"
        />
      </div>
    </div>
  );
}
