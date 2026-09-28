"use client";

import { useEffect } from "react";
import { trackPointerDown } from "@/lib/plain-click";

// The three accents from build.md, each with its deep partner for text on paper.
const ACCENTS = [
  { accent: "#b481f8", deep: "#7e47d6" },
  { accent: "#96b7d8", deep: "#456a90" },
  { accent: "#bb9b1b", deep: "#7a6410" },
] as const;

export function AccentCycle() {
  useEffect(() => {
    let index = 0;
    const pointer = trackPointerDown();

    const onClick = (event: MouseEvent) => {
      if (!pointer.isPlainClick(event)) return;
      index = (index + 1) % ACCENTS.length;
      const root = document.documentElement.style;
      root.setProperty("--accent", ACCENTS[index].accent);
      root.setProperty("--accent-deep", ACCENTS[index].deep);
    };

    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
      pointer.dispose();
    };
  }, []);

  return null;
}
