import Link from "next/link";
import { href, t, type Locale } from "@/lib/i18n";
import type { Project } from "@/content/projects";

/** Grid tile: photo, client, title, one line. */
export default function ProjectCard({ p, lang, ratio = "4 / 5" }: { p: Project; lang: Locale; ratio?: string }) {
  return (
    <Link href={href(lang, `/work/${p.slug}`)} className="group block" data-fade>
      <div className="overflow-hidden bg-line/40" style={{ aspectRatio: ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.cover.src}
          alt={t(p.cover.alt, lang)}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: p.cover.position }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <p className="kicker mt-4">{p.client}</p>
      <h3 className="mt-1 font-serif text-2xl leading-tight transition-colors group-hover:text-bordeaux">{t(p.title, lang)}</h3>
      <p className="mt-1 text-sm text-muted">{t(p.tag, lang)}</p>
    </Link>
  );
}
