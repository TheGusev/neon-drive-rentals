import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/checkout/SectionCard";
import { registerWithPassword } from "@/lib/auth.functions";
import { recordConsent } from "@/lib/consent.functions";
import { Checkbox } from "@/components/ui/checkbox";
import { LEGAL } from "@/lib/contacts";

export const Route = createFileRoute("/_public/register")({
  head: () => ({
    meta: [
      { title: "Регистрация клиента — NSK-RENT" },
      { name: "description", content: "Создайте аккаунт NSK-RENT: история аренд, документы и быстрые повторные бронирования." },
      { property: "og:title", content: "Регистрация — NSK-RENT" },
      { property: "og:description", content: "Аккаунт клиента проката авто в Новосибирске: аренды, документы, бронирования." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://nsk-rent.ru/register" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+7 ");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [pdn, setPdn] = useState(false);

  const register = useServerFn(registerWithPassword);
  const saveConsent = useServerFn(recordConsent);

  const problems: string[] = [];
  if (name.trim().length < 2) problems.push("Укажите имя");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) problems.push("Укажите корректный e-mail");
  if (phone.replace(/\D/g, "").length < 10) problems.push("Укажите номер телефона");
  if (password.length < 8) problems.push("Пароль — минимум 8 символов");
  if (password !== repeat) problems.push("Пароли не совпадают");
  if (!pdn) problems.push("Нужно согласие на обработку персональных данных");

  const mutation = useMutation({
    mutationFn: () => register({ data: { name: name.trim(), email: email.trim(), phone, password } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error(
          res.reason === "email_taken"
            ? "Такой e-mail уже зарегистрирован — войдите или восстановите пароль"
            : "База данных временно недоступна",
        );
        return;
      }
      // Фиксируем согласие с указанием версии документов.
      void saveConsent({
        data: {
          kind: "pdn_registration",
          docVersion: LEGAL.docsVersion,
          phone,
          email: email.trim(),
          page: "/register",
          payload: { pdn: true },
        },
      }).catch(() => undefined);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Аккаунт создан");
      void navigate({ to: "/profile" });
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 pb-16 pt-10">
        <h1 className="text-2xl font-semibold tracking-tight">Регистрация</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Аккаунт нужен, чтобы видеть свои аренды, документы и бронировать в один клик.
          Если вы уже бронировали по этому номеру — история подтянется автоматически.
        </p>

        <div className="mt-5">
          <SectionCard title="Данные аккаунта">
            <div className="space-y-4">
              <Field id="name" label="Имя и фамилия" value={name} onChange={setName} placeholder="Иван Иванов" autoComplete="name" />
              <Field id="email" label="E-mail" value={email} onChange={setEmail} placeholder="you@example.com" type="email" autoComplete="email" />
              <Field id="phone" label="Телефон" value={phone} onChange={setPhone} placeholder="+7 913 015-85-55" inputMode="tel" autoComplete="tel" />
              <Field id="password" label="Пароль" value={password} onChange={setPassword} placeholder="минимум 8 символов" type="password" autoComplete="new-password" />
              <Field id="repeat" label="Повторите пароль" value={repeat} onChange={setRepeat} placeholder="ещё раз" type="password" autoComplete="new-password" />

              <label className="flex cursor-pointer items-start gap-3">
                <Checkbox
                  checked={pdn}
                  onCheckedChange={(v) => setPdn(v === true)}
                  className="mt-0.5 h-5 w-5 rounded-md border-border data-[state=checked]:border-accent data-[state=checked]:bg-accent"
                />
                <span className="text-xs leading-snug text-foreground/80">
                  Даю{" "}
                  <Link to="/consent" className="link-text">
                    согласие на обработку персональных данных
                  </Link>{" "}
                  и принимаю{" "}
                  <Link to="/privacy" className="link-text">
                    политику конфиденциальности
                  </Link>{" "}
                  и{" "}
                  <Link to="/terms" className="link-text">
                    условия аренды
                  </Link>
                  .
                </span>
              </label>

              {problems.length > 0 && (password.length > 0 || email.length > 0) && (
                <ul className="space-y-1 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}

              <Button
                className="w-full"
                disabled={problems.length > 0 || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {mutation.isPending ? "Создаём…" : "Создать аккаунт"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Уже есть аккаунт?{" "}
                <Link to="/login" className="link-text">
                  Войти
                </Link>
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type,
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "tel" | "text" | "email";
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
