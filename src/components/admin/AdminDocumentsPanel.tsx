import { Check, Clock, FileText, IdCard, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { adminDocumentsQueryOptions } from "@/lib/queries";
import { reviewClientDocument } from "@/lib/profile.functions";

const statusTone = {
  verified: "bg-emerald-500/15 text-emerald-600",
  pending: "bg-amber-500/15 text-amber-600",
  rejected: "bg-rose-500/15 text-rose-600",
} as const;

const statusLabel = { verified: "Проверен", pending: "Ожидает", rejected: "Отклонён" } as const;

/** Проверка документов клиентов: фото, статус, решение менеджера. */
export function AdminDocumentsPanel() {
  const { data: docs = [], isLoading } = useQuery(adminDocumentsQueryOptions());
  const queryClient = useQueryClient();
  const review = useServerFn(reviewClientDocument);

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: "verified" | "rejected" }) => review({ data: vars }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error("Не удалось обновить статус документа");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "documents"] });
      toast.success("Статус документа обновлён");
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  if (isLoading || docs.length === 0) return null;

  return (
    <section className="mb-6 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Документы на проверку</h2>
      <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {docs.map((doc) => {
          const Icon = doc.type === "passport" ? IdCard : FileText;
          return (
            <li key={doc.id} className="flex items-center gap-3 rounded-xl border border-border/70 p-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                {doc.fileUrl ? (
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="h-full w-full">
                    <img src={doc.fileUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </a>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{doc.clientName}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {doc.type === "passport" ? "Паспорт" : "Права"} · {doc.clientPhone}
                </div>
              </div>
              <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] ${statusTone[doc.status]}`}>
                <Clock className="h-3 w-3" /> {statusLabel[doc.status]}
              </span>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Подтвердить документ"
                  onClick={() => mutation.mutate({ id: doc.id, status: "verified" })}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Отклонить документ"
                  onClick={() => mutation.mutate({ id: doc.id, status: "rejected" })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
