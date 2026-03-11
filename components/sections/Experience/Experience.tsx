import Image from "next/image";
import Link from "next/link";
import styles from "./Experience.module.css";

const experiences = [
  {
    title: "Military Leadership",
    description:
      "U.S. Army Desert Shield/Desert Storm veteran with a mission-first mindset and calm execution under pressure.",
    image: "/military.jpeg",
    href: "/contact",
    label: "Service",
  },
  {
    title: "Speaking & Leadership",
    description:
      "Keynotes, panels, and moderation that move rooms from inspired to committed action.",
    image: "/speaking.jpeg",
    href: "/contact",
    label: "Stage",
  },
  {
    title: "Podcast & Media",
    description:
      "High-energy conversations on leadership, business, and personal development—built for modern audiences.",
    image: "/podcast.jpeg",
    href: "/contact",
    label: "Media",
  },
  {
    title: "Consulting & Advisory",
    description:
      "25+ years consulting across travel, telecom, finance, AI, non-profit, executive placement, and entertainment.",
    image: "/panel-talk.jpeg",
    href: "/contact",
    label: "Business",
  },
];

export default function Experience() {
  return (
    <section className={styles.section} aria-label="Experience">
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.kicker}>Experience</p>
            <h2 className={styles.title}>
              A life shaped by hard decisions, disciplined judgment, and service under
              pressure.
            </h2>
          </div>

          <div className={styles.headerRight}>
            <p className={styles.lede}>
              Decades of experience where decisions mattered most, now helping leaders
              act with clarity, integrity, and confidence under pressure.
            </p>
            <div className={styles.headerCtas}>
              <Link href="/are-you-fit" className="btn btn-secondary">
                The Right Fit?
              </Link>
              <Link href="/contact" className="btn btn-primary">
                Book Sean
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {experiences.map((exp) => (
            <Link key={exp.title} href={exp.href} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                  quality={90}
                />
                <div className={styles.imageOverlay} />
                <span className={styles.label}>{exp.label}</span>

                <div className={styles.overlayContent}>
                  <h3 className={styles.cardTitle}>{exp.title}</h3>
                  <p className={styles.cardDesc}>{exp.description}</p>
                  <span className={styles.cardLink}>Explore →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.bottomLine}>
          <p className={styles.bottomText}>
            “Confusion is not neutral. It’s quietly charging interest.”{" "}
            <span className={styles.bottomEmphasis}>
              
              Clarity protects people, relationships, and outcomes.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
