import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getThreadMessages, listMessageThreads, sendAdminMessage } from "@/lib/messages.functions";

export const Route = createFileRoute("/_admin/admin/messages")({
  validateSearch: (search: Record<string, unknown>): { client?: string } =>
    typeof search["client"] === "string" ? { client: search["client"] } : {},
  head: () => ({
    meta: [
      { title: "Сообщения — Админ NSK-RENT" },
      { name: "description", content: "Переписка с клиентами NSK-RENT." },
      { property: "og:title", content: "Сообщения — Админ NSK-RENT" },
      { property: "og:description", content: "Ответы клиентам в один клик." },
    ],
  }),
  component: MessagesPage,
});

const time = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function MessagesPage() {
  const { client } = Route.useSearch();
  const listThreads = useServerFn(listMessageThreads);
  const loadThread = useServerFn(getThreadMessages);
  const reply = useServerFn(sendAdminMessage);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(client ?? null);
  const [text, setText] = useState("");

  const { data: threads = [] } = useQuery({
    queryKey: ["admin", "threads"],
    queryFn: () => listThreads(),
    refetchInterval: 15_000,
  });

  useEffect(() => {
    if (!selected && threads[0]) setSelected(threads[0].clientId);
  }, [threads, selected]);

  const { data: messages = [] } = useQuery({
    queryKey: ["admin", "thread", selected],
    queryFn: () => loadThread({ data: { clientId: selected! } }),
    enabled: Boolean(selected),
    refetchInterval: 15_000,
  });

  const mutation = useMutation({
    mutationFn: (body: string) => reply({ data: { clientId: selected!, body } }),
    onSuccess: () => {
      setText("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "thread", selected] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "threads"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  const current = threads.find((t) => t.clientId === selected);

  return (
    <div className="space-y-4 pb-24">
      <PageHeader title="Сообщения" description="Переписка с клиентами прямо из админки" />

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="max-h-[70vh] overflow-y-auto p-2">
          {threads.length === 0 && <p className="p-3 text-sm text-muted-foreground">Сообщений пока нет.</p>}
          <ul className="space-y-1">
            {threads.map((t) => (
              <li key={t.clientId}>
                <button
                  type="button"
                  onClick={() => setSelected(t.clientId)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition ${
                    selected === t.clientId ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{t.clientName}</span>
                    {t.unread > 0 && (
                      <span className="rounded-full bg-primary px-2 text-[10px] font-bold text-primary-foreground">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{t.lastBody}</p>
                  <p className="text-[10px] text-muted-foreground">{time(t.lastAt)}</p>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex max-h-[70vh] flex-col p-3">
          <p className="mb-2 text-sm font-semibold">
            {current ? `${current.clientName} · ${current.clientPhone}` : "Выберите диалог"}
          </p>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} className={m.sender === "admin" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-70">{time(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const body = text.trim();
              if (body && selected) mutation.mutate(body);
            }}
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ответ клиенту"
              disabled={!selected}
            />
            <Button type="submit" size="icon" disabled={!selected || mutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
