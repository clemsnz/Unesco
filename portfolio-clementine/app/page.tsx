import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `${site.name} — Portfolio`,
  alternates: { canonical: "/fr/" },
  robots: { index: false, follow: true },
};

/** Entry point: sends visitors to the French or English version based on their browser language. */
export default function RootRedirect() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-night text-ivory">
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var l=(navigator.language||'fr').toLowerCase();location.replace(l.indexOf('fr')===0?'/fr/':'/en/');})();`,
        }}
      />
      <p className="display text-5xl italic">{site.name}</p>
      <div className="cartel flex gap-6">
        <a href="/fr/" className="link-underline">Français</a>
        <a href="/en/" className="link-underline">English</a>
      </div>
    </main>
  );
}
