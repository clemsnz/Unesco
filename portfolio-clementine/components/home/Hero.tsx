"use client";

import { useRef } from "react";
import { gsap, onIntroDone, useGsap } from "@/lib/motion";
import { t, type Locale } from "@/lib/i18n";
import { site } from "@/content/site";
import { ui } from "@/content/ui";

export default function Hero({ lang }: { lang: Locale }) {
  const ref = useRef<HTMLElement>(null);

  useGsap(ref, (el) => {
    const letters = el.querySelectorAll("[data-l]");
    const arch = el.querySelector("[data-arch]");
    const fades = el.querySelectorAll("[data-fade]");
    const halo = el.querySelector<HTMLElement>("[data-halo]");

    gsap.set(letters, { yPercent: 110 });
    gsap.set(arch, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(fades, { opacity: 0, y: 18 });

    onIntroDone(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(letters, { yPercent: 0, duration: 1.4, stagger: 0.035 })
        .to(arch, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" }, 0.2)
        .from(el.querySelector("[data-arch] video"), { scale: 1.3, duration: 2.2 }, 0.2)
        .to(fades, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.7);
    });

    // Scroll: name drifts apart, arch rises — a quiet parallax exit.
    gsap.to(el.querySelector("[data-line1]"), { xPercent: -8, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(el.querySelector("[data-line2]"), { xPercent: 8, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(arch, { yPercent: -18, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });

    // Champagne halo follows the pointer (fine pointers only).
    if (halo && window.matchMedia("(pointer: fine)").matches) {
      gsap.set(halo, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight * 0.4 });
      const hx = gsap.quickTo(halo, "x", { duration: 1.2, ease: "power3" });
      const hy = gsap.quickTo(halo, "y", { duration: 1.2, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        hx(e.clientX - r.left);
        hy(e.clientY - r.top);
      };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    }
  });

  const split = (word: string) =>
    Array.from(word).map((ch, i) => (
      <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
        <span data-l className="inline-block">
          {ch}
        </span>
      </span>
    ));

  const words = [
    { fr: "Stratégie de marque", en: "Brand strategy" },
    { fr: "Influence & RP", en: "Influencer & PR" },
    { fr: "Événementiel", en: "Events" },
    { fr: "Contenus & CRM", en: "Content & CRM" },
    { fr: "Beauté · Bien-être · Luxe", en: "Beauty · Wellness · Luxury" },
  ];

  return (
    <section ref={ref} className="grain relative min-h-[100svh] overflow-hidden bg-night text-ivory" aria-labelledby="hero-title">
      <div
        data-halo
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[60vmax] w-[60vmax] rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(184,155,110,0.16) 0%, rgba(184,155,110,0) 60%)", transform: "translate(calc(50vw - 50%), calc(40vh - 50%))" }}
      />

      <div className="relative flex min-h-[100svh] flex-col justify-between px-4 pb-6 pt-24 md:px-8 md:pt-28">
        <div className="cartel flex justify-between gap-6 text-warm" data-fade>
          <span>N°00 — Portfolio 2026 / 27</span>
          <span className="hidden text-right sm:block">{t(site.school, lang)}</span>
        </div>

        <div className="relative mt-10 md:mt-0">
          <h1 id="hero-title" className="display relative z-10 text-[16vw] leading-[0.86] md:text-[15.5vw]" aria-label={site.name}>
            <span data-line1 className="block" aria-hidden>
              {split(site.firstName)}
            </span>
            <span data-line2 className="block pl-[14vw] italic text-champagne-soft md:pl-[22vw]" aria-hidden>
              {split(site.lastName)}
            </span>
          </h1>

          {/* Arch window onto the George V press event */}
          <div
            data-arch
            className="absolute right-[2vw] top-[-6vh] z-0 hidden aspect-[3/4.4] w-[22vw] overflow-hidden rounded-t-full md:block"
            aria-hidden
          >
            <video className="h-full w-full object-cover opacity-80" src="/video/press-event.mp4" poster="/video/press-event-poster.jpg" autoPlay muted loop playsInline preload="metadata" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
          </div>
        </div>

        <div className="mt-10 grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-6" data-fade>
            <p className="display text-3xl italic md:text-5xl">{t(site.tagline, lang)}</p>
            <p className="cartel mt-4 max-w-md text-warm">{t(site.role, lang)}</p>
          </div>
          <div className="flex items-end justify-between md:col-span-6 md:justify-end md:gap-16" data-fade>
            <p className="cartel max-w-[16rem] text-champagne">{t(site.availability, lang)}</p>
            <span className="cartel flex items-center gap-3 text-warm">
              {t(ui.home.scroll, lang)}
              <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-warm/30">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_var(--ease-luxe)_infinite] bg-champagne" />
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="border-y border-ivory/10 py-4" aria-hidden>
        <div className="flex overflow-hidden">
          <div className="marquee-track flex shrink-0 gap-12 whitespace-nowrap pr-12">
            {[...words, ...words, ...words, ...words].map((w, i) => (
              <span key={i} className="display flex items-center gap-12 text-2xl italic text-ivory/70 md:text-3xl">
                {t(w, lang)} <span className="text-champagne not-italic">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
