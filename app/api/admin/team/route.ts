import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("admin_users")
    .select("id, email, display_name, role, created_at")
    .order("created_at", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ members: data ?? [] });
}

export async function PATCH(request: Request) {
  const { error, admin, supabase } = await requireAdmin();
  if (error) return error;

  if (admin?.role !== "owner") {
    return NextResponse.json(
      { error: "Only owners can edit team member roles" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { id, role, display_name } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (role !== undefined) {
    const validRoles = ["owner", "admin", "viewer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    updates.role = role;
  }
  if (display_name !== undefined) updates.display_name = display_name;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { error: dbError } = await supabase
    .from("admin_users")
    .update(updates)
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
