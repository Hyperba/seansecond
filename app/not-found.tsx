import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <p className={styles.kicker}>404</p>
      <h1 className={styles.title}>This page doesn’t exist.</h1>
      <p className={styles.lede}>
        The page you’re looking for may have moved or no longer exists.
      </p>
      <Link href="/" className={styles.cta}>
        Return Home
      </Link>
    </main>
  );
}
