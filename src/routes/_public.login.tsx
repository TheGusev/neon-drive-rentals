import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/checkout/SectionCard";
import { loginWithOtp, requestOtp } from "@/lib/auth.functions";

export const Route = createFileRoute("/_public/login")({
  head: () => ({
    meta: [
      { title: "Вход по номеру телефона — NSK-RENT" },
      { name: "description", content: "Войдите в личный кабинет NSK-RENT по SMS-коду: аренды, документы и история поездок." },
      { property: "og:title", content: "Вход в личный кабинет — NSK-RENT" },
      { property: "og:description", content: "Авторизация по SMS-коду для клиентов NSK-RENT." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://nsk-rent.ru/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState("+7 ");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  const send = useServerFn(requestOtp);
  const login = useServerFn(loginWithOtp);

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

  const loginMutation = useMutation({
    mutationFn: () => login({ data: { phone, code } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error("Неверный или просроченный код");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Вы вошли в личный кабинет");
      void navigate({ to: "/profile" });
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 pb-16 pt-10">
        <h1 className="text-2xl font-semibold tracking-tight">Вход в личный кабинет</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Введите номер телефона — пришлём код подтверждения по SMS.
        </p>

        <div className="mt-6">
          <SectionCard title="Телефон">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Номер телефона</Label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    inputMode="tel"
                    className="pl-9"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 913 015-85-55"
                  />
                </div>
              </div>

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
                    disabled={code.length < 4 || loginMutation.isPending}
                    onClick={() => loginMutation.mutate()}
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
        </div>
      </div>
    </div>
  );
}
