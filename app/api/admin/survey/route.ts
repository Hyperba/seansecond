import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("questions")
    .select("*")
    .order("question_group", { ascending: true })
    .order("question_order", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Also fetch survey response count
  const { count } = await supabase
    .from("survey_responses")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({ questions: data ?? [], responseCount: count ?? 0 });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { question_group, question_order, question_text } = body;

  if (!question_group || question_order == null || !question_text) {
    return NextResponse.json(
      { error: "question_group, question_order, and question_text are required" },
      { status: 400 },
    );
  }

  const { data, error: dbError } = await supabase
    .from("questions")
    .insert([{ question_group, question_order, question_text }])
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ question: data });
}

export async function PUT(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { id, question_group, question_order, question_text } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (question_group !== undefined) updates.question_group = question_group;
  if (question_order !== undefined) updates.question_order = question_order;
  if (question_text !== undefined) updates.question_text = question_text;

  const { error: dbError } = await supabase
    .from("questions")
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
    .from("questions")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
