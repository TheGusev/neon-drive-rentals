import { createFileRoute } from "@tanstack/react-router";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CurrentRentalCard } from "@/components/profile/CurrentRentalCard";
import { DocumentsBlock } from "@/components/profile/DocumentsBlock";
import { BookingHistoryList } from "@/components/profile/BookingHistoryList";
import { FavoritesBlock } from "@/components/profile/FavoritesBlock";
import { ReviewsBlock } from "@/components/profile/ReviewsBlock";
import { RentalJourney } from "@/components/profile/RentalJourney";
import { ReviewForm } from "@/components/profile/ReviewForm";
import { BottomNav } from "@/components/profile/BottomNav";
import { SectionCard } from "@/components/checkout/SectionCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { myBookingsQueryOptions, myProfileQueryOptions, myReviewsQueryOptions } from "@/lib/queries";
import { clientLogout } from "@/lib/auth.functions";
import { useCarLookup } from "@/state/AppDataContext";

export const Route = createFileRoute("/_public/profile")({
  head: () => ({
    meta: [
      { title: "Личный кабинет — NSK-RENT" },
      { name: "description", content: "Текущая аренда, документы, история бронирований и рейтинг клиента NSK-RENT." },
      { property: "og:title", content: "Личный кабинет — NSK-RENT" },
      { property: "og:description", content: "Управляйте арендой, документами и историей поездок." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const getCarById = useCarLookup();
  const queryClient = useQueryClient();
  const logout = useServerFn(clientLogout);
  const { data, isLoading } = useQuery(myBookingsQueryOptions());
  const { data: profileData } = useQuery(myProfileQueryOptions());
  const profile = profileData?.profile ?? null;
  const authenticated = data?.authenticated ?? false;
  const bookings = data?.bookings ?? [];
  const active = bookings.find((b) => b.status === "active" || b.status === "paid");
  const car = active ? getCarById(active.carId) : undefined;
  const { data: myReviews } = useQuery({ ...myReviewsQueryOptions(), enabled: authenticated });
  const reviewedBookings = new Set((myReviews ?? []).map((r) => r.bookingId));
  const awaitingReview = bookings.find(
    (b) => (b.status === "completed" || Boolean(b.returnedAt)) && !reviewedBookings.has(b.id),
  );
  const awaitingCar = awaitingReview ? getCarById(awaitingReview.carId) : undefined;

  if (!isLoading && !authenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-md px-4 pb-28 pt-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Личный кабинет</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Войдите по номеру телефона, чтобы увидеть аренды, документы и историю поездок.
          </p>
          <Button className="mt-6 w-full" asChild>
            <Link to="/login">
              <LogIn className="mr-2 h-4 w-4" /> Войти по SMS
            </Link>
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 pb-28 pt-6 md:max-w-2xl md:pb-10">
        <ProfileHeader name={profile?.name} rating={profile?.rating ?? 0} reviewsCount={profile?.reviewsCount ?? 0} />

        <div className="mt-5 space-y-4">
          {active && car ? (
            <>
              <CurrentRentalCard booking={active} car={car} />
              <SectionCard title="Маршрут аренды" className="bg-card ring-1 ring-border">
                <RentalJourney booking={active} hasReview={reviewedBookings.has(active.id)} />
              </SectionCard>
            </>
          ) : (
            <SectionCard title="Текущая аренда" className="bg-card ring-1 ring-border">
              <p className="text-sm text-muted-foreground">Нет активных аренд. Загляните в каталог и выберите автомобиль.</p>
            </SectionCard>
          )}

          {awaitingReview && (
            <ReviewForm
              bookingId={awaitingReview.id}
              carTitle={
                awaitingCar ? `${awaitingCar.brand} ${awaitingCar.model}` : "Завершённая аренда"
              }
            />
          )}

          <DocumentsBlock documents={profileData?.documents ?? []} />

          <FavoritesBlock />

          <section id="bookings" className="scroll-mt-24">
            <BookingHistoryList items={bookings} />
          </section>

          <ReviewsBlock reviews={profileData?.reviews ?? []} rating={profile?.rating ?? 0} />

          <Button
            variant="soft"
            className="w-full"
            onClick={async () => {
              await logout({});
              await queryClient.invalidateQueries({ queryKey: ["me"] });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Выйти
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
