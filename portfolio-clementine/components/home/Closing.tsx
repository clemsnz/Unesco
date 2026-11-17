import { href, t, type Locale } from "@/lib/i18n";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { getProject, type Block } from "@/content/projects";
import { RevealText } from "@/components/Reveal";
import { MaskImage } from "@/components/Media";
import Button from "@/components/Button";
import { PressList } from "./PathAndPress";

export function PressSection({ lang }: { lang: Locale }) {
  const press = getProject("charlotte-muller")?.blocks.find((b): b is Extract<Block, { kind: "press" }> => b.kind === "press");
  if (!press) return null;
  return (
    <section className="bg-night px-4 py-28 text-ivory md:px-8 md:py-40" aria-labelledby="press-title">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="cartel text-champagne">N°04 — {t(ui.home.press, lang)}</p>
          <RevealText as="h2" text={lang === "fr" ? "Charlotte Muller, *dans la presse*" : "Charlotte Muller, *in the press*"} className="display mt-6 text-[12vw] md:text-[4.6vw]" />
          <p className="mt-6 max-w-xs text-sm text-ivory/60">{t(press.note!, lang)}</p>
        </div>
        <div className="md:col-span-8">
          <PressList lang={lang} items={press.items} />
        </div>
      </div>
    </section>
  );
}

export function ClosingCta({ lang }: { lang: Locale }) {
  return (
    <section className="relative overflow-hidden bg-night px-4 pb-16 pt-28 text-ivory md:px-8 md:pb-20 md:pt-40" aria-labelledby="cta-title">
      <div className="grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="cartel text-champagne">N°05 — Contact</p>
          <RevealText as="h2" text={t(ui.home.ctaTitle, lang).replace(/(\S+\.)$/, "*$1*")} className="display mt-6 text-[15vw] leading-[0.92] md:text-[7.5vw]" />
          <p className="mt-8 max-w-md text-lg text-ivory/70">{t(ui.home.ctaText, lang)}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href={href(lang, "/contact")}>{t(ui.nav.contact, lang)}</Button>
            <Button href={site.cv.en} download>{t(ui.contact.cv, lang)}</Button>
            <Button href={site.linkedin} external>LinkedIn</Button>
          </div>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <MaskImage
            src="/images/charlotte-muller/spa-power-mats.webp"
            alt={lang === "fr" ? "Le spa du George V, transats équipés de matelas Charlotte Muller" : "The George V spa, loungers fitted with Charlotte Muller mats"}
            ratio={4 / 5.4}
            arch
          />
        </div>
      </div>
    </section>
  );
}
