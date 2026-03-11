"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import s from "../shared.module.css";

type Testimonial = {
  id: string;
  created_at: string;
  name: string;
  title: string;
  quote: string;
  image_url: string | null;
  sort_order: number;
};

const EMPTY: Omit<Testimonial, "id" | "created_at"> = {
  name: "",
  title: "",
  quote: "",
  image_url: "",
  sort_order: 0,
};

export default function TestimonialsPage() {
  const { canWrite } = useAdmin();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to load testimonials");
      const data = await res.json();
      setItems(data.testimonials);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, sort_order: items.length + 1 });
    setCreating(true);
  };

  const openEdit = (t: Testimonial) => {
    setCreating(false);
    setEditing(t);
    setForm({
      name: t.name,
      title: t.title,
      quote: t.quote,
      image_url: t.image_url ?? "",
      sort_order: t.sort_order,
    });
  };

  const closeModal = () => {
    setEditing(null);
    setCreating(false);
    setForm(EMPTY);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (creating) {
        const res = await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Failed to create");
        }
        const { testimonial } = await res.json();
        setItems((prev) => [...prev, testimonial]);
      } else if (editing) {
        const res = await fetch("/api/admin/testimonials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Failed to update");
        }
        setItems((prev) =>
          prev.map((t) =>
            t.id === editing.id ? { ...t, ...form, image_url: form.image_url || null } : t,
          ),
        );
      }
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((t) => t.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/testimonials/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setForm({ ...form, image_url: data.url });
      if (imageRef.current) imageRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) return <div className={s.loadingState}>Loading testimonials…</div>;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Testimonials</h1>
          <p className={s.pageDesc}>{items.length} testimonials on the site</p>
        </div>
        <div className={s.headerActions}>
          {canWrite && (
            <button type="button" className={s.btnPrimary} onClick={openCreate}>
              + Add Testimonial
            </button>
          )}
        </div>
      </div>

      {error && <div className={s.errorBanner}>{error}</div>}

      {items.length === 0 ? (
        <div className={s.emptyState}>No testimonials yet.</div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Name</th>
                <th>Title</th>
                <th>Quote</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>{t.sort_order}</td>
                  <td style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {t.name}
                  </td>
                  <td>{t.title}</td>
                  <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.quote}
                  </td>
                  <td>
                    {canWrite && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className={`${s.btnSecondary} ${s.btnSmall}`}
                          onClick={() => openEdit(t)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`${s.btnDanger} ${s.btnSmall}`}
                          onClick={() => handleDelete(t.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {(creating || editing) && (
        <div className={s.modalBackdrop} onClick={closeModal}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>
              {creating ? "Add Testimonial" : "Edit Testimonial"}
            </h2>

            <div className={s.formGroup}>
              <label className={s.label}>Name</label>
              <input
                className={s.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>Title / Role</label>
              <input
                className={s.input}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>Quote</label>
              <textarea
                className={s.textarea}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
              />
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>Image (optional)</label>
              
              {/* Current image preview */}
              {form.image_url && (
                <div style={{ marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <img
                    src={form.image_url}
                    alt="Preview"
                    style={{ width: 64, height: 64, borderRadius: "var(--radius-full)", objectFit: "cover", border: "1px solid var(--color-border)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", wordBreak: "break-all" }}>
                      {form.image_url.length > 50 ? `...${form.image_url.slice(-50)}` : form.image_url}
                    </div>
                    <button
                      type="button"
                      style={{ fontSize: "var(--text-xs)", color: "#e53e3e", background: "none", border: "none", padding: 0, cursor: "pointer", marginTop: 4 }}
                      onClick={() => setForm({ ...form, image_url: "" })}
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              )}

              {/* Upload zone */}
              <div
                style={{
                  background: "var(--color-background)",
                  border: "1px dashed var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={() => imageRef.current?.click()}
              >
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
                  {uploadingImage ? "Uploading…" : "Click to upload image"}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: 4 }}>
                  JPEG, PNG, WebP, GIF · Max 5MB
                </p>
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </div>

              {/* Or enter URL manually */}
              <div style={{ marginTop: "var(--space-3)" }}>
                <input
                  className={s.input}
                  value={form.image_url ?? ""}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="Or paste image URL directly"
                  style={{ fontSize: "var(--text-xs)" }}
                />
              </div>
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>Sort Order</label>
              <input
                className={s.input}
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: Number(e.target.value) })
                }
              />
            </div>

            <div className={s.modalActions}>
              <button type="button" className={s.btnSecondary} onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className={s.btnPrimary}
                disabled={saving || !form.name || !form.title || !form.quote}
                onClick={handleSave}
              >
                {saving ? "Saving…" : creating ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
