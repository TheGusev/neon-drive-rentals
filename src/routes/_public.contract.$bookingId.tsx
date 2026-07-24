import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/_public/contract/$bookingId")({
  head: () => ({
    meta: [
      { title: "Подписание договора — RentSib" },
      { name: "description", content: "Электронная подпись договора аренды по SMS." },
      { property: "og:title", content: "Подписание договора — RentSib" },
      { property: "og:description", content: "ПЭП по SMS, скачивание PDF." },
    ],
  }),
  component: ContractPage,
});

function ContractPage() {
  const { bookingId } = Route.useParams();
  return <StubPage title="Подписание договора" subtitle={`Бронь: ${bookingId}. Резюме, чекбоксы, SMS-код — далее.`} />;
}
