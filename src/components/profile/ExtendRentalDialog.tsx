import { useMemo, useState } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { startExtensionPayment } from "@/lib/extensions.functions";
import type { Booking } from "@/types/domain";

export function ExtendRentalDialog({ booking }: { booking: Booking }) {
  const currentDate = booking.endDate.slice(0, 10); const [date, setDate] = useState(""); const [open, setOpen] = useState(false);
  const start = useServerFn(startExtensionPayment); const queryClient = useQueryClient();
  const min = useMemo(() => { const value = new Date(booking.endDate); value.setDate(value.getDate() + 1); return value.toISOString().slice(0, 10); }, [booking.endDate]);
  const mutation = useMutation({ mutationFn: () => start({ data: { bookingId: booking.id, newEndDate: new Date(`${date}T10:00:00`).toISOString() } }), onSuccess: async (result) => { if (!result.ok) return toast.error(result.error); if (result.mode === "live" && result.confirmationUrl) { window.location.href = result.confirmationUrl; return; } await queryClient.invalidateQueries({ queryKey: ["me", "bookings"] }); setOpen(false); toast.success("Аренда продлена", { description: `Доплата ${result.amount.toLocaleString("ru-RU")} ₽ подтверждена` }); }, onError: () => toast.error("Не удалось оформить продление") });
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="accent" size="lg" className="mt-3 w-full"><CalendarPlus className="mr-2 h-4 w-4" />Продлить аренду</Button></DialogTrigger><DialogContent className="clean-light max-w-sm rounded-2xl"><DialogHeader><DialogTitle>Продлить аренду</DialogTitle><DialogDescription>Сейчас возврат назначен на {new Date(currentDate).toLocaleDateString("ru-RU")}. Выберите новую дату — свободные даты проверятся перед оплатой.</DialogDescription></DialogHeader><Input type="date" min={min} value={date} onChange={(event) => setDate(event.target.value)} /><Button disabled={!date || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{mutation.isPending ? "Проверяем…" : "Проверить даты и оплатить"}</Button></DialogContent></Dialog>;
}