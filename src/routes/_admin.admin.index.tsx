import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Дашборд — Админ RentSib" },
      { name: "description", content: "Панель управления: брони, выручка, автопарк, клиенты." },
      { property: "og:title", content: "Админ-панель — RentSib" },
      { property: "og:description", content: "Панель управления прокатом." },
    ],
  }),
  component: () => (
    <StubPage title="Дашборд" subtitle="Брони сегодня, выручка, статус автопарка, последние клиенты — далее." />
  ),
});
