"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

type W = Window & { __lenis?: Lenis };

/** Smooth, inertial scrolling (Lenis) synchronised with GSAP ScrollTrigger. */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    (window as W).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as W).__lenis;
    };
  }, []);

  // New page → back to top, then recompute trigger positions once images settle.
  useEffect(() => {
    const lenis = (window as W).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 450);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", onLoad);
    };
  }, [pathname]);

  return null;
}
