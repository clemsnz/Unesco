"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { about, entrance, exit, journey, rooms, works } from "@/content/museum";
import { site } from "@/content/site";
import type { MuseumApi, Station } from "./scene";
import MuseumLite from "./MuseumLite";

const STEP_VH = 100; // scroll length between two stations

function canRun3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.innerWidth < 820 || window.matchMedia("(pointer: coarse)").matches) return false;
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
  if (mode === "pending") return <div className="fixed inset-0 bg-[#f1eee9]" />;
  return mode === "3d" ? <Museum3D /> : <MuseumLite />;
}

const roomLabel = (s?: Station) => (s ? (s.room === "entrance" ? entrance.room : rooms[s.room]) : "");
const workNumber = (i: number) => {
  const w = works[i];
  const same = works.slice(0, i + 1).filter((x) => x.room === w.room).length;
  return w.room === "main" ? String(same).padStart(2, "0") : `Étude ${String(same).padStart(2, "0")}`;
};

function Museum3D() {
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<MuseumApi | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [station, setStation] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [plan, setPlan] = useState(false);
  const cursor = useRef<HTMLDivElement>(null);
  const step = () => window.innerHeight * (STEP_VH / 100);

  useEffect(() => {
    let disposed = false;
    (async () => {
      await Promise.all([document.fonts.load('500 40px "Instrument Sans"'), document.fonts.load('400 40px "Instrument Sans"')]).catch(() => {});
      const { createMuseum } = await import("./scene");
      if (disposed || !canvas.current) return;
      const m = createMuseum(canvas.current, { works, entrance, rooms, journey, about, exit });
      api.current = m;
      setStations(m.stations);
      setReady(true);
      if (new URLSearchParams(location.search).has("capture")) (window as unknown as { __museum: MuseumApi }).__museum = m;
      let at: string | null = null;
      try {
        at = sessionStorage.getItem("museum-at");
        sessionStorage.removeItem("museum-at");
      } catch {}
      at = new URLSearchParams(location.search).get("at") ?? at;
      if (at) {
        requestAnimationFrame(() => {
          window.scrollTo(0, Number(at) * step());
          m.jump(Number(at));
        });
      }
    })();
    return () => {
      disposed = true;
      api.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const s = window.scrollY / step();
      api.current?.setProgress(s);
      setStation(Math.round(s));
    };
    const onResize = () => api.current?.resize();
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      api.current?.setPointer(x, y);
      const h = api.current?.hit(x, y) ?? null;
      setHover(h);
      api.current?.setHover(h);
      if (cursor.current) cursor.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlan(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const enter = (i: number) => {
    if (!api.current || leaving) return;
    const st = stations.findIndex((s) => s.art === i);
    try {
      sessionStorage.setItem("museum-at", String(st));
    } catch {}
    window.scrollTo(0, st * step());
    setLeaving(true);
    api.current.focus(i, () => router.push(`/oeuvres/${works[i].slug}/`));
  };

  const go = (i: number) => {
    setPlan(false);
    window.scrollTo({ top: i * step(), behavior: "smooth" });
  };
  const goRoom = (room: Station["room"]) => go(stations.findIndex((s) => s.room === room));

  const here = stations[Math.min(station, stations.length - 1)];
  const art = here?.art !== undefined ? here.art : null;
  const atExit = here?.room === "exit";

  return (
    <>
      <div style={{ height: `${Math.max(stations.length - 1, 1) * STEP_VH + 100}vh` }} aria-hidden />
      <canvas
        ref={canvas}
        className="fixed inset-0 h-screen w-screen"
        style={{ cursor: hover !== null ? "none" : "default" }}
        onClick={() => hover !== null && enter(hover)}
        aria-hidden
      />
      <div className={`pointer-events-none fixed inset-0 bg-[#f1eee9] transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`} />

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-8 py-6 text-[13px] tracking-[0.04em] text-[#1c1916]">
        <button onClick={() => go(0)} className="uppercase tracking-[0.2em]">{site.name}</button>
        <nav className="flex items-center gap-8" aria-label="Navigation">
          <button onClick={() => setPlan(true)} className="hover:opacity-60">Plan du musée</button>
          <a href={site.cv} download className="hover:opacity-60">CV</a>
          <button onClick={() => goRoom("exit")} className="hover:opacity-60">Contact</button>
        </nav>
      </header>

      {/* cartel of the work in front of the visitor */}
      <div className="pointer-events-none fixed bottom-8 left-8 z-20 max-w-md text-[#1c1916]">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#6b6259]">{roomLabel(here)}</p>
        <div className={`mt-3 transition-all duration-700 ${art !== null ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          {art !== null && (
            <>
              <p className="text-[22px] leading-tight">
                {workNumber(art)} — {works[art].title}
              </p>
              <p className="mt-1 text-[13px] text-[#6b6259]">{works[art].line}</p>
              <button onClick={() => enter(art)} className="pointer-events-auto mt-3 border-b border-current text-[13px]">
                Explorer l’œuvre →
              </button>
            </>
          )}
        </div>
      </div>
      <p className={`pointer-events-none fixed bottom-8 right-8 z-20 text-[11px] uppercase tracking-[0.22em] text-[#6b6259] transition-opacity duration-700 ${station === 0 ? "opacity-100" : "opacity-0"}`}>
        Faites défiler pour entrer ↓
      </p>

      {/* exit: contact */}
      <div className={`fixed inset-x-0 bottom-[12vh] z-20 flex justify-center gap-10 text-[15px] text-[#1c1916] transition-all duration-700 ${atExit ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        <a href={`mailto:${site.email}`} className="border-b border-current pb-0.5 hover:opacity-60">{site.email}</a>
        <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="border-b border-current pb-0.5 hover:opacity-60">LinkedIn ↗</a>
        <a href={site.cv} download className="border-b border-current pb-0.5 hover:opacity-60">Télécharger le CV ↓</a>
      </div>

      <div ref={cursor} className="pointer-events-none fixed left-0 top-0 z-30">
        <div className={`-translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1c1916] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition-opacity duration-300 ${hover !== null ? "opacity-100" : "opacity-0"}`}>
          Explorer
        </div>
      </div>

      {plan && <Plan onClose={() => setPlan(false)} onRoom={goRoom} onWork={(i) => go(stations.findIndex((s) => s.art === i))} />}

      <div className={`pointer-events-none fixed inset-0 z-50 bg-[#f7f6f2] transition-opacity duration-700 ${leaving ? "opacity-100 delay-1000" : "opacity-0"}`} />

      {/* the whole content, readable without the 3D (screen readers, search engines) */}
      <div className="sr-only">
        <h1>{site.name}</h1>
        <p>{entrance.line}</p>
        <ul>
          {works.map((w) => (
            <li key={w.slug}>
              <a href={`/oeuvres/${w.slug}/`}>{w.title} — {w.line}</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function Plan({ onClose, onRoom, onWork }: { onClose: () => void; onRoom: (r: Station["room"]) => void; onWork: (i: number) => void }) {
  const item = "text-left text-2xl leading-snug hover:opacity-60";
  const head = "text-[11px] uppercase tracking-[0.22em] text-[#8a8178]";
  return (
    <div role="dialog" aria-modal="true" aria-label="Plan du musée" className="fixed inset-0 z-40 overflow-y-auto bg-[#f1eee9]/97" onClick={onClose}>
      <div className="mx-auto grid max-w-5xl gap-12 px-8 py-24 md:grid-cols-3" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <p className={head}>01</p>
          <button className={item} onClick={() => onRoom("entrance")}>Entrée</button>
          <p className={`${head} pt-8`}>Cabinet d’études</p>
          {works.map((w, i) =>
            w.room === "cabinet" ? (
              <button key={w.slug} className={`${item} block`} onClick={() => onWork(i)}>{w.title}</button>
            ) : null,
          )}
        </div>
        <div className="space-y-3">
          <p className={head}>02 — Œuvres choisies</p>
          {works.map((w, i) =>
            w.room === "main" ? (
              <button key={w.slug} className={`${item} block`} onClick={() => onWork(i)}>
                <span className="mr-3 text-sm text-[#8a8178]">{workNumber(i)}</span>
                {w.title}
              </button>
            ) : null,
          )}
        </div>
        <div className="space-y-3">
          <p className={head}>03</p>
          <button className={`${item} block`} onClick={() => onRoom("journey")}>Parcours</button>
          <p className={`${head} pt-6`}>04</p>
          <button className={`${item} block`} onClick={() => onRoom("about")}>À propos</button>
          <p className={`${head} pt-6`}>05</p>
          <button className={`${item} block`} onClick={() => onRoom("exit")}>Sortie · Contact</button>
          <button onClick={onClose} className="block pt-10 text-[13px] text-[#6b6259]">Fermer ✕</button>
        </div>
      </div>
    </div>
  );
}
