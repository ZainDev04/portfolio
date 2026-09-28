"use client";

// Desktop project orbit:
// - cards spread over a sphere with the golden-angle (Fibonacci) spiral
// - the world is tilted 12deg and spins by itself at 4deg/s
// - drag turns it on both axes with momentum (friction 0.94)
// - every card turns to face the viewer (billboard)
// - far cards darken to 26% brightness and blur up to 8px, in 0.5px steps
// - hover lifts a card 12% and pulls it 14px toward the pointer
// - click flies a card to the front at 62% of the screen and dims the rest
// - it zooms in from 2.3x as the manifest disc shrinks, and collapses into
//   the centre at the end of the scroll (driven by `control`)
// - a toggle switches to the row view: one large card, thumbnails, caption,
//   and a progress bar that advances every 4.2s

import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import type { OrbitCard, Project } from "@/content/portfolio";
import { ArrowLink } from "@/components/ui/arrow-link";
import { prefersReducedMotion } from "@/lib/gsap";
import styles from "./orbit.module.css";

export type OrbitControl = { entry: number; collapse: number; visible: boolean };

const CARD_REF_PX = 2048;
const CARD_BASE_PX = 300;
const ENTRY_SCALE = 2.3;
const FRICTION = 0.94;
const VEL_STOP = 0.02;
const AUTO_SPEED = 4;
const DRAG_DEG_PER_PX = 0.25;
const DEPTH_BRIGHTNESS_MIN = 0.26;
const DEPTH_BLUR_MAX = 8;
const HOVER_SCALE = 0.12;
const HOVER_EASE = 9;
const MAG_PULL_PX = 14;
const FOCUS_SPEED = 1.7;
const FOCUS_FILL = 0.62;
const FOCUS_DIM = 0.45;
const CLICK_SLOP = 6;
const ROW_STEP_MS = 4200;
const DEG = Math.PI / 180;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type ProjectInfo = Pick<Project, "slug" | "title" | "year" | "context" | "results" | "live" | "code" | "paper" | "status">;

