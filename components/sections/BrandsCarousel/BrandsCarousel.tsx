import Image from "next/image";
import styles from "./BrandsCarousel.module.css";

const logos = [
  { src: "/logos/abc-news-logo.png", alt: "ABC News" },
  { src: "/logos/yahoo.png", alt: "Yahoo" },
  { src: "/logos/sxsw.png", alt: "SXSW" },
  { src: "/logos/ism.png", alt: "ISM" },
  { src: "/logos/gbs.png", alt: "GBS" },
  { src: "/logos/cs-monitor.png", alt: "The Christian Science Monitor" },
  { src: "/logos/senior-market-advisors.png", alt: "Senior Market Advisors" },
];

export default function BrandsCarousel() {
  const trackItems = [...logos, ...logos];

  return (
    <section className={styles.section} aria-label="As seen in">
      <div className="container">
        <div className={styles.header}>
          <p className={styles.kicker}>As seen in</p>
          <h2 className={styles.title}>Trusted by brands and featured in</h2>
        </div>
      </div>

      <div className={styles.marquee}>
        <div className={styles.track}>
          {trackItems.map((logo, idx) => (
            <div className={styles.item} key={`${logo.src}-${idx}`}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={220}
                height={80}
                className={styles.logo}
              />
            </div>
          ))}
        </div>
        <div className={styles.fadeLeft} aria-hidden="true" />
        <div className={styles.fadeRight} aria-hidden="true" />
      </div>
    </section>
  );
}
