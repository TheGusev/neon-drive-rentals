import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_public/cars/")({
  head: () => ({
    meta: [
      { title: "Каталог автомобилей — RentSib" },
      { name: "description", content: "Каталог японских кей-каров и премиум-авто для аренды в Новосибирске." },
      { property: "og:title", content: "Каталог — RentSib" },
      { property: "og:description", content: "Выберите авто и забронируйте онлайн." },
    ],
  }),
  component: () => (
    <StubPage title="Каталог автомобилей" subtitle="Фильтры, сортировка и карточки авто — в следующем промте." />
  ),
});
