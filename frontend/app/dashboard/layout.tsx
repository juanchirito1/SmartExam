import Sidebar from "@/components/dashboard/sidebar";
import Navbar from "@/components/dashboard/navbar";
import DashboardGuard from "@/components/auth/dashboard-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1">
          {/* Tu header actual */}

          <main>{children}</main>
        </div>
      </div>
    </DashboardGuard>
  );
}
