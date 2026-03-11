"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import s from "../shared.module.css";

const BUCKET = "media-kit";
const FILE_PATH = "MediaKit.pdf";

export default function MediaKitPage() {
  const { canWrite } = useAdmin();
  const [exists, setExists] = useState(false);
  const [sizeKb, setSizeKb] = useState(0);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const supabase = createClient();

      // List files to check existence and get metadata
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET)
        .list("", { limit: 10, search: FILE_PATH });

      if (listError) throw new Error(listError.message);

      const fileInfo = files?.find((f) => f.name === FILE_PATH);
      const fileExists = !!fileInfo;

      setExists(fileExists);

      if (fileExists) {
        // Get file size from metadata or default to 0
        const size = fileInfo.metadata?.size ?? 0;
        setSizeKb(Math.round(size / 1024));

        // Get public URL with cache-busting
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(FILE_PATH);
        setUrl(`${urlData.publicUrl}?t=${Date.now()}`);
      } else {
        setSizeKb(0);
        setUrl("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const uploadFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File must be under 20 MB.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      // Upload directly to Supabase Storage (bypasses Next.js body size limit)
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(FILE_PATH, file, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) throw new Error(uploadError.message);

      // Get public URL with cache-busting
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(FILE_PATH);

      setExists(true);
      setSizeKb(Math.round(file.size / 1024));
      setUrl(`${urlData.publicUrl}?t=${Date.now()}`);
      setSuccess("Media kit uploaded successfully!");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the media kit?")) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      const { error: deleteError } = await supabase.storage
        .from(BUCKET)
        .remove([FILE_PATH]);

      if (deleteError) throw new Error(deleteError.message);

      setExists(false);
      setSizeKb(0);
      setUrl("");
      setSuccess("Media kit deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className={s.loadingState}>Checking media kit…</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Media Kit</h1>
          <p className={s.pageDesc}>Manage the downloadable media kit PDF that visitors receive.</p>
        </div>
      </div>

      {error && <div className={s.errorBanner}>{error}</div>}
      {success && <div className={s.successBanner}>{success}</div>}

      {/* Current file card */}
      <div style={{ background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
          Current File
        </div>
        {exists ? (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <div style={{ width: 52, height: 52, borderRadius: "var(--radius-lg)", background: "rgba(229, 62, 62, 0.06)", border: "1px solid rgba(229, 62, 62, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "var(--text-sm)" }}>
                MediaKit.pdf
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>
                {sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`}
              </div>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <a href={url} target="_blank" rel="noopener noreferrer" className={s.btnSecondary} style={{ fontSize: "var(--text-xs)" }}>
                Preview
              </a>
              <a href={url} download="MediaKit.pdf" className={s.btnSecondary} style={{ fontSize: "var(--text-xs)" }}>
                Download
              </a>
              <button
                type="button"
                className={s.btnSecondary}
                style={{ fontSize: "var(--text-xs)", color: "#e53e3e" }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{ width: 52, height: 52, borderRadius: "var(--radius-lg)", background: "var(--color-background)", border: "1px dashed var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 500, color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>No file uploaded</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>Upload a PDF below to get started.</div>
            </div>
          </div>
        )}
      </div>

      {/* Upload zone */}
      <div
        style={{
          background: dragOver ? "rgba(135, 79, 251, 0.04)" : "var(--color-background-alt)",
          border: `2px dashed ${dragOver ? "var(--color-accent)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-10) var(--space-6)",
          textAlign: "center",
          transition: "all 0.15s ease",
          cursor: "pointer",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <div style={{ marginBottom: "var(--space-3)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "var(--color-accent)" : "var(--color-text-muted)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 4 }}>
          {uploading ? "Uploading…" : "Drop a PDF here or click to browse"}
        </p>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
          PDF only · Max 20 MB · Replaces the existing file immediately
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
