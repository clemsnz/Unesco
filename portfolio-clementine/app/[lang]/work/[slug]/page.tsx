import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, locales, t, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { getProject, nextProject, projects } from "@/content/projects";
import { ui } from "@/content/about";
import Photo from "@/components/Photo";
import Blocks from "@/components/Blocks";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

type Params = { params: Promise<{ lang: Locale; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return pageMetadata({ lang, path: `/work/${slug}`, title: `${t(p.title, lang)} · ${p.client}`, description: t(p.brief, lang), image: p.cover.src });
}

export default async function ProjectPage({ params }: Params) {
  const { lang, slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const next = nextProject(slug);
  const tall = p.cover.ratio < 1;

  return (
    <article className="wrap">
      {/* Title */}
      <header className="border-b border-ink py-10 md:py-14">
        <Link href={href(lang, "/work")} className="text-sm text-muted hover:text-bordeaux">← {t(ui.back, lang)}</Link>
        <p className="kicker mt-8">
          {p.client} · {t(p.context, lang)}
        </p>
        <h1 className="mt-3 font-serif text-5xl font-light leading-[1] md:text-8xl">{t(p.title, lang)}</h1>
      </header>

      {/* Cover + the three short blocks */}
      <section className={`grid gap-10 py-10 md:py-14 ${tall ? "md:grid-cols-12" : ""}`}>
        <div className={tall ? "md:col-span-6" : ""}>
          <Photo img={p.cover} lang={lang} priority />
        </div>
        <div className={`grid gap-8 ${tall ? "content-start md:col-span-5 md:col-start-8" : "md:grid-cols-3"}`}>
          <div data-fade>
            <h2 className="kicker text-bordeaux">{t(ui.brief, lang)}</h2>
            <p className="mt-3 font-serif text-xl leading-snug md:text-2xl">{t(p.brief, lang)}</p>
          </div>
          <div data-fade>
            <h2 className="kicker text-bordeaux">{t(ui.did, lang)}</h2>
            <ul className="mt-3 space-y-2">
              {p.did.map((d, i) => (
                <li key={i} className="border-t border-line pt-2">{t(d, lang)}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              {t(ui.role, lang)} : {t(p.role, lang)}
            </p>
          </div>
          {(p.result || p.links) && (
            <div data-fade>
              <h2 className="kicker text-bordeaux">{t(ui.result, lang)}</h2>
              {p.result && <p className="mt-3 font-serif text-xl leading-snug md:text-2xl">{t(p.result, lang)}</p>}
              {p.links && (
                <ul className="mt-4 space-y-2 text-sm">
                  {p.links.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="link">{l.label} ↗</a>
                      <span className="ml-2 text-muted">{t(l.note, lang)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      {p.blocks.length > 0 && (
        <section className="border-t border-ink pt-12 md:pt-16">
          <Blocks blocks={p.blocks} lang={lang} />
        </section>
      )}

      {/* Next */}
      <Link href={href(lang, `/work/${next.slug}`)} className="group mt-20 flex items-center justify-between gap-6 border-y border-ink py-8 md:mt-28">
        <span>
          <span className="kicker">{t(ui.next, lang)}</span>
          <span className="mt-2 block font-serif text-3xl transition-colors group-hover:text-bordeaux md:text-5xl">{t(next.title, lang)}</span>
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={next.cover.src} alt="" loading="lazy" className="hidden aspect-[4/3] w-48 object-cover md:block" />
      </Link>
    </article>
  );
}
