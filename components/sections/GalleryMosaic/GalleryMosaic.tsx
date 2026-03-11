import Image from "next/image";
import styles from "./GalleryMosaic.module.css";

const images = [
  { src: "/gallery/gallery-0.jpeg", alt: "" },
  { src: "/gallery/gallery-1.jpeg", alt: "" },
  { src: "/gallery/gallery-2.jpeg", alt: "" },
  { src: "/gallery/gallery-7.jpeg", alt: "" },
  { src: "/gallery/gallery-5.jpeg", alt: "" },
  { src: "/gallery/gallery-4.jpeg", alt: "" },
  { src: "/gallery/gallery-6.jpeg", alt: "" },
  { src: "/gallery/gallery-3.jpeg", alt: "" },
];

export default function GalleryMosaic() {
  return (
    <section className={styles.section} aria-label="Gallery">
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Gallery</p>
            <h2 className={styles.title}>In action. In service. Under pressure.</h2>
          </div>
          <p className={styles.lede}>
            Media-forward, full-bleed mosaic—built to feel cinematic and modern.
          </p>
        </div>
      </div>

      <div className={styles.mosaic}>
        {images.map((img, idx) => (
          <div className={styles.tile} key={`${img.src}-${idx}`}>
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              quality={85}
              style={{ objectFit: "cover" }}
            />
            <div className={styles.overlay} />
          </div>
        ))}
      </div>
    </section>
  );
}
