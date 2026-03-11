import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.page} role="status" aria-live="polite">
      <div className={styles.loader} />
      <p className={styles.text}>Loading...</p>
    </div>
  );
}
