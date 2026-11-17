"use client";

import { useState, type FormEvent } from "react";
import { t, type Locale } from "@/lib/i18n";
import { ui } from "@/content/ui";
import { site } from "@/content/site";

/**
 * Contact form with no backend: composes a pre-filled email in the visitor's mail app.
 * (To receive messages directly, swap the submit handler for a Formspree / Resend endpoint.)
 */
export default function ContactForm({ lang }: { lang: Locale }) {
  const f = ui.contact.form;
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const company = String(data.get("company") || "");
    const from = String(data.get("email") || "");
    const message = String(data.get("message") || "");
    const subject = `${t(f.subject, lang)}${company ? ` — ${company}` : ""}`;
    const body = `${message}\n\n— ${name}${company ? `, ${company}` : ""}\n${from}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field = "peer w-full border-b border-ivory/25 bg-transparent pb-3 pt-6 text-lg text-ivory outline-none transition-colors placeholder-transparent focus:border-champagne";
  const label = "cartel pointer-events-none absolute left-0 top-0 text-warm transition-colors peer-focus:text-champagne";

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate={false}>
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="relative">
          <input id="name" name="name" required autoComplete="name" placeholder=" " className={field} />
          <label htmlFor="name" className={label}>{t(f.name, lang)} *</label>
        </div>
        <div className="relative">
          <input id="company" name="company" autoComplete="organization" placeholder=" " className={field} />
          <label htmlFor="company" className={label}>{t(f.company, lang)}</label>
        </div>
      </div>
      <div className="relative">
        <input id="email" name="email" type="email" required autoComplete="email" placeholder=" " className={field} />
        <label htmlFor="email" className={label}>{t(f.email, lang)} *</label>
      </div>
      <div className="relative">
        <textarea id="message" name="message" required rows={5} placeholder=" " className={`${field} resize-none`} />
        <label htmlFor="message" className={label}>{t(f.message, lang)} *</label>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" className="group relative inline-flex items-center gap-3 overflow-hidden border border-ivory/40 px-8 py-4 text-ivory transition-colors duration-500 hover:text-night">
          <span aria-hidden className="absolute inset-0 translate-y-full bg-champagne transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-y-0" />
          <span className="cartel relative">{t(f.send, lang)}</span>
          <span aria-hidden className="relative">→</span>
        </button>
        <p className="text-sm text-warm" role="status">{sent ? "✓ " : ""}{t(f.note, lang)}</p>
      </div>
    </form>
  );
}
