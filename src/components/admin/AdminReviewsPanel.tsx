import { useMemo, useState } from "react";
import { Eye, EyeOff, Save, Star, Trash2 } from "lucide-react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminReviewsQueryOptions } from "@/lib/queries";
import { deleteReviewAdmin, setReviewVisibility, updateReviewAdmin } from "@/lib/reviews.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export function AdminReviewsPanel() {
  const { data: reviews } = useSuspenseQuery(adminReviewsQueryOptions());
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState<"all" | "visible" | "hidden" | "low">("all");
  const filtered = useMemo(() => reviews.filter((review) => {
    if (filter === "visible" && review.hidden) return false; if (filter === "hidden" && !review.hidden) return false;
    if (filter === "low" && review.rating > 3) return false;
    return `${review.author} ${review.carId} ${review.text} ${review.serviceComment ?? ""}`.toLowerCase().includes(query.toLowerCase());
  }), [reviews, query, filter]);
  return <div className="space-y-4"><div className="grid gap-2 sm:grid-cols-[1fr_auto]"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Клиент, автомобиль или текст" /><div className="flex gap-1 overflow-x-auto">{([['all','Все'],['visible','Опубликованы'],['hidden','Скрыты'],['low','1–3 звезды']] as const).map(([value,label]) => <Button key={value} size="sm" variant={filter === value ? "default" : "outline"} onClick={() => setFilter(value)}>{label}</Button>)}</div></div>
    {filtered.length === 0 ? <Card className="p-6 text-center text-sm text-muted-foreground">Отзывы не найдены</Card> : <div className="grid gap-3 xl:grid-cols-2">{filtered.map((review) => <ReviewEditor key={review.id} review={review} />)}</div>}
  </div>;
}

function ReviewEditor({ review }: { review: ReturnType<typeof adminReviewsQueryOptions>["queryFn"] extends () => Promise<infer T> ? T[number] : never }) {
  const [rating, setRating] = useState(review.rating); const [text, setText] = useState(review.text); const [serviceComment, setServiceComment] = useState(review.serviceComment ?? "");
  const update = useServerFn(updateReviewAdmin); const visibility = useServerFn(setReviewVisibility); const remove = useServerFn(deleteReviewAdmin); const queryClient = useQueryClient();
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }), queryClient.invalidateQueries({ queryKey: ["cars"] })]);
  const saveMutation = useMutation({ mutationFn: () => update({ data: { id: review.id, rating, text, serviceComment } }), onSuccess: async (result) => { if (!result.ok) return toast.error("Не удалось сохранить отзыв"); await refresh(); toast.success("Отзыв обновлён"); } });
  const visibilityMutation = useMutation({ mutationFn: () => visibility({ data: { id: review.id, hidden: !review.hidden } }), onSuccess: async (result) => { if (!result.ok) return toast.error("Не удалось изменить публикацию"); await refresh(); toast.success(review.hidden ? "Отзыв опубликован" : "Отзыв скрыт"); } });
  const deleteMutation = useMutation({ mutationFn: () => remove({ data: { id: review.id } }), onSuccess: async (result) => { if (!result.ok) return toast.error("Не удалось удалить отзыв"); await refresh(); toast.success("Отзыв удалён"); } });
  return <Card className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{review.author}</p><p className="text-xs text-muted-foreground">{review.carId} · бронь {review.bookingId.slice(0, 8)}</p></div><span className={review.hidden ? "text-xs text-muted-foreground" : "text-xs text-emerald-600"}>{review.hidden ? "Скрыт" : "Опубликован"}</span></div>
    <div className="flex gap-1" aria-label={`Оценка ${rating}`}>{[1,2,3,4,5].map((value) => <Button key={value} size="icon" variant="ghost" aria-label={`${value} звёзд`} onClick={() => setRating(value)}><Star className={`h-5 w-5 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} /></Button>)}</div>
    <Textarea value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} placeholder="Публичный отзыв" />
    <Textarea value={serviceComment} maxLength={2000} onChange={(e) => setServiceComment(e.target.value)} placeholder="Внутренний комментарий сервису" />
    <div className="flex flex-wrap gap-2"><Button size="sm" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}><Save className="mr-1.5 h-4 w-4" />Сохранить</Button><Button size="sm" variant="outline" disabled={visibilityMutation.isPending} onClick={() => visibilityMutation.mutate()}>{review.hidden ? <Eye className="mr-1.5 h-4 w-4" /> : <EyeOff className="mr-1.5 h-4 w-4" />}{review.hidden ? "Опубликовать" : "Скрыть"}</Button><Button size="sm" variant="destructive" disabled={deleteMutation.isPending} onClick={() => { if (window.confirm("Удалить отзыв без возможности восстановления?")) deleteMutation.mutate(); }}><Trash2 className="mr-1.5 h-4 w-4" />Удалить</Button></div>
  </Card>;
}