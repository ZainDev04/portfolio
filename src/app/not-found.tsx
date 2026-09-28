import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.circles} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.disc} />
      </div>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>This page drifted out of orbit.</h1>
      <Link className={styles.back} href="/">
        Back to the portfolio
      </Link>
    </main>
  );
}
