"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGsap } from "@/lib/motion";
import { href, t, type Locale } from "@/lib/i18n";
import { timeline } from "@/content/about";
import { ui } from "@/content/ui";

const kindLabel = {
  work: { fr: "Expérience", en: "Experience" },
  school: { fr: "Formation", en: "Education" },
  award: { fr: "Distinction", en: "Award" },
};

/** Vertical timeline: the champagne spine draws as you scroll, each stop lights up when reached. */
export default function Timeline({ lang }: { lang: Locale }) {
  const ref = useRef<HTMLOListElement>(null);

  useGsap(ref, (el) => {
    gsap.fromTo(
      el.querySelector("[data-spine]"),
      { scaleY: 0 },
      { scaleY: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 70%", scrub: true } },
    );
    el.querySelectorAll<HTMLElement>("[data-stop]").forEach((stop) => {
      const dot = stop.querySelector("[data-dot]");
      gsap.from(stop.querySelector("[data-body]"), { opacity: 0, x: 30, duration: 1, ease: "expo.out", scrollTrigger: { trigger: stop, start: "top 80%", once: true } });
      gsap.fromTo(dot, { scale: 0.4, backgroundColor: "#d9d2c7" }, { scale: 1, backgroundColor: "#b89b6e", duration: 0.4, scrollTrigger: { trigger: stop, start: "top 70%", toggleActions: "play none none reverse" } });
    });
  });

  return (
    <ol ref={ref} className="relative">
      <span aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px bg-night/10 md:left-[calc(25%+7px)]" />
      <span data-spine aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-champagne md:left-[calc(25%+7px)]" />
      {timeline.map((it, i) => (
        <li key={i} data-stop className="relative grid gap-2 pb-14 pl-10 md:grid-cols-4 md:gap-0 md:pl-0">
          <div className="cartel pt-1 text-warm-dark md:pr-10 md:text-right">{t(it.period, lang)}</div>
          <span data-dot aria-hidden className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-4 border-ivory bg-champagne md:left-1/4" />
          <div data-body className="md:col-span-3 md:pl-12">
            <p className="cartel text-champagne">{t(kindLabel[it.kind], lang)} · {it.place}</p>
            <h3 className="display mt-2 text-3xl leading-tight md:text-4xl">{t(it.org, lang)}</h3>
            <p className="mt-1 text-night/75">{t(it.title, lang)}</p>
            {it.text && <p className="mt-3 max-w-xl text-sm leading-relaxed text-night/60">{t(it.text, lang)}</p>}
            {it.project && (
              <Link href={href(lang, `/work/${it.project}`)} className="cartel link-underline mt-4 inline-block text-night">
                {t(ui.about.seeProject, lang)} →
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
