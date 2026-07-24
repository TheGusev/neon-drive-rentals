import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_public/booking/$carId")({
  head: () => ({
    meta: [
      { title: "Бронирование — RentSib" },
      { name: "description", content: "Выберите даты и рассчитайте стоимость аренды." },
      { property: "og:title", content: "Бронирование — RentSib" },
      { property: "og:description", content: "Даты, тариф, доставка, расчёт цены." },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  const { carId } = Route.useParams();
  return <StubPage title="Бронирование" subtitle={`Авто: ${carId}. Форма бронирования — в следующем промте.`} />;
}
