"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { about, entrance, exit, journey, rooms, shop, works, type ShopId } from "@/content/museum";
import { site } from "@/content/site";
import type { MuseumApi, Station } from "./scene";
import MuseumLite from "./MuseumLite";
import ContactForm from "./ContactForm";

const STEP_VH = 85; // scroll length between two stations

function canRun3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
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
  const [openJ, setOpenJ] = useState<number | null>(null);
  const [overFrieze, setOverFrieze] = useState(false);
  const cursor = useRef<HTMLDivElement>(null);
  const [souvenir, setSouvenir] = useState<ShopId | null>(null);
  const [overShop, setOverShop] = useState(false);
  const [narrowScreen, setNarrowScreen] = useState(false);
  const step = () => window.innerHeight * (STEP_VH / 100);

  useEffect(() => {
    let disposed = false;
    (async () => {
      await Promise.all([document.fonts.load('500 40px "Instrument Sans"'), document.fonts.load('400 40px "Instrument Sans"')]).catch(() => {});
      const { createMuseum } = await import("./scene");
      if (disposed || !canvas.current) return;
      const m = createMuseum(canvas.current, { works, entrance, rooms, journey, about, exit, shop });
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
    setNarrowScreen(window.innerWidth / window.innerHeight < 0.8);
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
      setOverFrieze(h === null && (api.current?.hitFrieze(x, y) ?? null) !== null);
      setOverShop(h === null && (api.current?.hitShop(x, y) ?? null) !== null);
      if (cursor.current) cursor.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPlan(false);
        setOpenJ(null);
        setSouvenir(null);
      }
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
  const inShop = here?.room === "exit" || here?.room === "about";
  const goShop = (id?: ShopId) => {
    setPlan(false);
    const i = stations.findIndex((s) => s.contact);
    window.scrollTo({ top: i * step(), behavior: "smooth" });
    if (id) setTimeout(() => setSouvenir(id), 900);
  };


  return (
    <>
      <div style={{ height: `${Math.max(stations.length - 1, 1) * STEP_VH + 100}vh` }} aria-hidden />
      <canvas
        ref={canvas}
        className="fixed inset-0 h-screen w-screen"
        style={{ cursor: hover !== null || overFrieze || overShop ? "none" : "default" }}
        onClick={(e) => {
          const x = (e.clientX / window.innerWidth) * 2 - 1;
          const y = -(e.clientY / window.innerHeight) * 2 + 1;
          const h = api.current?.hit(x, y) ?? null;
          if (h !== null) return enter(h);
          const f = api.current?.hitFrieze(x, y) ?? null;
          if (f !== null) return setOpenJ(f);
          const sv = api.current?.hitShop(x, y) ?? null;
          if (sv !== null) setSouvenir(sv as ShopId);
        }}
        aria-hidden
      />
      <div className={`pointer-events-none fixed inset-0 bg-[#f1eee9] transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`} />

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 text-[12px] tracking-[0.04em] text-[#1c1916] md:px-8 md:py-6 md:text-[13px]">
        <button onClick={() => go(0)} className="uppercase tracking-[0.2em]">
          <span className="hidden sm:inline">{site.name}</span>
          <span className="sm:hidden">C. Sanchez</span>
        </button>
        <nav className="flex items-center gap-5 md:gap-8" aria-label="Navigation">
          <button onClick={() => setPlan(true)} className="hover:opacity-60">
            <span className="hidden sm:inline">Plan du musée</span>
            <span className="sm:hidden">Plan</span>
          </button>
          <a href={site.cv} download className="hover:opacity-60">CV</a>
          <button onClick={() => goShop("contact")} className="hover:opacity-60">Contact</button>
        </nav>
      </header>

      {/* cartel of the work in front of the visitor */}
      <div className="pointer-events-none fixed bottom-5 left-4 right-4 z-20 max-w-md text-[#1c1916] md:bottom-8 md:left-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#6b6259]">{roomLabel(here)}</p>
        <div className={`mt-3 transition-all duration-700 ${art !== null ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          {art !== null && (
            <>
              <p className="text-[19px] leading-tight md:text-[22px]">
                {workNumber(art)} — {works[art].title}
              </p>
              <p className="mt-1 text-[13px] text-[#6b6259]">{works[art].line}</p>
              <p className="text-[13px] text-[#6b6259]">{works[art].role}</p>
              <button onClick={() => enter(art)} className="pointer-events-auto mt-3 border-b border-current text-[13px]">
                Explorer l’œuvre →
              </button>
            </>
          )}
        </div>
      </div>
      {/* timeline hint */}
      <p className={`pointer-events-none fixed bottom-24 left-4 z-20 text-[12px] text-[#6b6259] transition-opacity duration-700 md:bottom-28 md:left-8 ${here?.frieze ? "opacity-100" : "opacity-0"}`}>
        {narrowScreen ? "Touchez une date pour la dérouler" : "Cliquez sur une date pour la dérouler"}
      </p>

      {/* a timeline entry, unrolled */}
      {openJ !== null && (
        <div role="dialog" aria-modal="true" aria-label={journey[openJ].title} className="fixed inset-0 z-40 flex items-center justify-center bg-[#1c1916]/25 p-4" onClick={() => setOpenJ(null)}>
          <div className="w-full max-w-md bg-[#faf9f5] p-7 shadow-[0_30px_70px_-30px_rgba(30,22,15,0.6)]" onClick={(e) => e.stopPropagation()}>
            <p className="text-[11px] tracking-[0.2em] text-[#8a8178]">{String(openJ + 1).padStart(2, "0")}</p>
            <p className="mt-3 text-3xl">{journey[openJ].years}</p>
            <p className="mt-3 text-lg leading-snug">{journey[openJ].title}</p>
            <p className="mt-1 text-sm text-[#6b6259]">{journey[openJ].org}</p>
            <ul className="mt-5 space-y-2 text-[15px] leading-snug text-[#3a332d]">
              {journey[openJ].details.map((d) => (
                <li key={d}>— {d}</li>
              ))}
            </ul>
            <div className="mt-7 flex justify-between text-[13px]">
              <button onClick={() => setOpenJ((j) => (j! > 0 ? j! - 1 : j))} disabled={openJ === 0} className="disabled:opacity-30">← Précédent</button>
              <button onClick={() => setOpenJ(null)} className="text-[#6b6259]">Fermer ✕</button>
              <button onClick={() => setOpenJ((j) => (j! < journey.length - 1 ? j! + 1 : j))} disabled={openJ === journey.length - 1} className="disabled:opacity-30">Suivant →</button>
            </div>
          </div>
        </div>
      )}

      <p className={`pointer-events-none fixed bottom-14 right-4 z-20 text-[11px] md:bottom-8 md:right-8 uppercase tracking-[0.22em] text-[#6b6259] transition-opacity duration-700 ${station === 0 ? "opacity-100" : "opacity-0"}`}>
        Faites défiler pour entrer ↓
      </p>

      <div ref={cursor} className="pointer-events-none fixed left-0 top-0 z-30">
        <div className={`-translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1c1916] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition-opacity duration-300 ${hover !== null || overFrieze || overShop ? "opacity-100" : "opacity-0"}`}>
          {overFrieze ? "Dérouler" : overShop ? "Emporter" : "Explorer"}
        </div>
      </div>

      {/* the shop: every souvenir is also listed, for quick access */}
      <div className={`fixed inset-x-4 bottom-14 z-20 transition-all duration-700 md:inset-x-auto md:bottom-8 md:right-8 ${inShop ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>
        <div className="bg-[#faf9f5]/92 p-4 shadow-[0_14px_40px_-22px_rgba(30,22,15,0.5)] backdrop-blur md:w-64 md:p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#7a2f35]">{shop.title}</p>
          <p className="mt-1 text-[12px] text-[#6b6259]">{narrowScreen ? "Touchez" : "Cliquez sur"} un souvenir pour l’emporter.</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[14px] md:grid-cols-1">
            {shop.items.map((it) => (
              <li key={it.id}>
                <button onClick={() => setSouvenir(it.id)} className="text-left hover:opacity-60">
                  {it.name} <span className="text-[11px] text-[#8a8178]">· {it.object.replace(/^L[ae] /, "")}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {souvenir && <Souvenir id={souvenir} onClose={() => setSouvenir(null)} />}

      {/* soft photographic vignette */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-10" style={{ background: "radial-gradient(ellipse 85% 75% at 50% 48%, rgba(0,0,0,0) 60%, rgba(40,30,20,0.16) 100%)" }} />

      {plan && <Plan onClose={() => setPlan(false)} onRoom={goRoom} onWork={(i) => go(stations.findIndex((s) => s.art === i))} onContact={() => goShop()} />}

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

function Plan({ onClose, onRoom, onWork, onContact }: { onClose: () => void; onRoom: (r: Station["room"]) => void; onWork: (i: number) => void; onContact: () => void }) {
  const item = "text-left text-2xl leading-snug hover:opacity-60";
  const head = "text-[11px] uppercase tracking-[0.22em] text-[#8a8178]";
  return (
    <div role="dialog" aria-modal="true" aria-label="Plan du musée" className="fixed inset-0 z-40 overflow-y-auto bg-[#f1eee9]/97" onClick={onClose}>
      <div className="mx-auto grid max-w-5xl gap-12 px-8 py-24 md:grid-cols-3" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <p className={head}>01</p>
          <button className={item} onClick={() => onRoom("entrance")}>Entrée</button>
          <p className={`${head} pt-8`}>Études</p>
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
          <p className={`${head} pt-6`}>Boutique du musée</p>
          <button className={`${item} block`} onClick={onContact}>Souvenirs : CV, portrait, contact</button>
          <button onClick={onClose} className="block pt-10 text-[13px] text-[#6b6259]">Fermer ✕</button>
        </div>
      </div>
    </div>
  );
}

/** A souvenir from the museum shop, "taken home": its content in a card. */
function Souvenir({ id, onClose }: { id: ShopId; onClose: () => void }) {
  const it = shop.items.find((x) => x.id === id)!;
  const btn = "inline-block bg-[#1c1916] px-6 py-3 text-[12px] uppercase tracking-[0.2em] text-white hover:opacity-80";
  return (
    <div role="dialog" aria-modal="true" aria-label={it.name} className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#1c1916]/30 p-4" onClick={onClose}>
      <div className="relative my-auto w-full max-w-lg bg-[#faf9f5] p-7 shadow-[0_30px_70px_-30px_rgba(30,22,15,0.6)] md:p-9" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7a2f35]">{shop.title} · {it.object}</p>
            <p className="mt-2 text-3xl">{it.name}</p>
          </div>
          <span className="mt-1 shrink-0 border border-[#7a2f35] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#7a2f35]">Offert</span>
        </div>

        {id === "cv" && (
          <div className="mt-6">
            <p className="text-[15px] leading-relaxed text-[#3a332d]">Mon CV complet : expériences, formation, compétences, outils et langues, en une page.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a href={site.cv} download className={btn}>Télécharger le CV ↓</a>
              <a href={site.cv} target="_blank" rel="noopener noreferrer" className="self-center border-b border-current text-[13px]">L’ouvrir</a>
            </div>
          </div>
        )}

        {id === "portrait" && (
          <div className="mt-6 grid gap-6 sm:grid-cols-[150px_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={about.portrait.src} alt={about.portrait.alt} className="w-full border-[6px] border-white shadow-md" style={{ aspectRatio: String(about.portrait.ratio) }} />
            <div>
              <p className="text-xl leading-snug">« {about.quote} »</p>
              {about.lines.map((l) => (
                <p key={l} className="mt-3 text-[14px] text-[#6b6259]">{l}</p>
              ))}
              <p className="mt-3 text-[14px] text-[#7a2f35]">{about.seeking}</p>
            </div>
          </div>
        )}

        {id === "skills" && (
          <dl className="mt-6 space-y-5">
            {about.skills.map((k) => (
              <div key={k.title}>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-[#8a8178]">{k.title}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed">{k.text}</dd>
              </div>
            ))}
          </dl>
        )}

        {id === "linkedin" && (
          <div className="mt-6">
            <p className="text-[15px] leading-relaxed text-[#3a332d]">Mon parcours, mes projets et mes actualités.</p>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className={`${btn} mt-6`}>Voir mon profil LinkedIn ↗</a>
          </div>
        )}

        {id === "contact" && (
          <div className="mt-5">
            <p className="mb-4 text-[14px] text-[#6b6259]">Votre message arrive directement dans ma boîte mail.</p>
            <div className="h-[290px]">
              <ContactForm />
            </div>
            <p className="mt-5 border-t border-[#1c1916]/15 pt-4 text-[13px]">
              Ou directement : <a href={`mailto:${site.email}`} className="border-b border-current">{site.email}</a>
            </p>
          </div>
        )}

        <button onClick={onClose} className="mt-8 text-[13px] text-[#6b6259]">Fermer ✕</button>
      </div>
    </div>
  );
}
