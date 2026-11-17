"use client";

import { useRef, useState } from "react";
import { gsap, markIntroDone, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/motion";

/**
 * Opening curtain — shown once per browser session, ~1.6 s.
 * The name rises letter by letter, a champagne rule draws, the curtain lifts.
 */
export default function Intro({ first, last }: { first: string; last: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);

  useIsoLayoutEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("cs-intro") === "1";
    } catch {}
    if (seen || prefersReducedMotion() || !ref.current) {
      setShow(false);
      markIntroDone();
      return;
    }
    try {
      sessionStorage.setItem("cs-intro", "1");
    } catch {}

    const el = ref.current;
    const count = el.querySelector<HTMLElement>("[data-count]");
    const counter = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => setShow(false) });
    tl.from(el.querySelectorAll("[data-letter]"), { yPercent: 115, duration: 0.85, ease: "expo.out", stagger: 0.026 })
      .from(el.querySelector("[data-line]"), { scaleX: 0, duration: 0.9, ease: "expo.inOut" }, 0.15)
      .to(counter, {
        v: 100,
        duration: 0.95,
        ease: "power2.inOut",
        onUpdate: () => {
          if (count) count.textContent = String(Math.round(counter.v)).padStart(3, "0");
        },
      }, 0.1)
      .to(el.querySelectorAll("[data-letter]"), { yPercent: -115, duration: 0.6, ease: "expo.in", stagger: 0.012 }, "+=0.05")
      .add(() => markIntroDone(), "-=0.15")
      .to(el, { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, "-=0.25");

    return () => {
      tl.kill();
    };
  }, []);

  if (!show) return null;

  const letters = (word: string) =>
    Array.from(word).map((ch, i) => (
      <span key={i} className="inline-block overflow-hidden align-bottom">
        <span data-letter className="inline-block">
          {ch}
        </span>
      </span>
    ));

  return (
    <div
      id="intro"
      ref={ref}
      aria-hidden
      className="grain fixed inset-0 z-[100] flex flex-col items-center justify-center bg-night text-ivory"
    >
      <div className="display text-center text-[13vw] leading-[0.9] md:text-[7.5vw]">
        <div>{letters(first)}</div>
        <div className="italic text-champagne-soft">{letters(last)}</div>
      </div>
      <div data-line className="mt-8 h-px w-40 origin-left bg-champagne" />
      <div className="cartel absolute bottom-6 left-4 text-warm md:left-8">Portfolio — 2026 / 27</div>
      <div data-count className="cartel absolute bottom-6 right-4 text-warm md:right-8">
        000
      </div>
    </div>
  );
}
