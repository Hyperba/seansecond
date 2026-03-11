"use client";

import { useCallback, useEffect, useState } from "react";
import s from "../shared.module.css";

type Subscriber = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subscribers");
      if (!res.ok) throw new Error("Failed to load subscribers");
      const data = await res.json();
      setSubscribers(data.subscribers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleExportCsv = () => {
    window.open("/api/admin/subscribers?format=csv", "_blank");
  };

  if (loading) return <div className={s.loadingState}>Loading subscribers…</div>;
  if (error) return <div className={s.errorBanner}>{error}</div>;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Subscribers</h1>
          <p className={s.pageDesc}>{subscribers.length} newsletter subscribers</p>
        </div>
        <div className={s.headerActions}>
          <button
            type="button"
            className={s.btnSecondary}
            onClick={handleExportCsv}
            disabled={subscribers.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div className={s.emptyState}>No subscribers yet.</div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id}>
                  <td style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
                    {sub.email}
                  </td>
                  <td>{sub.name || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(sub.created_at).toLocaleDateString()}
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
