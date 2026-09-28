"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/content/portfolio";
import styles from "./work.module.css";

type Slide = Pick<Project, "slug" | "title" | "context" | "year" | "image" | "imageAlt" | "status">;

// Phones get a carousel: one project per screen, swipe or use the round
// arrows. The arrows wrap around (next on the last project goes to the
// first, previous on the first goes to the last). Each slide links to its
// entry in the index.
// Offset of a slide from the first one, so scroll positions don't depend on
// the track's padding.
function slideOffset(track: HTMLElement, index: number) {
  const items = track.children;
  if (!items.length) return 0;
  return (items[index] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft;
}

export function WorkCarousel({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);

  // Keep the counter in sync with swipes.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      let nearest = 0;
      let best = Infinity;
      for (let i = 0; i < track.children.length; i++) {
        const distance = Math.abs(slideOffset(track, i) - track.scrollLeft);
        if (distance < best) {
          best = distance;
          nearest = i;
        }
      }
      setCurrent(nearest);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const go = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (current + direction + slides.length) % slides.length;
    setCurrent(next);
    track.scrollTo({ left: slideOffset(track, next), behavior: "smooth" });
  };

  return (
    <div className={styles.carousel}>
      <ul ref={trackRef} className={styles.track} aria-label="Projects">
        {slides.map((slide, i) => (
          <li key={slide.slug} className={styles.slide} aria-label={`${i + 1} of ${slides.length}`}>
            <a href={`#project-${slide.slug}`} className={styles.slideLink}>
              {slide.image ? (
                <Image src={slide.image} alt={slide.imageAlt ?? ""} width={1440} height={900} sizes="84vw" />
              ) : (
                <span className={styles.textCard}>
                  <span className={styles.textCardTitle}>{slide.title}</span>
                  <span className={styles.textCardMeta}>Final year project · in progress</span>
                </span>
              )}
            </a>
            <p className={styles.slideTitle}>
              {slide.title}, {slide.year}
            </p>
            <p className={styles.slideContext}>{slide.context}</p>
          </li>
        ))}
      </ul>
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={() => go(-1)} aria-label="Previous project">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 L7 12 L15 20" /></svg>
        </button>
        <p className={styles.counter} aria-live="polite">
          {current + 1} / {slides.length}
        </p>
        <button type="button" className={styles.arrow} onClick={() => go(1)} aria-label="Next project">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 L17 12 L9 20" /></svg>
        </button>
      </div>
    </div>
  );
}
