"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Project } from "@/content/portfolio";
import styles from "./work.module.css";

type Slide = Pick<Project, "slug" | "title" | "context" | "year" | "image" | "imageAlt" | "status">;

// Phones get a carousel: one project per screen, swipe
// or use the round arrows. Each slide links to its entry in the index.
export function WorkCarousel({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLUListElement>(null);

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.firstElementChild as HTMLElement | null;
    const width = slide ? slide.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0") : track.clientWidth;
    track.scrollBy({ left: direction * width, behavior: "smooth" });
  };

  return (
    <div className={styles.carousel}>
      <ul ref={trackRef} className={styles.track} aria-label="Projects">
        {slides.map((slide) => (
          <li key={slide.slug} className={styles.slide}>
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
        <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label="Previous project">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 L7 12 L15 20" /></svg>
        </button>
        <button type="button" className={styles.arrow} onClick={() => step(1)} aria-label="Next project">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 L17 12 L9 20" /></svg>
        </button>
      </div>
    </div>
  );
}
