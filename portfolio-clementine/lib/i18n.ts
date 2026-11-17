export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

/** A bilingual string. */
export type L = { fr: string; en: string };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Pick the right language from a bilingual value. */
export function t(value: L | string, lang: Locale): string {
  return typeof value === "string" ? value : value[lang];
}

/** Build an internal href for a given locale: href("en", "/work") → "/en/work/" */
export function href(lang: Locale, path = "/"): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
}

/** Swap the locale segment of the current pathname. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && isLocale(parts[0])) parts[0] = to;
  else parts.unshift(to);
  return `/${parts.join("/")}/`;
}
