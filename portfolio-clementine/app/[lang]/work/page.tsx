import type { Metadata } from "next";
import { t, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ui } from "@/content/ui";
import { RevealText, FadeUp } from "@/components/Reveal";
import WorkIndex from "@/components/work/WorkIndex";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({ lang, path: "/work", title: t(ui.work.title, lang), description: t(ui.work.intro, lang) });
}

export default async function WorkPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return (
    <section className="grain relative min-h-screen bg-night px-4 pb-32 pt-36 text-ivory md:px-8 md:pt-44">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="cartel text-champagne">Index — {t(ui.work.title, lang)}</p>
          <RevealText as="h1" onLoad text={lang === "fr" ? "Études *de cas*" : "Case *studies*"} className="display mt-6 text-[19vw] leading-[0.88] md:text-[11vw]" />
        </div>
        <FadeUp className="self-end md:col-span-4">
          <p className="max-w-sm text-lg leading-relaxed text-ivory/70">{t(ui.work.intro, lang)}</p>
        </FadeUp>
      </div>
      <div className="mt-20 md:mt-28">
        <WorkIndex lang={lang} />
      </div>
    </section>
  );
}
