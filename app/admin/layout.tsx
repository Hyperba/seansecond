import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLayout from "@/components/layout/AdminLayout/AdminLayout";
import { AdminProvider, AdminRole } from "@/contexts/AdminContext";

export const metadata = {
  title: "Admin | M. Sean Agnew",
};

export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch admin profile from admin_users table
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id, display_name, role, email")
    .eq("id", user.id)
    .single();

  if (!adminUser) {
    // Authenticated but not an admin — redirect to signout API route
    // (can't clear cookies from a Server Component, so use a Route Handler)
    redirect("/api/auth/signout");
  }

  const adminUserWithRole = {
    ...adminUser,
    role: adminUser.role as AdminRole,
  };

  return (
    <AdminProvider user={adminUserWithRole}>
      <AdminLayout user={adminUser}>{children}</AdminLayout>
    </AdminProvider>
  );
}
