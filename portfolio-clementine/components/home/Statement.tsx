import { t, type Locale } from "@/lib/i18n";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { FadeUp, RevealText, Rule } from "@/components/Reveal";

export default function Statement({ lang }: { lang: Locale }) {
  return (
    <section className="room-light relative px-4 py-28 md:px-8 md:py-44" aria-labelledby="approach-title">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <p id="approach-title" className="cartel text-warm-dark">
            <span className="text-champagne">N°01</span> — {t(ui.home.approach, lang)}
          </p>
        </div>
        <div className="md:col-span-9">
          <RevealText
            as="p"
            text={t(site.vision, lang).replace(/^(.+?[.:])/, "*$1*")}
            className="display text-[8.5vw] leading-[1.02] md:text-[4.6vw]"
            stagger={0.018}
          />
        </div>
      </div>

      <Rule className="mt-24 md:mt-32" />

      <div className="mt-12 grid gap-12 md:grid-cols-12">
        <FadeUp className="md:col-span-5 md:col-start-4">
          <p className="text-lg leading-relaxed text-night/80 md:text-xl">{t(site.intro, lang)}</p>
        </FadeUp>
        <FadeUp as="dl" stagger={0.1} className="grid grid-cols-2 gap-x-6 gap-y-10 md:col-span-4">
          {site.keyFacts.map((f) => (
            <div key={f.value}>
              <dt className="display text-5xl md:text-6xl">{f.value}</dt>
              <dd className="mt-2 text-sm leading-snug text-night/65">{t(f.label, lang)}</dd>
            </div>
          ))}
        </FadeUp>
      </div>
    </section>
  );
}
