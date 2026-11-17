"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { href, t, type Locale } from "@/lib/i18n";
import { categories, projects, type CategoryKey } from "@/content/projects";
import { ui } from "@/content/ui";

/** Exhibition index: large typographic rows, hover preview that trails the cursor. */
export default function WorkIndex({ lang }: { lang: Locale }) {
  const [filter, setFilter] = useState<CategoryKey | "all">("all");
  const [hovered, setHovered] = useState<string | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  const used = Array.from(new Set(projects.map((p) => p.category)));
  const list = projects.filter((p) => filter === "all" || p.category === filter);
  const hoveredProject = projects.find((p) => p.slug === hovered);

  useEffect(() => {
    const el = preview.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const x = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [filter]);

  return (
    <div>
      <div className="cartel flex flex-wrap gap-x-6 gap-y-3 border-b border-ivory/15 pb-6" role="group" aria-label="Filter">
        {(["all", ...used] as const).map((c) => {
          const active = filter === c;
          const count = c === "all" ? projects.length : projects.filter((p) => p.category === c).length;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(c)}
              className={`flex items-baseline gap-1.5 transition-colors duration-300 ${active ? "text-champagne" : "text-warm hover:text-ivory"}`}
            >
              <span className={active ? "link-underline [background-size:100%_1px]" : "link-underline"}>
                {c === "all" ? t(ui.work.all, lang) : t(categories[c], lang)}
              </span>
              <sup className="text-[0.55rem] opacity-60">{count}</sup>
            </button>
          );
        })}
      </div>

      <ul onPointerLeave={() => setHovered(null)}>
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((p) => {
            const n = String(projects.indexOf(p) + 1).padStart(2, "0");
            return (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="border-b border-ivory/15"
              >
                <Link
                  href={href(lang, `/work/${p.slug}`)}
                  data-cursor={t(ui.work.view, lang)}
                  onPointerEnter={() => setHovered(p.slug)}
                  onFocus={() => setHovered(p.slug)}
                  onBlur={() => setHovered(null)}
                  className="group grid grid-cols-12 items-center gap-4 py-8 md:py-10"
                >
                  <span className="cartel col-span-2 text-champagne md:col-span-1">N°{n}</span>
                  <span className="col-span-10 md:col-span-6">
                    <span
                      className={`display block text-[10vw] leading-[0.95] transition-all duration-700 ease-[var(--ease-luxe)] md:text-[4.6vw] ${
                        hovered && hovered !== p.slug ? "opacity-30" : "opacity-100"
                      } group-hover:translate-x-3 group-hover:italic`}
                    >
                      {t(p.title, lang)}
                    </span>
                  </span>
                  <span className="cartel col-span-12 text-warm md:col-span-3 md:col-start-8">
                    {p.client}
                    <span className="block opacity-70">{t(p.type, lang)}</span>
                  </span>
                  <span className="cartel col-span-12 flex items-center justify-between text-warm md:col-span-2 md:justify-end md:gap-4">
                    {t(categories[p.category], lang)}
                    <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {/* Floating preview (desktop) */}
      <div ref={preview} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[50] hidden w-[22vw] md:block">
        <AnimatePresence>
          {hoveredProject && (
            <motion.div
              key={hoveredProject.slug}
              initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.05 }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
              exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-x-0 top-0 aspect-[4/5] overflow-hidden bg-night-3"
              style={{ boxShadow: `0 0 0 1px ${hoveredProject.tone}33` }}
            >
              {hoveredProject.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hoveredProject.cover.src} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="hatch flex h-full items-end p-6">
                  <span className="display text-4xl italic text-ivory">{hoveredProject.poster ? `${hoveredProject.poster.figure}${hoveredProject.poster.sup ?? ""}` : hoveredProject.client}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
