import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_public/cars/$carId")({
  head: ({ params }) => ({
    meta: [
      { title: `Авто ${params.carId} — RentSib` },
      { name: "description", content: "Характеристики авто, календарь занятости и бронирование." },
      { property: "og:title", content: `Авто ${params.carId} — RentSib` },
      { property: "og:description", content: "Характеристики и бронирование." },
    ],
  }),
  component: CarPage,
});

function CarPage() {
  const { carId } = Route.useParams();
  return (
    <StubPage title={`Карточка: ${carId}`} subtitle="Фото, характеристики, календарь, кнопка бронирования — далее." />
  );
}
