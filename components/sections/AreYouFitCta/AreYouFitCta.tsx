import Image from "next/image";
import Link from "next/link";
import { MediaKitButton } from "@/components/layout/MediaKitProvider";
import styles from "./AreYouFitCta.module.css";

export default function AreYouFitCta() {
  return (
    <section className={styles.section} aria-label="The right fit">
      <div className={styles.background}>
        <Image
          src="/sweetbio.jpeg"
          alt=""
          fill
          quality={90}
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className="container">
          <div className={styles.inner}>
            <p className={styles.kicker}>Ensuring the Right Fit</p>
            <h2 className={styles.title}>THE RIGHT FIT?</h2>
            <p className={styles.lede}>
              Great outcomes begin with alignment. This brief, two-minute survey helps
              me understand your goals, current priorities, and intent—so we can
              determine whether working together would genuinely serve you. It’s not
              sales-focused, and there’s no pressure or obligation. Your responses are
              used solely to assess fit and will never be shared.
            </p>

            <div className={styles.ctas}>
              <Link href="/are-you-fit" className={styles.primary}>
                Take the Survey
              </Link>
              <MediaKitButton className={styles.secondary}>
                Download Media Kit
              </MediaKitButton>
            </div>

            <p className={styles.note}>
              The goal is simple: protect clarity, focus, and the responsible use of
              everyone’s time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
