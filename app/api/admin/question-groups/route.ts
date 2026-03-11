import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("question_groups")
    .select("*")
    .order("sort_order", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ groups: data ?? [] });
}

export async function POST(request: Request) {
  const { error, supabase, admin } = await requireAdmin();
  if (error) return error;

  // Check if user can write
  if (admin?.role === "viewer") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const body = await request.json();
  const { name, sort_order } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("question_groups")
    .insert([{ name, sort_order: sort_order ?? 0 }])
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ group: data });
}

export async function PUT(request: Request) {
  const { error, supabase, admin } = await requireAdmin();
  if (error) return error;

  if (admin?.role === "viewer") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const body = await request.json();
  const { id, name, sort_order } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (sort_order !== undefined) updates.sort_order = sort_order;

  const { error: dbError } = await supabase
    .from("question_groups")
    .update(updates)
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const { error, supabase, admin } = await requireAdmin();
  if (error) return error;

  if (admin?.role === "viewer") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  // Batch update sort orders
  const body = await request.json();
  const { updates } = body as { updates: { id: string; sort_order: number }[] };

  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json({ error: "updates array is required" }, { status: 400 });
  }

  for (const { id, sort_order } of updates) {
    const { error: dbError } = await supabase
      .from("question_groups")
      .update({ sort_order })
      .eq("id", id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { error, supabase, admin } = await requireAdmin();
  if (error) return error;

  if (admin?.role === "viewer") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error: dbError } = await supabase
    .from("question_groups")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
