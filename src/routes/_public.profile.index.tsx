import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogIn, LogOut } from "lucide-react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CurrentRentalCard } from "@/components/profile/CurrentRentalCard";
import { FavoritesBlock } from "@/components/profile/FavoritesBlock";
import { ReviewsBlock } from "@/components/profile/ReviewsBlock";
import { ReviewForm } from "@/components/profile/ReviewForm";
import { SectionCard } from "@/components/checkout/SectionCard";
import { Button } from "@/components/ui/button";
import { myBookingsQueryOptions, myProfileQueryOptions, myReviewsQueryOptions } from "@/lib/queries";
import { clientLogout } from "@/lib/auth.functions";
import { useCarLookup } from "@/state/AppDataContext";

export const Route = createFileRoute("/_public/profile/")({
  head: () => ({ meta: [
    { title: "Личный кабинет — NSK-RENT" }, { name: "description", content: "Текущая аренда и данные клиента NSK-RENT." },
    { property: "og:title", content: "Личный кабинет — NSK-RENT" }, { property: "og:description", content: "Управление текущей арендой автомобиля." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" },
  ] }), component: ProfileOverview,
});

function ProfileOverview() {
  const getCarById = useCarLookup(); const queryClient = useQueryClient(); const logout = useServerFn(clientLogout);
  const { data, isLoading } = useQuery(myBookingsQueryOptions()); const { data: profileData } = useQuery(myProfileQueryOptions());
  const authenticated = data?.authenticated ?? false; const bookings = data?.bookings ?? [];
  const active = bookings.find((b) => b.status === "active" || b.status === "paid"); const car = active ? getCarById(active.carId) : undefined;
  const { data: myReviews = [] } = useQuery({ ...myReviewsQueryOptions(), enabled: authenticated });
  const reviewed = new Set(myReviews.map((review) => review.bookingId));
  const awaiting = bookings.find((b) => (b.status === "completed" || Boolean(b.returnedAt)) && !reviewed.has(b.id));
  const awaitingCar = awaiting ? getCarById(awaiting.carId) : undefined;
  if (!isLoading && !authenticated) return <LoginPrompt />;
  return <div className="space-y-3"><ProfileHeader name={profileData?.profile?.name} rating={0} reviewsCount={0} />
    {active && car ? <CurrentRentalCard booking={active} car={car} /> : <SectionCard title="Текущая аренда" className="bg-card ring-1 ring-border"><p className="text-sm text-muted-foreground">Нет активных аренд.</p><Button asChild className="mt-3"><Link to="/cars">Выбрать автомобиль</Link></Button></SectionCard>}
    {awaiting && <ReviewForm bookingId={awaiting.id} carTitle={awaitingCar ? `${awaitingCar.brand} ${awaitingCar.model}` : "Завершённая аренда"} />}
    <FavoritesBlock /><ReviewsBlock reviews={myReviews} rating={myReviews.length ? myReviews.reduce((sum, review) => sum + review.rating, 0) / myReviews.length : 0} />
    <Button variant="soft" className="w-full" onClick={async () => { await logout({}); await queryClient.invalidateQueries({ queryKey: ["me"] }); }}><LogOut className="mr-2 h-4 w-4" />Выйти</Button>
  </div>;
}
function LoginPrompt() { return <div className="py-16 text-center"><h1 className="text-2xl font-semibold">Личный кабинет</h1><p className="mt-2 text-sm text-muted-foreground">Войдите, чтобы увидеть аренды и документы.</p><Button asChild className="mt-6 w-full"><Link to="/login"><LogIn className="mr-2 h-4 w-4" />Войти по SMS</Link></Button></div>; }