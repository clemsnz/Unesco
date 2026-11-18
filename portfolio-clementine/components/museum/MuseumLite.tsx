"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { about, entrance, exit, journey, rooms, works, type Work } from "@/content/museum";
import { site } from "@/content/site";

/**
 * The museum for phones, reduced motion and devices without WebGL:
 * a vertical walk where each work comes towards the visitor as they scroll.
 */
export default function MuseumLite() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-approach]") ?? []);
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = Math.min(Math.max((vh - r.top) / (vh * 0.85), 0), 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.style.transform = `perspective(900px) translateZ(${(1 - e) * -160}px) translateY(${(1 - e) * 40}px)`;
        el.style.opacity = String(0.15 + e * 0.85);
      });
    };
    const onScroll = () => (raf ||= requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const label = "text-[11px] uppercase tracking-[0.24em] text-[#6b6259]";
  let mainN = 0;
  let cabN = 0;

  return (
    <div ref={root} className="bg-[#f1eee9] text-[#1c1916]">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-[#f1eee9]/85 px-4 py-4 text-[12px] backdrop-blur md:px-8">
        <a href="#entree" className="uppercase tracking-[0.18em]">{site.name}</a>
        <nav className="flex gap-5" aria-label="Navigation">
          <a href="#oeuvres">Œuvres</a>
          <a href={site.cv} download>CV</a>
          <a href="#sortie">Contact</a>
        </nav>
      </header>

      <section id="entree" className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <p className={label}>{entrance.room}</p>
        <h1 className="mt-8 text-[8.5vw] font-medium leading-tight tracking-[0.16em] sm:text-5xl">{entrance.name}</h1>
        <p className="mt-5 max-w-xs text-sm text-[#6b6259]">{entrance.line}</p>
        <p className={`${label} mt-16`}>Faites défiler pour entrer ↓</p>
      </section>

      <p id="oeuvres" className={`${label} px-6 pt-10 text-center`}>{rooms.main}</p>
      {works.map((w) => {
        if (w.room !== "main") return null;
        return <Hung key={w.slug} w={w} n={String(++mainN).padStart(2, "0")} />;
      })}

      <p className={`${label} px-6 pt-10 text-center`}>{rooms.cabinet}</p>
      {works.map((w) => {
        if (w.room !== "cabinet") return null;
        return <Hung key={w.slug} w={w} n={`Étude ${String(++cabN).padStart(2, "0")}`} small />;
      })}

      <section className="px-6 py-28">
        <p className={`${label} text-center`}>{rooms.journey}</p>
        <ol className="mx-auto mt-14 max-w-sm space-y-6">
          {journey.map((j, k) => (
            <li key={k} data-approach className="bg-[#faf9f5] p-7 shadow-[6px_14px_30px_-14px_rgba(30,22,15,0.35)]">
              <p className="text-[11px] tracking-[0.2em] text-[#8a8178]">{String(k + 1).padStart(2, "0")}</p>
              <p className="mt-4 text-3xl">{j.years}</p>
              <p className="mt-4 text-lg leading-snug">{j.title}</p>
              <p className="mt-1 text-sm text-[#6b6259]">{j.org}</p>
              <ul className="mt-4 space-y-1 text-sm text-[#3a332d]">
                {j.details.map((d) => (
                  <li key={d}>— {d}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-6 py-28">
        <p className={`${label} text-center`}>{rooms.about}</p>
        <div data-approach className="mx-auto mt-14 w-[78%] max-w-sm border-[6px] border-[#2b2622] bg-[#fbfaf6] p-[7%] shadow-[8px_18px_40px_-12px_rgba(30,22,15,0.45)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={about.portrait.src} alt={about.portrait.alt} loading="lazy" className="block w-full object-cover" style={{ aspectRatio: String(about.portrait.ratio) }} />
        </div>
        <p className="mx-auto mt-14 max-w-sm text-2xl leading-snug">« {about.quote} »</p>
        <div className="mx-auto mt-6 max-w-sm space-y-1 text-sm text-[#6b6259]">
          {about.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
          <p className="pt-3 text-[#1c1916]">{about.seeking}</p>
        </div>
        <dl className="mx-auto mt-14 max-w-sm space-y-6">
          {about.skills.map((k) => (
            <div key={k.title}>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-[#8a8178]">{k.title}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed">{k.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="sortie" className="flex min-h-[90svh] flex-col items-center justify-center px-6 text-center">
        <p className={label}>{rooms.exit}</p>
        <p className="mt-8 max-w-md text-4xl leading-tight">{exit.line}</p>
        <div className="mt-12 flex flex-col items-center gap-4 text-[15px]">
          <a href={`mailto:${site.email}`} className="border-b border-current pb-0.5">{site.email}</a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="border-b border-current pb-0.5">LinkedIn ↗</a>
          <a href={site.cv} download className="border-b border-current pb-0.5">Télécharger le CV ↓</a>
        </div>
      </section>
    </div>
  );
}

function Hung({ w, n, small = false }: { w: Work; n: string; small?: boolean }) {
  const frame = w.kind === "photo" ? "border-[6px] border-[#2b2622] bg-[#fbfaf6] p-[7%]" : "border-[3px] border-[#141312]";
  const width = w.art.ratio > 1.2 ? (small ? "w-[80%]" : "w-[88%]") : small ? "w-[62%]" : "w-[76%]";
  return (
    <section
      className="flex min-h-[100svh] flex-col items-center justify-center px-4 py-16"
      style={{ background: "radial-gradient(ellipse 70% 50% at 50% 42%, #fbfaf7 0%, rgba(241,238,233,0) 70%)" }}
    >
      <Link href={`/oeuvres/${w.slug}/`} className={`block ${width} max-w-md`} aria-label={`Explorer : ${w.title}`}>
        <div data-approach className="will-change-transform">
          <div className={`${frame} shadow-[8px_18px_40px_-12px_rgba(30,22,15,0.45)]`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={w.art.src} alt={w.art.alt} loading="lazy" className="block w-full object-cover" style={{ aspectRatio: String(w.art.ratio) }} />
          </div>
        </div>
      </Link>
      <div className={`mt-10 ${width} max-w-md`}>
        <p className="text-[11px] tracking-[0.2em] text-[#8a8178]">{n}</p>
        <p className="mt-1 text-xl leading-tight">{w.title}</p>
        <p className="mt-1 text-[13px] text-[#6b6259]">{w.line}</p>
        <p className="text-[13px] text-[#6b6259]">{w.role}</p>
        <Link href={`/oeuvres/${w.slug}/`} className="mt-4 inline-block border-b border-current text-[13px]">
          Explorer l’œuvre →
        </Link>
      </div>
    </section>
  );
}
