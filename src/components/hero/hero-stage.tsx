"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { trackPointerDown } from "@/lib/plain-click";
import { type Kick, OrbitCluster } from "./orbit-cluster";
import styles from "./hero.module.css";

// Client shell for the hero. The text comes in from the server component as
// children, so only the interactive layer ships as client code. A plain click
// anywhere on the hero pulls the satellites toward that point.
export function HeroStage({ children }: { children: ReactNode }) {
  const [kick, setKick] = useState<Kick | null>(null);
  const pointer = useRef<ReturnType<typeof trackPointerDown> | null>(null);

  useEffect(() => {
    pointer.current = trackPointerDown();
    return () => pointer.current?.dispose();
  }, []);

  return (
    <section
      id="top"
      className={styles.hero}
      data-header-theme="dark"
      aria-labelledby="hero-name"
      data-cursor-label={kick === null ? "click to orbit" : undefined}
      onClick={(event) => {
        if (!pointer.current?.isPlainClick(event.nativeEvent)) return;
        setKick((prev) => ({ x: event.clientX, y: event.clientY, n: (prev?.n ?? 0) + 1 }));
      }}
    >
      <OrbitCluster kick={kick} />
      {children}
    </section>
  );
}
