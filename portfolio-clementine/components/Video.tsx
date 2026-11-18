"use client";

import { useEffect, useRef } from "react";

/** Short muted loop that plays only while on screen (and never auto-plays with reduced motion). */
export default function Video({ src, poster, ratio, label }: { src: string; poster: string; ratio: number; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      aria-label={label}
      className="w-full bg-line/40 object-cover"
      style={{ aspectRatio: String(ratio) }}
    />
  );
}
