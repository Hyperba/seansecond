"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./AdminLayout.module.css";

type AdminUser = {
  display_name: string;
  role: string;
  email: string;
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/inbox", label: "Inbox", icon: InboxIcon },
  { href: "/admin/leads", label: "Leads", icon: LeadsIcon },
  { href: "/admin/subscribers", label: "Subscribers", icon: SubscribersIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: TestimonialsIcon },
  { href: "/admin/survey", label: "Survey", icon: SurveyIcon },
  { href: "/admin/media-kit", label: "Media Kit", icon: MediaKitIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AdminUser | null;
}) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const requestLogout = () => setShowLogoutConfirm(true);

  const initials = user?.display_name
    ? user.display_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className={styles.layout}>
      {/* ── Desktop sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <Image
            src="/logos/sean-signature.png"
            alt="M. Sean Agnew"
            width={140}
            height={32}
            className={styles.sidebarLogo}
          />
          <span className={styles.sidebarLabel}>Admin</span>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <item.icon className={styles.navIcon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{initials}</div>
            <div>
              <div className={styles.userName}>
                {user?.display_name ?? "Admin"}
              </div>
              <div className={styles.userRole}>{user?.role ?? "admin"}</div>
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={requestLogout}
          >
            <LogoutIcon className={styles.navIcon} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>{children}</main>

      {/* ── Mobile tab bar ── */}
      <div className={styles.tabBar}>
        <div className={styles.tabBarInner}>
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ""}`}
              >
                <item.icon className={styles.tabIcon} />
                {item.label}
              </Link>
            );
          })}
          <MoreMenu pathname={pathname} onLogout={requestLogout} />
        </div>
      </div>
      {/* ── Sign-out confirmation modal ── */}
      {showLogoutConfirm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "var(--space-4)" }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            style={{ background: "var(--color-background-alt)", borderRadius: "var(--radius-xl)", padding: "var(--space-8)", maxWidth: 400, width: "100%", boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>Sign Out?</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginBottom: "var(--space-6)", lineHeight: 1.6 }}>Are you sure you want to sign out of the admin portal?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: "var(--space-2) var(--space-4)", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-secondary)", background: "var(--color-background-alt)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-primary)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{ padding: "var(--space-2) var(--space-4)", fontSize: "var(--text-sm)", fontWeight: 600, color: "#fff", background: "#e53e3e", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-primary)" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mobile "More" overflow menu ── */
function MoreMenu({
  pathname,
  onLogout,
}: {
  pathname: string;
  onLogout: () => void;
}) {
  const overflowItems = NAV_ITEMS.slice(5);
  const isAnyActive = overflowItems.some((item) =>
    pathname.startsWith(item.href),
  );

  return (
    <div style={{ position: "relative" }}>
      <details style={{ listStyle: "none" }}>
        <summary
          className={`${styles.tabItem} ${isAnyActive ? styles.tabItemActive : ""}`}
          style={{ listStyle: "none" }}
        >
          <MoreIcon className={styles.tabIcon} />
          More
        </summary>
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            right: 0,
            marginBottom: 8,
            background: "var(--color-background-dark)",
            border: "1px solid var(--color-border-dark)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-2)",
            minWidth: 160,
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {overflowItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                style={{ padding: "var(--space-2) var(--space-4)" }}
              >
                <item.icon className={styles.navIcon} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            className={styles.navItem}
            onClick={onLogout}
            style={{
              padding: "var(--space-2) var(--space-4)",
              color: "#e53e3e",
            }}
          >
            <LogoutIcon className={styles.navIcon} />
            Sign Out
          </button>
        </div>
      </details>
    </div>
  );
}

/* ── SVG Icons ── */
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}

function LeadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function SubscribersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function TestimonialsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function SurveyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function MediaKitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
      <polyline points="13 2 13 9 20 9" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9 15 12 12 15 15" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
