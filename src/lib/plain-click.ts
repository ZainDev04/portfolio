// A "plain click" is a primary-button click that isn't on a link or button
// and didn't travel far enough to be a drag. Both the accent cycle and the
// hero orbit react only to plain clicks.

const DRAG_THRESHOLD = 6;

export function trackPointerDown() {
  let startX = 0;
  let startY = 0;

  const onDown = (event: PointerEvent) => {
    startX = event.clientX;
    startY = event.clientY;
  };

  const isPlainClick = (event: MouseEvent) => {
    if (event.button !== 0) return false;
    const target = event.target as Element | null;
    if (target?.closest("a, button, input, textarea, select, [data-no-accent]")) {
      return false;
    }
    return Math.hypot(event.clientX - startX, event.clientY - startY) <= DRAG_THRESHOLD;
  };

  window.addEventListener("pointerdown", onDown);

  return {
    isPlainClick,
    dispose: () => window.removeEventListener("pointerdown", onDown),
  };
}
