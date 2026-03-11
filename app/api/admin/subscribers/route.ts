import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const { data, error: dbError } = await supabase
    .from("leads")
    .select("*")
    .eq("source", "newsletter")
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const subscribers = data ?? [];

  if (format === "csv") {
    const header = "Email,Name,Date\n";
    const rows = subscribers
      .map(
        (s) =>
          `"${s.email}","${s.name ?? ""}","${new Date(s.created_at).toISOString()}"`,
      )
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="subscribers-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({ subscribers });
}
