"use client";

import { createElement, useRef, type ReactNode, type ElementType } from "react";
import { gsap, onIntroDone, useGsap } from "@/lib/motion";

/**
 * Text that rises word by word from behind a mask.
 * Wrap words in *asterisks* to set them in champagne italics.
 */
export function RevealText({
  text,
  as = "div",
  className = "",
  delay = 0,
  onLoad = false,
  stagger = 0.04,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** animate on page load (after intro) rather than on scroll */
  onLoad?: boolean;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGsap(ref, (el) => {
    const words = el.querySelectorAll("[data-w]");
    const anim = gsap.from(words, {
      yPercent: 118,
      rotate: 2,
      duration: 1.15,
      ease: "expo.out",
      stagger,
      delay,
      paused: true,
    });
    if (onLoad) {
      onIntroDone(() => anim.play());
    } else {
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true, onEnter: () => anim.play() } });
    }
  });

  const tokens = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  let key = 0;
  const children: ReactNode[] = [];
  tokens.forEach((tok) => {
    const italic = tok.startsWith("*") && tok.endsWith("*");
    const clean = italic ? tok.slice(1, -1) : tok;
    clean.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) {
        children.push(" ");
        return;
      }
      children.push(
        <span key={key++} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <span data-w className={`inline-block ${italic ? "italic text-champagne" : ""}`}>
            {w}
          </span>
        </span>,
      );
    });
  });

  return createElement(as, { ref, className, "aria-label": text.replace(/\*/g, "") }, <span aria-hidden>{children}</span>);
}

/** Simple fade + rise for blocks of content. */
export function FadeUp({
  children,
  className = "",
  delay = 0,
  y = 36,
  as = "div",
  stagger,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: ElementType;
  /** if set, animates direct children one after the other */
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, (el) => {
    const targets = stagger ? Array.from(el.children) : el;
    gsap.from(targets, {
      y,
      opacity: 0,
      duration: 1.1,
      ease: "expo.out",
      delay,
      stagger: stagger ?? 0,
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });
  return createElement(as, { ref, className }, children);
}

/** Thin rule that draws itself across the column. */
export function Rule({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, (el) => {
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 1.4,
      ease: "expo.inOut",
      scrollTrigger: { trigger: el, start: "top 95%", once: true },
    });
  });
  return <div ref={ref} aria-hidden className={`rule ${className}`} />;
}
