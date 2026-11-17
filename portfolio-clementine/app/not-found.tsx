import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-night px-4 text-center text-ivory">
      <p className="cartel text-champagne">404</p>
      <h1 className="display text-6xl italic md:text-8xl">Page introuvable</h1>
      <p className="text-ivory/60">This page doesn’t exist — cette page n’existe pas.</p>
      <div className="cartel flex gap-8">
        <Link href="/fr/" className="link-underline">Accueil</Link>
        <Link href="/en/" className="link-underline">Home</Link>
      </div>
    </main>
  );
}
