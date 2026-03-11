"use client";

import { useEffect, useState } from "react";
import styles from "./Testimonials.module.css";

type Testimonial = {
  id: string;
  name: string;
  title: string;
  quote: string;
  image_url: string | null;
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        setTestimonials(data.testimonials || []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <section className={styles.section} aria-label="Testimonials">
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Testimonials</p>
            <h2 className={styles.title}>Words from leaders who have felt the shift.</h2>
          </div>
          <p className={styles.lede}>
            Real stories from executives, founders, and creators who took clarity into action.
          </p>
        </div>

        <div className={styles.grid}>
          {isLoading ? (
            <div className={styles.loading}>Loading testimonials...</div>
          ) : (
            testimonials.map((t) => (
              <figure key={t.id} className={styles.card}>
                <blockquote className={styles.quote}>“{t.quote}”</blockquote>
                <figcaption className={styles.meta}>
                  {t.image_url ? (
                    <img
                      src={t.image_url}
                      alt={`${t.name} headshot`}
                      className={styles.avatar}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.avatarFallback}>{t.name.charAt(0)}</div>
                  )}
                  <div>
                    <p className={styles.name}>{t.name}</p>
                    <p className={styles.titleMeta}>{t.title}</p>
                  </div>
                </figcaption>
              </figure>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
