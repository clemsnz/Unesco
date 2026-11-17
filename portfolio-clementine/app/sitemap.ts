import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { locales } from "@/lib/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "work", "about", "contact", ...projects.map((p) => `work/${p.slug}`)];
  return locales.flatMap((lang) =>
    paths.map((p) => ({
      url: `${site.url}/${lang}/${p ? `${p}/` : ""}`,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
  );
}
