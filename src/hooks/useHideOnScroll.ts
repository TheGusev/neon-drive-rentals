import { useEffect, type RefObject } from "react";

type Options = {
  /** Always visible while scroll position is above this offset. */
  topOffset?: number;
  /** Accumulated downward distance before hiding. */
  hideAfter?: number;
  /** Accumulated upward distance before showing again. */
  showAfter?: number;
  /** Force-visible (e.g. while a menu is open). */
  locked?: boolean;
};

/**
 * Hides an element on scroll down and reveals it on scroll up by writing
 * `data-hidden` straight to the DOM — no React state, so scrolling never
 * triggers a re-render. rAF-throttled, passive, single scrollY read per frame.
 */
export function useHideOnScroll(
  ref: RefObject<HTMLElement | null>,
  { topOffset = 64, hideAfter = 24, showAfter = 8, locked = false }: Options = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const set = (hidden: boolean) => {
      const next = hidden ? "true" : "false";
      if (el.dataset["hidden"] !== next) el.dataset["hidden"] = next;
    };

    if (locked) {
      set(false);
      return;
    }

    let lastY = window.scrollY;
    let down = 0;
    let up = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      if (y <= topOffset) {
        down = 0;
        up = 0;
        set(false);
        return;
      }

      if (delta > 0) {
        down += delta;
        up = 0;
        if (down >= hideAfter) set(true);
      } else if (delta < 0) {
        up -= delta;
        down = 0;
        if (up >= showAfter) set(false);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, topOffset, hideAfter, showAfter, locked]);
}
