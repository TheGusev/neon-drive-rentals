import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_admin/admin/cars")({
  head: () => ({
    meta: [
      { title: "Автомобили — Админ RentSib" },
      { name: "description", content: "Управление автопарком, статусы, календарь." },
      { property: "og:title", content: "Автомобили — Админ RentSib" },
      { property: "og:description", content: "CRUD автопарка." },
    ],
  }),
  component: () => (
    <StubPage title="Автомобили" subtitle="CRUD автопарка, статусы, календарь — в следующем промте." />
  ),
});
