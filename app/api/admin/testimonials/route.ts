import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ testimonials: data ?? [] });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { name, title, quote, image_url, sort_order } = body;

  if (!name || !title || !quote || sort_order == null) {
    return NextResponse.json(
      { error: "name, title, quote, and sort_order are required" },
      { status: 400 },
    );
  }

  const { data, error: dbError } = await supabase
    .from("testimonials")
    .insert([{ name, title, quote, image_url: image_url || null, sort_order }])
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ testimonial: data });
}

export async function PUT(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { id, name, title, quote, image_url, sort_order } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (title !== undefined) updates.title = title;
  if (quote !== undefined) updates.quote = quote;
  if (image_url !== undefined) updates.image_url = image_url || null;
  if (sort_order !== undefined) updates.sort_order = sort_order;

  const { error: dbError } = await supabase
    .from("testimonials")
    .update(updates)
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error: dbError } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
