"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { usePathname } from "next/navigation";

import { MediaKitButton } from "../MediaKitProvider";

import styles from "./Footer.module.css";

const footerLinks = {
  navigation: [
    { label: "Experience", href: "/#experience", isAnchor: true },
    { label: "Podcast", href: "/#podcast", isAnchor: true },
    { label: "Testimonials", href: "/#testimonials", isAnchor: true },
    { label: "Gallery", href: "/#gallery", isAnchor: true },
    { label: "Contact", href: "/contact" },
    { label: "The Right Fit?", href: "/are-you-fit" },
  ],
};

const socialLinks = [
  {
    label: "LinkedIn",
    href: "http://www.linkedin.com/in/mseanagnew",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
  },
  {
    label: "Contact",
    href: "/contact",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
  {
    label: "IuvoCare",
    href: "https://iuvocare.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.9 12a5 5 0 0 1 5-5h3V5H8.9a7 7 0 1 0 0 14H12v-2H8.9a5 5 0 0 1-5-5zm6.1 1h4v-2h-4v2zm5-8H12v2h3a5 5 0 0 1 0 10h-3v2h3a7 7 0 1 0 0-14z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNewsletterError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newsletterEmail, source: "newsletter" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Unable to subscribe.");
      }

      setNewsletterSuccess(true);
      setNewsletterEmail("");
    } catch (error) {
      setNewsletterError(
        error instanceof Error ? error.message : "Unable to subscribe.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaHeadline}>
              Ready to Elevate Your Next Event?
            </h2>
            <p className={styles.ctaSubtext}>
              Book M. Sean Agnew for keynotes, panels, consulting, or media appearances.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/contact" className="btn btn-primary">
                Book Sean
              </Link>
              <MediaKitButton className="btn btn-outline-light">
                Download Media Kit
              </MediaKitButton>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainFooter}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.footerLogo} aria-label="M. Sean Agnew">
                <Image
                  src="/logos/sean-signature.png"
                  alt="M. Sean Agnew signature"
                  width={180}
                  height={48}
                  className={styles.footerLogoImage}
                />
              </Link>

              <p className={styles.footerTagline}>
                The HUMAN Signal in a noisy AI world.
              </p>
              <div className={styles.socialLinks}>
                {socialLinks.map((social) =>
                  social.href.startsWith("/") ? (
                    <Link
                      key={social.label}
                      href={social.href}
                      className={styles.socialLink}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </Link>
                  ) : (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ),
                )}
              </div>
            </div>

            <div className={styles.footerNav}>
              <h4 className={styles.footerNavTitle}>Navigation</h4>
              <ul className={styles.footerNavList}>
                {footerLinks.navigation.map((link) => (
                  <li key={link.href}>
                    {link.isAnchor && pathname === "/" ? (
                      <a href={link.href} className={styles.footerLink}>
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.footerNav}>
              <h4 className={styles.footerNavTitle}>Connect</h4>
              <ul className={styles.footerNavList}>
                <li>
                  <Link href="/contact" className={styles.footerLink}>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/are-you-fit" className={styles.footerLink}>
                    The Right Fit?
                  </Link>
                </li>
                <li>
                  <MediaKitButton className={styles.footerLink}>
                    Media Kit
                  </MediaKitButton>
                </li>
              </ul>
            </div>

            <div className={styles.footerNewsletter}>
              <h4 className={styles.footerNavTitle}>The Signal Brief</h4>
              <p className={styles.newsletterText}>
                Signal Seconds delivered daily. Clarity without the noise.
              </p>
              <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="Your email"
                  className={styles.newsletterInput}
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  required
                />
                <button type="submit" className={styles.newsletterBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Subscribe"}
                </button>
              </form>
              {newsletterError ? (
                <p className={styles.newsletterError}>{newsletterError}</p>
              ) : null}
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.copyright}>
              {currentYear} M. Sean Agnew. All rights reserved.
            </p>
            <p className={styles.philosophy}>
              &ldquo;It&apos;s not all about me.&rdquo;
            </p>
          </div>
        </div>
      </div>
      {newsletterSuccess ? (
        <div className={styles.newsletterModal} role="dialog" aria-modal="true">
          <div className={styles.newsletterModalCard}>
            <p className={styles.newsletterModalKicker}>You&apos;re in</p>
            <h3 className={styles.newsletterModalTitle}>Thanks for subscribing.</h3>
            <p className={styles.newsletterModalText}>
              We&apos;ll send new insights and updates straight to your inbox.
            </p>
            <button
              type="button"
              className={styles.newsletterModalBtn}
              onClick={() => setNewsletterSuccess(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </footer>
  );
}