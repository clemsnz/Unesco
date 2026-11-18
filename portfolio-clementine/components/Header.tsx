"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { href, switchLocalePath, t, type Locale } from "@/lib/i18n";
import { site } from "@/content/site";
import { ui } from "@/content/about";

export default function Header({ lang }: { lang: Locale }) {
  const pathname = usePathname() || `/${lang}/`;
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const links = [
    { path: "/work", label: t(ui.work, lang) },
    { path: "/about", label: t(ui.about, lang) },
    { path: "/contact", label: t(ui.contact, lang) },
  ];

  return (
    <header className="wrap flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-ink py-4">
      <Link href={href(lang)} className="font-serif text-xl">
        {site.name}
      </Link>
      <nav aria-label="Main" className="flex items-baseline gap-5 text-sm md:gap-8">
        {links.map((l) => {
          const active = pathname.startsWith(href(lang, l.path));
          return (
            <Link key={l.path} href={href(lang, l.path)} aria-current={active ? "page" : undefined} className={active ? "text-bordeaux" : "hover:text-bordeaux"}>
              {l.label}
            </Link>
          );
        })}
        <span className="text-muted">
          {(["fr", "en"] as const).map((l, i) => (
            <span key={l}>
              {i > 0 && " / "}
              {l === lang ? (
                <span className="text-ink">{l.toUpperCase()}</span>
              ) : (
                <Link href={switchLocalePath(pathname, l)} hrefLang={l} lang={l} className="hover:text-bordeaux">
                  {l.toUpperCase()}
                </Link>
              )}
            </span>
          ))}
        </span>
      </nav>
    </header>
  );
}
