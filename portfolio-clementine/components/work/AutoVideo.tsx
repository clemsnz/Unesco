"use client";

import { useEffect, useRef, useState } from "react";

/** Muted looping video that only plays while visible; respects reduced motion with a play toggle. */
export default function AutoVideo({ src, poster, ratio, label }: { src: string; poster: string; ratio: number; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().then(() => setPlaying(true)).catch(() => {});
        else {
          v.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
    else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-t-full bg-night" style={{ aspectRatio: String(ratio) }}>
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-label={label} className="h-full w-full object-cover" />
      <button type="button" onClick={toggle} className="cartel absolute bottom-4 left-4 bg-night/70 px-3 py-2 text-ivory backdrop-blur">
        {playing ? "❚❚ Pause" : "▶ Play"}
      </button>
    </div>
  );
}
