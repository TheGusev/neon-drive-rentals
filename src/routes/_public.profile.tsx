import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/profile/BottomNav";
export const Route = createFileRoute("/_public/profile")({ component: ProfileLayout });
function ProfileLayout() { return <div className="min-h-[60vh]"><div className="mx-auto max-w-md px-0 pb-28 pt-1 md:max-w-2xl md:pb-10"><Outlet /></div><BottomNav /></div>; }