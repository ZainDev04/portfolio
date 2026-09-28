"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, setHeaderTheme, type HeaderTheme } from "@/lib/gsap";

// Site-wide scroll layer:
// - Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync
// - header colour per section ([data-header-theme])
// - "past the hero" flag for the circle mark under the wordmark
// - fade-up reveals for anything marked [data-reveal]
export function SmoothScroll() {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    let lenis: Lenis | null = null;
    let onTick: ((time: number) => void) | null = null;

    if (!reduced) {
      lenis = new Lenis({ anchors: true, lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      onTick = (time) => lenis?.raf(time * 1000);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      setHeaderTheme("dark");
      document.querySelectorAll<HTMLElement>("[data-header-theme]").forEach((section) => {
        const theme = section.dataset.headerTheme as HeaderTheme;
        ScrollTrigger.create({
          trigger: section,
          start: "top top+=48",
          end: "bottom top+=48",
          onEnter: () => setHeaderTheme(theme),
          onEnterBack: () => setHeaderTheme(theme),
        });
      });

      const hero = document.getElementById("top");
      if (hero) {
        ScrollTrigger.create({
          trigger: hero,
          start: "bottom 40%",
          onEnter: () => (document.documentElement.dataset.pastHero = ""),
          onLeaveBack: () => delete document.documentElement.dataset.pastHero,
        });
      }

      if (!reduced) {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 32,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
      }
    });

    // Fonts and images can shift layout after load; recalculate positions.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
      if (onTick) gsap.ticker.remove(onTick);
      lenis?.destroy();
    };
  }, []);

  return null;
}
