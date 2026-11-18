import type { Metadata } from "next";
import Link from "next/link";
import { href, t, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { ui } from "@/content/about";
import ProjectCard from "@/components/ProjectCard";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({ lang });
}

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const [featured, ...others] = projects;
  const second = featured.blocks.find((b) => b.kind === "pair");

  return (
    <>
      {/* Masthead */}
      <section className="wrap">
        <div className="border-b border-ink py-10 text-center md:py-14">
          <h1 className="font-serif text-[15vw] font-light leading-[0.9] tracking-[-0.03em] md:text-[9.5vw] xl:text-[132px]">{site.name}</h1>
          <p className="mt-5 font-serif text-lg md:text-2xl">{t(site.tagline, lang)}</p>
        </div>
        <div className="kicker flex flex-wrap justify-between gap-2 border-b border-ink py-3 text-ink">
          <span>{t(site.school, lang)}</span>
          <span className="text-bordeaux">{t(site.availability, lang)}</span>
        </div>
      </section>

      {/* Featured */}
      <section className="wrap grid gap-8 py-12 md:grid-cols-12 md:gap-10 md:py-16">
        <Link href={href(lang, `/work/${featured.slug}`)} className="group md:col-span-7" data-fade>
          <div className="aspect-[4/3.6] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featured.cover.src} alt={t(featured.cover.alt, lang)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
          </div>
        </Link>
        <div className="flex flex-col justify-between gap-8 md:col-span-5" data-fade>
          <div>
            <p className="kicker">
              <span className="text-bordeaux">{t(ui.featured, lang)}</span> · {featured.client}
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.05] md:text-6xl">{t(featured.title, lang)}</h2>
            <p className="mt-5 max-w-md font-serif text-xl leading-snug">{t(featured.pitch ?? featured.brief, lang)}</p>
            <Link href={href(lang, `/work/${featured.slug}`)} className="link mt-6 inline-block text-sm">
              {t(ui.view, lang)} →
            </Link>
          </div>
          {second?.kind === "pair" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={second.imgs[1].src} alt={t(second.imgs[1].alt, lang)} loading="lazy" className="hidden aspect-[4/5] w-1/2 self-end object-cover md:block" />
          )}
        </div>
      </section>

      {/* All other projects */}
      <section className="wrap">
        <div className="flex items-baseline justify-between border-t border-ink py-4">
          <h2 className="kicker text-ink">{t(ui.work, lang)}</h2>
          <Link href={href(lang, "/work")} className="link text-sm">{t(ui.allWork, lang)}</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 pt-4 md:grid-cols-4 md:gap-x-6 md:gap-y-14">
          {others.map((p) => (
            <ProjectCard key={p.slug} p={p} lang={lang} />
          ))}
        </div>
      </section>

      {/* Short about */}
      <section className="wrap mt-20 md:mt-28">
        <div className="grid items-center gap-8 border-t border-ink pt-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4" data-fade>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.portrait.src} alt={t(site.portrait.alt, lang)} loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </div>
          <div className="md:col-span-7 md:col-start-6" data-fade>
            <p className="kicker">{t(ui.about, lang)}</p>
            <p className="mt-4 font-serif text-3xl leading-snug md:text-4xl">{t(site.intro, lang)}</p>
            <div className="mt-8 flex gap-6 text-sm">
              <Link href={href(lang, "/about")} className="link">{t(ui.more, lang)} →</Link>
              <a href={site.cv} download className="link">{t(ui.cv, lang)} ↓</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
