"use client";

import { useEffect, useState } from "react";

/**
 * Opening of a project room: the work fills the screen as if the visitor had walked up to it,
 * then settles back onto its wall with its cartel.
 */
export default function RoomHero() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <section
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pb-16 pt-24"
      style={{ background: "radial-gradient(ellipse 55% 60% at 50% 46%, #fbfaf7 0%, rgba(239,236,230,0) 72%)" }}
    >
      <div className={`transition-transform duration-[1600ms] ${ease} motion-reduce:transition-none ${on ? "scale-100" : "scale-[1.9]"}`}>
        <div className="border-[6px] border-[#2b2622] bg-[#fbfaf6] p-[clamp(18px,3.4vh,40px)] shadow-[12px_26px_60px_-18px_rgba(30,22,15,0.5)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/mini-mat/diner-table.webp" alt="Table du dîner de lancement du Mini Mat" className="block h-[min(64svh,720px)] w-auto max-w-[78vw] object-cover" style={{ aspectRatio: String(1179 / 1651) }} />
        </div>
      </div>
      <div className={`absolute bottom-10 left-6 max-w-xs transition-all delay-700 duration-1000 md:bottom-auto md:left-auto md:right-[8vw] md:top-[58%] ${on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <p className="text-[11px] tracking-[0.2em] text-[#8a8178]">01</p>
        <h1 className="mt-1 text-2xl leading-tight md:text-3xl">Lancement du Mini Mat</h1>
        <p className="mt-2 text-[13px] text-[#6b6259]">Charlotte Muller · Lancement produit · 2025</p>
        <p className="text-[13px] text-[#6b6259]">Assistante communication & marketing</p>
      </div>
      <div className={`pointer-events-none absolute inset-0 bg-[#f7f6f2] transition-opacity duration-1000 ${on ? "opacity-0" : "opacity-100"}`} />
    </section>
  );
}
