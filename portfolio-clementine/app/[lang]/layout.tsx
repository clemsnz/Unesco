import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n";
import { site } from "@/content/site";
import Intro from "@/components/Intro";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import ScrollProgress from "@/components/ScrollProgress";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HtmlLang from "@/components/HtmlLang";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: lang === "fr" ? "Étudiante en communication & marketing" : "Communications & marketing student",
    alumniOf: { "@type": "CollegeOrUniversity", name: "EFAP" },
    address: { "@type": "PostalAddress", addressLocality: "Paris", addressCountry: "FR" },
    sameAs: [site.linkedin],
    knowsLanguage: ["fr", "en", "es"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HtmlLang lang={lang} />
      <Intro first={site.firstName} last={site.lastName} />
      <SmoothScroll />
      <ScrollProgress />
      <Cursor />
      <Nav lang={lang} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer lang={lang} />
    </>
  );
}
