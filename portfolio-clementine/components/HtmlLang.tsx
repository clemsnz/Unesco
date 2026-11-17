"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

/** Keeps <html lang> in sync on client-side navigation between FR and EN. */
export default function HtmlLang({ lang }: { lang: Locale }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
