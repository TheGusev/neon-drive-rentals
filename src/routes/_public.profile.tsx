import { createFileRoute } from "@tanstack/react-router";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CurrentRentalCard } from "@/components/profile/CurrentRentalCard";
import { DocumentsBlock } from "@/components/profile/DocumentsBlock";
import { BookingHistoryList } from "@/components/profile/BookingHistoryList";
import { FavoritesBlock } from "@/components/profile/FavoritesBlock";
import { ReviewsBlock } from "@/components/profile/ReviewsBlock";
import { BottomNav } from "@/components/profile/BottomNav";
import { SectionCard } from "@/components/checkout/SectionCard";
import { bookings } from "@/mocks/bookings";
import { getCarById } from "@/mocks/cars";
import { currentClient } from "@/mocks/profile";

export const Route = createFileRoute("/_public/profile")({
  head: () => ({
    meta: [
      { title: "Личный кабинет — NSK-RENT" },
      { name: "description", content: "Текущая аренда, документы, история бронирований и рейтинг клиента NSK-RENT." },
      { property: "og:title", content: "Личный кабинет — NSK-RENT" },
      { property: "og:description", content: "Управляйте арендой, документами и историей поездок." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const active = bookings.find((b) => b.clientId === currentClient.id && b.status === "active");
  const car = active ? getCarById(active.carId) : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 pb-28 pt-6 md:max-w-2xl md:pb-10">
        <ProfileHeader />

        <div className="mt-5 space-y-4">
          {active && car ? (
            <CurrentRentalCard booking={active} car={car} />
          ) : (
            <SectionCard title="Текущая аренда" className="bg-card ring-1 ring-border">
              <p className="text-sm text-muted-foreground">Нет активных аренд. Загляните в каталог и выберите автомобиль.</p>
            </SectionCard>
          )}

          <DocumentsBlock />

          <FavoritesBlock />

          <section id="bookings" className="scroll-mt-24">
            <BookingHistoryList />
          </section>

          <ReviewsBlock />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
