import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { works, type Img } from "@/content/museum";
import { site } from "@/content/site";
import { etudes } from "@/content/etudes";
import FadeIn from "@/components/FadeIn";
import RoomHero from "@/components/museum/RoomHero";

export const dynamicParams = false;
export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const w = works.find((x) => x.slug === slug);
  if (!w) return {};
  return {
    title: `${w.title} — ${site.name}`,
    description: w.brief,
    openGraph: { title: `${w.title} — ${site.name}`, description: w.brief, images: [{ url: w.art.src }] },
  };
}

function Hung({ img, kind = "photo", className = "" }: { img: Img; kind?: "photo" | "print"; className?: string }) {
  return (
    <figure className={className} data-fade>
      <div className={`${kind === "photo" ? "border-[5px] border-[#2b2622] bg-[#fbfaf6] p-[5%]" : "border-[3px] border-[#141312]"} shadow-[10px_22px_48px_-16px_rgba(30,22,15,0.45)]`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.src} alt={img.alt} loading="lazy" className="block w-full" style={{ aspectRatio: String(img.ratio) }} />
      </div>
      {img.cartel && <figcaption className="mt-5 text-[12px] leading-relaxed text-[#6b6259]">{img.cartel}</figcaption>}
    </figure>
  );
}

const Wall = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <section className={`px-6 py-24 md:px-16 md:py-36 ${className}`} style={{ background: "radial-gradient(ellipse 60% 55% at 50% 45%, #faf9f6 0%, rgba(239,236,230,0) 70%)" }}>
    {children}
  </section>
);

