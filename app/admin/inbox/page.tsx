"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import s from "../shared.module.css";

type Contact = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  is_read: boolean;
};

export default function InboxPage() {
  const { canWrite } = useAdmin();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inbox");
      if (!res.ok) throw new Error("Failed to load contacts");
      const data = await res.json();
      setContacts(data.contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const toggleRead = async (id: string, is_read: boolean) => {
    await fetch("/api/admin/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_read }),
    });
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_read } : c)),
    );
    if (selected?.id === id) setSelected((p) => (p ? { ...p, is_read } : p));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    await fetch(`/api/admin/inbox?id=${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const openContact = (c: Contact) => {
    setSelected(c);
    if (!c.is_read) toggleRead(c.id, true);
  };

  const unreadCount = contacts.filter((c) => !c.is_read).length;

  if (loading) return <div className={s.loadingState}>Loading inbox…</div>;
  if (error) return <div className={s.errorBanner}>{error}</div>;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>
            Contacts Inbox
            {unreadCount > 0 && (
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 400, color: "var(--color-accent)", marginLeft: 8 }}>
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className={s.pageDesc}>
            {contacts.length} total · {unreadCount} unread · {contacts.length - unreadCount} read
          </p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className={s.emptyState}>No messages yet.</div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  style={{ cursor: "pointer", fontWeight: c.is_read ? 400 : 600 }}
                  onClick={() => openContact(c)}
                >
                  <td style={{ textAlign: "center" }}>
                    {!c.is_read && (
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--color-accent)" }} />
                    )}
                  </td>
                  <td style={{ color: "var(--color-text-primary)", fontWeight: c.is_read ? 400 : 600 }}>
                    {c.name}
                  </td>
                  <td>{c.email}</td>
                  <td>{c.company || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`${s.badge} ${c.is_read ? s.badgeRead : s.badgeUnread}`}>
                      {c.is_read ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td>
                    {canWrite && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className={`${s.btnSecondary} ${s.btnSmall}`}
                          onClick={(e) => { e.stopPropagation(); toggleRead(c.id, !c.is_read); }}
                        >
                          {c.is_read ? "Unread" : "Read"}
                        </button>
                        <button
                          type="button"
                          className={`${s.btnDanger} ${s.btnSmall}`}
                          onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
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

      {/* ── Detail modal ── */}
      {selected && (
        <div className={s.modalBackdrop} onClick={() => setSelected(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-6)" }}>
              <div>
                <h2 className={s.modalTitle} style={{ marginBottom: 4 }}>{selected.name}</h2>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                  {selected.email}{selected.company ? ` · ${selected.company}` : ""}
                </p>
              </div>
              <span className={`${s.badge} ${selected.is_read ? s.badgeRead : s.badgeUnread}`}>
                {selected.is_read ? "Read" : "Unread"}
              </span>
            </div>

            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "var(--space-4)", display: "flex", gap: "var(--space-4)" }}>
              <span>Received {new Date(selected.created_at).toLocaleString()}</span>
            </div>

            <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)", marginBottom: "var(--space-6)" }}>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--color-text-primary)", fontSize: "var(--text-sm)" }}>
                {selected.message}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-3)" }}>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  type="button"
                  className={s.btnSecondary}
                  onClick={() => toggleRead(selected.id, !selected.is_read)}
                >
                  Mark as {selected.is_read ? "Unread" : "Read"}
                </button>
                <button
                  type="button"
                  className={s.btnDanger}
                  onClick={() => handleDelete(selected.id)}
                >
                  Delete
                </button>
              </div>
              <button type="button" className={s.btnSecondary} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
