import type { Metadata } from "next";
import { site } from "@/content/site";
import { href, t, type Locale } from "./i18n";

export function pageMetadata({
  lang,
  path = "/",
  title,
  description,
  image = "/og-image.png",
}: {
  lang: Locale;
  path?: string;
  title?: string;
  description?: string;
  image?: string;
}): Metadata {
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — ${t(site.tagline, lang)}`;
  const desc = description ?? t(site.intro, lang);
  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: href(lang, path),
      languages: { fr: href("fr", path), en: href("en", path), "x-default": href("fr", path) },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: fullTitle,
      description: desc,
      url: href(lang, path),
      locale: lang === "fr" ? "fr_FR" : "en_GB",
      images: [{ url: image, width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: desc, images: [image] },
  };
}
