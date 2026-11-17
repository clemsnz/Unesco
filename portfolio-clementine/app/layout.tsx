import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/manrope/300.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  authors: [{ name: site.name }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0c0a",
  colorScheme: "dark light",
};

/**
 * Root layout. The visible language is set per route in app/[lang]/;
 * this inline script keeps <html lang> in sync for assistive tech.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var m=location.pathname.match(/^\\/(fr|en)(\\/|$)/);if(m)document.documentElement.lang=m[1];})();`,
          }}
        />
        <noscript>
          <style>{`#intro,[data-curtain]{display:none!important}[data-page]{opacity:1!important}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
