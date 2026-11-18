"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { artworks, entrance } from "@/content/museum";
import { site } from "@/content/site";
import MuseumLite from "./MuseumLite";

const STEP_VH = 110; // scroll length between two stations

function canRun3D() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.innerWidth < 820) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Museum() {
  const [mode, setMode] = useState<"pending" | "3d" | "lite">("pending");
  useEffect(() => setMode(canRun3D() ? "3d" : "lite"), []);
  if (mode === "pending") return <div className="fixed inset-0 bg-[#ece9e3]" />;
  return mode === "3d" ? <Museum3D /> : <MuseumLite />;
}

function Museum3D() {
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<Awaited<ReturnType<typeof import("./scene").createMuseum>> | null>(null);
  const [count, setCount] = useState(artworks.length + 4);
  const [station, setStation] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [plan, setPlan] = useState(false);
  const cursor = useRef<HTMLDivElement>(null);

  // build the scene once fonts are ready (they are painted into textures)
  useEffect(() => {
    let disposed = false;
    (async () => {
      await Promise.all([document.fonts.load('500 40px "Instrument Sans"'), document.fonts.load('400 40px "Instrument Sans"')]).catch(() => {});
      const { createMuseum } = await import("./scene");
      if (disposed || !canvas.current) return;
      api.current = createMuseum(canvas.current, { artworks, name: entrance.name, line: entrance.line, room: entrance.room });
      setCount(api.current.stations.length);
      if (new URLSearchParams(location.search).has("capture")) (window as unknown as { __museum: unknown }).__museum = api.current;
      setReady(true);
      // coming back from a room: resume where the visitor left
      const at = new URLSearchParams(location.search).get("at") ?? sessionStorage.getItem("museum-at");
      sessionStorage.removeItem("museum-at");
      if (at) window.scrollTo(0, Number(at) * window.innerHeight * (STEP_VH / 100));
    })();
    return () => {
      disposed = true;
      api.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const s = window.scrollY / (window.innerHeight * (STEP_VH / 100));
      api.current?.setProgress(s);
      setStation(Math.round(s));
    };
    const onResize = () => api.current?.resize();
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      api.current?.setPointer(x, y);
      const h = api.current?.hit(x, y) ?? null;
      const clickable = h !== null && !!artworks[h].page ? h : null;
      setHover(clickable);
      api.current?.setHover(h);
      if (cursor.current) cursor.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const enter = (i: number) => {
    const a = artworks[i];
    if (!a.page || !api.current) return;
    const st = api.current.stations.findIndex((s) => s.art === i);
    sessionStorage.setItem("museum-at", String(st));
    setLeaving(true);
    api.current.focus(i, () => router.push(a.page!));
  };

  const go = (i: number) => {
    setPlan(false);
    window.scrollTo({ top: i * window.innerHeight * (STEP_VH / 100), behavior: "smooth" });
  };

  const stations = api.current?.stations ?? [];
  const here = stations[Math.min(station, stations.length - 1)];
  const art = here?.art !== undefined ? artworks[here.art] : null;

  return (
    <>
      <div style={{ height: `${(count - 1) * STEP_VH + 100}vh` }} aria-hidden />
      <canvas
        ref={canvas}
        className="fixed inset-0 h-screen w-screen"
        style={{ cursor: hover !== null ? "none" : "default" }}
        onClick={() => hover !== null && enter(hover)}
        aria-label="Visite virtuelle du portfolio"
      />

      {/* loading veil */}
      <div className={`pointer-events-none fixed inset-0 bg-[#ece9e3] transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`} />

      {/* top bar */}
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-8 py-6 text-[13px] tracking-[0.04em] text-[#1c1916]">
        <button onClick={() => go(0)} className="uppercase tracking-[0.2em]">{site.name}</button>
        <nav className="flex items-center gap-8">
          <button onClick={() => setPlan(true)} className="hover:opacity-60">Plan du musée</button>
          <a href={site.cv} download className="hover:opacity-60">CV</a>
          <a href={`mailto:${site.email}`} className="hover:opacity-60">Contact</a>
        </nav>
      </header>

      {/* wayfinding + cartel of the work in front of the visitor */}
      <div className="pointer-events-none fixed bottom-8 left-8 z-20 text-[#1c1916]">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#6b6259]">{here?.label === "Entrée" ? entrance.room : station >= stations.length - 1 ? "Galerie 03 — Parcours" : "Galerie 02 — Œuvres choisies"}</p>
        <div className={`mt-3 transition-all duration-700 ${art ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          {art && (
            <>
              <p className="text-[22px] leading-tight">{art.n} — {art.title}</p>
              <p className="mt-1 text-[13px] text-[#6b6259]">{art.line}</p>
              {art.page && (
                <button onClick={() => enter(here!.art!)} className="pointer-events-auto mt-3 border-b border-current text-[13px]">
                  Explorer l’œuvre →
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <p className={`pointer-events-none fixed bottom-8 right-8 z-20 text-[11px] uppercase tracking-[0.22em] text-[#6b6259] transition-opacity duration-700 ${station === 0 ? "opacity-100" : "opacity-0"}`}>
        Faites défiler pour entrer ↓
      </p>

      {/* custom cursor over interactive works */}
      <div ref={cursor} className="pointer-events-none fixed left-0 top-0 z-30">
        <div className={`-translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1c1916] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition-opacity duration-300 ${hover !== null ? "opacity-100" : "opacity-0"}`}>
          Explorer
        </div>
      </div>

      {/* plan of the museum */}
      {plan && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#ece9e3]/95" onClick={() => setPlan(false)}>
          <ol className="space-y-4 text-center" onClick={(e) => e.stopPropagation()}>
            <li className="mb-8 text-[11px] uppercase tracking-[0.22em] text-[#6b6259]">Plan du musée</li>
            <li><button onClick={() => go(0)} className="text-3xl hover:opacity-60">Entrée</button></li>
            {artworks.map((a, i) => (
              <li key={a.slug}>
                <button onClick={() => go(stations.findIndex((s) => s.art === i))} className="text-3xl hover:opacity-60">
                  <span className="mr-3 text-base text-[#6b6259]">{a.n}</span>{a.title}
                </button>
              </li>
            ))}
            <li className="pt-6"><button onClick={() => setPlan(false)} className="text-[13px] text-[#6b6259]">Fermer</button></li>
          </ol>
        </div>
      )}

      {/* walking into a work */}
      <div className={`pointer-events-none fixed inset-0 z-50 bg-[#f7f6f2] transition-opacity duration-700 ${leaving ? "opacity-100 delay-1000" : "opacity-0"}`} />
    </>
  );
}
