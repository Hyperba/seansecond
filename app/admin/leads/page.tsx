"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import s from "../shared.module.css";

type Lead = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
  source: string | null;
  status: string;
};

const STATUS_OPTIONS = ["new", "contacted", "qualified", "closed"] as const;

const STATUS_BADGE: Record<string, string> = {
  new: s.badgeNew,
  contacted: s.badgeContacted,
  qualified: s.badgeQualified,
  closed: s.badgeClosed,
};

export default function LeadsPage() {
  const { canWrite } = useAdmin();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads");
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads(data.leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l)),
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead permanently?")) return;
    await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const sources = Array.from(new Set(leads.map((l) => l.source ?? "unknown")));

  const filtered = leads.filter((l) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (filterSource !== "all" && (l.source ?? "unknown") !== filterSource)
      return false;
    return true;
  });

  if (loading) return <div className={s.loadingState}>Loading leads…</div>;
  if (error) return <div className={s.errorBanner}>{error}</div>;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>All Leads</h1>
          <p className={s.pageDesc}>{leads.length} total leads</p>
        </div>
        <div className={s.headerActions}>
          <select
            className={s.select}
            style={{ width: "auto" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </option>
            ))}
          </select>
          <select
            className={s.select}
            style={{ width: "auto" }}
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
          >
            <option value="all">All Sources</option>
            {sources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={s.btnSecondary}
            onClick={() => window.open("/api/admin/leads?format=csv", "_blank")}
            disabled={leads.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={s.emptyState}>No leads match the current filters.</div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Source</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
                    {l.email}
                  </td>
                  <td>{l.name || "—"}</td>
                  <td>{l.source || "—"}</td>
                  <td>
                    <select
                      className={s.select}
                      style={{ width: "auto", padding: "2px 8px", fontSize: "var(--text-xs)" }}
                      value={l.status}
                      onChange={(e) => updateStatus(l.id, e.target.value)}
                      disabled={!canWrite}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {canWrite && (
                      <button
                        type="button"
                        className={`${s.btnDanger} ${s.btnSmall}`}
                        onClick={() => handleDelete(l.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