export default async function Room({ params }: Params) {
  const { slug } = await params;
  const i = works.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const w = works[i];
  const same = works.slice(0, i + 1).filter((x) => x.room === w.room).length;
  const n = w.room === "main" ? String(same).padStart(2, "0") : `Étude ${String(same).padStart(2, "0")}`;
  const next = works[(i + 1) % works.length];

  const e = etudes[w.slug];
  const label = "text-[11px] uppercase tracking-[0.24em] text-[#8a8178]";

  const g = w.gallery;
  const wide = (x: Img) => x.ratio > 1.6;

  return (
    <div className="bg-[#efece6] text-[#1c1916]">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-5 text-[13px] md:px-8">
        <Link href="/" className="hover:opacity-60">← Retour à la galerie</Link>
        <span className="hidden uppercase tracking-[0.2em] sm:inline">{site.name}</span>
      </header>

      <RoomHero w={w} n={n} />

      {/* identity card */}
      {e && (
        <section className="mx-auto max-w-5xl px-6 pt-24 md:pt-32" data-fade>
          <dl className="grid gap-x-10 gap-y-6 border-y border-[#1c1916]/15 py-8 sm:grid-cols-2 lg:grid-cols-3">
            {e.facts.map((f) => (
              <div key={f.k}>
                <dt className="text-[11px] uppercase tracking-[0.22em] text-[#8a8178]">{f.k}</dt>
                <dd className="mt-1.5 text-[15px] leading-snug">{f.v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* context & goals */}
      <section className="mx-auto grid max-w-5xl gap-14 px-6 py-24 md:grid-cols-12 md:gap-10 md:py-32">
        <div className="md:col-span-7" data-fade>
          <p className={label}>Le contexte</p>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-[#2b2622]">
            {(e?.context ?? [w.brief]).map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </div>
        <div className="md:col-span-4 md:col-start-9" data-fade>
          <p className={label}>{e?.goals ? "Les objectifs" : "Le brief"}</p>
          {e?.goals ? (
            <ul className="mt-5 space-y-3 text-[15px] leading-snug">
              {e.goals.map((g2) => (
                <li key={g2} className="border-t border-[#1c1916]/12 pt-3">{g2}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-[15px] leading-snug">{w.brief}</p>
          )}
        </div>
      </section>

      {/* what I did */}
      <section className="px-6 py-24 md:py-32" style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, #faf9f6 0%, rgba(239,236,230,0) 75%)" }}>
        <div className="mx-auto max-w-5xl" data-fade>
          <p className={label}>Mon rôle</p>
          <h2 className="mt-3 text-3xl leading-tight md:text-4xl">{w.role}</h2>
          <ol className="mt-10 grid gap-x-12 md:grid-cols-2">
            {(e?.missions ?? [w.did]).map((m, k) => (
              <li key={m} className="grid grid-cols-[2.2rem_1fr] border-t border-[#1c1916]/12 py-4 text-[15px] leading-snug">
                <span className="text-[11px] tracking-[0.18em] text-[#8a8178]">{String(k + 1).padStart(2, "0")}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* the idea */}
      {e?.idea && (
        <section className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32" data-fade>
          <p className={label}>L’idée</p>
          <h2 className="mt-4 text-3xl leading-tight md:text-5xl">{e.idea.title}</h2>
          <div className="mt-8 space-y-4 text-lg leading-relaxed text-[#2b2622]">
            {e.idea.text.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </section>
      )}

      {/* chapters: a sequence of walls, each introduced by a short wall text */}
      {w.chapters?.map((ch, ci) => {
        const roman = ["I", "II", "III", "IV", "V"][ci];
        const wideImgs = ch.imgs.filter(wide);
        const rest = ch.imgs.filter((x) => !wide(x));
        const cols = rest.length === 3 || rest.length >= 5 ? "md:grid-cols-3" : "md:grid-cols-2";
        return (
          <section key={ch.title} className="pt-16 md:pt-24">
            <div className="mx-auto max-w-5xl px-6" data-fade>
              <div className="h-px bg-[#1c1916]/15" />
              <p className="mt-10 text-[11px] uppercase tracking-[0.24em] text-[#8a8178]">Salle {roman}</p>
              <h2 className="mt-3 text-3xl leading-tight md:text-4xl">{ch.title}</h2>
              {ch.text && <p className="mt-4 max-w-2xl text-lg leading-snug text-[#3a332d]">{ch.text}</p>}
            </div>
            {wideImgs.map((img) => (
              <Wall key={img.src}>
                <Hung img={img} kind="print" className="mx-auto max-w-5xl" />
              </Wall>
            ))}
            {rest.length > 0 && (
              <div className={`mx-auto grid max-w-5xl items-end gap-12 px-6 py-16 md:gap-14 md:py-24 ${cols}`}>
                {rest.map((img, k) => (
                  <Hung key={img.src} img={img} kind={img.ratio > 1 || img.src.includes("story") ? "print" : "photo"} className={cols === "md:grid-cols-2" && k % 2 === 1 ? "md:mb-24" : ""} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* works of the room: one wide work alone on its wall, others in pairs */}
      {g.filter(wide).map((img) => (
        <Wall key={img.src}>
          <Hung img={img} kind="print" className="mx-auto max-w-5xl" />
        </Wall>
      ))}
      {g.filter((x) => !wide(x)).length > 0 && (
        <section className="mx-auto grid max-w-5xl items-end gap-16 px-6 py-24 md:grid-cols-2 md:gap-20 md:py-36">
          {g
            .filter((x) => !wide(x))
            .map((img, k) => (
              <Hung key={img.src} img={img} kind={img.ratio > 1 ? "print" : "photo"} className={k % 2 === 1 ? "md:mb-32" : ""} />
            ))}
        </section>
      )}

      {/* figures */}
      {(e?.figures || w.result) && (
        <section className="mx-auto max-w-5xl px-6 py-24 md:py-32" data-fade>
          <p className={label}>En chiffres</p>
          {e?.figures && (
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
              {e.figures.map((f) => (
                <div key={f.label} className="border-t border-[#1c1916]/20 pt-5">
                  <dt className="text-4xl md:text-5xl">{f.value}</dt>
                  <dd className="mt-2 text-[13px] leading-snug text-[#5f574f]">{f.label}</dd>
                </div>
              ))}
            </dl>
          )}
          {e?.figuresNote && <p className="mt-6 text-[13px] italic text-[#6b6259]">{e.figuresNote}</p>}
          {w.result && <p className="mt-10 max-w-2xl text-xl leading-snug">{w.result}</p>}
        </section>
      )}

      {/* deliverables & skills */}
      {(e?.deliverables || e?.skills) && (
        <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2" data-fade>
          {e?.deliverables && (
            <div>
              <p className={label}>Livrables</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {e.deliverables.map((d) => (
                  <li key={d} className="border border-[#1c1916]/20 px-3 py-1.5 text-[13px]">{d}</li>
                ))}
              </ul>
            </div>
          )}
          {e?.skills && (
            <div>
              <p className={label}>Compétences</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {e.skills.map((d) => (
                  <li key={d} className="bg-[#1c1916] px-3 py-1.5 text-[13px] text-[#f1eee9]">{d}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {w.reel && (
        <Wall>
          <figure className="mx-auto w-[min(88vw,360px)]" data-fade>
            <div className="border-[6px] border-[#141312] bg-black shadow-[10px_22px_48px_-16px_rgba(30,22,15,0.45)]">
              <iframe
                src={`https://www.instagram.com/reel/${w.reel.id}/embed/`}
                title={w.reel.cartel}
                loading="lazy"
                className="block h-[620px] w-full bg-white"
                allow="encrypted-media; picture-in-picture"
              />
            </div>
            <figcaption className="mt-5 text-[12px] text-[#6b6259]">
              {w.reel.cartel} ·{" "}
              <a href={`https://www.instagram.com/reel/${w.reel.id}/`} target="_blank" rel="noopener noreferrer" className="border-b border-current">
                Voir sur Instagram ↗
              </a>
            </figcaption>
          </figure>
        </Wall>
      )}

      {w.press && (
        <section className="mx-auto max-w-3xl px-6 py-24 md:py-36" data-fade>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a8178]">Dans la presse</p>
          <ul className="mt-6 border-t border-[#1c1916]/15">
            {w.press.map((p) => (
              <li key={p.url} className="border-b border-[#1c1916]/15">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 hover:opacity-60">
                  <span className="text-xl">{p.outlet}</span>
                  <span className="text-[13px] text-[#6b6259]">{p.note} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {e?.takeaway && (
        <figure className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32" data-fade>
          <p className={label}>Ce que j’en retiens</p>
          <blockquote className="mt-6 text-2xl italic leading-snug md:text-3xl">« {e.takeaway} »</blockquote>
        </figure>
      )}
      {e?.note && <p className="mx-auto max-w-3xl px-6 pb-10 text-center text-[13px] italic text-[#6b6259]">{e.note}</p>}

      <nav className="flex flex-col items-center gap-3 px-6 pb-28 pt-16 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a8178]">Suite de la visite</p>
        <Link href={`/oeuvres/${next.slug}/`} className="text-2xl hover:opacity-60 md:text-3xl">
          {next.title} →
        </Link>
        <Link href="/" className="mt-4 border-b border-current text-[13px]">Retour à la galerie</Link>
      </nav>
      <FadeIn />
    </div>
  );
}
