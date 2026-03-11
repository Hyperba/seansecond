import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeEmail, sanitizeText, validateEmail, getClientIp, detectHoneypot } from "@/lib/security";

type LeadPayload = {
  email: string;
  name?: string;
  source?: string;
  website?: string;
};

const limiter = rateLimit("leads", 5, 300000);

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const { success } = limiter.check(clientIp);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as LeadPayload;

    if (detectHoneypot(body)) {
      return NextResponse.json({ ok: true });
    }

    const email = sanitizeEmail(body.email || "");
    const name = body.name ? sanitizeText(body.name, 100) : null;
    const source = sanitizeText(body.source || "media-kit", 50);

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Missing required environment configuration." },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const payload: { email: string; source: string; name?: string | null } = {
      email,
      source,
    };

    if (name) {
      payload.name = name;
    }

    const { error } = await supabase
      .from("leads")
      .upsert([payload], { onConflict: "email" });

    if (error) {
      return NextResponse.json(
        { error: "Unable to save lead.", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to process request.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
