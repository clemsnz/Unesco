import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { works } from "@/content/museum";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${site.url}/`, priority: 1 }, ...works.map((w) => ({ url: `${site.url}/oeuvres/${w.slug}/`, priority: 0.7 }))];
}
