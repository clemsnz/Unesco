import { t, type Locale } from "@/lib/i18n";
import type { Block } from "@/content/projects";
import { ui } from "@/content/ui";
import { FadeUp, RevealText, Rule } from "@/components/Reveal";
import { MaskImage, Placeholder } from "@/components/Media";
import { PressList } from "@/components/home/PathAndPress";
import AutoVideo from "./AutoVideo";

function Label({ children }: { children: React.ReactNode }) {
  return <p className="cartel text-warm-dark md:sticky md:top-28">{children}</p>;
}

function Caption({ children }: { children: React.ReactNode }) {
  return <figcaption className="cartel mt-3 max-w-xl normal-case tracking-[0.04em] text-warm-dark">{children}</figcaption>;
}

export default function CaseBlocks({ blocks, lang }: { blocks: Block[]; lang: Locale }) {
  return (
    <div className="space-y-24 md:space-y-36">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} lang={lang} />
      ))}
    </div>
  );
}

function BlockView({ block: b, lang }: { block: Block; lang: Locale }) {
  switch (b.kind) {
    case "text":
      return (
        <section className="grid gap-8 px-4 md:grid-cols-12 md:px-8">
          <div className="md:col-span-3">
            <Label>{t(b.label, lang)}</Label>
          </div>
          <div className="md:col-span-7">
            {b.title && <RevealText as="h3" text={t(b.title, lang)} className="display text-4xl leading-[1.02] md:text-6xl" />}
            <FadeUp stagger={0.1} className={`space-y-6 ${b.title ? "mt-10" : ""}`}>
              {b.body.map((p, j) => (
                <p key={j} className="text-lg leading-relaxed text-night/80 md:text-xl md:leading-relaxed">
                  {t(p, lang)}
                </p>
              ))}
            </FadeUp>
          </div>
        </section>
      );

    case "list":
      return (
        <section className="grid gap-8 px-4 md:grid-cols-12 md:px-8">
          <div className="md:col-span-3">
            <Label>{t(b.label, lang)}</Label>
          </div>
          <FadeUp as={b.ordered ? "ol" : "ul"} stagger={0.07} className="md:col-span-8">
            {b.items.map((it, j) => (
              <li key={j} className="grid grid-cols-12 gap-4 border-t border-night/15 py-5">
                <span className="cartel col-span-2 pt-1 text-champagne md:col-span-1">{String(j + 1).padStart(2, "0")}</span>
                <span className="col-span-10 text-lg leading-snug md:col-span-11 md:text-xl">{t(it, lang)}</span>
              </li>
            ))}
          </FadeUp>
        </section>
      );

    case "quote":
      return (
        <figure className="px-4 md:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <span aria-hidden className="display block text-7xl leading-none text-champagne">“</span>
            <RevealText as="blockquote" text={t(b.text, lang).trim().replace(/^[«‘“"]\s*|\s*[»’”"]$/g, "")} className="display mt-2 text-3xl italic leading-[1.15] md:text-5xl" stagger={0.02} />
            {b.source && <figcaption className="cartel mt-8 text-warm-dark">— {t(b.source, lang)}</figcaption>}
          </div>
        </figure>
      );

    case "figures":
      return (
        <section className="grid gap-8 px-4 md:grid-cols-12 md:px-8">
          <div className="md:col-span-3">
            <Label>{t(b.label, lang)}</Label>
            {b.note && <p className="mt-4 max-w-[15rem] text-sm italic text-night/55">{t(b.note, lang)}</p>}
          </div>
          <FadeUp as="dl" stagger={0.09} className="grid grid-cols-2 gap-x-6 gap-y-12 md:col-span-9 md:grid-cols-4">
            {b.items.map((f, j) => (
              <div key={j} className="border-t border-night/20 pt-5">
                <dt className="display text-5xl md:text-6xl">{f.value}</dt>
                <dd className="mt-3 text-sm leading-snug text-night/65">{t(f.label, lang)}</dd>
              </div>
            ))}
          </FadeUp>
        </section>
      );

    case "image": {
      const m = b.media;
      const layout = b.layout ?? "wide";
      const wrap =
        layout === "full" ? "" : layout === "wide" ? "px-4 md:px-8 md:grid md:grid-cols-12" : "px-4 md:px-8 md:grid md:grid-cols-12";
      const inner = layout === "full" ? "" : layout === "wide" ? "md:col-span-10 md:col-start-2" : "md:col-span-6 md:col-start-4";
      return (
        <figure className={wrap}>
          <div className={inner}>
            <MaskImage src={m.src} alt={t(m.alt, lang)} ratio={m.ratio} parallax={layout === "full"} sizes="100vw" />
            {m.caption && <div className={layout === "full" ? "px-4 md:px-8" : ""}><Caption>{t(m.caption, lang)}</Caption></div>}
          </div>
        </figure>
      );
    }

    case "pair":
      return (
        <div className="grid gap-10 px-4 md:grid-cols-12 md:px-8">
          {b.media.map((m, j) => (
            <figure key={j} className={j === 0 ? "md:col-span-5 md:col-start-1" : "md:col-span-6 md:col-start-7 md:mt-40"}>
              <MaskImage src={m.src} alt={t(m.alt, lang)} ratio={m.ratio} sizes="(min-width: 768px) 45vw, 100vw" />
              {m.caption && <Caption>{t(m.caption, lang)}</Caption>}
            </figure>
          ))}
        </div>
      );

    case "slides":
      return (
        <section className="px-4 md:px-8">
          <Label>{t(b.label, lang)}</Label>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {b.media.map((m, j) => (
              <figure key={j} className={j % 2 === 1 ? "md:mt-24" : ""}>
                <div className="bg-night p-2 shadow-[0_30px_60px_-30px_rgba(14,12,10,0.5)] md:p-3">
                  <MaskImage src={m.src} alt={t(m.alt, lang)} ratio={m.ratio} parallax={false} sizes="(min-width: 768px) 48vw, 100vw" />
                </div>
                {m.caption && <Caption>{t(m.caption, lang)}</Caption>}
              </figure>
            ))}
          </div>
        </section>
      );

    case "video":
      return (
        <figure className="grid items-end gap-8 px-4 md:grid-cols-12 md:px-8">
          <div className="md:col-span-4 md:col-start-3">
            <AutoVideo src={b.src} poster={b.poster} ratio={b.ratio} label={t(b.caption, lang)} />
          </div>
          <div className="md:col-span-4">
            <Rule className="mb-6" />
            <figcaption className="display text-3xl italic leading-tight md:text-4xl">{t(b.caption, lang)}</figcaption>
          </div>
        </figure>
      );

    case "placeholder":
      return (
        <div className="px-4 md:grid md:grid-cols-12 md:px-8">
          <div className="md:col-span-10 md:col-start-2">
            <Placeholder tag={t(ui.work.placeholder, lang)} label={t(b.label, lang)} ratio={b.ratio} />
          </div>
        </div>
      );

    case "chapter":
      return (
        <section className="px-4 md:px-8">
          <Rule />
          <div className="mt-10 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-3">
              <span className="display block text-[22vw] italic leading-[0.8] text-champagne md:text-[9vw]">{b.number}</span>
            </div>
            <div className="md:col-span-8">
              <RevealText as="h2" text={t(b.title, lang)} className="display text-[11vw] leading-[0.95] md:text-[5.4vw]" />
              {b.intro && (
                <FadeUp>
                  <p className="mt-8 max-w-2xl text-lg leading-relaxed text-night/80 md:text-xl">{t(b.intro, lang)}</p>
                </FadeUp>
              )}
            </div>
          </div>
        </section>
      );

    case "press":
      return (
        <section className="grid gap-8 px-4 md:grid-cols-12 md:px-8">
          <div className="md:col-span-3">
            <Label>{t(b.label, lang)}</Label>
            {b.note && <p className="mt-4 max-w-[15rem] text-sm italic text-night/55">{t(b.note, lang)}</p>}
          </div>
          <div className="md:col-span-9">
            <PressList lang={lang} items={b.items} dark={false} />
          </div>
        </section>
      );
  }
}
