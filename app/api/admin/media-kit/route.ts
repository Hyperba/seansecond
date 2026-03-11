import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

const BUCKET = "media-kit";
const FILE_PATH = "MediaKit.pdf";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  // Check if MediaKit.pdf exists in Supabase Storage
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list("", { limit: 1, search: FILE_PATH });

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  const fileInfo = files?.find((f) => f.name === FILE_PATH);
  const exists = !!fileInfo;
  const sizeKb = fileInfo ? Math.round((fileInfo.metadata?.size ?? 0) / 1024) : 0;

  // Get public URL
  let url = "";
  if (exists) {
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(FILE_PATH);
    url = urlData.publicUrl;
  }

  return NextResponse.json({ exists, sizeKb, url });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File must be under 20MB" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage (upsert = overwrite if exists)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(FILE_PATH, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(FILE_PATH);

    return NextResponse.json({
      ok: true,
      sizeKb: Math.round(file.size / 1024),
      url: urlData.publicUrl,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Upload failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { error: deleteError } = await supabase.storage
    .from(BUCKET)
    .remove([FILE_PATH]);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
