import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { SectionCard } from "@/components/checkout/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyMessages, sendMyMessage } from "@/lib/messages.functions";

const time = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

/** Переписка клиента с администратором NSK-RENT. */
export function MessagesBlock() {
  const fetchMessages = useServerFn(getMyMessages);
  const send = useServerFn(sendMyMessage);
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["my-messages"],
    queryFn: () => fetchMessages(),
    refetchInterval: 15_000,
  });
  const messages = data?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const mutation = useMutation({
    mutationFn: (body: string) => send({ data: { body } }),
    onSuccess: () => {
      setText("");
      void queryClient.invalidateQueries({ queryKey: ["my-messages"] });
    },
  });

  return (
    <SectionCard title="Сообщения" className="bg-card ring-1 ring-border">
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Напишите нам — администратор ответит здесь, ответ придёт в этот же чат.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.sender === "client" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.sender === "client" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p className="mt-1 text-[10px] opacity-70">{time(m.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const body = text.trim();
          if (body) mutation.mutate(body);
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение администратору"
          className="h-11 rounded-2xl"
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-2xl" disabled={mutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </SectionCard>
  );
}
