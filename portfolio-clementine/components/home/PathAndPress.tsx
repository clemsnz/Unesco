import Link from "next/link";
import { href, t, type Locale } from "@/lib/i18n";
import { timeline } from "@/content/about";
import { getProject } from "@/content/projects";
import { ui } from "@/content/ui";
import { FadeUp, RevealText } from "@/components/Reveal";
import Button from "@/components/Button";

export function PathPreview({ lang }: { lang: Locale }) {
  const items = timeline.filter((i) => i.kind !== "school");
  return (
    <section className="room-light px-4 py-28 md:px-8 md:py-40" aria-labelledby="path-title">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="cartel text-warm-dark">
            <span className="text-champagne">N°03</span> — {t(ui.home.path, lang)}
          </p>
          <RevealText as="h2" text={lang === "fr" ? "De Toulouse *à Paris*" : "From Toulouse *to Paris*"} className="display mt-6 text-[13vw] md:text-[5.2vw]" />
          <p className="mt-6 max-w-xs text-night/70">{t(ui.home.pathIntro, lang)}</p>
          <div className="mt-10">
            <Button href={href(lang, "/about")} variant="dark">{t(ui.home.moreAbout, lang)}</Button>
          </div>
        </div>
        <FadeUp as="ol" stagger={0.07} className="md:col-span-8">
          {items.map((it, i) => {
            const project = it.project ? getProject(it.project) : undefined;
            const row = (
              <div className="grid grid-cols-12 items-baseline gap-4 border-t border-night/15 py-6 transition-colors duration-500 group-hover:border-night">
                <span className="cartel col-span-12 text-warm-dark sm:col-span-3">{t(it.period, lang)}</span>
                <span className="col-span-12 sm:col-span-6">
                  <span className="display block text-2xl leading-tight md:text-3xl">{t(it.org, lang)}</span>
                  <span className="mt-1 block text-sm text-night/65">{t(it.title, lang)}</span>
                </span>
                <span className="cartel col-span-12 flex justify-between text-warm-dark sm:col-span-3 sm:justify-end sm:gap-4">
                  {it.place}
                  {project && <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>}
                </span>
              </div>
            );
            return (
              <li key={i} className="group">
                {project ? (
                  <Link href={href(lang, `/work/${project.slug}`)} data-cursor={t(ui.work.view, lang)} className="block">
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </FadeUp>
      </div>
    </section>
  );
}

export function PressList({
  lang,
  items,
  dark = true,
}: {
  lang: Locale;
  items: { outlet: string; title: string; date: { fr: string; en: string }; url: string; type: { fr: string; en: string } }[];
  dark?: boolean;
}) {
  return (
    <FadeUp as="ul" stagger={0.08}>
      {items.map((a) => (
        <li key={a.url}>
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor={t(ui.work.read, lang)}
            className={`group grid grid-cols-12 items-baseline gap-4 border-t py-7 transition-colors duration-500 ${dark ? "border-ivory/15 hover:border-champagne" : "border-night/15 hover:border-night"}`}
          >
            <span className={`cartel col-span-12 md:col-span-3 ${dark ? "text-champagne" : "text-warm-dark"}`}>
              {a.outlet}
              <span className="block opacity-60">{t(a.type, lang)} · {t(a.date, lang)}</span>
            </span>
            <span className="display col-span-11 text-2xl leading-snug md:col-span-8 md:text-3xl">{a.title}</span>
            <span aria-hidden className="col-span-1 text-right transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
          </a>
        </li>
      ))}
    </FadeUp>
  );
}
