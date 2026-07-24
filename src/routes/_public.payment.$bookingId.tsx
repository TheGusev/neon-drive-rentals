import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_public/payment/$bookingId")({
  head: () => ({
    meta: [
      { title: "Оплата — RentSib" },
      { name: "description", content: "Оплата бронирования через ЮKassa." },
      { property: "og:title", content: "Оплата заказа — RentSib" },
      { property: "og:description", content: "Быстрая и безопасная оплата." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { bookingId } = Route.useParams();
  return <StubPage title="Оплата заказа" subtitle={`Бронь: ${bookingId}. Виджет ЮKassa — следующим промтом.`} />;
}
