"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { href, switchLocalePath, t, type Locale } from "@/lib/i18n";
import { ui } from "@/content/ui";
import { site } from "@/content/site";

const ease = [0.76, 0, 0.24, 1] as const;

export default function Nav({ lang }: { lang: Locale }) {
  const pathname = usePathname() || `/${lang}/`;
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { path: "/work", label: t(ui.nav.work, lang), n: "01" },
    { path: "/about", label: t(ui.nav.about, lang), n: "02" },
    { path: "/contact", label: t(ui.nav.contact, lang), n: "03" },
  ];
  const isActive = (p: string) => pathname.startsWith(href(lang, p));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ivory focus:px-4 focus:py-2 focus:text-night">
        {t(ui.nav.skip, lang)}
      </a>
      <header className="fixed inset-x-0 top-0 z-[60] text-ivory mix-blend-difference">
        <nav aria-label="Main" className="flex items-center justify-between px-4 py-5 md:px-8 md:py-6">
          <Link href={href(lang)} className="group flex items-center gap-3" aria-label={`${site.name} — ${t(ui.nav.home, lang)}`}>
            <span className="display text-2xl italic leading-none">CS</span>
            <span className="cartel relative hidden overflow-hidden sm:block">
              <span className="block transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:-translate-y-full">{site.name}</span>
              <span aria-hidden className="absolute left-0 top-full block transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:-translate-y-full">{t(ui.nav.home, lang)}</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-10 md:flex">
            {links.map((l) => (
              <li key={l.path}>
                <Link href={href(lang, l.path)} className="cartel group relative flex items-baseline gap-2" aria-current={isActive(l.path) ? "page" : undefined}>
                  <span className="text-[0.55rem] opacity-50">{l.n}</span>
                  <span className="link-underline pb-0.5" style={isActive(l.path) ? { backgroundSize: "100% 1px" } : undefined}>
                    {l.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5">
            <LangSwitch lang={lang} pathname={pathname} />
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="menu-overlay"
              className="cartel flex items-center gap-2 md:hidden"
            >
              <span>{open ? t(ui.nav.close, lang) : t(ui.nav.menu, lang)}</span>
              <span aria-hidden className="relative block h-2 w-5">
                <span className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ${open ? "translate-y-1 rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "-translate-y-1 -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={t(ui.nav.menu, lang)}
            className="grain fixed inset-0 z-[55] flex flex-col justify-between bg-night px-4 pb-8 pt-28 text-ivory md:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.8, ease }}
          >
            <ul className="space-y-2">
              {[{ path: "/", label: t(ui.nav.home, lang), n: "00" }, ...links].map((l, i) => (
                <li key={l.path} className="overflow-hidden">
                  <motion.div initial={{ y: "110%" }} animate={{ y: 0 }} exit={{ y: "110%" }} transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.06 }}>
                    <Link href={href(lang, l.path)} className="flex items-baseline gap-4 py-1">
                      <span className="cartel text-champagne">{l.n}</span>
                      <span className="display text-[15vw] leading-none">{l.label}</span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.5 }} className="space-y-2">
              <a href={`mailto:${site.email}`} className="block text-sm">{site.email}</a>
              <p className="cartel text-warm">{t(site.availability, lang)}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LangSwitch({ lang, pathname }: { lang: Locale; pathname: string }) {
  return (
    <div className="cartel flex items-center gap-1.5" role="group" aria-label="Language">
      {(["fr", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className="opacity-40">/</span>}
          {l === lang ? (
            <span aria-current="true" className="opacity-100">{l.toUpperCase()}</span>
          ) : (
            <Link href={switchLocalePath(pathname, l)} hrefLang={l} lang={l} className="opacity-45 transition-opacity hover:opacity-100">
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
