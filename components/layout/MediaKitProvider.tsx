"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./MediaKitProvider.module.css";

const BUCKET = "media-kit";
const FILE_PATH = "MediaKit.pdf";

const MediaKitContext = createContext({
  open: () => {},
});

export function MediaKitButton({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const { open } = useContext(MediaKitContext);

  const handleClick = () => {
    onClick?.();
    open();
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}

export default function MediaKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaKitUrl, setMediaKitUrl] = useState<string | null>(null);

  const isValidEmail = useMemo(() => {
    return /\S+@\S+\.\S+/.test(email.trim());
  }, [email]);

  // Fetch the media kit URL from Supabase Storage when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchUrl = async () => {
      const supabase = createClient();
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(FILE_PATH);
      // Add cache-busting timestamp to force fresh download
      setMediaKitUrl(`${urlData.publicUrl}?t=${Date.now()}`);
    };
    fetchUrl();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const value = useMemo(() => ({
    open: () => setIsOpen(true),
  }), []);

  const handleDownload = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!isValidEmail || isSubmitting || !mediaKitUrl) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source: "media-kit" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Unable to save email.");
      }

      window.open(mediaKitUrl, "_blank", "noopener,noreferrer");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save email.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MediaKitContext.Provider value={value}>
      {children}
      <div className={`${styles.backdrop} ${isOpen ? styles.open : ""}`}>
        <div className={styles.modal} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.close}
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            ×
          </button>

          <p className={styles.kicker}>Media Kit</p>
          <h3 className={styles.title}>Download Sean’s Media Kit</h3>
          <p className={styles.subtext}>
            Enter your email to unlock the download. You can view it immediately after.
          </p>

          <label className={styles.label} htmlFor="media-kit-email">
            Email
          </label>
          <input
            id="media-kit-email"
            type="email"
            className={styles.input}
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          {isValidEmail && mediaKitUrl ? (
            <a
              className={styles.download}
              href={mediaKitUrl}
              download="MediaKit.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownload}
            >
              {isSubmitting ? "Saving..." : "Download Media Kit"}
            </a>
          ) : (
            <p className={styles.helper}>Enter a valid email to unlock the download.</p>
          )}

          {error ? <p className={styles.error}>{error}</p> : null}
        </div>
      </div>
    </MediaKitContext.Provider>
  );
}
