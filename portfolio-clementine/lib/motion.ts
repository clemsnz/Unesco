"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useEffect, type RefObject } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Run GSAP code scoped to a ref, auto-reverted on unmount.
 * The callback is skipped entirely when the user prefers reduced motion.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  fn: (self: HTMLElement) => void | (() => void),
  deps: unknown[] = [],
) {
  useIsoLayoutEffect(() => {
    const el = scope.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => fn(el), el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ── Intro coordination: hero waits for the intro curtain ── */
let introDone = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  introDone = true;
  listeners.forEach((l) => l());
  listeners.clear();
}

export function onIntroDone(cb: () => void) {
  if (introDone) cb();
  else listeners.add(cb);
  return () => listeners.delete(cb);
}
