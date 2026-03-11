import Link from "next/link";
import { MediaKitButton } from "@/components/layout/MediaKitProvider";
import styles from "./Podcast.module.css";

const YOUTUBE_ID = "dW9YaBTZ_Nc";

export default function Podcast() {
  return (
    <section className={styles.section} aria-label="Podcast">
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Podcast</p>
            <h2 className={styles.title}>A featured conversation</h2>
          </div>

          <div className={styles.headerRight}>
            <p className={styles.lede}>
              Video-first. Clear ideas. Real leadership lessons—delivered with energy and
              warmth.
            </p>
            <div className={styles.ctas}>
              <Link href="/contact" className="btn btn-primary">
                Invite Sean
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.videoCard}>
            <div className={styles.videoFrame}>
              <iframe
                className={styles.iframe}
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1`}
                title="Featured video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className={styles.videoMeta}>
              <h3 className={styles.videoTitle}>Watch the full episode</h3>
              <p className={styles.videoDesc}>
                A conversation on leadership, business, and the mindset required to win—without losing the people around you.
              </p>
              <div className={styles.videoLinks}>
                <a
                  className={styles.externalLink}
                  href={`https://www.youtube.com/watch?v=${YOUTUBE_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube →
                </a>
              </div>
            </div>
          </div>

          <aside className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Want Sean on your show?</h3>
            <p className={styles.sideText}>
              If you host a podcast, panel, or media segment and want a guest who blends lived experience with actionable insight, reach out.
            </p>
            <div className={styles.sideCtas}>
              <Link href="/contact" className="btn btn-primary">
                Contact
              </Link>
              <MediaKitButton className="btn btn-secondary">
                Media Kit
              </MediaKitButton>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
