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
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var l=(navigator.language||'fr').toLowerCase();location.replace(l.indexOf('fr')===0?'/fr/':'/en/');})();`,
        }}
      />
      <p className="font-serif text-5xl">{site.name}</p>
      <div className="flex gap-6">
        <a href="/fr/" className="link">Français</a>
        <a href="/en/" className="link">English</a>
      </div>
    </main>
  );
}
