import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/checkout/SectionCard";
import { submitReview } from "@/lib/reviews.functions";
import { cn } from "@/lib/utils";

/** Отзыв после возврата авто: публичная оценка + внутренний комментарий сервису. */
export function ReviewForm({ bookingId, carTitle }: { bookingId: string; carTitle: string }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [serviceComment, setServiceComment] = useState("");
  const send = useServerFn(submitReview);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => send({ data: { bookingId, rating, text, serviceComment } }),
    onSuccess: async (result) => {
      if (result.ok) {
        toast.success("Спасибо! Отзыв опубликован");
        await queryClient.invalidateQueries({ queryKey: ["me"] });
        await queryClient.invalidateQueries({ queryKey: ["cars"] });
        return;
      }
      const messages: Record<string, string> = {
        unauthorized: "Войдите в кабинет, чтобы оставить отзыв",
        not_found: "Бронирование не найдено",
        not_completed: "Отзыв можно оставить после возврата автомобиля",
        already_reviewed: "Вы уже оставили отзыв по этой аренде",
      };
      toast.error(messages[result.reason] ?? "Не удалось отправить отзыв");
    },
    onError: () => toast.error("Не удалось отправить отзыв"),
  });

  return (
    <SectionCard title="Оцените аренду" className="bg-card ring-1 ring-border">
      <p className="text-sm text-muted-foreground">{carTitle}</p>

      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`Оценка ${value}`}
            onClick={() => setRating(value)}
            className="p-1"
          >
            <Star
              className={cn(
                "h-6 w-6 transition",
                value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>

      <Textarea
        className="mt-3"
        rows={3}
        placeholder="Как показал себя автомобиль? Отзыв увидят другие клиенты."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Textarea
        className="mt-2"
        rows={2}
        placeholder="Комментарий сервису (не публикуется)"
        value={serviceComment}
        onChange={(e) => setServiceComment(e.target.value)}
      />

      <Button
        className="mt-3 w-full"
        size="xl"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "Отправляем…" : "Отправить отзыв"}
      </Button>
    </SectionCard>
  );
}
