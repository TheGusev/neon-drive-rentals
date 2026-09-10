import { useState } from "react";
import { Gauge } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitReturnMileage } from "@/lib/bookings.functions";

/**
 * Показания одометра при завершении аренды. Клиент вносит значение один раз —
 * дальше его меняет только администратор.
 */
export function MileageForm({ bookingId }: { bookingId: string }) {
  const [value, setValue] = useState("");
  const queryClient = useQueryClient();
  const submit = useServerFn(submitReturnMileage);

  const mutation = useMutation({
    mutationFn: (mileage: number) => submit({ data: { id: bookingId, mileage } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error(
          res.reason === "already_set" ? "Пробег уже зафиксирован" : "Не удалось сохранить пробег",
        );
        return;
      }
      toast.success("Пробег отправлен менеджеру");
      setValue("");
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  const numeric = Number(value.replace(/\D/g, ""));
  const valid = Number.isFinite(numeric) && numeric > 0;

  return (
    <div className="mt-3 rounded-2xl bg-muted p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Gauge className="h-4 w-4 text-muted-foreground" /> Показания одометра
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Введите пробег на приборной панели при возврате авто — он попадёт в акт приёма-передачи.
      </p>
      <div className="mt-2 flex gap-2">
        <Input
          inputMode="numeric"
          placeholder="например, 84 500"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-10"
        />
        <Button
          size="sm"
          className="h-10 shrink-0"
          disabled={!valid || mutation.isPending}
          onClick={() => mutation.mutate(numeric)}
        >
          Отправить
        </Button>
      </div>
    </div>
  );
}
