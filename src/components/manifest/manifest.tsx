import { ManifestScene } from "./manifest-scene";
import styles from "./manifest.module.css";

export function Manifest() {
  return (
    <ManifestScene>
      <div className={styles.rings} aria-hidden="true">
        <span />
        <span />
      </div>

      <div className={styles.content} data-fit>
        <p className={styles.label}>Approach</p>
        <h2 id="approach-title" className={styles.headline} data-manifest-part>
          <span>From raw rows</span>
          <span>to a live demo.</span>
          <span>
            <span className={styles.strike} data-strike>
              Measured
            </span>{" "}
            at every step.
          </span>
        </h2>

        <div className={styles.lower}>
          <div className={styles.result} data-manifest-part>
            <p className={styles.number}>
              25.4%&nbsp;→&nbsp;2.9%.
            </p>
            <p className={styles.caption}>
              <span className={styles.rule} aria-hidden="true" />
              Face verification error once faces are aligned, TechFest runner-up pipeline
            </p>
          </div>

          <div className={styles.copy} data-manifest-part>
            <p>Every project starts with the data: what it holds, what it can&apos;t answer, and a baseline to beat.</p>
            <p>Then the model, then an honest check. When a result doesn&apos;t survive the check, I say so and write down why.</p>
            <p>Then it ships: an API, a demo you can click, and a README with the numbers.</p>
          </div>
        </div>
      </div>
    </ManifestScene>
  );
}
