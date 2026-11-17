import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import SelectedWork from "@/components/home/SelectedWork";
import { PathPreview } from "@/components/home/PathAndPress";
import { ClosingCta, PressSection } from "@/components/home/Closing";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({ lang });
}

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return (
    <>
      <Hero lang={lang} />
      <Statement lang={lang} />
      <SelectedWork lang={lang} />
      <PathPreview lang={lang} />
      <PressSection lang={lang} />
      <ClosingCta lang={lang} />
    </>
  );
}
