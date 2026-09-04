import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminClientCard } from "@/components/admin/AdminClientCard";
import { AdminDocumentsPanel } from "@/components/admin/AdminDocumentsPanel";
import { EntityGrid, EmptyState } from "@/components/admin/EntityCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminClientsQueryOptions } from "@/lib/queries";
import { toggleClientBlock } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/clients")({
  head: () => ({ meta: [{ title: "Клиенты — Панель управления" }] }),
  component: AdminClientsPage,
});

function AdminClientsPage() {
  const { data: rows } = useSuspenseQuery(adminClientsQueryOptions());
  const queryClient = useQueryClient();
  const blockFn = useServerFn(toggleClientBlock);
  const blockMutation = useMutation({
    mutationFn: (vars: { id: string; blocked: boolean }) => blockFn({ data: vars }),
    onSuccess: async (res, vars) => {
      if (!res.ok) {
        toast.error("Не удалось изменить статус клиента");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      toast.success(vars.blocked ? "Клиент в чёрном списке" : "Клиент разблокирован");
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "blacklist">("all");

  const filtered = useMemo(() => {
    return rows.filter((c) => {
      if (tab === "blacklist" && !c.blacklisted) return false;
      if (q && !`${c.name} ${c.phone} ${c.email ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [rows, q, tab]);

  const toggleBlacklist = (id: string, val: boolean) => blockMutation.mutate({ id, blocked: val });

  return (
    <div className="w-full">
      <PageHeader
        title="Клиенты"
        description="CRM: контакты, история и чёрный список"
      />

      <AdminDocumentsPanel />

      <div className="mb-4 w-full space-y-3">
        <Input
          placeholder="Поиск по имени, телефону или email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="all">Все ({rows.length})</TabsTrigger>
            <TabsTrigger value="blacklist">
              <Ban className="mr-1.5 h-4 w-4" /> Чёрный список (
              {rows.filter((r) => r.blacklisted).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="Клиентов не найдено" />
      ) : (
        <EntityGrid key={`${q}|${tab}`}>
          {filtered.map((c, i) => (
            <AdminClientCard
              key={c.id}
              client={c}
              index={i}
              onToggleBlacklist={(v) => toggleBlacklist(c.id, v)}
            />
          ))}
        </EntityGrid>
      )}
    </div>
  );
}
