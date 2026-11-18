import { t, type Locale } from "@/lib/i18n";
import type { Block } from "@/content/projects";
import Photo from "./Photo";
import Video from "./Video";

/** The photo story of a project page. */
export default function Blocks({ blocks, lang }: { blocks: Block[]; lang: Locale }) {
  return (
    <div className="space-y-16 md:space-y-24">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "image":
            return <Photo key={i} img={b.img} lang={lang} className={b.size === "medium" ? "mx-auto md:w-2/3" : ""} />;
          case "pair":
            return (
              <div key={i}>
                <div className="grid items-start gap-4 md:grid-cols-2 md:gap-6">
                  {b.imgs.map((img, j) => (
                    <Photo key={j} img={img} lang={lang} />
                  ))}
                </div>
                {b.caption && <p className="mt-3 text-sm text-muted">{t(b.caption, lang)}</p>}
              </div>
            );
          case "row":
            return (
              <div key={i}>
                <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {b.imgs.map((img, j) => (
                    <Photo key={j} img={img} lang={lang} />
                  ))}
                </div>
                {b.caption && <p className="mt-3 text-sm text-muted">{t(b.caption, lang)}</p>}
              </div>
            );
          case "pages":
            return (
              <div key={i}>
                <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
                  {b.imgs.map((img, j) => (
                    <Photo key={j} img={img} lang={lang} className="shadow-[0_1px_0_var(--color-line)]" />
                  ))}
                </div>
                {b.caption && <p className="mt-3 text-sm text-muted">{t(b.caption, lang)}</p>}
              </div>
            );
          case "video":
            return (
              <div key={i} className="grid items-start gap-4 md:grid-cols-2 md:gap-6">
                <figure data-fade>
                  <Video src={b.src} poster={b.poster} ratio={b.ratio} label={b.caption ? t(b.caption, lang) : ""} />
                  {b.caption && <figcaption className="mt-3 text-sm text-muted">{t(b.caption, lang)}</figcaption>}
                </figure>
                {b.side && <Photo img={b.side} lang={lang} />}
              </div>
            );
        }
      })}
    </div>
  );
}
