import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { adminFetch } from "@/lib/server-fetch";

// Reads the auth cookie for display only — middleware is what actually
// protects this route tree, so a lookup failure here just falls back to a
// generic label instead of enforcing anything.
async function getAdminEmail(): Promise<string> {
  try {
    const res = await adminFetch("/api/auth/me");
    if (!res.ok) {
      return "Admin";
    }
    const json = await res.json();
    return json.data?.email ?? "Admin";
  } catch {
    return "Admin";
  }
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminEmail = await getAdminEmail();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopbar adminEmail={adminEmail} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
