"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import styles from "./contact.module.css";

// The ending: once the scene is in view, the
// purple ball is tossed from behind the ring. It rises above the ring while
// growing, then lands in front of it (1.5s), and its text fades in at the
// end. Scrolling back up resets it. The cream arc rises with scroll.
const FLIGHT_MS = 1500;
const K_START = 0.55;
const K_APEX = 0.28;
const G_APEX = 0.62;
const R_SMALL = 0.02;
const R_FULL = 0.125;

function path(g: number) {
  if (g <= G_APEX) {
    const a = g / G_APEX;
    return K_START - (K_START + K_APEX) * (1 - (1 - a) ** 2);
  }
  const b = (g - G_APEX) / (1 - G_APEX);
  return -K_APEX * (1 - (b < 0.5 ? 2 * b * b : 1 - (-2 * b + 2) ** 2 / 2));
}

export function ContactScene({ email }: { email: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const ball = ballRef.current;
    if (!scene || !ball) return;

    const place = (g: number) => {
      const vh = window.innerHeight;
      ball.style.setProperty("--ball-y", `${(path(g) * vh).toFixed(1)}px`);
      ball.style.setProperty("--ball-s", ((R_SMALL + (R_FULL - R_SMALL) * g ** 1.6) / R_FULL).toFixed(4));
      ball.classList.toggle(styles.inFront, g >= G_APEX);
      ball.classList.toggle(styles.ready, g > 0.86);
    };

    if (prefersReducedMotion()) {
      place(1);
      return;
    }

    let start = 0;
    let frame = 0;
    const fly = (now: number) => {
      const g = Math.min(1, (now - start) / FLIGHT_MS);
      place(g);
      if (g < 1) frame = requestAnimationFrame(fly);
    };
    const launch = () => {
      if (start) return;
      start = performance.now();
      frame = requestAnimationFrame(fly);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      start = 0;
      place(0);
    };
    place(0);

    const ctx = gsap.context(() => {
      gsap.from("[data-arc]", {
        yPercent: 35,
        ease: "none",
        scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
      });
      gsap.timeline({
        // Toss once the whole scene is on screen; reset when scrolling back up.
        scrollTrigger: { trigger: scene, start: "bottom bottom+=2", onEnter: launch, onLeaveBack: reset },
      });
    }, scene);

    return () => {
      cancelAnimationFrame(frame);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={sceneRef} className={styles.scene}>
      <div className={styles.arc} data-arc aria-hidden="true" />
      <div className={styles.ring} aria-hidden="true" />
      <a ref={ballRef} className={styles.ball} href={`mailto:${email}`}>
        <span>
          Let&apos;s
          <br />
          <em>talk</em>
        </span>
      </a>
    </div>
  );
}
