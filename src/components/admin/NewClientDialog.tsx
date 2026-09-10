import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientAdmin } from "@/lib/admin.functions";

const empty = { name: "", phone: "", email: "" };

/** Быстрое добавление клиента в CRM без брони. */
export function NewClientDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const queryClient = useQueryClient();
  const createFn = useServerFn(createClientAdmin);

  const mutation = useMutation({
    mutationFn: () =>
      createFn({
        data: { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() },
      }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      toast.success("Клиент добавлен");
      setForm(empty);
      setOpen(false);
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  const submit = () => {
    if (form.name.trim().length < 2) {
      toast.error("Укажите имя клиента");
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      toast.error("Укажите телефон клиента");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый клиент</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-client-name">Имя</Label>
            <Input
              id="new-client-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Иван Петров"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-client-phone">Телефон</Label>
            <Input
              id="new-client-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+7 999 000-00-00"
              inputMode="tel"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-client-email">E-mail (необязательно)</Label>
            <Input
              id="new-client-email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="client@mail.ru"
              inputMode="email"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="soft" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending ? "Сохраняем…" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