export function OrbitSphere({
  cards,
  projects,
  control,
}: {
  cards: OrbitCard[];
  projects: ProjectInfo[];
  control: MutableRefObject<OrbitControl>;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hintRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [rowView, setRowView] = useState(false);
  const rowViewRef = useRef(false);
  const [rowIndex, setRowIndex] = useState(0);
  // Direction of the last move (1 = next, -1 = previous), so the row slides
  // in from the matching side. 0 = no move yet, so no animation on open.
  const [rowDir, setRowDir] = useState<-1 | 0 | 1>(0);
  const showRow = useCallback(
    (index: number, dir: -1 | 1) => {
      setRowDir(dir);
      setRowIndex(((index % cards.length) + cards.length) % cards.length);
    },
    [cards.length],
  );
  const [rowPaused, setRowPaused] = useState(false);

  const project = (slug: string) => projects.find((p) => p.slug === slug);

  const focus = useCallback((index: number | null) => {
    focusedRef.current = index;
    setFocused(index);
  }, []);

  useEffect(() => {
    rowViewRef.current = rowView;
  }, [rowView]);

  // The sphere loop.
  useEffect(() => {
    const layer = layerRef.current;
    const stage = stageRef.current;
    const world = worldRef.current;
    if (!layer || !stage || !world) return;
    const reduced = prefersReducedMotion();

    // Card directions on a unit sphere (golden-angle spiral) and sizes.
    const golden = Math.PI * (3 - Math.sqrt(5));
    const n = cards.length;
    const meta = cards.map((card, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const shown = CARD_BASE_PX * (Math.sqrt(card.w * card.h) / CARD_REF_PX);
      return {
        dirX: Math.cos(theta) * r,
        dirY: y,
        dirZ: Math.sin(theta) * r,
        w: shown * Math.sqrt(card.w / card.h),
        h: shown * Math.sqrt(card.h / card.w),
        hover: 0,
        z2: 0,
        lastBlur: -1,
        lastZ: -1,
      };
    });
    meta.forEach((m, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      el.style.width = `${m.w}px`;
      el.style.height = `${m.h}px`;
      el.style.marginLeft = `${-m.w / 2}px`;
      el.style.marginTop = `${-m.h / 2}px`;
    });

    let targetR = 420;
    let perspective = 1260;
    const size = () => {
      targetR = Math.max(380, Math.min(780, window.innerWidth * 0.42));
      perspective = targetR * 3;
      stage.style.perspective = `${perspective}px`;
    };
    size();
    window.addEventListener("resize", size);

    let rotY = 0;
    let rotX = 12;
    let velY = 0;
    let velX = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let moved = 0;
    let pointerX = -1;
    let pointerY = -1;
    let pointerInside = false;
    let hoverIndex: number | null = null;
    let focusAmt = 0;
    let lastFocused: number | null = null;
    let last = performance.now();
    let frame = 0;

    const cardAt = (px: number, py: number) => {
      let best: number | null = null;
      meta.forEach((m, i) => {
        const el = cardRefs.current[i];
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom && (best === null || m.z2 > meta[best].z2)) best = i;
      });
      return best;
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { entry, collapse, visible } = control.current;

      layer.style.visibility = visible ? "visible" : "hidden";
      if (!visible) return;
      const ready = entry > 0.98 && collapse < 0.02;
      layer.style.pointerEvents = ready ? "auto" : "none";
      if (!ready && focusedRef.current !== null) focus(null);

      // Collapse: the sphere bulges out a little, then everything is pulled in.
      const bump = collapse < 0.2 ? 1 + 0.18 * (collapse / 0.2) : 1.18 * Math.max(0, 1 - (collapse - 0.2) / 0.54);
      const cardShrink = collapse > 0.22 ? Math.max(0, 1 - (collapse - 0.22) / 0.78) : 1;
      const R = targetR * (ENTRY_SCALE - (ENTRY_SCALE - 1) * easeOutCubic(entry)) * bump;

      const current = focusedRef.current;
      if (current !== null) lastFocused = current;
      focusAmt = Math.max(0, Math.min(1, focusAmt + (current !== null ? 1 : -1) * dt * FOCUS_SPEED));
      const fe = easeInOutCubic(focusAmt);

      if (!dragging) {
        if (Math.abs(velY) > VEL_STOP || Math.abs(velX) > VEL_STOP) {
          rotY += velY;
          rotX += velX;
          const f = FRICTION ** (dt * 60);
          velY *= f;
          velX *= f;
        } else if (!reduced) {
          rotY += dt * AUTO_SPEED * (1 - fe);
        }
      }
      rotX = Math.max(-70, Math.min(70, rotX));
      world.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      const billboard = `rotateY(${-rotY}deg) rotateX(${-rotX}deg)`;
      const ry = rotY * DEG;
      const rx = rotX * DEG;
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);

      hoverIndex = pointerInside && !dragging && current === null && focusAmt < 0.01 ? cardAt(pointerX, pointerY) : null;
      layer.classList.toggle(styles.isHover, hoverIndex !== null);
      const hoverStep = Math.min(1, dt * HOVER_EASE);

      meta.forEach((m, i) => {
        const el = cardRefs.current[i];
        const shade = shadeRefs.current[i];
        if (!el || !shade) return;
        m.hover += ((i === hoverIndex ? 1 : 0) - m.hover) * hoverStep;

        let x0 = m.dirX * R;
        let y0 = m.dirY * R;
        let z0 = m.dirZ * R;
        const isFocus = i === current || (focusAmt > 0 && i === lastFocused);
        if (isFocus) {
          const want = Math.min(window.innerWidth, window.innerHeight) * FOCUS_FILL;
          const wantScale = Math.max(1.15, Math.min(4, want / Math.max(m.w, m.h)));
          const fz = perspective * (1 - 1 / wantScale);
          const ty = fz * sinX;
          const tz1 = fz * cosX;
          const tx = -tz1 * sinY;
          const tz = tz1 * cosY;
          x0 += (tx - x0) * fe;
          y0 += (ty - y0) * fe;
          z0 += (tz - z0) * fe;
        }
        const z1 = -x0 * sinY + z0 * cosY;
        const z2 = y0 * sinX + z1 * cosX;
        m.z2 = z2;

        // Magnetic pull toward the pointer while hovered.
        let pull = "";
        if (m.hover > 0.001 && pointerInside) {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = Math.max(-1, Math.min(1, (pointerX - cx) / (r.width / 2)));
          const dy = Math.max(-1, Math.min(1, (pointerY - cy) / (r.height / 2)));
          pull = ` translate(${(dx * MAG_PULL_PX * m.hover).toFixed(2)}px, ${(dy * MAG_PULL_PX * m.hover).toFixed(2)}px)`;
        }
        const scale = (1 + m.hover * HOVER_SCALE) * cardShrink;
        el.style.transform = `translate3d(${x0}px, ${y0}px, ${z0}px) ${billboard}${pull} scale(${scale.toFixed(4)})`;

        const depth = Math.max(0, Math.min(1, (z2 + R) / (2 * R)));
        let brightness = DEPTH_BRIGHTNESS_MIN + (1 - DEPTH_BRIGHTNESS_MIN) * depth;
        if (!isFocus && fe > 0) brightness *= 1 - FOCUS_DIM * fe;
        if (isFocus) brightness = brightness + (1 - brightness) * fe;
        shade.style.opacity = (1 - brightness).toFixed(3);

        const far = isFocus ? (1 - depth) * (1 - fe) : 1 - depth;
        const blurRaw = far * far * DEPTH_BLUR_MAX;
        const blur = blurRaw < 0.3 ? 0 : Math.round(blurRaw * 2) / 2;
        if (blur !== m.lastBlur) {
          m.lastBlur = blur;
          el.style.filter = blur ? `blur(${blur}px)` : "";
        }
        const z = isFocus && fe > 0 ? 5000 : Math.round(depth * 100);
        if (z !== m.lastZ) {
          m.lastZ = z;
          el.style.zIndex = String(z);
        }
      });

      const hint = hintRef.current;
      if (hint) {
        const show = (1 - fe) * (rowViewRef.current ? 0 : 1) * Math.min(1, entry * 1.2) * cardShrink;
        hint.style.opacity = show.toFixed(3);
        hint.style.transform = `translate(-50%, -50%) scale(${(0.6 + 0.4 * show).toFixed(3)})`;
      }
      // The view toggle only shows while the sphere is settled and nothing is focused.
      const toggle = toggleRef.current;
      if (toggle) {
        const t = ready ? 1 - fe : 0;
        toggle.style.opacity = t.toFixed(3);
        toggle.style.pointerEvents = t > 0.5 ? "auto" : "none";
        toggle.tabIndex = t > 0.5 ? 0 : -1;
      }
      const caption = captionRef.current;
      if (caption) caption.style.opacity = String(Math.max(0, fe - 0.6) / 0.4);
    };
    frame = requestAnimationFrame(tick);

    const onDown = (event: PointerEvent) => {
      if ((event.target as Element).closest("a, button")) return;
      dragging = focusedRef.current === null;
      lastX = event.clientX;
      lastY = event.clientY;
      moved = 0;
      velX = 0;
      velY = 0;
      layer.classList.toggle(styles.isDragging, dragging);
    };
    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerInside = true;
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      rotY += dx * DRAG_DEG_PER_PX;
      rotX -= dy * DRAG_DEG_PER_PX;
      velY = reduced ? 0 : dx * DRAG_DEG_PER_PX;
      velX = reduced ? 0 : -dy * DRAG_DEG_PER_PX;
    };
    const onUp = (event: PointerEvent) => {
      const wasDragging = dragging;
      dragging = false;
      layer.classList.remove(styles.isDragging);
      if ((event.target as Element).closest("a, button")) return;
      if (moved > CLICK_SLOP && wasDragging) return;
      // A click: close the focused card, or focus the card under the pointer.
      if (focusedRef.current !== null) focus(null);
      else {
        const hit = cardAt(event.clientX, event.clientY);
        if (hit !== null) focus(hit);
      }
    };
    const onLeave = () => {
      pointerInside = false;
    };
    const onWindowUp = () => {
      dragging = false;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && focusedRef.current !== null) focus(null);
    };

    layer.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    layer.addEventListener("pointerup", onUp);
    window.addEventListener("pointerup", onWindowUp);
    layer.addEventListener("pointerleave", onLeave);
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", size);
      layer.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      layer.removeEventListener("pointerup", onUp);
      layer.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [cards, control, focus]);

  // Row view autoplay.
  useEffect(() => {
    if (!rowView || rowPaused || prefersReducedMotion()) return;
    const timer = window.setTimeout(() => showRow(rowIndex + 1, 1), ROW_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [rowView, rowPaused, rowIndex, showRow]);

  const focusedProject = focused !== null ? project(cards[focused].slug) : undefined;
  const rowCard = cards[rowIndex];
  const rowProject = project(rowCard.slug);

  return (
    <div ref={layerRef} className={styles.layer} data-no-accent data-row={rowView || undefined}>
      <div ref={stageRef} className={styles.stage} aria-hidden="true">
        <div ref={worldRef} className={styles.world}>
          {cards.map((card, i) => {
            const info = project(card.slug);
            return (
              <div
                key={`${card.slug}-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={styles.card}
              >
                {card.src ? (
                  // Plain img: the card is sized and transformed every frame.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.src} alt="" draggable={false} decoding="async" />
                ) : (
                  <span className={styles.textCard}>
                    <b>{info?.title}</b>
                    <span>Final year project · in progress</span>
                  </span>
                )}
                <span
                  ref={(el) => {
                    shadeRefs.current[i] = el;
                  }}
                  className={styles.shade}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div ref={hintRef} className={styles.hint} aria-hidden="true">
        <span>Drag</span>
        <span>to</span>
        <span>orbit</span>
      </div>

      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        onClick={() => {
          focus(null);
          setRowView((v) => !v);
        }}
        aria-pressed={rowView}
        aria-label={rowView ? "Switch to orbit view" : "Switch to row view"}
      >
        {rowView ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="7" width="4" height="10" rx="1" />
            <rect x="9" y="5" width="6" height="14" rx="1" />
            <rect x="17" y="7" width="4" height="10" rx="1" />
          </svg>
        )}
      </button>

      {/* Caption for the card flown to the front. */}
      <div ref={captionRef} className={styles.caption} aria-live="polite">
        {focusedProject ? <Caption info={focusedProject} /> : null}
      </div>

      {rowView ? (
        <div
          className={styles.row}
          onMouseEnter={() => setRowPaused(true)}
          onMouseLeave={() => setRowPaused(false)}
          onFocus={() => setRowPaused(true)}
          onBlur={() => setRowPaused(false)}
        >
          <div className={styles.strip}>
            {[-2, -1, 0, 1, 2].map((offset) => {
              const index = (rowIndex + offset + cards.length) % cards.length;
              const c = cards[index];
              const main = offset === 0;
              const info = project(c.slug);
              return (
                <button
                  // Re-keyed on every move so the slide-in animation replays.
                  key={`${offset}-${index}-${rowIndex}`}
                  type="button"
                  className={main ? styles.rowMain : styles.rowThumb}
                  data-dir={rowDir || undefined}
                  onClick={() => {
                    if (!main) showRow(index, offset > 0 ? 1 : -1);
                  }}
                  aria-label={main ? `${info?.title}, current` : `Show ${info?.title}`}
                  tabIndex={main ? -1 : 0}
                >
                  {c.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.src} alt={main ? c.alt : ""} draggable={false} />
                  ) : (
                    <span className={styles.textCard}>
                      <b>{info?.title}</b>
                      <span>Final year project · in progress</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className={styles.progress} aria-hidden="true">
            <span key={`${rowIndex}-${rowPaused}`} data-paused={rowPaused || undefined} />
          </div>
          <div key={`caption-${rowIndex}`} className={styles.rowCaption} data-dir={rowDir || undefined}>
            {rowProject ? <Caption info={rowProject} /> : null}
          </div>
          <div className={styles.rowArrows}>
            <button type="button" onClick={() => showRow(rowIndex - 1, -1)} aria-label="Previous">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 L7 12 L15 20" /></svg>
            </button>
            <button type="button" onClick={() => showRow(rowIndex + 1, 1)} aria-label="Next">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 L17 12 L9 20" /></svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Caption({ info }: { info: ProjectInfo }) {
  return (
    <div className={styles.captionInner}>
      <p className={styles.captionTitle}>
        {info.title}, {info.year}
      </p>
      <p className={styles.captionContext}>{info.context}</p>
      <p className={styles.captionResult}>{info.results[0]}</p>
      <div className={styles.captionLinks}>
        {info.live ? <ArrowLink href={info.live}>Live demo</ArrowLink> : null}
        {info.paper ? <ArrowLink href={info.paper}>Paper</ArrowLink> : null}
        {info.code ? <ArrowLink href={info.code}>Code</ArrowLink> : null}
        <a className={styles.more} href={`#project-${info.slug}`}>
          Details
        </a>
      </div>
    </div>
  );
}
