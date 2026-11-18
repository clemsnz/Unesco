import type { Metadata } from "next";
import { t, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { projects } from "@/content/projects";
import { ui } from "@/content/about";
import ProjectCard from "@/components/ProjectCard";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({ lang, path: "/work", title: t(ui.work, lang) });
}

export default async function Work({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return (
    <section className="wrap">
      <h1 className="border-b border-ink py-10 font-serif text-6xl font-light md:py-14 md:text-8xl">{t(ui.work, lang)}</h1>
      <div className="grid gap-x-6 gap-y-14 pt-10 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.slug} p={p} lang={lang} ratio="4 / 3" />
        ))}
      </div>
    </section>
  );
}
