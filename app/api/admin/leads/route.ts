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
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const leads = data ?? [];

  if (format === "csv") {
    const header = "Email,Name,Source,Status,Date\n";
    const rows = leads
      .map(
        (l) =>
          `"${l.email}","${l.name ?? ""}","${l.source ?? ""}","${l.status ?? ""}","${new Date(l.created_at).toISOString()}"`,
      )
      .join("\n");
    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({ leads });
}

export async function PATCH(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { id, status } = body;

  const validStatuses = ["new", "contacted", "qualified", "closed"];
  if (!id || !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: "id and valid status required" },
      { status: 400 },
    );
  }

  const { error: dbError } = await supabase
    .from("leads")
    .update({ status })
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
    .from("leads")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
