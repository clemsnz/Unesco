"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGsap } from "@/lib/motion";
import { href, t, type Locale } from "@/lib/i18n";
import { categories, featuredProjects, type Project } from "@/content/projects";
import { ui } from "@/content/ui";
import { RevealText } from "@/components/Reveal";
import Button from "@/components/Button";

/** Pinned horizontal "exhibition" of the featured projects (desktop), stacked on mobile. */
export default function SelectedWork({ lang }: { lang: Locale }) {
  const ref = useRef<HTMLElement>(null);

  useGsap(ref, (el) => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const track = el.querySelector<HTMLElement>("[data-track]");
      if (!track) return;
      const distance = () => track.scrollWidth - window.innerWidth + 64;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el.querySelector("[data-pin]"),
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      // counter-drift on images for depth
      el.querySelectorAll<HTMLElement>("[data-drift]").forEach((img) => {
        gsap.fromTo(img, { xPercent: 6 }, {
          xPercent: -6,
          ease: "none",
          scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
        });
      });
      // progress line
      gsap.to(el.querySelector("[data-progress]"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: el.querySelector("[data-pin]"), start: "top top", end: () => `+=${distance()}`, scrub: true },
      });
    });
  });

  const offsets = ["lg:mt-[12vh]", "lg:mt-[24vh]", "lg:mt-[14vh]", "lg:mt-[20vh]"];
  const widths = ["lg:w-[27vw]", "lg:w-[38vw]", "lg:w-[36vw]", "lg:w-[25vw]"];

  return (
    <section ref={ref} className="relative bg-night text-ivory" aria-labelledby="selected-title">
      <div data-pin className="relative overflow-hidden px-4 py-28 md:px-8 lg:flex lg:h-[100svh] lg:items-center lg:py-0">
        <div data-track className="hscroll">
          <header className="lg:w-[34vw] lg:pt-[10vh]">
            <p className="cartel text-champagne">N°02 — {t(ui.home.selected, lang)}</p>
            <RevealText as="h2" text={lang === "fr" ? "Projets *choisis*" : "Selected *work*"} className="display mt-6 text-[17vw] leading-[0.9] md:text-[9vw] lg:text-[7.4vw]" />
            <p className="mt-8 max-w-sm text-base leading-relaxed text-ivory/70">{t(ui.home.selectedIntro, lang)}</p>
            <div className="mt-10">
              <Button href={href(lang, "/work")}>{t(ui.home.allWork, lang)}</Button>
            </div>
          </header>

          {featuredProjects.map((p, i) => (
            <ProjectTile key={p.slug} project={p} index={i} lang={lang} className={`${offsets[i % 4]} ${widths[i % 4]}`} />
          ))}
        </div>

        <div aria-hidden className="absolute inset-x-8 bottom-8 hidden h-px bg-ivory/10 lg:block">
          <div data-progress className="h-full origin-left scale-x-0 bg-champagne" />
        </div>
      </div>
    </section>
  );
}

function ProjectTile({ project: p, index, lang, className }: { project: Project; index: number; lang: Locale; className: string }) {
  const n = String(index + 1).padStart(2, "0");
  return (
    <article className={`group relative w-full shrink-0 ${className}`}>
      <Link href={href(lang, `/work/${p.slug}`)} data-cursor={t(ui.work.view, lang)} className="block" aria-label={`${t(p.title, lang)} — ${p.client}`}>
        <div className="cartel mb-4 flex justify-between gap-6 text-warm">
          <span>
            <span className="text-champagne">N°{n}</span> · {t(categories[p.category], lang)}
          </span>
          <span className="hidden text-right sm:inline">{t(p.year, lang)}</span>
        </div>

        <div className="relative overflow-hidden bg-night-3" style={{ aspectRatio: p.cover ? (p.cover.ratio < 1 ? "4 / 5" : "4 / 3") : "4 / 5" }}>
          {p.cover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-drift
                src={p.cover.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-y-0 left-[-8%] h-full w-[116%] max-w-none object-cover transition-[scale] duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-night/10 transition-colors duration-700 group-hover:bg-night/0" />
            </>
          ) : (
            <PosterTile project={p} lang={lang} />
          )}
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-x-100"
            style={{ background: p.tone }}
          />
        </div>

        <h3 className="display mt-6 text-4xl leading-[1] transition-colors duration-500 md:text-5xl">
          <span className="link-underline pb-1">{t(p.title, lang)}</span>
        </h3>
        <p className="cartel mt-3 text-warm">{p.client} — {t(p.type, lang)}</p>
      </Link>
    </article>
  );
}

/** Typographic poster for projects without a supplied cover visual. */
export function PosterTile({ project: p, lang }: { project: Project; lang: Locale }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-night-2 p-6 md:p-8">
      <div className="cartel flex justify-between gap-4 text-champagne">
        <span>{p.client}</span>
        <span>{t(p.year, lang)}</span>
      </div>
      <div>
        {p.poster ? (
          <>
            <div className="display text-[28vw] leading-[0.8] text-ivory transition-transform duration-1000 ease-[var(--ease-luxe)] group-hover:-translate-y-2 lg:text-[9vw]">
              {p.poster.figure}
              {p.poster.sup && <sup className="text-[0.4em] italic text-champagne">{p.poster.sup}</sup>}
            </div>
            <p className="display mt-4 max-w-xs text-xl italic text-ivory/80 md:text-2xl">{t(p.poster.line, lang)}</p>
          </>
        ) : (
          <p className="display text-5xl italic text-ivory/90">{t(p.title, lang)}</p>
        )}
      </div>
    </div>
  );
}
