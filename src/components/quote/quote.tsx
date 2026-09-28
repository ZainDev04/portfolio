import styles from "./quote.module.css";

// His own line, from the GitHub profile README.
export function Quote() {
  return (
    <section className={styles.quote} data-header-theme="dark" aria-label="Quote">
      <figure className={styles.figure} data-reveal>
        <blockquote className={styles.text}>
          <p>“I ship models past the notebook stage.”</p>
        </blockquote>
        <figcaption className={styles.by}>Shaikh Muhammad Zain</figcaption>
      </figure>
      <span className={styles.ring} aria-hidden="true" data-reveal />
    </section>
  );
}
