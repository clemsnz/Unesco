import type { Metadata } from "next";
import { t, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { about, ui } from "@/content/about";
import Photo from "@/components/Photo";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({ lang, path: "/about", title: t(ui.about, lang), description: t(about.lead, lang) });
}

export default async function About({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return (
    <div className="wrap">
      <h1 className="border-b border-ink py-10 font-serif text-6xl font-light md:py-14 md:text-8xl">{t(ui.about, lang)}</h1>

      <section className="grid gap-10 py-10 md:grid-cols-12 md:py-14">
        <Photo img={about.photos[0]} lang={lang} priority className="md:col-span-5" />
        <div className="md:col-span-6 md:col-start-7" data-fade>
          <p className="font-serif text-3xl leading-snug md:text-4xl">{t(about.lead, lang)}</p>
          <div className="mt-8 space-y-4 text-lg text-ink/85">
            {about.bio.map((b, i) => (
              <p key={i}>{t(b, lang)}</p>
            ))}
          </div>
          <p className="mt-8 text-bordeaux">{t(site.availability, lang)}</p>
          <a href={site.cv} download className="link mt-4 inline-block text-sm">{t(ui.cv, lang)} ↓</a>
        </div>
      </section>

      <section className="grid gap-10 border-t border-ink py-10 md:grid-cols-12 md:py-14">
        <h2 className="kicker text-ink md:col-span-3">{t(ui.path, lang)}</h2>
        <ul className="md:col-span-9">
          {about.parcours.map((x, i) => (
            <li key={i} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[10rem_1fr_auto] sm:gap-6" data-fade>
              <span className="text-sm text-muted">{t(x.when, lang)}</span>
              <span className="font-serif text-xl">{t(x.what, lang)}</span>
              <span className="text-sm sm:text-right">{x.where}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-10 border-t border-ink py-10 md:grid-cols-12 md:py-14">
        <h2 className="kicker text-ink md:col-span-3">{t(ui.skills, lang)}</h2>
        <div className="grid gap-8 sm:grid-cols-3 md:col-span-9">
          {about.skills.map((g, i) => (
            <div key={i} data-fade>
              <h3 className="font-serif text-2xl text-bordeaux">{t(g.title, lang)}</h3>
              <p className="mt-2 text-ink/85">{t(g.items, lang)}</p>
            </div>
          ))}
          <div className="sm:col-span-3 grid gap-4 border-t border-line pt-6 text-sm sm:grid-cols-2">
            <p><span className="kicker mr-3">{t(ui.tools, lang)}</span>{about.tools}</p>
            <p><span className="kicker mr-3">{t(ui.languages, lang)}</span>{t(about.languages, lang)}</p>
          </div>
        </div>
      </section>

      <Photo img={about.photos[1]} lang={lang} className="border-t border-ink pt-10 md:pt-14" />
    </div>
  );
}
