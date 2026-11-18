import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { works, type Img } from "@/content/museum";
import { site } from "@/content/site";
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

  const texts: [string, string][] = [["Le brief", w.brief], ["Mon rôle", w.did]];
  if (w.result) texts.push(["Résultat", w.result]);

  const g = w.gallery;
  const wide = (x: Img) => x.ratio > 1.6;

  return (
    <div className="bg-[#efece6] text-[#1c1916]">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-5 text-[13px] md:px-8">
        <Link href="/" className="hover:opacity-60">← Retour à la galerie</Link>
        <span className="hidden uppercase tracking-[0.2em] sm:inline">{site.name}</span>
      </header>

      <RoomHero w={w} n={n} />

      <section className={`mx-auto grid max-w-5xl gap-14 px-6 py-28 md:gap-10 md:py-40 ${texts.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {texts.map(([k, v]) => (
          <div key={k} data-fade>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a8178]">{k}</p>
            <p className="mt-4 text-lg leading-snug">{v}</p>
          </div>
        ))}
      </section>

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
