"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MediaKitButton } from "../MediaKitProvider";

import styles from "./Navbar.module.css";

const navLinks = [
  { label: "Experience", href: "/#experience", isAnchor: true },
  { label: "Podcast", href: "/#podcast", isAnchor: true },
  { label: "Testimonials", href: "/#testimonials", isAnchor: true },
  { label: "Gallery", href: "/#gallery", isAnchor: true },
  { label: "Contact", href: "/contact", isAnchor: false },
  { label: "The Right Fit?", href: "/are-you-fit", isAnchor: false },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isSolid = isScrolled || pathname !== "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ""} ${
        isSolid ? styles.solid : ""
      }`}
    >
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} aria-label="M. Sean Agnew">
          <span className={styles.logoMark}>
            <Image
              src="/logos/sean-signature.png"
              alt="M. Sean Agnew signature"
              width={160}
              height={44}
              className={styles.logoImage}
              priority
            />
            <span className={styles.logoTagline}>
              The HUMAN Signal in a noisy AI world.
            </span>
          </span>
        </Link>

        <ul className={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.isAnchor && pathname === "/" ? (
                <a href={link.href} className={styles.navLink}>
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className={styles.navLink}>
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.navActions}>
          <MediaKitButton className={`btn btn-primary ${styles.ctaBtn}`}>
            Media Kit
          </MediaKitButton>
        </div>

        <button
          className={`${styles.mobileMenuBtn} ${isMobileMenuOpen ? styles.active : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </nav>

      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ""}`}>
        <ul className={styles.mobileNavLinks}>
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.isAnchor && pathname === "/" ? (
                <a
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <MediaKitButton
          className={`btn btn-primary ${styles.mobileCta}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Media Kit
        </MediaKitButton>
      </div>
    </header>
  );
}