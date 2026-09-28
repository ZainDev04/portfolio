"use client";

// Adapted from 21st.dev "Custom Cursor" by soralabs
// (https://21st.dev/@soralabs/components/custom-cursor).
// Kept: the spring-follow motion values and the coarse-pointer and
// reduced-motion opt-outs. Changed: colour comes from --accent instead of the
// demo's orange, hover is detected by delegation instead of wrapper targets,
// and an optional label follows the dot ([data-cursor-label]).

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { FINE_POINTER, useMediaQuery } from "@/lib/use-media-query";
import styles from "./custom-cursor.module.css";

const INTERACTIVE = "a, button, [role='button'], [data-cursor]";

export function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const isFinePointer = useMediaQuery(FINE_POINTER);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [onAccent, setOnAccent] = useState(false);
  // The label shows only once the pointer has rested for 420ms, and flips to
  // the left near the right edge.
  const [isResting, setIsResting] = useState(false);
  const [labelLeft, setLabelLeft] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const spring = { damping: 22, stiffness: 150, mass: 0.8 };
  const springX = useSpring(cursorX, spring);
  const springY = useSpring(cursorY, spring);

  const isActive = isFinePointer && !prefersReducedMotion;

  useEffect(() => {
    if (!isActive) return;
    let restTimer = 0;

    const handlePointerMove = (event: PointerEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      setIsVisible(true);
      setIsResting(false);
      window.clearTimeout(restTimer);
      restTimer = window.setTimeout(() => {
        setLabelLeft(event.clientX > window.innerWidth - 210);
        setIsResting(true);
      }, 420);

      const target = event.target as Element | null;
      setIsHovering(Boolean(target?.closest(INTERACTIVE)));
      setLabel(target?.closest<HTMLElement>("[data-cursor-label]")?.dataset.cursorLabel ?? null);
      // Over purple panels the accent dot would vanish; switch it to ink.
      setOnAccent(Boolean(target?.closest("[data-cursor-theme='ink']")));
    };
    const handleLeave = () => setIsVisible(false);

    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener("pointerleave", handleLeave);
    return () => {
      window.clearTimeout(restTimer);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, [isActive, cursorX, cursorY]);

  if (!isActive) return null;

  return (
    <motion.div
      aria-hidden="true"
      className={styles.cursor}
      data-visible={isVisible || undefined}
      data-on-accent={onAccent || undefined}
      style={{ x: springX, y: springY }}
    >
      <span className={styles.dot} data-hover={isHovering || undefined} />
      {label && !isHovering ? (
        <span className={styles.label} data-shown={isResting || undefined} data-left={labelLeft || undefined}>
          {label}
        </span>
      ) : null}
    </motion.div>
  );
}

export default CustomCursor;
