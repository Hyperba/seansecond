import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export type AdminUser = {
  id: string;
  email: string;
  display_name: string;
  role: string;
};

/**
 * Verify the current request is from an authenticated admin user.
 * Returns { admin, supabase } on success, or a NextResponse error.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      admin: null,
      supabase,
    };
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .single();

  if (!admin) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      admin: null,
      supabase,
    };
  }

  return { error: null, admin: admin as AdminUser, supabase };
}
