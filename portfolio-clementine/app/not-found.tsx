import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f1eee9] px-4 text-center text-[#1c1916]">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[#6b6259]">Salle introuvable</p>
      <h1 className="text-4xl">Cette page n’existe pas.</h1>
      <Link href="/" className="border-b border-current text-[13px]">Retour à la galerie</Link>
    </main>
  );
}
