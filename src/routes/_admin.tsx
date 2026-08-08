import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { adminSessionStatus } from "@/lib/adminGate.functions";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: async () => {
    const { unlocked } = await adminSessionStatus();
    if (!unlocked) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
});
