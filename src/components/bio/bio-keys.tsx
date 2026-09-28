"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import styles from "./bio.module.css";

// The pinned index on the left. The key for the part in the middle of the
// screen turns purple; each key also jumps to its part.
export function BioKeys({ parts }: { parts: { id: string; label: string }[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const triggers = parts.map((part, i) =>
      ScrollTrigger.create({
        trigger: `#${part.id}`,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) setActive(i);
        },
      }),
    );
    return () => triggers.forEach((trigger) => trigger.kill());
  }, [parts]);

  return (
    <ol className={styles.keyList}>
      {parts.map((part, i) => (
        <li key={part.id}>
          <a href={`#${part.id}`} className={styles.key} aria-current={active === i ? "true" : undefined}>
            {part.label}
          </a>
        </li>
      ))}
    </ol>
  );
}
