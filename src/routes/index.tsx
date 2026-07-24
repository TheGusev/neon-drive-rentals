import { createFileRoute } from "@tanstack/react-router";
import heroDrive from "@/assets/cars/hero-drive.jpg";
import { HomeDesktop, HomeMobile } from "@/components/home/HomeStage";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "NSK-RENT — Аренда японских кей-каров в Новосибирске" },
      {
        name: "description",
        content:
          "Прокат японских кей-каров в Новосибирске. Онлайн-бронирование за 3 минуты, честные цены, поддержка 24/7.",
      },
      { property: "og:title", content: "NSK-RENT — Аренда японских кей-каров в Новосибирске" },
      {
        property: "og:description",
        content: "Кей-кары в аренду в Новосибирске. Быстрое бронирование онлайн.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Home() {
  return (
    <>
      <div className="hidden md:block">
        <HomeDesktop heroImage={heroDrive} />
      </div>
      <div className="md:hidden">
        <HomeMobile heroImage={heroDrive} />
      </div>
    </>
  );
}
