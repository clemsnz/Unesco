import { t, type Locale } from "@/lib/i18n";
import type { Img } from "@/content/projects";

/** Photo with reserved proportions, optional caption, soft fade-in. */
export default function Photo({ img, lang, className = "", priority = false, cover = false }: { img: Img; lang: Locale; className?: string; priority?: boolean; cover?: boolean }) {
  return (
    <figure className={className} data-fade>
      <div className="overflow-hidden bg-line/40" style={cover ? undefined : { aspectRatio: String(img.ratio) }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.src}
          alt={t(img.alt, lang)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={{ objectPosition: img.position }}
          className="h-full w-full object-cover"
        />
      </div>
      {img.caption && <figcaption className="mt-3 text-sm text-muted">{t(img.caption, lang)}</figcaption>}
    </figure>
  );
}
