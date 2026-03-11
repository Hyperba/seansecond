"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MediaKitButton } from "@/components/layout/MediaKitProvider";
import styles from "./Hero.module.css";

const heroImages = [
  "/news.jpeg",
  "/akido.jpeg",
  "/red-carpet.jpeg",
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.backgroundWrapper}>
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`${styles.backgroundImage} ${
              index === currentImageIndex ? styles.active : ""
            }`}
          >
            <Image
              src={image}
              alt=""
              fill
              priority={index === 0}
              quality={90}
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className="container">
          <div className={styles.contentInner}>
            <span className={styles.eyebrow}>Regret Is Preventable. Clarity Comes First</span>
            
            <h1 className={styles.headline}>
              Clarity That Turns
              <span className={styles.headlineAccent}> Responsibility Into Revenue</span>
            </h1>
            
            <p className={styles.subheadline}>
              M. Sean Agnew brings decades of real-world sales leadership, executive
              advisory experience, and disciplined decision frameworks to help founders,
              physicians, and executives communicate value clearly, act decisively under
              pressure, and scale without compromising who they are.
            </p>

            <div className={styles.quotes}>
              <p className={styles.quote}>“Confusion is expensive. Clarity pays dividends.”</p>
              <p className={styles.quote}>“Sales becomes service when clarity leads.”</p>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>25+</span>
                <span className={styles.statLabel}>Years Experience</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>100+</span>
                <span className={styles.statLabel}>Speaking Events</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>6</span>
                <span className={styles.statLabel}>Industries</span>
              </div>
            </div>

            <div className={styles.ctas}>
              <Link href="/contact" className="btn btn-primary">
                Book Sean
              </Link>
              <MediaKitButton className="btn btn-outline-light">
                Download Media Kit
              </MediaKitButton>
              <Link href="/are-you-fit" className={styles.textLink}>
                The Right Fit? →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.scrollIndicator}>
        <span className={styles.scrollText}>Scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
