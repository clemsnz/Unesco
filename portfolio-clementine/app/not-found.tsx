import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <p className="text-bordeaux">404</p>
      <h1 className="font-serif text-6xl md:text-8xl">Page introuvable</h1>
      <p className="text-muted">This page doesn’t exist — cette page n’existe pas.</p>
      <div className="flex gap-8">
        <Link href="/fr/" className="link">Accueil</Link>
        <Link href="/en/" className="link">Home</Link>
      </div>
    </main>
  );
}
