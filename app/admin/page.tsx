import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./admin.module.css";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch counts in parallel
  const [leadsRes, contactsRes, unreadRes, surveyRes, testimonialsRes, subscribersRes] =
    await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("contact-form").select("id", { count: "exact", head: true }),
      supabase
        .from("contact-form")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false),
      supabase.from("survey_responses").select("id", { count: "exact", head: true }),
      supabase.from("testimonials").select("id", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("source", "newsletter"),
    ]);

  const totalLeads = leadsRes.count ?? 0;
  const totalContacts = contactsRes.count ?? 0;
  const unreadContacts = unreadRes.count ?? 0;
  const totalSurvey = surveyRes.count ?? 0;
  const totalTestimonials = testimonialsRes.count ?? 0;
  const totalSubscribers = subscribersRes.count ?? 0;

  // Lead source breakdown for analytics
  const { data: allLeads } = await supabase.from("leads").select("source, status, created_at").order("created_at", { ascending: false });
  const leadSourceCounts: Record<string, number> = {};
  const leadStatusCounts: Record<string, number> = { new: 0, contacted: 0, qualified: 0, closed: 0 };
  let leadsThisWeek = 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const l of allLeads ?? []) {
    const src = l.source ?? "unknown";
    leadSourceCounts[src] = (leadSourceCounts[src] ?? 0) + 1;
    if (l.status && l.status in leadStatusCounts) leadStatusCounts[l.status]++;
    if (new Date(l.created_at).getTime() > weekAgo) leadsThisWeek++;
  }

  // Recent activity — latest 8 items across contacts, leads, survey
  const [recentContactsRes, recentLeadsRes, recentSurveyRes] = await Promise.all([
    supabase
      .from("contact-form")
      .select("name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("leads")
      .select("email, source, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("survey_responses")
      .select("name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  type ActivityItem = {
    type: "contact" | "lead" | "survey";
    label: string;
    time: string;
  };

  const activity: ActivityItem[] = [];

  for (const c of recentContactsRes.data ?? []) {
    activity.push({
      type: "contact",
      label: `${c.name} sent a message`,
      time: c.created_at,
    });
  }
  for (const l of recentLeadsRes.data ?? []) {
    activity.push({
      type: "lead",
      label: `${l.email} joined via ${l.source ?? "unknown"}`,
      time: l.created_at,
    });
  }
  for (const s of recentSurveyRes.data ?? []) {
    activity.push({
      type: "survey",
      label: `${s.name} completed the survey`,
      time: s.created_at,
    });
  }

  activity.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
  );

  const recentActivity = activity.slice(0, 8);

  return (
    <div className={styles.page}>
      <h1 className={styles.greeting}>Dashboard</h1>
      <p className={styles.subGreeting}>
        Overview of your site activity and management tools.
      </p>

      {/* ── Stats ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
            <svg className={styles.statIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
          </div>
          <span className={styles.statValue}>{totalLeads}</span>
          <span className={styles.statLabel}>Total Leads</span>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <svg className={styles.statIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></svg>
          </div>
          <span className={styles.statValue}>
            {unreadContacts}
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 400, color: "var(--color-text-muted)", marginLeft: 4 }}>
              / {totalContacts}
            </span>
          </span>
          <span className={styles.statLabel}>Unread Messages</span>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <svg className={styles.statIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          </div>
          <span className={styles.statValue}>{totalSurvey}</span>
          <span className={styles.statLabel}>Survey Responses</span>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
            <svg className={styles.statIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          </div>
          <span className={styles.statValue}>{totalSubscribers}</span>
          <span className={styles.statLabel}>Subscribers</span>
        </div>
      </div>

      {/* ── Analytics breakdown ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)", marginBottom: "var(--space-10)" }}>
        {/* Lead sources */}
        <div style={{ background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Lead Sources</div>
          {Object.keys(leadSourceCounts).length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>No leads yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {Object.entries(leadSourceCounts).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                <div key={source} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", width: 80, flexShrink: 0, textTransform: "capitalize" }}>{source}</span>
                  <div style={{ flex: 1, height: 18, background: "var(--color-background)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(count / totalLeads) * 100}%`, background: "var(--color-accent)", borderRadius: "var(--radius-md)", minWidth: 4 }} />
                  </div>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-primary)", width: 28 }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lead status + weekly */}
        <div style={{ background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Lead Pipeline</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
            {Object.entries(leadStatusCounts).map(([status, count]) => (
              <div key={status}>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text-primary)" }}>{count}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "capitalize" }}>{status}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--color-accent)" }}>{leadsThisWeek}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>New leads this week</div>
          </div>
        </div>
      </div>

      {/* ── Quick links ── */}
      <div className={styles.quickLinks}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.linksGrid}>
          <Link href="/admin/inbox" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <svg className={styles.linkIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></svg>
            </div>
            <div>
              <div className={styles.linkTitle}>Contacts Inbox</div>
              <div className={styles.linkDesc}>Read and manage messages</div>
            </div>
          </Link>

          <Link href="/admin/testimonials" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <svg className={styles.linkIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            </div>
            <div>
              <div className={styles.linkTitle}>Testimonials</div>
              <div className={styles.linkDesc}>Add or edit testimonials</div>
            </div>
          </Link>

          <Link href="/admin/survey" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <svg className={styles.linkIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            </div>
            <div>
              <div className={styles.linkTitle}>Edit Survey</div>
              <div className={styles.linkDesc}>Manage questions & groups</div>
            </div>
          </Link>

          <Link href="/admin/leads" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <svg className={styles.linkIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            </div>
            <div>
              <div className={styles.linkTitle}>All Leads</div>
              <div className={styles.linkDesc}>View and manage all leads</div>
            </div>
          </Link>

          <Link href="/admin/subscribers" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <svg className={styles.linkIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </div>
            <div>
              <div className={styles.linkTitle}>Subscribers</div>
              <div className={styles.linkDesc}>Newsletter list & CSV export</div>
            </div>
          </Link>

          <Link href="/admin/media-kit" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <svg className={styles.linkIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /><line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 12 15 15" /></svg>
            </div>
            <div>
              <div className={styles.linkTitle}>Media Kit</div>
              <div className={styles.linkDesc}>Replace the PDF document</div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.recentList}>
          {recentActivity.length === 0 ? (
            <div className={styles.emptyState}>No recent activity yet.</div>
          ) : (
            recentActivity.map((item, i) => (
              <div key={`${item.type}-${item.time}-${i}`} className={styles.recentItem}>
                <span
                  className={`${styles.recentDot} ${
                    item.type === "contact"
                      ? styles.dotContact
                      : item.type === "lead"
                        ? styles.dotLead
                        : styles.dotSurvey
                  }`}
                />
                <span className={styles.recentText}>{item.label}</span>
                <span className={styles.recentTime}>
                  {formatRelativeTime(item.time)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;

  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth}mo ago`;
}
