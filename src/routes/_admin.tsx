import { Link, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { adminSessionStatus } from "@/lib/adminGate.functions";
import { AdminErrorScreen, AdminPendingScreen } from "@/components/admin/AdminErrorScreen";

export const Route = createFileRoute("/_admin")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  ssr: false,
  beforeLoad: async () => {
    const { unlocked } = await adminSessionStatus();
    if (!unlocked) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
  pendingComponent: AdminPendingScreen,
  errorComponent: AdminRouteError,
});

function AdminRouteError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <AdminErrorScreen
      error={error}
      onRetry={() => {
        router.invalidate();
        reset();
      }}
      extra={
        <Link to="/admin/diagnostics" className="text-sm underline">
          Открыть диагностику
        </Link>
      }
    />
  );
}
