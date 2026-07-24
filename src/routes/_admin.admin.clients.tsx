import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Star, Ban } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { clients as seedClients } from "@/mocks/clients";
import type { Client } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/clients")({
  head: () => ({ meta: [{ title: "Клиенты — Панель управления" }] }),
  component: AdminClientsPage,
});

function AdminClientsPage() {
  const [rows, setRows] = useState<Client[]>(seedClients);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "blacklist">("all");

  const filtered = useMemo(() => {
    return rows.filter((c) => {
      if (tab === "blacklist" && !c.blacklisted) return false;
      if (q && !`${c.name} ${c.phone} ${c.email ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, q, tab]);

  const toggleBlacklist = (id: string, val: boolean) => {
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, blacklisted: val } : c)));
    toast(val ? "Клиент добавлен в чёрный список" : "Клиент удалён из чёрного списка");
  };

  return (
    <div>
      <PageHeader
        title="Клиенты"
        description="CRM: контакты, история и чёрный список"
        actions={
          <Button onClick={() => toast("Форма клиента скоро появится")}>
            <Plus className="mr-2 h-4 w-4" /> Новый клиент
          </Button>
        }
      />

      <div className="mb-4 space-y-3">
        <Input placeholder="Поиск по имени, телефону или email" value={q} onChange={(e) => setQ(e.target.value)} />
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">Все ({rows.length})</TabsTrigger>
            <TabsTrigger value="blacklist">
              <Ban className="mr-1.5 h-4 w-4" /> Чёрный список ({rows.filter((r) => r.blacklisted).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Клиент</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Заказов</TableHead>
              <TableHead>Рейтинг</TableHead>
              <TableHead className="text-right">Чёрный список</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className={c.blacklisted ? "bg-rose-50/50" : undefined}>
                <TableCell className="text-sm font-medium">{c.name}</TableCell>
                <TableCell className="text-sm">{c.phone}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.email ?? "—"}</TableCell>
                <TableCell className="text-center text-sm">{c.ordersCount}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {c.rating.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Switch checked={!!c.blacklisted} onCheckedChange={(v) => toggleBlacklist(c.id, v)} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">Клиентов не найдено</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
