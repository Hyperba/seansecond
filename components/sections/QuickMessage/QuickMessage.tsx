import Image from "next/image";
import Link from "next/link";
import { MediaKitButton } from "@/components/layout/MediaKitProvider";
import styles from "./QuickMessage.module.css";

export default function QuickMessage() {
  return (
    <section className={styles.section} aria-label="Quick message">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.left}>
            <p className={styles.kicker}>A quick message</p>
            <h2 className={styles.title}>From Sean</h2>
            <p className={styles.body}>
              I have had the honor of serving in the military, building more than one
              career, and stepping deeper into creative work over time. I have also
              experienced real loss and real growth. Through all of it, one belief has
              kept me grounded.
            </p>
            <p className={styles.pull}>
              It is not all about me.
            </p>
            <p className={styles.body}>
              When we practice that daily, we lead with more humility, communicate with
              more care, and build things that actually last. We do better work when we
              remember we are part of something bigger than ourselves.
            </p>
            <p className={styles.body}>
              As I often say, “courage is the willingness to show up and be all in when
              you cannot predict the outcome”.
            </p>
            <p className={styles.body}>
              If that belief resonates with you, you are in the right place.
            </p>
            <p className={styles.signature}>M. Sean Agnew</p>

            <div className={styles.ctas}>
              <Link href="/are-you-fit" className="btn btn-secondary">
                The Right Fit?
              </Link>
              <MediaKitButton className="btn btn-primary">
                Media Kit
              </MediaKitButton>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.imageWrap}>
              <Image
                src="/fountain.jpeg"
                alt="M. Sean Agnew"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                quality={90}
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
