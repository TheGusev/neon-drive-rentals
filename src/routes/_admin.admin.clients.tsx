import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_admin/admin/clients")({
  head: () => ({
    meta: [
      { title: "Клиенты — Админ RentSib" },
      { name: "description", content: "CRM: карточки клиентов, история, чёрный список." },
      { property: "og:title", content: "Клиенты — Админ RentSib" },
      { property: "og:description", content: "CRM клиентов." },
    ],
  }),
  component: () => (
    <StubPage title="Клиенты" subtitle="Карточка клиента, история, чёрный список — далее." />
  ),
});
