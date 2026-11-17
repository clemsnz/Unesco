import Link from "next/link";
import { href, t, type Locale } from "@/lib/i18n";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import BackToTop from "./BackToTop";

export default function Footer({ lang }: { lang: Locale }) {
  return (
    <footer className="relative overflow-hidden bg-night px-4 pb-8 pt-24 text-ivory md:px-8">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="cartel text-champagne">{t(site.availability, lang)}</p>
          <a href={`mailto:${site.email}`} className="display link-underline mt-6 inline-block text-[6.6vw] italic leading-none md:text-[4.2vw]">
            {site.email}
          </a>
        </div>
        <div className="cartel grid grid-cols-2 gap-8 text-warm md:col-span-5 md:col-start-8">
          <ul className="space-y-3">
            <li><Link className="link-underline hover:text-ivory" href={href(lang, "/work")}>{t(ui.nav.work, lang)}</Link></li>
            <li><Link className="link-underline hover:text-ivory" href={href(lang, "/about")}>{t(ui.nav.about, lang)}</Link></li>
            <li><Link className="link-underline hover:text-ivory" href={href(lang, "/contact")}>{t(ui.nav.contact, lang)}</Link></li>
          </ul>
          <ul className="space-y-3">
            <li><a className="link-underline hover:text-ivory" href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
            <li><a className="link-underline hover:text-ivory" href={site.cv.en} download>CV (EN) ↓</a></li>
            <li><BackToTop label={t(ui.footer.top, lang)} /></li>
          </ul>
        </div>
      </div>
      <div aria-hidden className="display pointer-events-none mt-20 select-none whitespace-nowrap text-center text-[17.5vw] leading-[0.8] text-ivory/[0.06]">
        Clémentine Sanchez
      </div>
      <div className="cartel mt-6 flex flex-col justify-between gap-2 text-warm/70 sm:flex-row">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>{t(ui.footer.rights, lang)}</span>
      </div>
    </footer>
  );
}
