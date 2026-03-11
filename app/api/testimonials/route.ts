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

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, title, quote, image_url")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Unable to fetch testimonials." },
      { status: 500 },
    );
  }

  return NextResponse.json({ testimonials: data || [] });
}
