import { Wordmark } from "./wordmark";
import styles from "./site-header.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      {/* The hero's circle mark flies here and docks under the wordmark on
          scroll (see hero/orbit-cluster.tsx). */}
      <div className={styles.brand}>
        <a className={styles.home} href="#top" aria-label="Shaikh Muhammad Zain, back to top">
          <Wordmark />
        </a>
      </div>
      <nav className={styles.nav} aria-label="Main">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}
