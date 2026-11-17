"use client";

import { useRef } from "react";
import { gsap, useGsap } from "@/lib/motion";

/**
 * Image revealed through a rising mask, with an optional slow parallax drift.
 * Uses plain <img> (static export) with reserved aspect ratio to avoid layout shift.
 */
export function MaskImage({
  src,
  alt,
  ratio,
  className = "",
  imgClassName = "",
  parallax = true,
  priority = false,
  fit = "cover",
  sizes,
  arch = false,
}: {
  src: string;
  alt: string;
  ratio: number;
  className?: string;
  imgClassName?: string;
  parallax?: boolean;
  priority?: boolean;
  fit?: "cover" | "contain";
  sizes?: string;
  /** top edge cut as a palace arch */
  arch?: boolean;
}) {
  const round = arch ? " round 9999px 9999px 0px 0px" : "";
  const ref = useRef<HTMLDivElement>(null);

  useGsap(ref, (el) => {
    const img = el.querySelector("img");
    gsap.fromTo(
      el,
      { clipPath: `inset(100% 0% 0% 0%${round})` },
      {
        clipPath: `inset(0% 0% 0% 0%${round})`,
        duration: 1.5,
        ease: "expo.inOut",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
    if (img) {
      gsap.fromTo(img, { scale: 1.22 }, { scale: parallax ? 1.08 : 1, duration: 1.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      if (parallax) {
        gsap.fromTo(
          img,
          { yPercent: -4 },
          { yPercent: 4, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      }
    }
  });

  return (
    <div ref={ref} className={`relative overflow-hidden bg-night-3 ${className}`} style={{ aspectRatio: String(ratio), clipPath: arch ? `inset(0% 0% 0% 0%${round})` : undefined }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"} ${imgClassName}`}
      />
    </div>
  );
}

/** Elegant frame for a visual that has not been supplied yet. */
export function Placeholder({ label, tag, ratio = 16 / 9, className = "" }: { label: string; tag: string; ratio?: number; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${tag} — ${label}`}
      className={`hatch relative flex items-center justify-center border border-dashed border-champagne/50 ${className}`}
      style={{ aspectRatio: String(ratio) }}
    >
      <div className="max-w-sm bg-ivory/90 px-5 py-4 text-center text-night">
        <div className="cartel text-champagne">{tag}</div>
        <div className="mt-2 font-display text-lg italic leading-snug">{label}</div>
      </div>
    </div>
  );
}
