import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_admin/admin/finance")({
  head: () => ({
    meta: [
      { title: "Финансы — Админ RentSib" },
      { name: "description", content: "Выручка, платежи, залоги, экспорт." },
      { property: "og:title", content: "Финансы — Админ RentSib" },
      { property: "og:description", content: "Финансовая отчётность проката." },
    ],
  }),
  component: () => (
    <StubPage title="Финансы" subtitle="Выручка по дням, платежи, залоги, экспорт в Excel — далее." />
  ),
});
