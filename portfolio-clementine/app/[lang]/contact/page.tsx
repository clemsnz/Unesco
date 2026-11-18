import type { Metadata } from "next";
import { t, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { ui } from "@/content/about";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({ lang, path: "/contact", title: t(ui.contact, lang) });
}

export default async function Contact({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const rows = [
    { k: "E-mail", v: site.email, href: `mailto:${site.email}` },
    { k: "LinkedIn", v: "clementine-sanchez ↗", href: site.linkedin, ext: true },
    { k: "CV", v: `${t(ui.cv, lang)} ↓`, href: site.cv, dl: true },
  ];
  return (
    <section className="wrap">
      <h1 className="border-b border-ink py-10 font-serif text-6xl font-light md:py-14 md:text-8xl">{t(ui.contact, lang)}</h1>
      <p className="max-w-2xl py-10 font-serif text-2xl leading-snug md:text-3xl">{t(ui.contactText, lang)}</p>
      <ul className="border-t border-ink">
        {rows.map((r) => (
          <li key={r.k} className="border-b border-line">
            <a
              href={r.href}
              {...(r.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              {...(r.dl ? { download: true } : {})}
              className="group grid gap-1 py-6 sm:grid-cols-[10rem_1fr]"
            >
              <span className="kicker">{r.k}</span>
              <span className="font-serif text-2xl break-all transition-colors group-hover:text-bordeaux md:text-4xl">{r.v}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
