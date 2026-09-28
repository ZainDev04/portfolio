"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The header and circle mark read this to pick colours that stay visible.
export type HeaderTheme = "dark" | "accent" | "light";
export function setHeaderTheme(theme: HeaderTheme) {
  document.documentElement.dataset.headerTheme = theme;
}
