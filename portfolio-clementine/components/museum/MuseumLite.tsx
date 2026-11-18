"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { artworks, entrance, type Artwork } from "@/content/museum";
import { site } from "@/content/site";

/**
 * The museum for phones, reduced motion and devices without WebGL:
 * a vertical gallery where each work comes towards the visitor as they scroll.
 */
export default function MuseumLite() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-approach]") ?? []);
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = Math.min(Math.max((vh - r.top) / (vh * 0.9), 0), 1); // 0 → entering, 1 → in front of us
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

  return (
    <div ref={root} className="bg-[#ece9e3] text-[#1c1916]">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-[#ece9e3]/85 px-4 py-4 text-[12px] backdrop-blur">
        <span className="uppercase tracking-[0.18em]">{site.name}</span>
        <nav className="flex gap-5">
          <a href={site.cv} download>CV</a>
          <a href={`mailto:${site.email}`}>Contact</a>
        </nav>
      </header>

      <section className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#6b6259]">{entrance.room}</p>
        <h1 className="mt-8 text-[9vw] font-medium leading-tight tracking-[0.18em] sm:text-5xl">{entrance.name}</h1>
        <p className="mt-5 max-w-xs text-sm text-[#6b6259]">{entrance.line}</p>
        <p className="mt-16 text-[11px] uppercase tracking-[0.24em] text-[#6b6259]">Faites défiler pour entrer ↓</p>
      </section>

      <p className="px-6 text-center text-[11px] uppercase tracking-[0.24em] text-[#6b6259]">Galerie 02 — Œuvres choisies</p>

      {artworks.map((a) => (
        <Work key={a.slug} a={a} />
      ))}

      <section className="flex min-h-[60svh] flex-col items-center justify-center text-center">
        <p className="text-[11px] uppercase tracking-[0.24em]">Galerie 03</p>
        <p className="mt-2 text-[#6b6259]">Parcours →</p>
      </section>
    </div>
  );
}

function Work({ a }: { a: Artwork }) {
  const frame =
    a.kind === "photo" ? "border-[6px] border-[#2b2622] bg-[#fbfaf6] p-[7%]" : a.kind === "poster" ? "border-[3px] border-[#141312]" : "border-[6px] border-[#141312]";
  const media =
    a.kind === "screen" ? (
      <video src={a.src} poster={a.poster} muted loop autoPlay playsInline className="block w-full" style={{ aspectRatio: String(a.ratio) }} />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={a.src} alt={a.title} loading="lazy" className="block w-full" style={{ aspectRatio: String(a.ratio) }} />
    );
  const body = (
    <div data-approach className="mx-auto w-[78%] max-w-sm will-change-transform">
      <div className={`${frame} shadow-[8px_18px_40px_-12px_rgba(30,22,15,0.45)]`}>{media}</div>
    </div>
  );
  return (
    <section
      className="flex min-h-[110svh] flex-col items-center justify-center px-4 py-20"
      style={{ background: "radial-gradient(ellipse 70% 50% at 50% 42%, #fbfaf7 0%, rgba(236,233,227,0) 70%)" }}
    >
      {a.page ? (
        <Link href={a.page} className="block w-full" aria-label={`Explorer : ${a.title}`}>
          {body}
        </Link>
      ) : (
        <div className="w-full">{body}</div>
      )}
      <div className="mt-10 w-[78%] max-w-sm">
        <p className="text-[11px] tracking-[0.2em] text-[#8a8178]">{a.n}</p>
        <p className="mt-1 text-xl leading-tight">{a.title}</p>
        <p className="mt-1 text-[13px] text-[#6b6259]">{a.line}</p>
        <p className="text-[13px] text-[#6b6259]">{a.role}</p>
        {a.page && (
          <Link href={a.page} className="mt-4 inline-block border-b border-current text-[13px]">
            Explorer l’œuvre →
          </Link>
        )}
      </div>
    </section>
  );
}
