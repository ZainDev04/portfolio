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
          return (
            <g key={i}>
              <path id={`ring-cw-${i}`} d={loopPath(r, 1)} />
              <path id={`ring-ccw-${i}`} d={loopPath(r, 0)} />
            </g>
          );
        })}
      </defs>
      {rings.map((ring, i) => {
        const r = INNER + i * GAP;
        return (
          <g key={ring.label} data-ring>
            <circle className={styles.ringLine} cx={C} cy={C} r={r} />
            {layoutRing(ring, i).map((item) => (
              <g key={item.text}>
                {item.dot && (
                  <circle
                    className={item.accent ? styles.nodeAccent : styles.node}
                    cx={item.dot.x}
                    cy={item.dot.y}
                    r={item.accent ? 11 : 16}
                  />
                )}
                <text className={item.tool ? styles.nodeLabel : styles.ringLabel} dy={-10}>
                  <textPath href={`#ring-${item.flip ? "ccw" : "cw"}-${i}`} startOffset={item.offset}>
                    {item.text}
                  </textPath>
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// A circle drawn twice from its leftmost point, clockwise (sweep 1, over the
// top) or anticlockwise (sweep 0, under the bottom). Twice, so text that
// starts near the end of the first turn does not get cut at the seam.
function loopPath(r: number, sweep: 0 | 1) {
  const turn = `a ${r} ${r} 0 1 ${sweep} ${2 * r} 0 a ${r} ${r} 0 1 ${sweep} ${-2 * r} 0`;
  return `M ${C - r} ${C} ${turn} ${turn}`;
}

// Rough text widths in viewBox units at the phone font sizes (the largest).
const LABEL_EM = 30 * 0.56;
const TOOL_EM = 28 * 0.6;
const DOT_GAP = 30;

const round = (n: number) => Math.round(n * 10) / 10;

// Every word on a ring is written along that ring: the area name first, then
// each tool after its dot, spread evenly so nothing overlaps. Words on the
// lower half run along the anticlockwise path so they read upright.
function layoutRing(ring: Ring, i: number) {
  const r = INNER + i * GAP;
  const circ = 2 * Math.PI * r;
  const items = [
    { text: ring.label, tool: false, len: ring.label.length * LABEL_EM },
    ...ring.tools.map((tool) => ({ text: tool, tool: true, len: DOT_GAP + tool.length * TOOL_EM })),
  ];
  const gap = (circ - items.reduce((sum, it) => sum + it.len, 0)) / items.length;

  // Centre the area name a little left of the top, shifting ring by ring.
  const labelMid = ((70 + i * 16) * Math.PI) / 180;
  let s = labelMid * r - items[0].len / 2;

  return items.map((item, t) => {
    const from = s;
    s += item.len + gap;
    const mid = Math.PI + (from + item.len / 2) / r;
    const flip = Math.sin(mid) > 0;
    // Where the word starts on the path it is drawn along.
    const start = mod(flip ? -(from + item.len) : from, circ);
    const angle = flip ? Math.PI - start / r : Math.PI + start / r;
    return {
      text: item.text,
      tool: item.tool,
      accent: t === 1,
      flip,
      offset: round(item.tool ? start + DOT_GAP : start),
      dot: item.tool ? { x: round(C + Math.cos(angle) * r), y: round(C + Math.sin(angle) * r) } : null,
    };
  });
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
