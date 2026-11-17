import type { Metadata } from "next";
import { t, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { FadeUp, RevealText } from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({ lang, path: "/contact", title: t(ui.contact.title, lang), description: t(ui.contact.lead, lang) });
}

export default async function Contact({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const cv = (lang === "fr" && site.cv.fr) || site.cv.en;
  const cvIsEn = cv === site.cv.en;

  return (
    <section className="grain relative min-h-screen bg-night px-4 pb-32 pt-36 text-ivory md:px-8 md:pt-44">
      <p className="cartel text-champagne">{t(ui.contact.title, lang)} — {t(site.availability, lang)}</p>
      <RevealText as="h1" onLoad text={lang === "fr" ? "Parlons *marques*." : "Let’s talk *brands*."} className="display mt-8 text-[17vw] leading-[0.88] md:text-[10vw]" />

      <div className="mt-20 grid gap-16 md:mt-28 md:grid-cols-12">
        <FadeUp className="md:col-span-5">
          <p className="max-w-md text-xl leading-relaxed text-ivory/75">{t(ui.contact.lead, lang)}</p>
          <dl className="mt-14 space-y-8">
            <div>
              <dt className="cartel text-warm">{t(ui.contact.email, lang)}</dt>
              <dd className="mt-2">
                <a href={`mailto:${site.email}`} className="display link-underline text-2xl italic md:text-3xl">{site.email}</a>
              </dd>
            </div>
            <div>
              <dt className="cartel text-warm">{t(ui.contact.linkedin, lang)}</dt>
              <dd className="mt-2">
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="display link-underline text-2xl md:text-3xl">{site.linkedinLabel} ↗</a>
              </dd>
            </div>
            <div>
              <dt className="cartel text-warm">CV</dt>
              <dd className="mt-2">
                <a href={cv} download className="display link-underline text-2xl md:text-3xl">
                  {t(ui.contact.cv, lang)} ↓
                </a>
                {cvIsEn && lang === "fr" && <span className="cartel ml-3 text-warm">({t(ui.contact.cvEnOnly, lang)})</span>}
              </dd>
            </div>
            <div>
              <dt className="cartel text-warm">{t(ui.contact.based, lang)}</dt>
              <dd className="display mt-2 text-2xl md:text-3xl">{site.city}</dd>
            </div>
          </dl>
        </FadeUp>
        <FadeUp delay={0.15} className="md:col-span-6 md:col-start-7">
          <ContactForm lang={lang} />
        </FadeUp>
      </div>
    </section>
  );
}
