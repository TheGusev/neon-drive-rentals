import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_admin/admin/bookings")({
  head: () => ({
    meta: [
      { title: "Бронирования — Админ RentSib" },
      { name: "description", content: "Список и управление бронированиями." },
      { property: "og:title", content: "Бронирования — Админ RentSib" },
      { property: "og:description", content: "Список и управление бронированиями." },
    ],
  }),
  component: () => (
    <StubPage title="Бронирования" subtitle="Список, ручное добавление, генерация договора — далее." />
  ),
});
