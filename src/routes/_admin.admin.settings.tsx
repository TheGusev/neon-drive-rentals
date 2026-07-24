import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_admin/admin/settings")({
  head: () => ({
    meta: [
      { title: "Настройки — Админ RentSib" },
      { name: "description", content: "Тарифы, шаблон договора, интеграции." },
      { property: "og:title", content: "Настройки — Админ RentSib" },
      { property: "og:description", content: "Тарифы, договор, интеграции." },
    ],
  }),
  component: () => (
    <StubPage title="Настройки" subtitle="Тарифы, шаблон договора, интеграции — в следующем промте." />
  ),
});
