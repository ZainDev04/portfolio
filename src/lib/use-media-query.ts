"use client";

import { useSyncExternalStore } from "react";

export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const MOBILE = "(max-width: 767px)";

// Server render assumes false, so touch-only and desktop-only effects
// switch on after hydration.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
