import type { Metadata } from "next";
import { t, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { bio, languages, personal, portrait, skills, tools } from "@/content/about";
import { FadeUp, RevealText, Rule } from "@/components/Reveal";
import { MaskImage } from "@/components/Media";
import Timeline from "@/components/Timeline";
import Button from "@/components/Button";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({ lang, path: "/about", title: t(ui.about.title, lang), description: t(ui.about.lead, lang) });
}

export default async function About({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return (
    <>
      {/* ── Portrait ── */}
      <section className="grain relative bg-night px-4 pb-24 pt-36 text-ivory md:px-8 md:pb-36 md:pt-44">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="flex flex-col justify-between md:col-span-7">
            <div>
              <p className="cartel text-champagne">{t(ui.about.title, lang)} — {site.name}</p>
              <RevealText as="h1" onLoad text={t(ui.about.lead, lang).replace(/^([^.]+\.)/, "*$1*")} className="display mt-8 text-[10vw] leading-[1] md:text-[4.8vw]" stagger={0.025} />
            </div>
            <FadeUp delay={0.4} className="mt-12 grid gap-6 border-t border-ivory/15 pt-8 sm:grid-cols-3">
              <div>
                <p className="cartel text-champagne">{lang === "fr" ? "Aujourd’hui" : "Now"}</p>
                <p className="mt-2 text-sm text-ivory/80">{t(site.school, lang)}</p>
              </div>
              <div>
                <p className="cartel text-champagne">{lang === "fr" ? "Recherche" : "Looking for"}</p>
                <p className="mt-2 text-sm text-ivory/80">{t(site.availability, lang)}</p>
              </div>
              <div>
                <p className="cartel text-champagne">{lang === "fr" ? "Secteurs" : "Sectors"}</p>
                <p className="mt-2 text-sm text-ivory/80">{lang === "fr" ? "Mode, beauté, luxe, bien-être" : "Fashion, beauty, luxury, wellness"}</p>
              </div>
            </FadeUp>
          </div>
          <figure className="md:col-span-4 md:col-start-9">
            <MaskImage src={portrait.src} alt={t(portrait.alt, lang)} ratio={portrait.ratio} priority arch />
            <figcaption className="cartel mt-4 normal-case tracking-[0.04em] text-warm">{t(portrait.caption, lang)}</figcaption>
          </figure>
        </div>
      </section>

      {/* ── Bio ── */}
      <section className="room-light px-4 py-24 md:px-8 md:py-36">
        <div className="grid gap-10 md:grid-cols-12">
          <p className="cartel text-warm-dark md:col-span-3">N°01 — {lang === "fr" ? "En quelques lignes" : "In a few lines"}</p>
          <FadeUp stagger={0.12} className="space-y-8 md:col-span-7">
            {bio.map((p, i) => (
              <p key={i} className={i === 0 ? "display text-3xl leading-snug md:text-4xl" : "text-lg leading-relaxed text-night/80 md:text-xl"}>
                {t(p, lang)}
              </p>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="room-light px-4 pb-24 md:px-8 md:pb-36" aria-labelledby="path">
        <Rule className="mb-16" />
        <div className="mb-16 grid gap-6 md:grid-cols-12">
          <p className="cartel text-warm-dark md:col-span-3">N°02 — {t(ui.about.path, lang)}</p>
          <RevealText as="h2" text={lang === "fr" ? "Le *parcours*" : "The *path*"} className="display text-[14vw] leading-[0.9] md:col-span-9 md:text-[7vw]" />
        </div>
        <Timeline lang={lang} />
      </section>

      {/* ── Skills ── */}
      <section className="bg-night px-4 py-24 text-ivory md:px-8 md:py-36" aria-labelledby="skills-title">
        <div className="grid gap-6 md:grid-cols-12">
          <p className="cartel text-champagne md:col-span-3">N°03 — {t(ui.about.skills, lang)}</p>
          <RevealText as="h2" text={lang === "fr" ? "De la stratégie *au terrain*" : "From strategy *to the field*"} className="display text-[12vw] leading-[0.95] md:col-span-9 md:text-[6vw]" />
        </div>
        <FadeUp stagger={0.1} className="mt-16 grid gap-12 md:mt-24 md:grid-cols-3">
          {skills.map((g, i) => (
            <div key={i} className="border-t border-ivory/20 pt-6">
              <p className="cartel text-champagne">0{i + 1}</p>
              <h3 className="display mt-3 text-3xl italic">{t(g.title, lang)}</h3>
              <ul className="mt-6 space-y-3 text-ivory/80">
                {g.items.map((s, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden className="text-champagne">—</span>
                    {t(s, lang)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </FadeUp>

        <div className="mt-24 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="cartel text-warm">{t(ui.about.tools, lang)}</p>
            <FadeUp as="ul" stagger={0.05} className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
              {tools.map((tool) => (
                <li key={tool} className="display text-3xl md:text-5xl">
                  {tool}
                </li>
              ))}
            </FadeUp>
          </div>
          <div className="md:col-span-3 md:col-start-10">
            <p className="cartel text-warm">{t(ui.about.languages, lang)}</p>
            <ul className="mt-6 space-y-3">
              {languages.map((l, i) => (
                <li key={i} className="flex items-baseline justify-between border-b border-ivory/15 pb-3">
                  <span className="display text-2xl">{t(l.name, lang)}</span>
                  <span className="cartel text-champagne">{t(l.level, lang)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Personal ── */}
      <section className="room-light px-4 py-24 md:px-8 md:py-36" aria-labelledby="off">
        <div className="grid gap-6 md:grid-cols-12">
          <p className="cartel text-warm-dark md:col-span-3">N°04 — {t(ui.about.off, lang)}</p>
          <RevealText as="h2" text={lang === "fr" ? "Ce qui *me nourrit*" : "What *drives me*"} className="display text-[12vw] leading-[0.95] md:col-span-9 md:text-[6vw]" />
        </div>
        <FadeUp stagger={0.1} className="mt-16 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {personal.map((p, i) => (
            <div key={i} className="border-t border-night/20 pt-6">
              <h3 className="display text-2xl italic">{t(p.title, lang)}</h3>
              <p className="mt-3 text-night/70">{t(p.text, lang)}</p>
            </div>
          ))}
        </FadeUp>
        <div className="mt-20 flex flex-wrap gap-4">
          <Button href={site.cv.en} variant="dark" download>{t(ui.contact.cv, lang)} (EN)</Button>
          <Button href={`/${lang}/contact/`} variant="dark">{t(ui.nav.contact, lang)}</Button>
        </div>
      </section>
    </>
  );
}
