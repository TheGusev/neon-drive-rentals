import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_public/profile")({
  head: () => ({
    meta: [
      { title: "Личный кабинет — RentSib" },
      { name: "description", content: "Ваши аренды, история бронирований и документы." },
      { property: "og:title", content: "Личный кабинет — RentSib" },
      { property: "og:description", content: "Текущая аренда, история, документы, рейтинг." },
    ],
  }),
  component: () => (
    <StubPage title="Личный кабинет" subtitle="Текущая аренда, история, документы, рейтинг — в следующем промте." />
  ),
});
