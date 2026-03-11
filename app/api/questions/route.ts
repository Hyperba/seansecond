import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Missing required environment configuration." },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch question groups for ordering
  const { data: groups } = await supabase
    .from("question_groups")
    .select("name, sort_order")
    .order("sort_order", { ascending: true });

  // Fetch questions
  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .order("question_order", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Unable to fetch questions." },
      { status: 500 },
    );
  }

  // Sort questions by group order, then by question_order
  const groupOrderMap = new Map<string, number>();
  (groups ?? []).forEach((g, idx) => {
    groupOrderMap.set(g.name, g.sort_order ?? idx);
  });

  const sortedQuestions = (questions || []).sort((a, b) => {
    const aGroupOrder = groupOrderMap.get(a.question_group) ?? 999;
    const bGroupOrder = groupOrderMap.get(b.question_group) ?? 999;
    if (aGroupOrder !== bGroupOrder) return aGroupOrder - bGroupOrder;
    return a.question_order - b.question_order;
  });

  return NextResponse.json({ questions: sortedQuestions });
}
