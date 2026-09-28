"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { orbitCards, projects } from "@/content/portfolio";
import { OrbitSphere, type OrbitControl } from "@/components/orbit/orbit-sphere";
import { gsap, prefersReducedMotion, setHeaderTheme } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/use-media-query";
import styles from "./manifest.module.css";

const DESKTOP = "(min-width: 768px)";

// One long scroll scene:
// 1. a purple disc rises out of the hero and fills the screen (manifest)
// 2. the disc shrinks and reveals the project sphere behind it, which zooms in
// 3. the sphere stays while you drag it, then collapses into the centre
// Mobile runs only step 1; its projects are a swipe carousel in Work.
export function ManifestScene({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const control = useRef<OrbitControl>({ entry: 0, collapse: 0, visible: false });
  const isDesktop = useMediaQuery(DESKTOP);

  // On very short screens (iPhone SE) the text can be taller than the stage;
  // shrink the whole block just enough to fit instead of cutting it off.
  useEffect(() => {
    const panel = panelRef.current;
    const content = panel?.querySelector<HTMLElement>("[data-fit]");
    if (!panel || !content) return;
    const fit = () => {
      content.style.scale = "";
      const need = content.scrollHeight;
      const room = panel.clientHeight;
      if (need > room + 1) content.style.scale = (room / need).toFixed(4);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(panel);
    document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const panel = panelRef.current;
    if (!wrap || !panel) return;
    if (prefersReducedMotion()) {
      panel.style.clipPath = "none";
      control.current = { entry: 1, collapse: 0, visible: true };
      return;
    }

    const disc = { r: 0, cy: 115 };
    const fullRadius = () => Math.hypot(window.innerWidth, window.innerHeight) * 0.6;
    const draw = () => {
      panel.style.clipPath = `circle(${disc.r}px at 50% ${disc.cy}%)`;
    };
    const parts = panel.querySelectorAll("[data-manifest-part]");
    const strike = panel.querySelector("[data-strike]");
    const mm = gsap.matchMedia();

    // Desktop: manifest then orbit (wrapper is 560vh; stage sticks at ~0.18).
    mm.add(DESKTOP, () => {
      const c = control.current;
      const orbit = { entry: 0, collapse: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            setHeaderTheme(p > 0.18 && p < 0.44 ? "accent" : "dark");
            c.visible = p > 0.36 && p < 0.99;
          },
          onLeave: () => {
            setHeaderTheme("dark");
            c.visible = false;
          },
          onLeaveBack: () => {
            setHeaderTheme("dark");
            c.visible = false;
          },
        },
      });
      const sync = () => {
        c.entry = orbit.entry;
        c.collapse = orbit.collapse;
      };
      disc.r = 0;
      disc.cy = 115;
      draw();
      tl.to(disc, { r: () => fullRadius(), cy: 50, duration: 0.16, ease: "power2.inOut", onUpdate: draw }, 0.03)
        .fromTo(parts, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.06, stagger: 0.02 }, 0.16)
        .fromTo(strike, { "--strike": 0 }, { "--strike": 1, duration: 0.05 }, 0.27)
        .to(parts, { y: -32, opacity: 0, duration: 0.04, stagger: 0.01 }, 0.37)
        .to(disc, { r: 0, duration: 0.08, ease: "power2.in", onUpdate: draw }, 0.4)
        .fromTo(orbit, { entry: 0 }, { entry: 1, duration: 0.1, onUpdate: sync }, 0.4)
        .fromTo(orbit, { collapse: 0 }, { collapse: 1, duration: 0.13, onUpdate: sync }, 0.84)
        .to({}, { duration: 0.03 });
      return () => {
        c.visible = false;
      };
    });

    // Mobile: manifest only (wrapper is 320vh; stage sticks at ~0.31).
    mm.add("(max-width: 767px)", () => {
      disc.r = 0;
      disc.cy = 115;
      draw();
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => setHeaderTheme(self.progress > 0.3 && self.progress < 0.88 ? "accent" : "dark"),
          onLeave: () => setHeaderTheme("dark"),
          onLeaveBack: () => setHeaderTheme("dark"),
        },
      });
      tl.to(disc, { r: () => fullRadius(), cy: 50, duration: 0.27, ease: "power2.inOut", onUpdate: draw }, 0.05)
        .fromTo(parts, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.1, stagger: 0.03 }, 0.26)
        .fromTo(strike, { "--strike": 0 }, { "--strike": 1, duration: 0.08 }, 0.45)
        .to(parts, { y: -32, opacity: 0, duration: 0.06, stagger: 0.02 }, 0.8)
        .to(disc, { r: 0, duration: 0.16, ease: "power2.in", onUpdate: draw }, 0.84);
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={wrapRef} id="approach" className={styles.scroll} data-header-theme="accent" aria-labelledby="approach-title">
      <div className={styles.stage}>
        {isDesktop ? (
          <OrbitSphere
            cards={orbitCards}
            projects={projects.map(({ slug, title, year, context, results, live, code, paper, status }) => ({
              slug,
              title,
              year,
              context,
              results,
              live,
              code,
              paper,
              status,
            }))}
            control={control}
          />
        ) : null}
        <div ref={panelRef} className={styles.panel} data-cursor-theme="ink">
          {children}
        </div>
      </div>
    </section>
  );
}
