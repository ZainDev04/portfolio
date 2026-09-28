import { HeroStage } from "./hero-stage";
import { HeroStrip } from "./hero-strip";
import styles from "./hero.module.css";

// Type-led hero: the name carries the section and the circles fill the
// right side. No photo.
export function Hero() {
  return (
    <HeroStage>
      <div className={styles.text}>
        <p className={styles.claim}>retrieval&nbsp;· learning&nbsp;· deployment</p>
        <h1 id="hero-name" className={styles.name}>
          <span className={styles.firstLine}>Shaikh Muhammad</span>{" "}
          <span className={styles.nowrap}>
            Zain<span className={styles.stop}>.</span>
          </span>
        </h1>
        <p className={styles.role}>machine learning engineer, karachi</p>
      </div>
      <HeroStrip tick />
    </HeroStage>
  );
}
