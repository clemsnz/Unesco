"use client";

import { useEffect, useState } from "react";
import type { Work } from "@/content/museum";

/**
 * Opening of a room: the work fills the screen as if the visitor had walked up to it,
 * then settles back onto its wall with its cartel.
 */
export default function RoomHero({ w, n }: { w: Work; n: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";
  const landscape = w.art.ratio > 1.15;
  const frame = w.kind === "photo" ? "border-[6px] border-[#2b2622] bg-[#fbfaf6] p-[clamp(16px,3.2vh,38px)]" : "border-[3px] border-[#141312]";
  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center gap-10 overflow-hidden px-6 pb-16 pt-24 md:flex-row md:gap-16"
      style={{ background: "radial-gradient(ellipse 55% 60% at 50% 46%, #fbfaf7 0%, rgba(239,236,230,0) 72%)" }}
    >
      <div className={`transition-transform duration-[1600ms] ${ease} motion-reduce:transition-none ${on ? "scale-100" : "scale-[1.9]"}`}>
        <div className={`${frame} shadow-[12px_26px_60px_-18px_rgba(30,22,15,0.5)]`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={w.art.src}
            alt={w.art.alt}
            className={landscape ? "block h-auto w-[min(84vw,860px)]" : "block h-[min(62svh,700px)] w-auto max-w-[78vw]"}
            style={{ aspectRatio: String(w.art.ratio) }}
          />
        </div>
      </div>
      <div className={`max-w-xs self-start transition-all delay-700 duration-1000 md:self-end md:pb-[8vh] ${on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <p className="text-[11px] tracking-[0.2em] text-[#8a8178]">{n}</p>
        <h1 className="mt-1 text-2xl leading-tight md:text-3xl">{w.title}</h1>
        <p className="mt-2 text-[13px] text-[#6b6259]">{w.line}</p>
        <p className="text-[13px] text-[#6b6259]">{w.role}</p>
      </div>
      <div className={`pointer-events-none absolute inset-0 bg-[#f7f6f2] transition-opacity duration-1000 ${on ? "opacity-0" : "opacity-100"}`} />
    </section>
  );
}
