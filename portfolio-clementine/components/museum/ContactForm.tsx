"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/content/site";

/**
 * Contact form hung on the wall of Galerie 04.
 * With a Web3Forms key (content/site.ts) messages are sent straight to Clémentine's inbox;
 * without one, it opens the visitor's mail app with everything pre-filled.
 */
export default function ContactForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const name = String(d.get("name") || "");
    const email = String(d.get("email") || "");
    const message = String(d.get("message") || "");
    if (!site.formKey) {
      const body = `${message}\n\n— ${name}\n${email}`;
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Message de ${name} via le portfolio`)}&body=${encodeURIComponent(body)}`;
      setState("sent");
      return;
    }
    setState("sending");
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: site.formKey, subject: `Portfolio — message de ${name}`, from_name: name, name, email, message, botcheck: d.get("botcheck") || "" }),
      });
      const j = await r.json();
      if (!j.success) throw new Error();
      setState("sent");
      form.reset();
    } catch {
      setState("error");
    }
  };

  const field = "w-full border-b border-[#1c1916]/25 bg-transparent py-2 text-[15px] outline-none transition-colors placeholder:text-[#8a8178] focus:border-[#1c1916]";
  return (
    <form onSubmit={submit} className={`flex h-full flex-col ${compact ? "gap-3" : "gap-[clamp(8px,2.2vh,22px)]"}`}>
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-6">
        <label className="block">
          <span className="sr-only">Nom</span>
          <input name="name" required autoComplete="name" placeholder="Nom" className={field} />
        </label>
        <label className="block">
          <span className="sr-only">E-mail</span>
          <input name="email" type="email" required autoComplete="email" placeholder="E-mail" className={field} />
        </label>
      </div>
      <label className="block flex-1">
        <span className="sr-only">Message</span>
        <textarea name="message" required placeholder="Votre message" className={`${field} h-full min-h-[90px] resize-none`} />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-[#6b6259]" role="status">
          {state === "sent" ? (site.formKey ? "Merci, votre message est bien arrivé." : "Votre messagerie s’ouvre avec le message.") : state === "error" ? `L’envoi a échoué. Écrivez-moi à ${site.email}.` : state === "sending" ? "Envoi…" : ""}
        </p>
        <button type="submit" disabled={state === "sending"} className="bg-[#1c1916] px-6 py-3 text-[12px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 disabled:opacity-50">
          Envoyer
        </button>
      </div>
    </form>
  );
}
