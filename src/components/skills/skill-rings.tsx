"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import styles from "./skills.module.css";

type Ring = { label: string; tools: string[] };

const SIZE = 1000;
const C = SIZE / 2;
const INNER = 130;
const GAP = 64;

// Decorative: concentric rings with curved area labels and tool nodes.
// Each ring turns a little as you scroll, alternating direction, and the
// purple card slides in from the right. The same content is in the card as
// text, so the drawing is hidden from screen readers.
export function SkillRings({ rings }: { rings: Ring[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const section = svg?.closest("section");
    if (!svg || !section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      svg.querySelectorAll<SVGGElement>("[data-ring]").forEach((ring, i) => {
        gsap.fromTo(
          ring,
          { rotation: 0 },
          {
            rotation: (i % 2 ? -1 : 1) * (18 + i * 4),
            svgOrigin: `${C} ${C}`,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.8 },
          },
        );
      });

      const card = section.querySelector("[data-skills-card]");
      if (card) {
        gsap.from(card, {
          xPercent: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 85%", once: true },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <svg ref={svgRef} className={styles.rings} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
      <defs>
        {rings.map((_, i) => {
          const r = INNER + i * GAP;
          return <path key={i} id={`ring-path-${i}`} d={`M ${C - r} ${C} a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 ${-2 * r} 0`} />;
        })}
      </defs>
      {rings.map((ring, i) => {
        const r = INNER + i * GAP;
        return (
          <g key={ring.label} data-ring>
            <circle className={styles.ringLine} cx={C} cy={C} r={r} />
            <text className={styles.ringLabel} dy={-8}>
              <textPath href={`#ring-path-${i}`} startOffset={`${8 + i * 7}%`}>
                {ring.label}
              </textPath>
            </text>
            {ring.tools.map((tool, t) => {
              const angle = (i * 57 + t * (360 / (ring.tools.length + 1)) + 20) * (Math.PI / 180);
              // Rounded so server and browser render the same string.
              const x = Math.round((C + Math.cos(angle) * r) * 10) / 10;
              const y = Math.round((C + Math.sin(angle) * r) * 10) / 10;
              return (
                <g key={tool} transform={`translate(${x} ${y})`}>
                  <circle className={t === 0 ? styles.nodeAccent : styles.node} r={t === 0 ? 11 : 16} />
                  <text className={styles.nodeLabel} x={22} dy={5}>
                    {tool}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
