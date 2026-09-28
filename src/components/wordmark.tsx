"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import styles from "./wordmark.module.css";

// The dot after "zain" sits as a full stop and now and then hops up to a
// superscript.
const HOP_EVERY_MS = 7000;
const REST_MS = 2200;

export function Wordmark() {
  const prefersReducedMotion = useReducedMotion();
  const [raised, setRaised] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let restTimer: number | undefined;
    const hopTimer = window.setInterval(() => {
      setRaised(true);
      restTimer = window.setTimeout(() => setRaised(false), REST_MS);
    }, HOP_EVERY_MS);
    return () => {
      window.clearInterval(hopTimer);
      window.clearTimeout(restTimer);
    };
  }, [prefersReducedMotion]);

  return (
    <span className={styles.wordmark} data-wordmark>
      zain
      <motion.span
        aria-hidden="true"
        className={styles.dot}
        animate={{ y: raised ? "-0.62em" : "0em", x: raised ? "0.06em" : "0em" }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      />
    </span>
  );
}
