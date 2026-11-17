import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, locales, t, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { categories, getProject, nextProject, projects } from "@/content/projects";
import { ui } from "@/content/ui";
import { FadeUp, RevealText } from "@/components/Reveal";
import { MaskImage } from "@/components/Media";
import { PosterTile } from "@/components/home/SelectedWork";
import CaseBlocks from "@/components/work/CaseBlocks";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

type Params = { params: Promise<{ lang: Locale; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return pageMetadata({ lang, path: `/work/${slug}`, title: `${t(p.title, lang)} · ${p.client}`, description: t(p.summary, lang) });
}

export default async function CaseStudy({ params }: Params) {
  const { lang, slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const next = nextProject(slug);
  const n = String(projects.indexOf(p) + 1).padStart(2, "0");
  const portrait = p.cover && p.cover.ratio < 1;

  const meta = [
    { k: t(ui.work.client, lang), v: p.client },
    { k: t(ui.work.type, lang), v: t(p.type, lang) },
    { k: t(ui.work.role, lang), v: t(p.role, lang) },
    { k: t(ui.work.team, lang), v: t(p.team, lang) },
    { k: t(ui.work.period, lang), v: t(p.year, lang) },
  ];

  return (
    <article>
      {/* ── Cover ── */}
      <header className="grain relative bg-night px-4 pb-20 pt-32 text-ivory md:px-8 md:pb-28 md:pt-40">
        <div className="cartel flex flex-wrap items-center justify-between gap-4 text-warm">
          <Link href={href(lang, "/work")} className="link-underline hover:text-ivory">
            ← {t(ui.work.back, lang)}
          </Link>
          <span>
            <span className="text-champagne">N°{n}</span> · {t(categories[p.category], lang)} · {t(p.year, lang)}
          </span>
        </div>

        <div className={`mt-14 grid gap-12 ${portrait ? "md:grid-cols-12" : ""}`}>
          <div className={portrait ? "md:col-span-7" : ""}>
            <RevealText as="h1" onLoad text={t(p.title, lang)} className={`display leading-[0.9] ${portrait ? "text-[14vw] md:text-[7vw]" : "text-[15vw] md:text-[9.5vw]"}`} />
            <FadeUp delay={0.3}>
              <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ivory/75 md:text-2xl md:leading-relaxed">{t(p.summary, lang)}</p>
            </FadeUp>
            <FadeUp as="dl" delay={0.4} stagger={0.06} className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ivory/15 pt-8 md:grid-cols-5">
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="cartel text-champagne">{m.k}</dt>
                  <dd className="mt-2 text-sm leading-snug text-ivory/85">{m.v}</dd>
                </div>
              ))}
            </FadeUp>
          </div>
          {portrait && p.cover && (
            <div className="md:col-span-4 md:col-start-9">
              <MaskImage src={p.cover.src} alt={t(p.cover.alt, lang)} ratio={p.cover.ratio} priority arch />
            </div>
          )}
        </div>

        {!portrait && (
          <div className="mt-16 md:mt-24">
            {p.cover ? (
              <MaskImage src={p.cover.src} alt={t(p.cover.alt, lang)} ratio={p.cover.ratio} priority sizes="100vw" />
            ) : (
              <div className="group relative aspect-[16/9] md:aspect-[21/9]">
                <PosterTile project={p} lang={lang} />
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Essentials: contribution, deliverables, skills ── */}
      <section className="room-light px-4 pb-8 pt-24 md:px-8 md:pt-32">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="cartel text-champagne">{t(ui.work.mine, lang)}</p>
            <FadeUp as="ul" stagger={0.06} className="mt-6">
              {p.mine.map((m, i) => {
                const text = t(m, lang);
                const todo = text.startsWith("[");
                return (
                  <li key={i} className={`border-t border-night/15 py-4 text-lg leading-snug ${todo ? "border-dashed bg-champagne/10 px-3 italic text-night/60" : ""}`}>
                    {text}
                  </li>
                );
              })}
            </FadeUp>
            {p.teamWork && (
              <>
                <p className="cartel mt-10 text-warm-dark">{t(ui.work.teamWork, lang)}</p>
                <ul className="mt-4">
                  {p.teamWork.map((m, i) => (
                    <li key={i} className="border-t border-night/15 py-4 text-night/70">{t(m, lang)}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="md:col-span-3 md:col-start-8">
            <p className="cartel text-warm-dark">{t(ui.work.deliverables, lang)}</p>
            <ul className="mt-6 space-y-2 text-night/80">
              {p.deliverables.map((d, i) => (
                <li key={i}>{t(d, lang)}</li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="cartel text-warm-dark">{t(ui.work.skills, lang)}</p>
            <ul className="mt-6 space-y-2 text-night/80">
              {p.skills.map((d, i) => (
                <li key={i} className="display italic">{t(d, lang)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <div className="room-light pb-32 pt-24 md:pb-44 md:pt-36">
        <CaseBlocks blocks={p.blocks} lang={lang} />
      </div>

      {/* ── Next ── */}
      <Link
        href={href(lang, `/work/${next.slug}`)}
        data-cursor={t(ui.work.view, lang)}
        className="group relative block overflow-hidden bg-night px-4 py-24 text-ivory md:px-8 md:py-36"
      >
        {next.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={next.cover.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-100 group-hover:opacity-25" />
        )}
        <div className="relative">
          <p className="cartel text-champagne">{t(ui.work.next, lang)} →</p>
          <p className="display mt-6 text-[14vw] leading-[0.9] transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-4 group-hover:italic md:text-[8vw]">
            {t(next.title, lang)}
          </p>
          <p className="cartel mt-6 text-warm">{next.client} — {t(categories[next.category], lang)}</p>
        </div>
      </Link>
    </article>
  );
}
