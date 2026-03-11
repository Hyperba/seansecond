"use client";

import { useCallback, useEffect, useState } from "react";
import s from "../shared.module.css";

type TeamMember = {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
};


type Stats = {
  leads: number;
  contacts: number;
  unread: number;
  survey: number;
  testimonials: number;
  subscribers: number;
};

const ROLE_OPTIONS = ["owner", "admin", "viewer"];
const ROLE_COLORS: Record<string, string> = {
  owner: "#874ffb",
  admin: "#4285f4",
  viewer: "#718096",
};

export default function SettingsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editForm, setEditForm] = useState({ display_name: "", role: "" });
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const teamRes = await fetch("/api/admin/team");

      if (teamRes.ok) {
        const t = await teamRes.json();
        setMembers(t.members);
      }

      // Fetch stats
      const [leadsRes, contactsRes, surveyCountRes, testRes, subsRes] = await Promise.all([
        fetch("/api/admin/leads"),
        fetch("/api/admin/inbox"),
        fetch("/api/admin/survey"),
        fetch("/api/admin/testimonials"),
        fetch("/api/admin/subscribers"),
      ]);

      const leadsData = leadsRes.ok ? await leadsRes.json() : { leads: [] };
      const contactsData = contactsRes.ok ? await contactsRes.json() : { contacts: [] };
      const surveyData = surveyCountRes.ok ? await surveyCountRes.json() : { responseCount: 0 };
      const testData = testRes.ok ? await testRes.json() : { testimonials: [] };
      const subsData = subsRes.ok ? await subsRes.json() : { subscribers: [] };

      setStats({
        leads: leadsData.leads?.length ?? 0,
        contacts: contactsData.contacts?.length ?? 0,
        unread: contactsData.contacts?.filter((c: { is_read: boolean }) => !c.is_read).length ?? 0,
        survey: surveyData.responseCount ?? 0,
        testimonials: testData.testimonials?.length ?? 0,
        subscribers: subsData.subscribers?.length ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openEditMember = (m: TeamMember) => {
    setEditingMember(m);
    setEditForm({ display_name: m.display_name, role: m.role });
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingMember.id, ...editForm }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update");
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? { ...m, ...editForm } : m)),
      );
      setEditingMember(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={s.loadingState}>Loading settings…</div>;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Settings & Analytics</h1>
          <p className={s.pageDesc}>Team management and site-wide analytics overview.</p>
        </div>
      </div>

      {error && <div className={s.errorBanner}>{error}</div>}

      {/* ── Overview stats ── */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-10)" }}>
          {[
            { label: "Total Leads", value: stats.leads, color: "#874ffb" },
            { label: "Contacts", value: stats.contacts, color: "#38a169" },
            { label: "Unread", value: stats.unread, color: "#e53e3e" },
            { label: "Survey Responses", value: stats.survey, color: "#4285f4" },
            { label: "Testimonials", value: stats.testimonials, color: "#dd6b20" },
            { label: "Subscribers", value: stats.subscribers, color: "#718096" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)", fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Team members ── */}
      <div style={{ marginBottom: "var(--space-10)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Team Members</h2>

        {members.length === 0 ? (
          <div className={s.emptyState}>No team members found.</div>
        ) : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th style={{ width: 80 }}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{m.display_name}</td>
                    <td>{m.email}</td>
                    <td>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "2px 10px",
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        borderRadius: "var(--radius-full)",
                        background: `${ROLE_COLORS[m.role] ?? "#718096"}15`,
                        color: ROLE_COLORS[m.role] ?? "#718096",
                        textTransform: "capitalize",
                      }}>
                        {m.role}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{new Date(m.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className={`${s.btnSecondary} ${s.btnSmall}`}
                        onClick={() => openEditMember(m)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit team member modal ── */}
      {editingMember && (
        <div className={s.modalBackdrop} onClick={() => setEditingMember(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2 className={s.modalTitle}>Edit Team Member</h2>

            <div className={s.formGroup}>
              <label className={s.label}>Display Name</label>
              <input
                className={s.input}
                value={editForm.display_name}
                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
              />
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>Role</label>
              <select
                className={s.select}
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: 4 }}>
                Owner: full access + can edit roles · Admin: full access · Viewer: read-only
              </p>
            </div>

            <div className={s.modalActions}>
              <button type="button" className={s.btnSecondary} onClick={() => setEditingMember(null)}>Cancel</button>
              <button
                type="button"
                className={s.btnPrimary}
                disabled={saving || !editForm.display_name}
                onClick={handleSaveMember}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
