import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import RoomHero from "@/components/museum/RoomHero";

export const metadata: Metadata = {
  title: "Lancement du Mini Mat — Prototype",
  robots: { index: false, follow: false },
};

const press = [
  { outlet: "Le Journal des Palaces", note: "Article · 27 octobre 2025", url: "https://www.journaldespalaces.com/article-76280-innovation-la-revolution-des-spas-commence-avec-les-matelas-charlotte-muller.html" },
  { outlet: "Le Journal des Palaces", note: "Communiqué · 13 novembre 2025", url: "https://www.journaldespalaces.com/communique-76483-charlotte-muller-lance-le-mini-mat-pemf-l-objet-bien-etre-de-30-cm-qui-magnetise-paris-et-les-spas-d-hotels-de-luxe.html" },
  { outlet: "S-Quive", note: "Article · 11 décembre 2025", url: "https://www.s-quive.com/article/charlotte-muller-method-lexcellence-au-service-du-bien-etre-feminin" },
];

/** A framed work hung on the wall of the room. */
function Hung({ src, alt, ratio, mat = true, className = "" }: { src: string; alt: string; ratio: number; mat?: boolean; className?: string }) {
  return (
    <div className={`${mat ? "border-[5px] border-[#2b2622] bg-[#fbfaf6] p-[5%]" : "border-[3px] border-[#141312]"} shadow-[10px_22px_48px_-16px_rgba(30,22,15,0.45)] ${className}`} data-fade>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="block w-full" style={{ aspectRatio: String(ratio) }} />
    </div>
  );
}

function Cartel({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 text-[12px] leading-relaxed text-[#6b6259]">{children}</p>;
}

export default function MiniMatRoom() {
  return (
    <div className="bg-[#efece6] text-[#1c1916]">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-5 text-[13px] md:px-8">
        <Link href="/prototype/" className="hover:opacity-60">← Retour à la galerie</Link>
        <span className="hidden uppercase tracking-[0.2em] sm:inline">Clémentine Sanchez</span>
      </header>

      <RoomHero />

      {/* Wall text: one idea per screen */}
      <section className="mx-auto grid max-w-5xl gap-14 px-6 py-32 md:grid-cols-3 md:gap-10 md:py-48">
        {[
          ["Le brief", "Lancer le Mini Mat, un tapis infrarouge PEMF de 30 cm, auprès de la presse beauté et bien-être."],
          ["Mon rôle", "Packaging conçu de A à Z. Dîner de lancement. Événement presse au Four Seasons George V, avec le bureau de presse Pascale Venot."],
          ["Résultat", "Le lancement a été repris dans la presse spécialisée."],
        ].map(([k, v]) => (
          <div key={k} data-fade>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a8178]">{k}</p>
            <p className="mt-4 text-lg leading-snug">{v}</p>
          </div>
        ))}
      </section>

      {/* The works of the room */}
      <section className="px-6 py-24 md:px-16 md:py-40" style={{ background: "radial-gradient(ellipse 60% 55% at 50% 45%, #faf9f6 0%, rgba(239,236,230,0) 70%)" }}>
        <Hung src="/images/mini-mat/packaging.webp" alt="Packaging du Mini Mat, à plat" ratio={2000 / 777} mat={false} className="mx-auto max-w-5xl" />
        <div className="mx-auto max-w-5xl">
          <Cartel>Packaging du Mini Mat · Fichier de conception · 2025</Cartel>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl items-end gap-16 px-6 py-24 md:grid-cols-2 md:gap-20 md:py-40">
        <div>
          <Hung src="/images/mini-mat/george-v-spa.webp" alt="Le spa du Four Seasons George V, équipé des matelas Charlotte Muller" ratio={1125 / 2000} />
          <Cartel>Le spa du Four Seasons George V, équipé des matelas Charlotte Muller</Cartel>
        </div>
        <div className="md:mb-32">
          <Hung src="/images/mini-mat/george-v-presse.webp" alt="Démonstration pendant l’événement presse" ratio={1500 / 2000} />
          <Cartel>Démonstration pendant l’événement presse</Cartel>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 md:py-40" data-fade>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a8178]">Dans la presse</p>
        <ul className="mt-6 border-t border-[#1c1916]/15">
          {press.map((p) => (
            <li key={p.url} className="border-b border-[#1c1916]/15">
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-baseline justify-between gap-6 py-5 hover:opacity-60">
                <span className="text-xl">{p.outlet}</span>
                <span className="text-[13px] text-[#6b6259]">{p.note} ↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <nav className="flex flex-col items-center gap-3 px-6 pb-28 pt-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a8178]">Suite de la visite</p>
        <Link href="/prototype/?at=4" className="text-3xl hover:opacity-60">02 — Événements presse & influence →</Link>
        <Link href="/prototype/" className="mt-4 border-b border-current text-[13px]">Retour à la galerie</Link>
      </nav>
      <FadeIn />
    </div>
  );
}
