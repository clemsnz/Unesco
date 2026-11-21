import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Work } from "@/content/museum";

/**
 * The museum in WebGL: one long, bright building divided into rooms by partition walls.
 * A subjective camera walks from station to station as the visitor scrolls.
 */

const WALL = 0xf1eee9;
const EYE = 1.62;
const HALF_W = 8;
const H = 5.0;
const Z_FRONT = 10;
const SANS = '"Instrument Sans", Helvetica, Arial, sans-serif';
const SERIF = '"Newsreader", Georgia, "Times New Roman", serif';

export type Station = { pos: THREE.Vector3; look: THREE.Vector3; room: keyof RoomNames | "entrance"; art?: number; frieze?: boolean; contact?: boolean; /** a point the visitor walks through without stopping */ walk?: boolean };
type RoomNames = { main: string; cabinet: string; journey: string; about: string; exit: string };

export type ShopItem = { id: string; object: string; name: string; tag: string };
export type MuseumInput = {
  shop: { title: string; sub: string; welcome?: string; items: ShopItem[] };
  works: Work[];
  entrance: { room: string; name: string; line: string };
  rooms: RoomNames;
  coulisses: { src: string; ratio: number }[];
  horsChamp?: { src: string; ratio: number }[];
  journey: { years: string; title: string; org: string; details: string[] }[];
  about: { portrait: { src: string; ratio: number }; quote: string; lines: string[]; seeking?: string; skills: { title: string; text: string }[] };
  exit: { line: string };
};

export type MuseumApi = {
  stations: Station[];
  setProgress: (s: number) => void;
  jump: (s: number) => void;
  focusPose: (i: number, t: number) => void;
  setPointer: (x: number, y: number) => void;
  hit: (x: number, y: number) => number | null;
  setHover: (i: number | null) => void;
  focus: (i: number, onDone: () => void) => void;
  /** id of the souvenir under the pointer in the museum shop, or null */
  hitShop: (x: number, y: number) => string | null;
  /** index of the timeline entry under the pointer, or null */
  hitFrieze: (x: number, y: number) => number | null;
  /** floor point under the pointer, where a click would walk to (or null) */
  floorAt: (x: number, y: number) => THREE.Vector3 | null;
  /** show the Street View-style target ring on the floor (null hides it) */
  showRing: (p: THREE.Vector3 | null) => void;
  /** walk freely to a floor point; resolves with the nearest station index once arrived */
  walkTo: (p: THREE.Vector3, onArrive: (nearest: number) => void) => void;
  /** station index of the floor marker under the pointer, or null */
  hitSpot: (x: number, y: number) => number | null;
  setSpotHover: (i: number | null) => void;
  /** walk straight to a stop (through doorways if needed), without passing by the others */
  travelTo: (idx: number, onArrive: (idx: number) => void) => void;
  /** turn the head (drag to look around), in pixels */
  lookAround: (dx: number, dy: number) => void;
  /** index of the station the camera is currently closest to */
  nearest: () => number;
  /** true once the camera has settled on its station */
  settled: () => boolean;
  resize: () => void;
  dispose: () => void;
};

/* ───────── canvas helpers ───────── */

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function spaced(c: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: "left" | "center" = "left") {
  const chars = Array.from(text);
  const widths = chars.map((ch) => c.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = align === "center" ? x - total / 2 : x;
  chars.forEach((ch, i) => {
    c.fillText(ch, cx, y);
    cx += widths[i] + spacing;
  });
}

function wrap(c: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number, align: "left" | "center" = "left") {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (c.measureText(test).width > max && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  lines.push(line);
  c.textAlign = align;
  lines.forEach((l, i) => c.fillText(l, x, y + i * lh));
  c.textAlign = "left";
  return lines.length;
}

function concreteTexture() {
  const t = canvasTex(1024, 1024, (c) => {
    c.fillStyle = "#d8d3cb";
    c.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const r = 40 + Math.random() * 160;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      const a = Math.random() * 0.05;
      g.addColorStop(0, Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(90,80,70,${a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const img = c.getImageData(0, 0, 1024, 1024);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    c.putImageData(img, 0, 0);
    c.strokeStyle = "rgba(120,110,100,0.35)";
    c.lineWidth = 2;
    c.strokeRect(1, 1, 1022, 1022);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const gradientTex = (stops: [number, string][]) =>
  canvasTex(4, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 256);
  });

const wash = () =>
  canvasTex(256, 512, (c) => {
    c.scale(1, 2);
    const g = c.createRadialGradient(128, 104, 0, 128, 118, 128);
    g.addColorStop(0, "rgba(255,251,243,0.9)");
    g.addColorStop(0.45, "rgba(255,251,243,0.45)");
    g.addColorStop(1, "rgba(255,251,243,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });

/** Painted plaster: fine grain, darker towards the floor, slightly lighter under the ceiling. */
function plasterTexture() {
  const t = canvasTex(1024, 512, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#f4f2ee");
    g.addColorStop(0.35, "#f1eee9");
    g.addColorStop(0.8, "#e9e5df");
    g.addColorStop(1, "#ddd8d0");
    c.fillStyle = g;
    c.fillRect(0, 0, 1024, 512);
    const img = c.getImageData(0, 0, 1024, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 5;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    c.putImageData(img, 0, 0);
    for (let k = 0; k < 40; k++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = 60 + Math.random() * 140;
      const rg = c.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, `rgba(${Math.random() > 0.5 ? "255,255,255" : "120,110,100"},0.025)`);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = rg;
      c.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  });
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/** The light scallop a ceiling spot draws on a gallery wall: narrow at the top, opening downwards. */
const scallop = () =>
  canvasTex(256, 512, (c) => {
    const img = c.createImageData(256, 512);
    for (let y = 0; y < 512; y++) {
      const v = y / 511;
      const width = 0.08 + 0.42 * Math.sqrt(v);
      const inten = Math.pow(Math.min(v / 0.42, 1), 0.6) * Math.pow(1 - v, 1.4) * 1.9;
      for (let x = 0; x < 256; x++) {
        const u = (x / 255 - 0.5) / width;
        const edge = Math.exp(-Math.pow(Math.abs(u) * 1.25, 4));
        const a = Math.max(0, Math.min(1, inten * edge));
        const i = (y * 256 + x) * 4;
        img.data[i] = 255;
        img.data[i + 1] = 247;
        img.data[i + 2] = 232;
        img.data[i + 3] = a * 255;
      }
    }
    c.putImageData(img, 0, 0);
  });

/** Light oak planks. */
function parquetTexture() {
  const t = canvasTex(1024, 1024, (c) => {
    const rows = 8;
    const h = 1024 / rows;
    for (let r = 0; r < rows; r++) {
      let x = -Math.random() * 400;
      while (x < 1024) {
        const w = 300 + Math.random() * 420;
        const tone = 168 + Math.random() * 22;
        c.fillStyle = `rgb(${tone + 22},${tone + 6},${tone - 22})`;
        c.fillRect(x, r * h, w, h);
        c.strokeStyle = "rgba(90,60,30,0.08)";
        c.lineWidth = 1;
        for (let g = 0; g < 9; g++) {
          const gy = r * h + 6 + Math.random() * (h - 12);
          c.beginPath();
          c.moveTo(x, gy);
          c.bezierCurveTo(x + w * 0.3, gy + (Math.random() - 0.5) * 6, x + w * 0.7, gy + (Math.random() - 0.5) * 6, x + w, gy);
          c.stroke();
        }
        c.fillStyle = "rgba(60,40,20,0.35)";
        c.fillRect(x, r * h, 2, h);
        x += w;
      }
      c.fillStyle = "rgba(60,40,20,0.3)";
      c.fillRect(0, r * h, 1024, 2);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const shadowTex = () =>
  canvasTex(256, 256, (c) => {
    c.shadowColor = "rgba(30,22,15,0.55)";
    c.shadowBlur = 34;
    c.shadowOffsetX = 1000;
    c.fillStyle = "#000";
    c.fillRect(48 - 1000, 48, 160, 160);
  });

function cartelTex(n: string, w: Work) {
  return canvasTex(720, 440, (c) => {
    c.fillStyle = "#fbfaf7";
    c.fillRect(0, 0, 720, 440);
    c.fillStyle = "#8a8178";
    c.font = `500 26px ${SANS}`;
    spaced(c, n, 48, 86, 4);
    c.fillStyle = "#1f1b18";
    c.font = `500 40px ${SANS}`;
    const l = wrap(c, w.title, 48, 150, 620, 48);
    c.fillStyle = "#5f574f";
    c.font = `400 24px ${SANS}`;
    const y = 150 + l * 48 + 50;
    wrap(c, w.line, 48, y, 630, 32);
    c.fillText(w.role, 48, y + 70);
  });
}

/** Painted wall text (vinyl lettering). */
function vinyl(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  return canvasTex(w, h, (c) => {
    c.fillStyle = "#1c1916";
    draw(c);
  });
}

/* ───────── layout ───────── */

const MAIN_START = -13;
const MAIN_STEP = 3.5;
const ENTRY_W = 2.1; // width of one timeline entry on the wall (m)

function layout(input: MuseumInput) {
  // the great hall: every work, alternating left and right walls
  const order = [...input.works.map((w, i) => ({ w, i })).filter((x) => x.w.room === "main"), ...input.works.map((w, i) => ({ w, i })).filter((x) => x.w.room === "cabinet")];
  const z: number[] = [];
  const side: (-1 | 1)[] = [];
  order.forEach(({ i }, k) => {
    z[i] = MAIN_START - k * MAIN_STEP;
    side[i] = k % 2 === 0 ? -1 : 1;
  });
  const lastZ = MAIN_START - (order.length - 1) * MAIN_STEP;
  const wallJourney = lastZ - 5;
  // Galerie 03: the timeline on the left wall
  const fz0 = wallJourney - 1.5;
  const fz1 = fz0 - input.journey.length * ENTRY_W;
  // the museum shop
  const wallShop = fz1 - 2;
  const back = wallShop - 10;
  return { z, side, order: order.map((o) => o.i), wallJourney, fz0, fz1, wallShop, back };
}

/* ───────── scene ───────── */

export function createMuseum(canvas: HTMLCanvasElement, input: MuseumInput): MuseumApi {
  const { works } = input;
  /** phones in portrait: the camera stands further back so each work fits the screen */
  const narrow = canvas.clientWidth / canvas.clientHeight < 0.8;
  const L = layout(input);
  const Z_BACK = L.back;
  const len = Z_FRONT - Z_BACK;
  const midZ = (Z_FRONT + Z_BACK) / 2;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  let pixelRatio = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(WALL);
  scene.fog = new THREE.Fog(WALL, 14, 46);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 140);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.4;
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfffaf2, 0xbfb6a8, 1.45));
  const sun = new THREE.DirectionalLight(0xfff1de, 0.55);
  sun.position.set(3, 10, 6);
  scene.add(sun);

  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);
  const basic = (map: THREE.Texture, transparent = true) => keep(new THREE.MeshBasicMaterial({ map, transparent, toneMapped: false }));

  disposables.push(envRT);
  /* photographed materials (CC0, Poly Haven): painted plaster walls, herringbone oak parquet */
  const texLoader = new THREE.TextureLoader();
  const pbr = (name: string, rx: number, ry: number) => {
    const load = (suffix: string, srgb: boolean) => {
      const t = keep(texLoader.load(`/textures/${name}_${suffix}.jpg`));
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      t.anisotropy = 8;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    return { map: load("diff", true), normalMap: load("nor_gl", false), roughnessMap: load("rough", false) };
  };
  void plasterTexture;
  const wallMat = keep(new THREE.MeshStandardMaterial({ ...pbr("plaster", 2, 1.4), roughness: 0.95, normalScale: new THREE.Vector2(0.35, 0.35) }));
  const wallMatLong = keep(new THREE.MeshStandardMaterial({ ...pbr("plaster", len / 3.5, H / 3.5), color: 0xf3ebde, roughness: 0.95, normalScale: new THREE.Vector2(0.35, 0.35) }));
  const gapMat = keep(new THREE.MeshBasicMaterial({ color: 0x77706a }));
  /** recessed shadow gap at the foot of a wall, as in real galleries */
  const shadowGap = (w: number, x: number, z: number, ry: number) => {
    const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, 0.02)), gapMat);
    m.rotation.y = ry;
    m.position.set(x, 0.01, z);
    scene.add(m);
  };

  /* architecture */
  const floorTex = keep(concreteTexture());
  floorTex.repeat.set(4, len / 3);
  // polished concrete: a faint mirror under a slightly translucent stone layer (desktop only)
  const floorMat = keep(new THREE.MeshStandardMaterial({ map: floorTex, color: 0xd2cbc0, roughness: 0.55, transparent: !narrow, opacity: narrow ? 1 : 0.9 }));
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(HALF_W * 2, len)), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.002, midZ);
  floor.visible = false; // parquet covers the whole building

  const slotMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
  // lighting tracks along both walls
  const lampMatSign = keep(new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.6 }));
  const trackMat = keep(new THREE.MeshStandardMaterial({ color: 0x2c2926, roughness: 0.45, metalness: 0.2 }));
  const hallEnd = L.wallJourney + 0.15;
  for (const sd of [-1, 1]) {
    const tl = hallEnd - Z_BACK - 1;
    const track = new THREE.Mesh(keep(new THREE.BoxGeometry(0.03, 0.022, tl)), trackMat);
    track.position.set(sd * (HALF_W - 1.5), H - 0.015, Z_BACK + 0.5 + tl / 2);
    scene.add(track);
    // in the great hall, a rail fixed under the cornice
    const hl = Z_FRONT - hallEnd - 0.6;
    const rail = new THREE.Mesh(keep(new THREE.BoxGeometry(0.03, 0.022, hl)), trackMat);
    rail.position.set(sd * (HALF_W - 0.75), H - 0.55, hallEnd + 0.3 + hl / 2);
    scene.add(rail);
  }
  const spotGeo = keep(new THREE.CylinderGeometry(0.045, 0.06, 0.2, 20));
  const lensMat = keep(new THREE.MeshBasicMaterial({ color: 0xfff6e4, toneMapped: false }));
  const lensGeo = keep(new THREE.CircleGeometry(0.05, 20));
  /** a spot on the track, aimed at the wall */
  const spot = (side: -1 | 1, z: number) => {
    const g = new THREE.Group();
    const inHall = z > L.wallJourney + 0.15;
    g.position.set(side * (HALF_W - (inHall ? 0.75 : 1.5)), inHall ? H - 0.59 : H - 0.05, z);
    const arm = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6)), trackMat);
    arm.position.y = -0.06;
    g.add(arm);
    const head = new THREE.Group();
    head.position.y = -0.14;
    head.rotation.z = side * (inHall ? -0.35 : -0.85);
    const body = new THREE.Mesh(spotGeo, trackMat);
    head.add(body);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.y = -0.101;
    head.add(lens);
    g.add(head);
    scene.add(g);
  };
  const wallGeo = keep(new THREE.PlaneGeometry(len, H));
  for (const s of [-1, 1] as const) {
    const w = new THREE.Mesh(wallGeo, wallMatLong);
    w.rotation.y = s === -1 ? Math.PI / 2 : -Math.PI / 2;
    w.position.set(s * HALF_W, H / 2, midZ);
    scene.add(w);
    shadowGap(len, s * (HALF_W - 0.003), midZ, w.rotation.y);
  }
  const endGeo = keep(new THREE.PlaneGeometry(HALF_W * 2, H));
  const back = new THREE.Mesh(endGeo, wallMat);
  back.position.set(0, H / 2, Z_BACK);
  scene.add(back);
  shadowGap(HALF_W * 2, 0, Z_BACK + 0.003, 0);
  const front = new THREE.Mesh(endGeo, wallMat);
  front.rotation.y = Math.PI;
  front.position.set(0, H / 2, Z_FRONT);
  scene.add(front);

  const aoFloor = keep(new THREE.MeshBasicMaterial({ map: keep(gradientTex([[0, "rgba(40,30,20,0)"], [1, "rgba(40,30,20,0.22)"]])), transparent: true, depthWrite: false }));
  const aoCeil = keep(new THREE.MeshBasicMaterial({ map: keep(gradientTex([[0, "rgba(40,30,20,0.12)"], [1, "rgba(40,30,20,0)"]])), transparent: true, depthWrite: false }));
  const stripGeo = keep(new THREE.PlaneGeometry(len, 0.7));
  for (const s of [-1, 1] as const)
    for (const [mat, y] of [
      [aoFloor, 0.35],
      [aoCeil, H - 0.35],
    ] as const) {
      const m = new THREE.Mesh(stripGeo, mat);
      m.rotation.y = s === -1 ? Math.PI / 2 : -Math.PI / 2;
      m.position.set(s * (HALF_W - 0.005), y, midZ);
      scene.add(m);
    }

  /** Partition wall with a doorway (possibly off-centre); optional room name painted beside it. */
  const OPEN = 2.1;
  const partitionZs: number[] = [];
  function partition(
    z: number,
    opts: { label?: string; sub?: string; doorX?: number; half?: number; front?: THREE.Material; back?: THREE.Material; signLight?: boolean } = {},
  ) {
    partitionZs.push(z);
    const dx = opts.doorX ?? 0;
    const half = opts.half ?? OPEN;
    const mats = [wallMat, wallMat, wallMat, wallMat, opts.front ?? wallMat, opts.back ?? wallMat];
    const segs: [number, number][] = [
      [-HALF_W, dx - half],
      [dx + half, HALF_W],
    ];
    for (const [x0, x1] of segs) {
      const w = x1 - x0;
      if (w <= 0.05) continue;
      const p = new THREE.Mesh(keep(new THREE.BoxGeometry(w, H, 0.3)), mats);
      p.position.set((x0 + x1) / 2, H / 2, z);
      scene.add(p);
      for (const sz of [1, -1]) {
        shadowGap(w, (x0 + x1) / 2, z + sz * 0.152, sz === 1 ? 0 : Math.PI);
        const ao = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, 0.6)), aoFloor);
        ao.rotation.y = sz === 1 ? 0 : Math.PI;
        ao.position.set((x0 + x1) / 2, 0.3, z + sz * 0.155);
        scene.add(ao);
      }
    }
    const lintel = new THREE.Mesh(keep(new THREE.BoxGeometry(half * 2, H - 3.3, 0.3)), mats);
    lintel.position.set(dx, 3.3 + (H - 3.3) / 2, z);
    scene.add(lintel);
    if (opts.label) {
      const tex = keep(
        canvasTex(1600, 520, (c) => {
          c.fillStyle = opts.signLight ? "#efe9df" : "#1c1916";
          c.font = `500 74px ${SANS}`;
          spaced(c, opts.label!.toUpperCase(), 40, 200, 20);
          c.fillStyle = opts.signLight ? "#c9c1b4" : "#6b6259";
          c.font = `400 56px ${SANS}`;
          c.fillText(opts.sub ?? "", 40, 320);
        }),
      );
      const sign = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.1, 1.0)), basic(tex));
      const left = (-HALF_W + dx - half) / 2;
      sign.position.set(left + 0.15, 2.3, z + 0.16);
      scene.add(sign);
    }
  }

  /* Galerie 01 — entrance: a free-standing wall painted deep burgundy, the name in serif capitals */
  const partW = 7.6;
  const entryMat = keep(new THREE.MeshStandardMaterial({ ...pbr("plaster", 2.4, 1.3), color: 0x5e2329, roughness: 0.92, normalScale: new THREE.Vector2(0.08, 0.08) }));
  const part = new THREE.Mesh(keep(new THREE.BoxGeometry(partW, 4.0, 0.3)), entryMat);
  part.position.set(-1.6, 2.0, -6);
  scene.add(part);
  shadowGap(partW, -1.6, -5.848, 0);
  const nameTex = keep(
    canvasTex(4096, 1400, (c) => {
      c.fillStyle = "#d8bcb4";
      c.font = `500 54px ${SANS}`;
      spaced(c, input.entrance.room.toUpperCase(), 2048, 330, 20, "center");
      c.fillStyle = "#f4ebe3";
      c.font = `400 250px ${SERIF}`;
      spaced(c, input.entrance.name, 2048, 760, 34, "center");
      c.fillStyle = "#e2cbc3";
      c.font = `italic 400 104px ${SERIF}`;
      c.textAlign = "center";
      c.fillText(input.entrance.line, 2048, 960);
      c.textAlign = "left";
    }),
  );
  const nameMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(partW - 0.5, (partW - 0.5) * (1400 / 4096))), basic(nameTex));
  nameMesh.position.set(-1.6, 2.1, -5.845);
  (nameMesh.material as THREE.Material).depthWrite = false;
  nameMesh.renderOrder = 2;
  scene.add(nameMesh);
  // the light grazing the wall from the ceiling
  const entryWash = new THREE.Mesh(keep(new THREE.PlaneGeometry(partW, 4.0)), keep(new THREE.MeshBasicMaterial({ map: keep(gradientTex([[0, "rgba(255,236,220,0.07)"], [0.5, "rgba(255,236,220,0.015)"], [1, "rgba(255,236,220,0)"]])), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  entryWash.position.set(-1.6, 2.0, -5.847);
  scene.add(entryWash);
  const partAo = new THREE.Mesh(keep(new THREE.PlaneGeometry(partW, 0.6)), aoFloor);
  partAo.position.set(-1.6, 0.3, -5.845);
  scene.add(partAo);

  const [mainName, mainSub] = input.rooms.main.split(" — ");
  const g2 = keep(
    vinyl(2048, 400, (c) => {
      c.font = `500 84px ${SANS}`;
      spaced(c, mainName.toUpperCase(), 40, 160, 24);
      c.fillStyle = "#6b6259";
      c.font = `400 64px ${SANS}`;
      c.fillText(mainSub, 40, 290);
    }),
  );
  const g2m = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.2, 0.62)), basic(g2));
  g2m.rotation.y = -Math.PI / 2;
  g2m.position.set(HALF_W - 0.01, 2.6, -9.5);
  scene.add(g2m);

  /* Galerie 03 and the shop are separate rooms; the great hall holds every work */
  const [jName] = input.rooms.journey.split(" — ");
  partition(L.wallJourney, { label: jName, sub: "Parcours" });
  partition(L.wallShop, { label: input.shop.title, sub: input.shop.sub });
  // oak parquet everywhere, with a hint of the polished finish on desktop
  const parquet = keep(parquetTexture());
  const floorPiece = (z0: number, z1: number) => {
    const l = z0 - z1;
    void parquet;
    const m = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(HALF_W * 2, l)),
      keep(
        new THREE.MeshStandardMaterial({
          ...pbr("parquet", (HALF_W * 2) / 2.2, l / 2.2),
          color: 0xf4ece2,
          roughness: 0.72,
          normalScale: new THREE.Vector2(0.6, 0.6),
        }),
      ),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, 0.004, (z0 + z1) / 2);
    scene.add(m);
  };
  floorPiece(Z_FRONT, L.wallJourney + 0.15);
  floorPiece(L.wallJourney - 0.15, L.wallShop + 0.15);
  floorPiece(L.wallShop - 0.15, Z_BACK);
  /* the ceiling: matte white, opened by long glazed roof lanterns with real depth and steel glazing bars */
  const LW = 2.2; // half width of a lantern
  const WELL = 1.1; // depth of the light well above the ceiling
  const lanterns: [number, number][] = [[L.wallJourney - 1.3, L.wallShop + 1.3]];
  const CEIL0 = L.wallJourney + 0.15; // the great hall has its glass vault instead
  const ceilMat = keep(new THREE.MeshStandardMaterial({ ...pbr("plaster", 4, 4), color: 0xf6f4f0, emissive: 0x2c2a26, roughness: 1, normalScale: new THREE.Vector2(0.2, 0.2) }));
  const ceilPiece = (x0: number, x1: number, z0: number, z1: number) => {
    const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(x1 - x0, z0 - z1)), ceilMat);
    m.rotation.x = Math.PI / 2;
    m.position.set((x0 + x1) / 2, H, (z0 + z1) / 2);
    scene.add(m);
  };
  ceilPiece(-HALF_W, -LW, CEIL0, Z_BACK);
  ceilPiece(LW, HALF_W, CEIL0, Z_BACK);
  let zc = CEIL0;
  for (const [z0, z1] of lanterns) {
    ceilPiece(-LW, LW, zc, z0);
    zc = z1;
  }
  ceilPiece(-LW, LW, zc, Z_BACK);
  const wellMat = keep(new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 1 }));
  const barMat = keep(new THREE.MeshStandardMaterial({ color: 0xd8d4cd, roughness: 0.6, metalness: 0.1 }));
  const skyTex = keep(
    canvasTex(64, 256, (c) => {
      const g = c.createLinearGradient(0, 0, 64, 0);
      g.addColorStop(0, "#f2f4f6");
      g.addColorStop(0.5, "#ffffff");
      g.addColorStop(1, "#f2f4f6");
      c.fillStyle = g;
      c.fillRect(0, 0, 64, 256);
    }),
  );
  const glassMat = keep(new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false }));
  for (const [z0, z1] of lanterns) {
    const l = z0 - z1;
    const zm = (z0 + z1) / 2;
    // the four sides of the well
    for (const sx of [-1, 1]) {
      const w = new THREE.Mesh(keep(new THREE.PlaneGeometry(l, WELL)), wellMat);
      w.rotation.y = sx === -1 ? Math.PI / 2 : -Math.PI / 2;
      w.position.set(sx * LW, H + WELL / 2, zm);
      scene.add(w);
    }
    for (const [z, ry] of [
      [z0, Math.PI],
      [z1, 0],
    ] as const) {
      const w = new THREE.Mesh(keep(new THREE.PlaneGeometry(LW * 2, WELL)), wellMat);
      w.rotation.y = ry;
      w.position.set(0, H + WELL / 2, z);
      scene.add(w);
    }
    const glass = new THREE.Mesh(keep(new THREE.PlaneGeometry(LW * 2, l)), glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.set(0, H + WELL, zm);
    scene.add(glass);
    // glazing bars: one along the ridge, others across every 1.5 m
    const ridge = new THREE.Mesh(keep(new THREE.BoxGeometry(0.07, 0.12, l)), barMat);
    ridge.position.set(0, H + WELL - 0.06, zm);
    scene.add(ridge);
    const nb = Math.max(1, Math.round(l / 1.5));
    for (let k = 1; k < nb; k++) {
      const b = new THREE.Mesh(keep(new THREE.BoxGeometry(LW * 2, 0.1, 0.05)), barMat);
      b.position.set(0, H + WELL - 0.05, z0 - (k * l) / nb);
      scene.add(b);
    }
    // the steel edge where the ceiling opens
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(keep(new THREE.BoxGeometry(0.04, 0.04, l)), barMat);
      e.position.set(sx * LW, H - 0.02, zm);
      scene.add(e);
    }
  }
  /* ───────── the great hall: a glazed barrel vault on iron arches, as in the Beaux-Arts railway halls turned museums ───────── */
  const hallZ1 = L.wallJourney + 0.15;
  const hallLen = Z_FRONT - hallZ1;
  const hallMid = (Z_FRONT + hallZ1) / 2;
  const RISE = 0.55; // the vault is a flattened half-cylinder
  const vault = new THREE.Group();
  vault.position.set(0, H, hallMid);
  vault.scale.set(1, RISE, 1);
  scene.add(vault);
  const paneTex = keep(
    canvasTex(256, 256, (c) => {
      const g = c.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, "#fbfcfd");
      g.addColorStop(1, "#eef1f4");
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 256);
      c.fillStyle = "#b9b3a8";
      c.fillRect(0, 0, 256, 7);
      c.fillRect(0, 0, 7, 256);
      c.fillStyle = "rgba(185,179,168,0.55)";
      c.fillRect(126, 0, 3, 256);
    }),
  );
  paneTex.wrapS = paneTex.wrapT = THREE.RepeatWrapping;
  paneTex.repeat.set(18, hallLen / 1.3);
  const glazing = new THREE.Mesh(keep(new THREE.CylinderGeometry(HALF_W, HALF_W, hallLen, 72, 1, true, Math.PI / 2, Math.PI)), keep(new THREE.MeshBasicMaterial({ map: paneTex, side: THREE.DoubleSide, toneMapped: false })));
  glazing.rotation.x = Math.PI / 2;
  vault.add(glazing);
  const ironMat = keep(new THREE.MeshStandardMaterial({ color: 0xcfc8bb, roughness: 0.55, metalness: 0.25 }));
  const archGeo = keep(new THREE.TorusGeometry(HALF_W - 0.06, 0.11, 8, 72, Math.PI));
  const nArch = Math.round(hallLen / 2.6);
  for (let k = 0; k <= nArch; k++) {
    const a = new THREE.Mesh(archGeo, ironMat);
    a.position.z = hallLen / 2 - (k * hallLen) / nArch;
    vault.add(a);
  }
  // purlins running the length of the vault
  for (const ang of [0.35, 0.75, 1.15, Math.PI / 2, Math.PI - 1.15, Math.PI - 0.75, Math.PI - 0.35]) {
    const p = new THREE.Mesh(keep(new THREE.BoxGeometry(0.07, 0.12, hallLen)), ironMat);
    p.position.set(Math.cos(ang) * (HALF_W - 0.08), Math.sin(ang) * (HALF_W - 0.08), 0);
    p.rotation.z = ang;
    vault.add(p);
  }
  // the half-moon walls closing the vault at each end
  const lunetteGeo = keep(new THREE.CircleGeometry(HALF_W, 72, 0, Math.PI));
  for (const [z, ry] of [
    [Z_FRONT - 0.001, Math.PI],
    [hallZ1 + 0.001, 0],
  ] as const) {
    const l = new THREE.Mesh(lunetteGeo, wallMat);
    l.scale.y = RISE;
    l.rotation.y = ry;
    l.position.set(0, H, z);
    scene.add(l);
  }
  // a great clock in the far lunette, telling the real time
  const gold = keep(new THREE.MeshStandardMaterial({ color: 0xc9a35a, roughness: 0.28, metalness: 1 }));
  const clock3d = new THREE.Group();
  clock3d.position.set(0, H + 1.75, hallZ1 + 0.05);
  scene.add(clock3d);
  const CR = 1.15;
  const ring1 = new THREE.Mesh(keep(new THREE.TorusGeometry(CR, 0.07, 16, 96)), gold);
  clock3d.add(ring1);
  const ring2 = new THREE.Mesh(keep(new THREE.TorusGeometry(CR + 0.16, 0.035, 12, 96)), gold);
  clock3d.add(ring2);
  const faceTex = keep(
    canvasTex(1024, 1024, (c) => {
      const g = c.createRadialGradient(512, 512, 0, 512, 512, 512);
      g.addColorStop(0, "#fffdf6");
      g.addColorStop(1, "#f1e9d6");
      c.fillStyle = g;
      c.beginPath();
      c.arc(512, 512, 512, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#2b2622";
      c.font = `400 96px ${SERIF}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"].forEach((s, k) => {
        const a = (k / 12) * Math.PI * 2;
        c.fillText(s, 512 + Math.sin(a) * 400, 512 - Math.cos(a) * 400);
      });
      for (let k = 0; k < 60; k++) {
        const a = (k / 60) * Math.PI * 2;
        const r0 = k % 5 ? 478 : 462;
        c.fillRect(512 + Math.sin(a) * r0 - 2, 512 - Math.cos(a) * r0 - 2, 4, 4);
      }
      c.textAlign = "left";
      c.textBaseline = "alphabetic";
    }),
  );
  const face = new THREE.Mesh(keep(new THREE.CircleGeometry(CR, 96)), basic(faceTex));
  face.position.z = -0.02;
  clock3d.add(face);
  const handMat = keep(new THREE.MeshStandardMaterial({ color: 0x1c1916, roughness: 0.5, metalness: 0.4 }));
  const hand = (len2: number, w: number) => {
    const piv = new THREE.Group();
    const m = new THREE.Mesh(keep(new THREE.BoxGeometry(w, len2, 0.02)), handMat);
    m.position.y = len2 / 2 - 0.08;
    piv.add(m);
    piv.position.z = 0.02;
    clock3d.add(piv);
    return piv;
  };
  const hourHand = hand(0.62, 0.06);
  const minHand = hand(0.92, 0.04);
  const setClock = () => {
    const d = new Date();
    const m = d.getMinutes() + d.getSeconds() / 60;
    minHand.rotation.z = -(m / 60) * Math.PI * 2;
    hourHand.rotation.z = -(((d.getHours() % 12) + m / 60) / 12) * Math.PI * 2;
  };
  setClock();
  const clockTimer = window.setInterval(setClock, 20000);
  disposables.push({ dispose: () => clearInterval(clockTimer) });
  // a moulded cornice where the walls meet the vault, and a stone skirting
  const cornShape = new THREE.Shape();
  cornShape.moveTo(0, -0.5);
  cornShape.lineTo(0.05, -0.5);
  cornShape.lineTo(0.05, -0.42);
  cornShape.lineTo(0.1, -0.4);
  cornShape.quadraticCurveTo(0.12, -0.12, 0.34, -0.08);
  cornShape.lineTo(0.38, -0.08);
  cornShape.lineTo(0.38, 0.03);
  cornShape.lineTo(0, 0.03);
  const cornGeo = keep(new THREE.ExtrudeGeometry(cornShape, { depth: hallLen, bevelEnabled: false, curveSegments: 8 }));
  const cornMat = keep(new THREE.MeshStandardMaterial({ color: 0xf2ede4, roughness: 0.9 }));
  const skirtMat = keep(new THREE.MeshStandardMaterial({ color: 0xc9bca7, roughness: 0.6 }));
  for (const sd of [-1, 1] as const) {
    const c = new THREE.Mesh(cornGeo, cornMat);
    c.position.set(sd * HALF_W, H, hallZ1);
    c.scale.x = -sd;
    scene.add(c);
    const sk = new THREE.Mesh(keep(new THREE.BoxGeometry(0.04, 0.24, hallLen)), skirtMat);
    sk.position.set(sd * (HALF_W - 0.02), 0.12, hallMid);
    scene.add(sk);
  }
  // the shop has a plain ceiling with recessed downlights
  const dlGeo = keep(new THREE.CircleGeometry(0.075, 24));
  const dlRim = keep(new THREE.RingGeometry(0.075, 0.095, 24));
  const rimMat = keep(new THREE.MeshBasicMaterial({ color: 0xc9c4bc }));
  for (let z = L.wallShop - 1.6; z > Z_BACK + 0.8; z -= 2.2)
    for (const x of [-3.4, 3.4]) {
      const d = new THREE.Mesh(dlGeo, slotMat);
      d.rotation.x = Math.PI / 2;
      d.position.set(x, H - 0.004, z);
      scene.add(d);
      const r = new THREE.Mesh(dlRim, rimMat);
      r.rotation.x = Math.PI / 2;
      r.position.set(x, H - 0.003, z);
      scene.add(r);
    }
  // green emergency exit signs above the doorways
  const exitSign = keep(
    canvasTex(512, 180, (c) => {
      c.fillStyle = "#1f8a4c";
      c.fillRect(0, 0, 512, 180);
      c.fillStyle = "#ffffff";
      c.font = `600 70px ${SANS}`;
      c.fillText("SORTIE", 150, 115);
      c.fillRect(40, 60, 70, 60);
      c.fillStyle = "#1f8a4c";
      c.fillRect(60, 75, 30, 45);
    }),
  );
  for (const z of [L.wallJourney, L.wallShop]) {
    const sign = new THREE.Mesh(keep(new THREE.BoxGeometry(0.42, 0.15, 0.05)), [lampMatSign, lampMatSign, lampMatSign, lampMatSign, basic(exitSign, false), lampMatSign]);
    sign.position.set(0, 3.55, z + 0.18);
    scene.add(sign);
  }
  // soft shading in the corners where walls meet
  const cornerTex = keep(
    canvasTex(256, 4, (c) => {
      const g = c.createLinearGradient(0, 0, 256, 0);
      g.addColorStop(0, "rgba(40,30,20,0.22)");
      g.addColorStop(1, "rgba(40,30,20,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 4);
    }),
  );
  const cornerMat = keep(new THREE.MeshBasicMaterial({ map: cornerTex, transparent: true, depthWrite: false }));
  const corner = (sd: -1 | 1, z: number, dir: -1 | 1) => {
    const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.9, H)), cornerMat);
    m.rotation.y = sd === -1 ? Math.PI / 2 : -Math.PI / 2;
    // the dark edge of the gradient must sit against the corner
    m.scale.x = sd === -1 ? -dir : dir;
    m.position.set(sd * (HALF_W - 0.006), H / 2, z + dir * 0.45);
    scene.add(m);
  };
  for (const z of [L.wallJourney, L.wallShop]) {
    for (const sd of [-1, 1] as const) {
      corner(sd, z + 0.15, 1);
      corner(sd, z - 0.15, -1);
    }
  }
  for (const sd of [-1, 1] as const) {
    corner(sd, Z_BACK, 1);
    corner(sd, Z_FRONT, -1);
  }

  /* works */
  const loader = new THREE.TextureLoader();
  const shadowMap = keep(shadowTex());
  const poolMap = keep(scallop());
  const hitMeshes: THREE.Object3D[] = [];
  const pools: THREE.MeshBasicMaterial[] = [];
  const groups: THREE.Group[] = [];

  function hang(opts: { src: string; ratio: number; height: number; kind: "photo" | "print"; side: -1 | 1; z: number; y?: number; index?: number; cartel?: THREE.Texture; lit?: boolean }) {
    const g = new THREE.Group();
    g.position.set(opts.side * (HALF_W - 0.02), opts.y ?? EYE + 0.08, opts.z);
    g.rotation.y = opts.side === -1 ? Math.PI / 2 : -Math.PI / 2;
    const imgH = opts.height;
    const imgW = imgH * opts.ratio;
    const mat = opts.kind === "photo" ? 0.2 : 0;
    const border = opts.kind === "photo" ? 0.045 : 0.025;
    const W = imgW + 2 * (mat + border);
    const Hh = imgH + 2 * (mat + border);

    const poolMat = keep(new THREE.MeshBasicMaterial({ map: poolMap, transparent: true, opacity: 0.42, depthWrite: false, blending: THREE.AdditiveBlending }));
    pools.push(poolMat);
    const gy = opts.y ?? EYE + 0.08;
    const top = H - 0.02;
    const bottom = 0.25;
    const pool = new THREE.Mesh(keep(new THREE.PlaneGeometry(Math.max(W * 1.9, 2.2), top - bottom)), poolMat);
    pool.position.set(0, (top + bottom) / 2 - gy, 0.002);
    if (opts.lit !== false) {
      g.add(pool);
      spot(opts.side, opts.z);
    }
    const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(W * 1.45, Hh * 1.45)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.55, depthWrite: false })));
    shadow.position.set(0.04, -0.09, 0.004);
    g.add(shadow);
    const frame = new THREE.Mesh(keep(new THREE.BoxGeometry(W, Hh, 0.045)), keep(new THREE.MeshStandardMaterial({ color: opts.kind === "photo" ? 0x2b2622 : 0x141312, roughness: 0.55 })));
    frame.position.z = 0.0225;
    g.add(frame);
    if (mat > 0) {
      const passe = new THREE.Mesh(keep(new THREE.PlaneGeometry(imgW + 2 * mat, imgH + 2 * mat)), keep(new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 1 })));
      passe.position.z = 0.046;
      g.add(passe);
    }
    const map = keep(loader.load(opts.src));
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    const art = new THREE.Mesh(keep(new THREE.PlaneGeometry(imgW, imgH)), keep(new THREE.MeshBasicMaterial({ map, toneMapped: false })));
    art.position.z = 0.048;
    g.add(art);
    if (opts.cartel) {
      const cartel = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.42, 0.257)), basic(opts.cartel, false));
      cartel.position.set(W / 2 + 0.5, -Hh / 2 + 0.2, 0.006);
      g.add(cartel);
      if (opts.index !== undefined) {
        cartel.userData.index = opts.index;
        hitMeshes.push(cartel);
      }
    }
    if (opts.index !== undefined) {
      frame.userData.index = art.userData.index = opts.index;
      hitMeshes.push(frame, art);
    }
    scene.add(g);
    return { g, W, Hh };
  }

  let mainN = 0;
  let cabN = 0;
  works.forEach((w, i) => {
    const n = w.room === "main" ? String(++mainN).padStart(2, "0") : `Étude ${String(++cabN).padStart(2, "0")}`;
    const { g } = hang({ src: w.art.src, ratio: w.art.ratio, height: w.height, kind: w.kind, side: L.side[i], z: L.z[i], index: i, cartel: keep(cartelTex(n, w)) });
    groups[i] = g;
  });

  /* Galerie 03 — left wall: the timeline */
  const n = input.journey.length;
  const PX = 400; // px per metre
  const colW = ENTRY_W * PX;
  const friezeH = 2.5;
  const friezeTex = keep(
    vinyl(Math.round(n * colW), Math.round(friezeH * PX), (c) => {
      c.fillStyle = "rgba(28,25,22,0.35)";
      c.fillRect(0, 248, n * colW, 2);
      input.journey.forEach((j, k) => {
        const x = k * colW + 36;
        const w = colW - 90;
        c.fillStyle = "#8a8178";
        c.font = `500 24px ${SANS}`;
        spaced(c, String(k + 1).padStart(2, "0"), x, 110, 5);
        c.fillStyle = "#1c1916";
        c.font = `400 58px ${SANS}`;
        c.fillText(j.years, x, 200);
        c.beginPath();
        c.arc(x + 7, 249, 8, 0, Math.PI * 2);
        c.fill();
        c.font = `500 36px ${SANS}`;
        let y = 330;
        y += wrap(c, j.title, x, y, w, 44) * 44;
        c.fillStyle = "#6b6259";
        c.font = `400 26px ${SANS}`;
        y += wrap(c, j.org, x, y + 4, w, 34) * 34 + 28;
        c.fillStyle = "#3a332d";
        c.font = `400 23px ${SANS}`;
        j.details.forEach((d) => {
          c.fillText("—", x, y);
          y += wrap(c, d, x + 34, y, w - 34, 31) * 31 + 8;
        });
      });
    }),
  );
  const frieze = new THREE.Mesh(keep(new THREE.PlaneGeometry(n * ENTRY_W, friezeH)), basic(friezeTex));
  frieze.rotation.y = Math.PI / 2;
  frieze.position.set(-HALF_W + 0.012, 1.72, (L.fz0 + L.fz1) / 2);
  scene.add(frieze);
  for (let k = 0; k < n; k += 2) spot(-1, L.fz0 - (k + 0.5) * ENTRY_W);

  /* Galerie 03 — right wall: "En coulisses", a salon-style hang of behind-the-scenes photos */
  const cols = Math.ceil(input.coulisses.length / 2);
  const colStep = 1.75;
  // hung towards the end of the room, so the visitor just turns round after the timeline
  const coulZ = L.fz1 + (cols * colStep) / 2 + 0.3;
  input.coulisses.forEach((ph, k) => {
    const col = Math.floor(k / 2);
    const row = k % 2;
    const z = coulZ + ((cols - 1) / 2 - col) * colStep;
    const h = ph.ratio < 1 ? 0.82 : 0.64;
    hang({ src: ph.src, ratio: ph.ratio, height: h, kind: "photo", side: 1, z, y: row === 0 ? 2.6 : 1.3, lit: false });
  });
  for (let col = 0; col < cols; col += 1) spot(1, coulZ + ((cols - 1) / 2 - col) * colStep);
  const coulWash = new THREE.Mesh(keep(new THREE.PlaneGeometry(cols * colStep + 0.4, H - 0.4)), keep(new THREE.MeshBasicMaterial({ map: keep(gradientTex([[0, "rgba(255,248,235,0.0)"], [0.2, "rgba(255,248,235,0.22)"], [1, "rgba(255,248,235,0)"]])), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  coulWash.rotation.y = -Math.PI / 2;
  coulWash.position.set(HALF_W - 0.005, (H + 0.4) / 2, coulZ);
  scene.add(coulWash);
  const coulTitle = keep(
    vinyl(1600, 420, (c) => {
      c.font = `italic 400 130px ${SERIF}`;
      c.fillText("En coulisses", 20, 170);
      c.fillStyle = "#6b6259";
      c.font = `400 46px ${SANS}`;
      c.fillText("Studio, palace, plateau, finale : là où ça se passe.", 20, 290);
    }),
  );
  const coulTitleMat = basic(coulTitle);
  coulTitleMat.depthWrite = false;
  const coulTitleMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(2.9, 0.76)), coulTitleMat);
  coulTitleMesh.renderOrder = 2;
  coulTitleMesh.rotation.y = -Math.PI / 2;
  coulTitleMesh.position.set(HALF_W - 0.012, 3.75, coulZ);
  scene.add(coulTitleMesh);

  /* Galerie 03 — right wall, near the door: a deep green section with the portrait and the skills */
  const aboutHits: THREE.Object3D[] = [];
  const zP = L.wallJourney - 3.4; // portrait
  const zS = L.wallJourney - 7.0; // skills panel
  const greenZ0 = L.wallJourney - 0.4;
  const greenZ1 = zS - 1.85;
  const green = new THREE.Mesh(keep(new THREE.PlaneGeometry(greenZ0 - greenZ1, H)), keep(new THREE.MeshStandardMaterial({ ...pbr("plaster", 3, 1.6), color: 0x3f5247, roughness: 0.95, normalScale: new THREE.Vector2(0.15, 0.15) })));
  green.rotation.y = -Math.PI / 2;
  green.position.set(HALF_W - 0.004, H / 2, (greenZ0 + greenZ1) / 2);
  scene.add(green);
  const markAbout = (o: THREE.Object3D, id: string) =>
    o.traverse((m) => {
      if ((m as THREE.Mesh).isMesh) {
        m.userData.shop = id;
        aboutHits.push(m);
      }
    });
  const portraitHang = hang({ src: input.about.portrait.src, ratio: input.about.portrait.ratio, height: 1.5, kind: "photo", side: 1, z: zP });
  markAbout(portraitHang.g, "portrait");
  const onGreen = (w: number, h: number, z: number, y: number, draw: (c: CanvasRenderingContext2D) => void) => {
    const tex = keep(canvasTex(Math.round(w * 800), Math.round(h * 800), draw));
    const mt = basic(tex);
    mt.depthWrite = false;
    const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, h)), mt);
    m.renderOrder = 2;
    m.rotation.y = -Math.PI / 2;
    m.position.set(HALF_W - 0.008, y, z);
    scene.add(m);
    return m;
  };
  // beside the portrait, painted lettering: who I am, what I am looking for
  const bio = onGreen(2.0, 2.0, zP + 2.0, 1.8, (c) => {
    const W2 = 1600;
    c.fillStyle = "#c9d2c8";
    c.font = `500 46px ${SANS}`;
    spaced(c, "PORTRAIT", 0, 150, 12);
    c.fillStyle = "#f3eee4";
    c.font = `italic 400 120px ${SERIF}`;
    let y = 330;
    y += wrap(c, `« ${input.about.quote} »`, 0, y, W2 - 30, 138) * 138 + 50;
    c.font = `400 58px ${SANS}`;
    c.fillStyle = "#dfe4dc";
    input.about.lines.forEach((l) => {
      y += wrap(c, l, 0, y, W2 - 30, 76) * 76;
    });
    if (input.about.seeking) {
      y += 20;
      c.fillStyle = "#efd9b4";
      wrap(c, input.about.seeking, 0, y, W2 - 30, 76);
    }
  });
  markAbout(bio, "portrait");
  // the skills, painted on the wall in three columns
  const skillsPanel = onGreen(3.5, 2.3, zS, 1.9, (c) => {
    c.fillStyle = "#f3eee4";
    c.font = `italic 400 200px ${SERIF}`;
    c.fillText("Compétences", 0, 200);
    const colW2 = 930;
    input.about.skills.forEach((k, i) => {
      const x = i * colW2;
      c.fillStyle = "#efd9b4";
      c.font = `500 50px ${SANS}`;
      spaced(c, k.title.toUpperCase(), x, 400, 10);
      c.fillStyle = "#f3eee4";
      c.font = `400 60px ${SANS}`;
      k.text.split(" · ").forEach((s, j) => c.fillText(s, x, 520 + j * 90, colW2 - 40));
    });
  });
  markAbout(skillsPanel, "skills");
  for (const z of [zS + 1.2, zS - 1.2, zP + 2.0]) spot(1, z);
  for (const [z, w] of [
    [zS, 4.0],
    [zP + 2.0, 2.4],
  ] as const) {
    const wash = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, H - 0.6)), keep(new THREE.MeshBasicMaterial({ map: poolMap, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending })));
    wash.rotation.y = -Math.PI / 2;
    wash.position.set(HALF_W - 0.006, (H + 0.6) / 2, z);
    scene.add(wash);
  }

  /* ───────── the museum shop ───────── */
  // coloured end wall with the closing line
  const shopWall = keep(new THREE.MeshStandardMaterial({ color: 0x7a2f35, roughness: 0.9 }));
  const endPaint = new THREE.Mesh(keep(new THREE.PlaneGeometry(HALF_W * 2 - 0.01, H)), shopWall);
  endPaint.position.set(0, H / 2, Z_BACK + 0.006);
  scene.add(endPaint);
  const exitTex = keep(
    canvasTex(3600, 900, (c) => {
      c.fillStyle = "#e9d9cf";
      c.font = `500 60px ${SANS}`;
      spaced(c, input.shop.title.toUpperCase(), 1800, 170, 22, "center");
      c.textAlign = "center";
      c.fillStyle = "#f6ece4";
      c.font = `italic 400 250px ${SERIF}`;
      c.fillText(input.exit.line, 1800, 560);
      c.textAlign = "left";
    }),
  );
  const exitMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(8.6, 8.6 * (900 / 3600))), basic(exitTex));
  exitMesh.position.set(0, 3.3, Z_BACK + 0.012);
  scene.add(exitMesh);
  const paper0 = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => keep(canvasTex(w, h, draw));
  // ── photographed objects (CC0 scans, Poly Haven) ──
  const gltfLoader = new GLTFLoader();
  const models = new Map<string, Promise<THREE.Group>>();
  const loadedScenes: THREE.Object3D[] = [];
  const model = (id: string) => {
    if (!models.has(id))
      models.set(
        id,
        gltfLoader.loadAsync(`/models/${id}/${id}.gltf`).then((g) => {
          loadedScenes.push(g.scene);
          return g.scene;
        }),
      );
    return models.get(id)!.then((s) => s.clone(true));
  };
  disposables.push({
    dispose: () =>
      loadedScenes.forEach((s) =>
        s.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          m.geometry.dispose();
          for (const mt of ([] as THREE.Material[]).concat(m.material)) {
            for (const v of Object.values(mt)) if (v instanceof THREE.Texture) v.dispose();
            mt.dispose();
          }
        }),
      ),
  });
  /** place a scanned object; resolves with its group once loaded */
  const place = (id: string, x: number, y: number, z: number, ry = 0, s: number | [number, number, number] = 1, parent: THREE.Object3D = scene, then?: (g: THREE.Group) => void) =>
    model(id)
      .then((g) => {
        g.position.set(x, y, z);
        g.rotation.y = ry;
        if (typeof s === "number") g.scale.setScalar(s);
        else g.scale.set(...s);
        parent.add(g);
        then?.(g);
        return g;
      })
      .catch(() => null);
  const blob = (w: number, d: number, x: number, y: number, z: number, o = 0.45, parent: THREE.Object3D = scene) => {
    const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, d)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: o, depthWrite: false })));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    parent.add(m);
  };

  /* ───────── the great hall's furniture: sculptures on marble plinths, upholstered benches, palms ───────── */
  const marble = keep(new THREE.MeshStandardMaterial({ ...pbr("plaster", 0.5, 1), color: 0xf1ede6, roughness: 0.32, normalScale: new THREE.Vector2(0.15, 0.15) }));
  const plinth = (x: number, z: number, h: number, w = 0.5) => {
    const p = new THREE.Mesh(keep(new THREE.BoxGeometry(w, h, w)), marble);
    p.position.set(x, h / 2, z);
    scene.add(p);
    const cap = new THREE.Mesh(keep(new THREE.BoxGeometry(w + 0.06, 0.04, w + 0.06)), marble);
    cap.position.set(x, h + 0.02, z);
    scene.add(cap);
    const foot = new THREE.Mesh(keep(new THREE.BoxGeometry(w + 0.08, 0.08, w + 0.08)), marble);
    foot.position.set(x, 0.04, z);
    scene.add(foot);
    blob(w * 2.2, w * 2.2, x, 0.009, z, 0.5);
    return h + 0.04;
  };
  const hallOrder = L.order.filter((i) => works[i].room === "main" || works[i].room === "cabinet");
  const statues: [string, number, number][] = [
    ["marble_bust_01", 1.55, 1.15],
    ["horse_statue_01", 4.2, 1.0],
    ["marble_bust_01", 1.55, 1.15],
    ["antique_ceramic_vase_01", 2.0, 1.0],
  ];
  // opposite each of these works, on the blank stretch of the other wall
  [1, 3, 5, 7].forEach((k, n) => {
    const i = hallOrder[k];
    if (i === undefined || n >= statues.length) return;
    const sd = -L.side[i] as -1 | 1;
    const z = L.z[i];
    if (sd === 1 && Math.abs(z + 9.5) < 1.6) return;
    const x = sd * (HALF_W - 1.1);
    const [id, s, h] = statues[n];
    const top = plinth(x, z, h);
    place(id, x, top, z, sd === 1 ? -Math.PI / 2 : Math.PI / 2, s);
  });
  // benches down the middle, in line with the works so the walk passes between them
  [0, 2, 4, 6].forEach((k) => {
    const i = hallOrder[k];
    if (i === undefined) return;
    blob(1.3, 1.6, 0, 0.009, L.z[i], 0.5);
    place("Ottoman_01", 0, 0, L.z[i], Math.PI / 2, 1.15);
  });
  // tall palms in planters by the doorways
  for (const [x, z] of [
    [-HALF_W + 1.0, Z_FRONT - 1.0],
    [HALF_W - 1.0, Z_FRONT - 1.0],
    [-2.9, L.wallJourney + 0.9],
    [2.9, L.wallJourney + 0.9],
    [-2.9, L.wallShop + 0.9],
  ]) {
    blob(1.4, 1.4, x, 0.009, z, 0.5);
    place("potted_plant_02", x, 0, z, x, 2.0);
  }

  /* ───────── the museum shop: one long table in the middle, the souvenirs laid flat as in a bookshop ───────── */
  const tblZ = L.wallShop - 4.6;
  const TW = 3.2; // table length (x)
  const TD = 1.9; // table depth (z)
  const TH = 0.88;
  blob(narrow ? TD + 1.4 : TW + 1.4, narrow ? TW + 1.4 : TD + 1.4, 0, 0.008, tblZ, 0.55);
  // a solid light-oak bookshop table (photographed wood, Poly Haven), with a low shelf of books.
  // On portrait screens it is turned lengthways, so the view from above fills the screen.
  const tableG = new THREE.Group();
  tableG.position.set(0, 0, tblZ);
  tableG.rotation.y = narrow ? Math.PI / 2 : 0;
  scene.add(tableG);
  const oak = (rx: number, ry: number, rot = 0, rough = 0.55) => {
    const load = (suffix: string, srgb: boolean) => {
      const tx = keep(texLoader.load(`/textures/oak_${suffix}.jpg`));
      tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
      tx.repeat.set(rx, ry);
      tx.center.set(0.5, 0.5);
      tx.rotation = rot;
      tx.anisotropy = 8;
      if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
      return tx;
    };
    return keep(new THREE.MeshStandardMaterial({ map: load("diff", true), normalMap: load("nor_gl", false), roughnessMap: load("rough", false), color: 0xf2e6d4, roughness: rough, normalScale: new THREE.Vector2(0.5, 0.5) }));
  };
  // grain running the length of the table
  const slab = new THREE.Mesh(keep(new RoundedBoxGeometry(TW, 0.06, TD, 4, 0.014)), oak(1.1, 1.8, Math.PI / 2, 0.5));
  slab.position.set(0, TH - 0.03, 0);
  tableG.add(slab);
  const legMat = oak(0.15, 1);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(keep(new RoundedBoxGeometry(0.075, TH - 0.06, 0.075, 2, 0.008)), legMat);
      leg.position.set(sx * (TW / 2 - 0.14), (TH - 0.06) / 2, sz * (TD / 2 - 0.14));
      tableG.add(leg);
    }
  for (const sz of [-1, 1]) {
    const apron = new THREE.Mesh(keep(new RoundedBoxGeometry(TW - 0.3, 0.1, 0.03, 2, 0.006)), oak(2, 0.1, Math.PI / 2));
    apron.position.set(0, TH - 0.11, sz * (TD / 2 - 0.14));
    tableG.add(apron);
  }
  const shelfY = 0.2;
  const lowShelf = new THREE.Mesh(keep(new RoundedBoxGeometry(TW - 0.3, 0.03, TD - 0.3, 2, 0.008)), oak(1, 1.6, Math.PI / 2));
  lowShelf.position.set(0, shelfY, 0);
  tableG.add(lowShelf);
  for (const [x, z, ry] of [
    [-1.3, 0.45, 0],
    [-0.5, 0.45, 0],
    [0.3, 0.45, 0],
    [-1.0, -0.2, Math.PI],
    [0.6, -0.2, Math.PI],
  ] as const)
    place("book_encyclopedia_set_01", x, shelfY + 0.015, z, ry, 1, tableG);
  blob(TW * 1.25, TD * 1.4, 0, shelfY + 0.016, 0, 0.25, tableG);
  // by the closing wall: side tables with plants, a brass vase
  place("brass_vase_01", HALF_W - 0.9, 0, Z_BACK + 0.9, 0, 1.4);
  blob(0.6, 0.6, HALF_W - 0.9, 0.008, Z_BACK + 0.9, 0.5);
  for (const sx of [-1, 1]) {
    const x = sx * (HALF_W - 2.6);
    blob(0.9, 0.8, x, 0.008, Z_BACK + 0.7, 0.5);
    place("side_table_01", x, 0, Z_BACK + 0.6, 0, 1.2);
    place("potted_plant_04", x - 0.1, 0.66, Z_BACK + 0.6, sx, 1.6);
    place(sx < 0 ? "ceramic_vase_03" : "ceramic_vase_01", x + 0.16, 0.66, Z_BACK + 0.55, 0, 1);
  }
  // two crystal chandeliers over the table, on chains
  const chainMat = keep(new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.35, metalness: 0.9 }));
  for (const x of [-0.95, 0.95]) {
    const bottom = 3.45;
    const s = 1.1;
    place("Chandelier_03", x, bottom + 1.04 * s, tblZ, 0, s);
    const top = bottom + 1.04 * s;
    const chain = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.008, 0.008, H - top, 6)), chainMat);
    chain.position.set(x, (H + top) / 2, tblZ);
    scene.add(chain);
  }

  /** a printed surface: canvas texture for the top of a souvenir lying on the table */
  const print = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => keep(canvasTex(w, h, draw));
  const center = (c: CanvasRenderingContext2D, s: string, x: number, y: number) => {
    c.textAlign = "center";
    c.fillText(s, x, y);
    c.textAlign = "left";
  };
  const cover: Record<string, () => THREE.Texture> = {
    cv: () =>
      print(700, 980, (c) => {
        c.fillStyle = "#f4efe6";
        c.fillRect(0, 0, 700, 980);
        c.fillStyle = "#7a2f35";
        c.fillRect(0, 0, 700, 18);
        c.fillStyle = "#8a8178";
        c.font = `500 28px ${SANS}`;
        spaced(c, "CURRICULUM VITAE", 350, 170, 8, "center");
        c.fillStyle = "#1c1916";
        c.font = `400 92px ${SERIF}`;
        center(c, "Clémentine", 350, 430);
        center(c, "Sanchez", 350, 530);
        c.fillStyle = "#6b6259";
        c.font = `400 30px ${SANS}`;
        center(c, "Marketing & communication", 350, 640);
        center(c, "EFAP Paris", 350, 685);
        c.fillStyle = "#1c1916";
        c.fillRect(315, 820, 70, 3);
      }),
    portrait: () => {
      const t = print(760, 1000, (c) => {
        c.fillStyle = "#fbfaf6";
        c.fillRect(0, 0, 760, 1000);
      });
      const img = new Image();
      img.onload = () => {
        const c = (t.image as HTMLCanvasElement).getContext("2d")!;
        const w = 680;
        const h = 860;
        const s = Math.max(w / img.width, h / img.height);
        c.save();
        c.beginPath();
        c.rect(40, 40, w, h);
        c.clip();
        c.drawImage(img, 40 + (w - img.width * s) / 2, 40 + (h - img.height * s) / 2, img.width * s, img.height * s);
        c.restore();
        t.needsUpdate = true;
      };
      img.src = input.about.portrait.src;
      return t;
    },
    skills: () =>
      print(700, 980, (c) => {
        c.fillStyle = "#e7dccb";
        c.fillRect(0, 0, 700, 980);
        c.fillStyle = "#7a2f35";
        c.font = `500 32px ${SANS}`;
        spaced(c, "COMPÉTENCES", 350, 170, 8, "center");
        c.fillStyle = "#2b2622";
        c.font = `400 34px ${SANS}`;
        ["Communication de marque", "Influence & RP", "Événementiel", "Social media", "CRM & e-mailing", "Rédaction", "Plan média"].forEach((s, k) => center(c, s, 350, 290 + k * 72));
      }),
    linkedin: () =>
      print(850, 520, (c) => {
        c.fillStyle = "#fbfaf7";
        c.fillRect(0, 0, 850, 520);
        c.fillStyle = "#1c1916";
        c.font = `400 60px ${SERIF}`;
        c.fillText("Clémentine Sanchez", 60, 170);
        c.fillStyle = "#6b6259";
        c.font = `400 30px ${SANS}`;
        c.fillText("Marketing & communication", 60, 225);
        c.fillStyle = "#0a66c2";
        c.fillRect(60, 340, 60, 60);
        c.fillStyle = "#fff";
        c.font = `700 40px ${SANS}`;
        c.fillText("in", 70, 384);
        c.fillStyle = "#1c1916";
        c.font = `400 32px ${SANS}`;
        c.fillText("in/clementine-sanchez", 140, 382);
      }),
    contact: () =>
      print(840, 530, (c) => {
        c.fillStyle = "#f1e8d8";
        c.fillRect(0, 0, 840, 530);
        c.strokeStyle = "rgba(90,70,50,0.35)";
        c.lineWidth = 2;
        c.strokeRect(24, 24, 792, 482);
        c.fillStyle = "#7a2f35";
        c.font = `italic 400 96px ${SERIF}`;
        center(c, "Écrivez-moi", 420, 260);
        c.fillStyle = "#6b6259";
        c.font = `500 26px ${SANS}`;
        spaced(c, "CLÉMENTINE SANCHEZ", 420, 350, 6, "center");
      }),
  };
  const paperMat = keep(new THREE.MeshStandardMaterial({ color: 0xf6f1e8, roughness: 0.85 }));
  const shopHits: THREE.Object3D[] = [];
  const tagTex = (it: ShopItem) =>
    paper0(360, 170, (c) => {
      c.fillStyle = "#fbfaf7";
      c.fillRect(0, 0, 360, 170);
      c.fillStyle = "#1c1916";
      c.font = `500 34px ${SANS}`;
      c.fillText(it.name, 22, 62);
      c.fillStyle = "#6b6259";
      c.font = `400 24px ${SANS}`;
      c.fillText(it.object, 22, 102);
      c.fillStyle = "#7a2f35";
      c.font = `500 22px ${SANS}`;
      spaced(c, "OFFERT", 22, 144, 4);
    });
  /** size (x, z) and thickness of each souvenir, and where it lies on the table */
  const flat: Record<string, { w: number; d: number; t: number; n: number; x: number; z: number; r: number }> = {
    cv: { w: 0.5, d: 0.7, t: 0.014, n: 3, x: -0.85, z: -0.22, r: 0.04 },
    linkedin: { w: 0.44, d: 0.27, t: 0.004, n: 6, x: 0.12, z: -0.5, r: -0.06 },
    contact: { w: 0.5, d: 0.32, t: 0.003, n: 5, x: 0.1, z: 0.15, r: 0.05 },
  };
  const top = TH + 0.003;
  input.shop.items.forEach((it) => {
    const f = flat[it.id];
    if (!f) return;
    const g = new THREE.Group();
    g.position.set(f.x, top, f.z);
    // keep the print facing the visitor whichever way the table is turned
    g.rotation.y = f.r - tableG.rotation.y;
    tableG.add(g);
    const tex = cover[it.id]?.();
    // a small pile: the top copy is printed, the others show their edges
    for (let k = 0; k < f.n; k++) {
      const face = k === f.n - 1 && tex ? basic(tex, false) : paperMat;
      const sheet = new THREE.Mesh(keep(new THREE.BoxGeometry(f.w, f.t, f.d)), [paperMat, paperMat, face, paperMat, paperMat, paperMat]);
      sheet.position.set((k % 2 ? 0.004 : -0.003) * (k > 0 ? 1 : 0), f.t / 2 + k * f.t, 0);
      sheet.rotation.y = (k - f.n / 2) * 0.012;
      sheet.userData.shop = it.id;
      shopHits.push(sheet);
      g.add(sheet);
    }
    blob(f.w * 1.5, f.d * 1.4, 0, 0.0005, 0, 0.35, g);
      const tag = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.3, 0.142)), basic(tagTex(it), false));
    // its label lies on the table just in front
    tag.position.set(0, 0.0015, f.d / 2 + 0.11);
    tag.rotation.x = -Math.PI / 2;
    tag.userData.shop = it.id;
    shopHits.push(tag);
    g.add(tag);
  });
  // a printed card for the visitors who made it this far
  if (input.shop.welcome) {
    const wTex = print(1500, 420, (c) => {
      c.fillStyle = "#fbf7ef";
      c.fillRect(0, 0, 1500, 420);
      c.strokeStyle = "#7a2f35";
      c.lineWidth = 4;
      c.strokeRect(26, 26, 1448, 368);
      c.fillStyle = "#7a2f35";
      c.font = `500 30px ${SANS}`;
      spaced(c, input.shop.title.toUpperCase(), 750, 110, 9, "center");
      c.fillStyle = "#1c1916";
      c.font = `italic 400 76px ${SERIF}`;
      const [a, b] = input.shop.welcome!.split("? ");
      center(c, b ? `${a}?` : a, 750, 225);
      if (b) center(c, b, 750, 320);
    });
    const card = new THREE.Mesh(keep(new THREE.BoxGeometry(1.0, 0.004, 0.28)), [paperMat, paperMat, basic(wTex, false), paperMat, paperMat, paperMat]);
    // in front of the souvenirs; on portrait screens, beside the CV
    if (narrow) card.scale.setScalar(0.8);
    card.position.set(narrow ? -0.8 : -0.35, top + 0.002, narrow ? 0.5 : 0.7);
    card.rotation.y = 0.015 - tableG.rotation.y;
    tableG.add(card);

  }
  // more for sale around them: real books, postcards and a vase
  place("book_encyclopedia_set_01", 1.05, top, -0.6, -Math.PI / 2, 1, tableG);
  place("antique_ceramic_vase_01", 1.35, top, -0.2, 0, 0.8, tableG);
  model("postcard_set_01")
    .then((set) => {
      let n = 0;
      set.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || n > 5) return;
        const c = new THREE.Mesh(m.geometry, m.material);
        c.scale.setScalar(1.8);
        c.position.set(0.62 + (n % 3) * 0.32, top + 0.002 + n * 0.0005, 0.3 + Math.floor(n / 3) * 0.22);
        c.rotation.y = (n % 2 ? 1 : -1) * 0.05 * n - tableG.rotation.y;
        tableG.add(c);
        n++;
      });
    })
    .catch(() => {});
  // lit from above
  const tablePool = new THREE.Mesh(keep(new THREE.PlaneGeometry(TW + 1.2, TD + 1.2)), keep(new THREE.MeshBasicMaterial({ map: poolMap, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending })));
  tablePool.rotation.x = -Math.PI / 2;
  tablePool.position.set(0, top + 0.02, 0);
  tableG.add(tablePool);

  /* the shop's left wall: "Hors champ", a few personal photographs in a row */
  const hcZ = L.wallShop - 4.8;
  const hc = input.horsChamp ?? [];
  if (hc.length) {
    const hcH = (r: number) => (r < 1 ? 1.25 : 0.95);
    const widths = hc.map((ph) => hcH(ph.ratio) * ph.ratio + 0.49);
    const gap = 0.28;
    const total = widths.reduce((a, b) => a + b, 0) + gap * (hc.length - 1);
    let z = hcZ + total / 2;
    hc.forEach((ph, k) => {
      const zc = z - widths[k] / 2;
      hang({ src: ph.src, ratio: ph.ratio, height: hcH(ph.ratio), kind: "photo", side: -1, z: zc, y: EYE });
      z -= widths[k] + gap;
    });
    const hcTitle = keep(
      vinyl(1600, 420, (c) => {
        c.font = `italic 400 130px ${SERIF}`;
        c.fillText("Hors champ", 20, 170);
        c.fillStyle = "#6b6259";
        c.font = `400 46px ${SANS}`;
        c.fillText("Les amis, les terrasses, les soirées.", 20, 290);
      }),
    );
    const hcMat = basic(hcTitle);
    hcMat.depthWrite = false;
    const hcMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(2.9, 0.76)), hcMat);
    hcMesh.renderOrder = 2;
    hcMesh.rotation.y = Math.PI / 2;
    hcMesh.position.set(-HALF_W + 0.012, 3.55, hcZ + total / 2 - 1.45);
    scene.add(hcMesh);
  }

  /* ───────── the walk ───────── */
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const stations: Station[] = [
    { pos: v3(0.6, EYE, 8.5), look: v3(-1.4, 1.95, -6), room: "entrance" },
    { pos: v3(-1.4, EYE, narrow ? 6.5 : 1.6), look: v3(-1.5, 2.05, -6), room: "entrance" },
    { pos: v3(4.0, EYE, -5.2), look: v3(3.0, EYE, -16), room: "main" },
  ];
  const facing = (s: -1 | 1, z: number, d = 4.9, dz = 0.45) => ({
    pos: v3(s * (HALF_W - d), EYE, z + 0.2),
    look: v3(s * HALF_W, EYE - 0.02, z + (s === -1 ? -dz : dz)),
  });
  /** walking down the middle of the room, looking ahead */
  const walkThrough = (x: number, z: number, room: Station["room"]) => stations.push({ pos: v3(x, EYE, z), look: v3(x * 0.4, EYE - 0.08, z - 9), room, walk: true });
  let prevZ: number | null = null;
  L.order.forEach((i) => {
    const w = works[i];
    if (prevZ !== null) walkThrough(0, (prevZ + L.z[i]) / 2, "main");
    prevZ = L.z[i];
    const wide = w.height * w.art.ratio > 1.9;
    const d = narrow ? (wide ? 5.4 : 4.3) : 4.9;
    stations.push({ ...facing(L.side[i], L.z[i], d, narrow ? 0.25 : 0.45), room: "main", art: i });
  });
  stations.push({ pos: v3(0, EYE, L.wallJourney + 5), look: v3(-3, 2.1, L.wallJourney), room: "main" });
  walkThrough(0, L.wallJourney - 0.5, "journey");
  // Galerie 03: the stops on both walls, visited in the order one walks past them
  const g3: Station[] = [];
  if (narrow) {
    input.journey.forEach((_, k) => {
      const z = L.fz0 - (k + 0.5) * ENTRY_W;
      g3.push({ pos: v3(-HALF_W + 3.3, EYE, z), look: v3(-HALF_W, 1.62, z), room: "journey", frieze: true });
    });
  } else {
    const m = Math.ceil(n / 3);
    for (let i = 0; i < m; i++) {
      const z = L.fz0 - ((i + 0.5) / m) * n * ENTRY_W;
      g3.push({ pos: v3(-HALF_W + 4.4, EYE, z), look: v3(-HALF_W, 1.7, z), room: "journey", frieze: true });
    }
  }
  const zPv = narrow ? zP + 0.4 : zP + 1.0;
  g3.push({ pos: v3(HALF_W - (narrow ? 5.6 : 3.9), EYE, zPv), look: v3(HALF_W, 1.75, zPv), room: "journey" });
  g3.push({ pos: v3(HALF_W - (narrow ? 6.6 : 4.0), EYE, zS), look: v3(HALF_W, 1.85, zS), room: "journey" });
  g3.push({ pos: v3(HALF_W - (narrow ? 6.6 : 5.6), EYE, coulZ), look: v3(HALF_W, 1.9, coulZ), room: "journey" });
  g3.sort((a, b) => b.pos.z - a.pos.z).forEach((s) => stations.push(s));
  walkThrough(0, L.wallShop + 1.2, "about");
  // the shop: the whole room, then the table of souvenirs seen from above, then the closing line
  stations.push({ pos: v3(0, EYE, L.wallShop - 0.8), look: v3(0, 1.4, Z_BACK), room: "about" });
  if (hc.length) stations.push({ pos: v3(-HALF_W + (narrow ? 6.6 : 5.0), EYE, hcZ), look: v3(-HALF_W, 1.85, hcZ), room: "about" });
  // leaning over the table: the souvenirs seen from above
  stations.push({ pos: v3(0, TH + (narrow ? 2.35 : 2.1), tblZ + (narrow ? 0.75 : 0.8)), look: v3(0, TH, tblZ + (narrow ? -0.05 : 0.12)), room: "exit", contact: true });
  stations.push({ pos: v3(0, EYE, Z_BACK + (narrow ? 10 : 7)), look: v3(0, 2.2, Z_BACK), room: "exit" });

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let target = 0;
  let current = 0;
  let vel = 0;
  /** critically damped spring: starts and stops softly, never overshoots */
  const smoothDamp = (dt: number, time = 0.6) => {
    const omega = 2 / time;
    const x = omega * dt;
    const k = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = current - target;
    const tmpv = (vel + omega * change) * dt;
    vel = (vel - omega * tmpv) * k;
    current = target + (change + tmpv) * k;
    if (Math.abs(current - target) < 1e-4 && Math.abs(vel) < 1e-3) {
      current = target;
      vel = 0;
    }
  };
  const pointer = new THREE.Vector2();
  const ptrSmooth = new THREE.Vector2();
  let hovered: number | null = null;
  let walkT = 0;
  let frozen: { p: THREE.Vector3; l: THREE.Vector3 } | null = null;
  let focusAnim: { from: THREE.Vector3; fromLook: THREE.Vector3; to: THREE.Vector3; toLook: THREE.Vector3; t0: number; done: () => void } | null = null;
  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const right = new THREE.Vector3();

  const quats = stations.map((st) => {
    const m = new THREE.Matrix4().lookAt(st.pos, st.look, new THREE.Vector3(0, 1, 0));
    return new THREE.Quaternion().setFromRotationMatrix(m);
  });
  const quat = new THREE.Quaternion();
  const fwd = new THREE.Vector3();
  /** ease a segment: slow down only where the visitor actually stops */
  const segEase = (f: number, a: Station, b: Station) => {
    const sa = !a.walk;
    const sb = !b.walk;
    if (sa && sb) return f * f * (3 - 2 * f);
    if (sa) return f * f;
    if (sb) return 1 - (1 - f) * (1 - f);
    return f;
  };
  function poseAt(s: number) {
    const max = stations.length - 1;
    const c = Math.min(Math.max(s, 0), max);
    const i = Math.min(Math.floor(c), max - 1);
    const f = segEase(c - i, stations[i], stations[i + 1]);
    pos.lerpVectors(stations[i].pos, stations[i + 1].pos, f);
    quat.slerpQuaternions(quats[i], quats[i + 1], f);
    fwd.set(0, 0, -1).applyQuaternion(quat);
    look.copy(pos).addScaledVector(fwd, 5);
  }

  // ambient occlusion: the soft contact shadows that make a real room read as real
  let composer: EffectComposer | null = null;
  if (!narrow) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const ao = new GTAOPass(scene, camera, canvas.clientWidth, canvas.clientHeight);
    ao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 12 });
    ao.blendIntensity = 0.9;
    composer.addPass(ao);
    composer.addPass(new OutputPass());
    disposables.push({ dispose: () => composer?.dispose() });
  }

  /* ───────── free walk (Street View style) ───────── */
  const free = { blend: 0, pos: new THREE.Vector3(), quat: new THREE.Quaternion(), anim: null as null | { pts: THREE.Vector3[]; seg: number; t: number; lens: number[]; total: number; done: () => void; yaw0: number; yaw1: number }, release: false, syncIdx: -1 };
  let yawOff = 0;
  let pitchOff = 0;
  const ringMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
  const ring = new THREE.Mesh(keep(new THREE.RingGeometry(0.2, 0.26, 48)), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  scene.add(ring);
  const ringDisc = new THREE.Mesh(keep(new THREE.CircleGeometry(0.2, 48)), keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })));
  ringDisc.rotation.x = -Math.PI / 2;
  ringDisc.position.y = 0.011;
  scene.add(ringDisc);
  let ringGoal = 0;
  const yawOf = (q: THREE.Quaternion) => {
    const f = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    return Math.atan2(-f.x, -f.z);
  };
  const quatFromYaw = (yaw: number, pitch = -0.04) => new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, "YXZ"));
  /** the room a z coordinate belongs to, and the walls separating rooms */
  const walls = [-6, L.wallJourney, L.wallShop];
  const doorX = (z: number) => (z === -6 ? 4.2 : 0);
  const clampRoom = (p: THREE.Vector3) => {
    p.x = Math.max(-HALF_W + 1.1, Math.min(HALF_W - 1.1, p.x));
    p.z = Math.max(Z_BACK + 1.1, Math.min(Z_FRONT - 1.1, p.z));
    for (const w of walls) if (Math.abs(p.z - w) < 0.9) p.z = w + (p.z > w ? 0.9 : -0.9);
    return p;
  };

  /* ───────── floor markers, as in a virtual flat tour: click one to walk there ───────── */
  const spotTex = keep(
    canvasTex(256, 256, (c) => {
      c.clearRect(0, 0, 256, 256);
      const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, "rgba(255,255,255,0.28)");
      g.addColorStop(0.78, "rgba(255,255,255,0.38)");
      g.addColorStop(0.8, "rgba(255,255,255,0.95)");
      g.addColorStop(0.9, "rgba(255,255,255,0.95)");
      g.addColorStop(0.92, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 256);
    }),
  );
  const arrowTex = keep(
    canvasTex(256, 256, (c) => {
      c.clearRect(0, 0, 256, 256);
      c.strokeStyle = "rgba(255,255,255,0.98)";
      c.lineWidth = 22;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.beginPath();
      c.moveTo(70, 160);
      c.lineTo(128, 96);
      c.lineTo(186, 160);
      c.stroke();
    }),
  );
  const markGeo = keep(new THREE.PlaneGeometry(0.7, 0.7));
  const hitGeo = keep(new THREE.CircleGeometry(0.5, 16));
  const hitMat = keep(new THREE.MeshBasicMaterial({ visible: false }));
  type Spot = THREE.Group & { hit: THREE.Mesh; disc: THREE.Mesh; arrow: THREE.Mesh; idx: number; o: number };
  const spots: Spot[] = [];
  stations.forEach((st, k) => {
    if (st.walk) return;
    const g = new THREE.Group() as Spot;
    g.position.set(st.pos.x, 0.014, st.pos.z);
    const disc = new THREE.Mesh(markGeo, new THREE.MeshBasicMaterial({ map: spotTex, transparent: true, depthWrite: false, opacity: 0 }));
    keep(disc.material as THREE.Material);
    disc.rotation.x = -Math.PI / 2;
    const arrow = new THREE.Mesh(markGeo, new THREE.MeshBasicMaterial({ map: arrowTex, transparent: true, depthWrite: false, opacity: 0 }));
    keep(arrow.material as THREE.Material);
    arrow.rotation.x = -Math.PI / 2;
    arrow.position.y = 0.002;
    arrow.scale.setScalar(0.62);
    const hit = new THREE.Mesh(hitGeo, hitMat);
    hit.rotation.x = -Math.PI / 2;
    hit.userData.station = k;
    g.add(disc, arrow, hit);
    Object.assign(g, { hit, disc, arrow, idx: k, o: 0 });
    g.visible = false;
    scene.add(g);
    spots.push(g);
  });
  let spotHover: number | null = null;
  const spotWalls = [-6, L.wallJourney, L.wallShop];
  /** which markers are worth showing from where the visitor stands */
  const updateSpots = (dt: number) => {
    const here = Math.round(current);
    const cam = camera.position;
    // the next stop ahead gets an arrow
    const next = spots.find((s) => s.idx > here + 0.4);
    spots.forEach((s) => {
      const d = Math.hypot(s.position.x - cam.x, s.position.z - cam.z);
      const behindWall = spotWalls.some((w) => (w - cam.z) * (w - s.position.z) < 0 && !(w === -6 && (s.position.x > 2.4 || cam.x > 2.4)));
      const near = Math.abs(s.idx - here);
      let goal = d > 1.3 && d < 12 && (!behindWall || near <= 2) ? Math.min(1, (12 - d) / 4) : 0;
      if (s.idx === here) goal = 0;
      if (spotHover === s.idx) goal = 1;
      s.o += (goal - s.o) * (1 - Math.exp(-dt * 8));
      s.visible = s.o > 0.02;
      const big = spotHover === s.idx ? 1.18 : 1;
      s.scale.setScalar(s.scale.x + (big - s.scale.x) * 0.2);
      (s.disc.material as THREE.MeshBasicMaterial).opacity = s.o * 0.9;
      const isNext = s === next;
      (s.arrow.material as THREE.MeshBasicMaterial).opacity = isNext ? s.o : 0;
      if (isNext) s.arrow.rotation.z = Math.atan2(-(s.position.x - cam.x), -(s.position.z - cam.z));
    });
  };

  const perf = { n: -60, t: 0 };
  let trip: null | { pts: THREE.Vector3[]; lens: number[]; total: number; t: number; dur: number; q0: THREE.Quaternion; q1: THREE.Quaternion; idx: number; done: () => void } = null;
  const clock = new THREE.Clock();
  let raf = 0;
  let visible = true;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    if (frozen) {
      camera.position.copy(frozen.p);
      camera.lookAt(frozen.l);
    } else if (focusAnim) {
      const t = Math.min((performance.now() - focusAnim.t0) / 1500, 1);
      const e = ease(t);
      camera.position.lerpVectors(focusAnim.from, focusAnim.to, e);
      tmp.lerpVectors(focusAnim.fromLook, focusAnim.toLook, e);
      camera.lookAt(tmp);
      if (t >= 1) {
        const d = focusAnim.done;
        focusAnim = null;
        d();
      }
    } else {
      smoothDamp(dt);
      poseAt(current);
      let speed = Math.min(Math.abs(vel) * 0.9, 1);
      // a direct trip to another stop (floor marker, buttons, plan)
      if (trip) {
        const a = trip;
        a.t = Math.min(1, a.t + dt / a.dur);
        const e = a.t < 0.5 ? 4 * a.t * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 3) / 2;
        let d = e * a.total;
        let k = 0;
        while (k < a.lens.length - 1 && d > a.lens[k]) d -= a.lens[k++];
        free.pos.lerpVectors(a.pts[k], a.pts[k + 1], Math.min(d / Math.max(a.lens[k], 1e-6), 1));
        // turn towards the destination early, like someone walking with purpose
        free.quat.slerpQuaternions(a.q0, a.q1, Math.min(1, e * 1.35));
        free.blend = 1;
        speed = Math.max(speed, Math.sin(Math.PI * a.t));
        if (a.t >= 1) {
          trip = null;
          target = current = a.idx;
          vel = 0;
          poseAt(current);
          free.blend = 0;
          a.done();
        }
      }
      // free walk towards a clicked point on the floor
      if (free.anim) {
        const a = free.anim;
        a.t += (dt * 1.5) / Math.max(a.total, 0.5);
        const e = a.t >= 1 ? 1 : a.t < 0.5 ? 2 * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 2) / 2;
        let d = e * a.total;
        let k = 0;
        while (k < a.lens.length - 1 && d > a.lens[k]) d -= a.lens[k++];
        free.pos.lerpVectors(a.pts[k], a.pts[k + 1], Math.min(d / Math.max(a.lens[k], 1e-6), 1));
        let dy = a.yaw1 - a.yaw0;
        dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        free.quat.copy(quatFromYaw(a.yaw0 + dy * Math.min(e * 1.4, 1)));
        speed = Math.max(speed, 1 - Math.abs(2 * e - 1));
        if (a.t >= 1) {
          free.anim = null;
          a.done();
        }
      }
      if (free.release) {
        free.blend = Math.max(0, free.blend - dt * 1.1);
        if (free.blend === 0) free.release = false;
      }
      if (free.blend > 0) {
        const b = free.blend * free.blend * (3 - 2 * free.blend);
        pos.lerp(free.pos, b);
        quat.slerp(free.quat, b);
      }
      // looking around eases back when walking along the path
      if (speed > 0.05 && !free.anim && !trip) {
        yawOff *= Math.exp(-dt * 2);
        pitchOff *= Math.exp(-dt * 2);
      }
      ptrSmooth.lerp(pointer, 1 - Math.exp(-dt * 3));
      camera.position.copy(pos);
      walkT += dt * 7.5 * speed;
      camera.position.y += Math.sin(walkT * 2) * 0.012 * speed;
      camera.quaternion.copy(quat);
      camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yawOff - ptrSmooth.x * 0.04);
      camera.rotateX(pitchOff + ptrSmooth.y * 0.025);
      fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
      look.copy(camera.position).addScaledVector(fwd, 5);
    }
    updateSpots(dt);
    // keep the visit fluid: drop the ambient-occlusion pass, then resolution, on slow devices
    perf.n++;
    perf.t += dt;
    if (perf.n === 60) {
      const avg = perf.t / perf.n;
      perf.n = 0;
      perf.t = 0;
      if (avg > 1 / 40) {
        if (composer) {
          composer.dispose();
          composer = null;
        } else if (pixelRatio > 1) {
          pixelRatio = Math.max(1, pixelRatio - 0.25);
          renderer.setPixelRatio(pixelRatio);
          resize();
        }
      }
    }
    ringMat.opacity += (ringGoal * 0.85 - ringMat.opacity) * 0.2;
    (ringDisc.material as THREE.MeshBasicMaterial).opacity = ringMat.opacity * 0.25;
    pools.forEach((m, i) => {
      const goal = i === hovered ? 0.62 : 0.42;
      m.opacity += (goal - m.opacity) * 0.1;
    });
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }
  const onVis = () => {
    visible = !document.hidden;
    clock.getDelta();
  };
  document.addEventListener("visibilitychange", onVis);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 72 : w / h < 1.2 ? 62 : 50;
    camera.updateProjectionMatrix();
  };
  resize();
  poseAt(0);
  frame();

  const raycaster = new THREE.Raycaster();
  const focusTarget = (i: number) => {
    const center = new THREE.Vector3();
    groups[i].getWorldPosition(center);
    const vfov = (camera.fov * Math.PI) / 180;
    const dist = (works[i].height * 0.62) / Math.tan(vfov / 2);
    return { to: center.clone().addScaledVector(new THREE.Vector3(-L.side[i], 0, 0), dist), toLook: center };
  };

  return {
    stations,
    hitFrieze: (x, y) => {
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const h = raycaster.intersectObject(frieze, false)[0];
      if (!h || !h.uv || h.distance > 9) return null;
      return Math.min(n - 1, Math.max(0, Math.floor(h.uv.x * n)));
    },
    hitShop: (x, y) => {
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const h = raycaster.intersectObjects(shopHits.concat(aboutHits), false)[0];
      return h && h.distance < 8 ? (h.object.userData.shop as string) : null;
    },
    settled: () => !focusAnim && !free.anim && !trip && Math.abs(target - current) < 0.02,
    hitSpot: (x, y) => {
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const h = raycaster.intersectObjects(
        spots.filter((s) => s.visible).map((s) => s.hit),
        false,
      )[0];
      return h ? (h.object.userData.station as number) : null;
    },
    setSpotHover: (i) => (spotHover = i),
    setProgress: (s) => {
      if (trip) return;
      target = s;
      if (free.blend > 0 && !free.anim && Math.abs(s - free.syncIdx) > 0.04) free.release = true;
    },
    floorAt: (x, y) => {
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const hitW = raycaster.intersectObjects(hitMeshes.concat(shopHits, aboutHits, [frieze]), false)[0];
      const p = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p)) return null;
      if (hitW && hitW.distance < camera.position.distanceTo(p)) return null;
      const d = p.distanceTo(camera.position);
      if (d > 16 || d < 0.8) return null;
      if (Math.abs(p.x) > HALF_W - 0.3 || p.z > Z_FRONT - 0.3 || p.z < Z_BACK + 0.3) return null;
      return p;
    },
    showRing: (p) => {
      ringGoal = p ? 1 : 0;
      if (p) {
        ring.position.x = ringDisc.position.x = p.x;
        ring.position.z = ringDisc.position.z = p.z;
      }
    },
    travelTo: (idx, onArrive) => {
      const st = stations[idx];
      if (!st) return;
      const start = camera.position.clone();
      const dest = st.pos.clone();
      const pts = [start];
      const lo = Math.min(start.z, dest.z);
      const hi = Math.max(start.z, dest.z);
      const crossing = walls.filter((w) => w > lo && w < hi && !(w === -6 && start.x > 2.4 && dest.x > 2.4)).sort((a, b) => (start.z > dest.z ? b - a : a - b));
      for (const w of crossing) {
        // the entrance wall is free-standing: only walk round it when it is really in the way
        if (w === -6) {
          const xAt = start.x + ((w - start.z) / (dest.z - start.z)) * (dest.x - start.x);
          if (xAt > 2.4) continue;
        }
        const dir = start.z > dest.z ? -1 : 1;
        pts.push(new THREE.Vector3(doorX(w), EYE, w - dir * 1.1), new THREE.Vector3(doorX(w), EYE, w + dir * 1.1));
      }
      pts.push(dest);
      const lens = pts.slice(1).map((q, k) => q.distanceTo(pts[k]));
      const total = lens.reduce((a, b) => a + b, 0);
      free.anim = null;
      free.release = false;
      frozen = null;
      const q0 = camera.quaternion.clone();
      yawOff = 0;
      pitchOff = 0;
      ptrSmooth.set(0, 0);
      pointer.set(0, 0);
      const dur = Math.min(4.2, Math.max(1.3, total / 2.1));
      trip = { pts, lens, total: Math.max(total, 1e-4), t: 0, dur, q0, q1: quats[idx].clone(), idx, done: () => onArrive(idx) };
    },
    walkTo: (p0, onArrive) => {
      const start = camera.position.clone();
      const dest = clampRoom(p0.clone());
      dest.y = EYE;
      // pass through doorways when the destination is in another room
      const pts = [start];
      const lo = Math.min(start.z, dest.z);
      const hi = Math.max(start.z, dest.z);
      const crossing = walls.filter((w) => w > lo && w < hi).sort((a, b) => (start.z > dest.z ? b - a : a - b));
      for (const w of crossing) {
        const dir = start.z > dest.z ? -1 : 1;
        pts.push(new THREE.Vector3(doorX(w), EYE, w - dir * 1.2), new THREE.Vector3(doorX(w), EYE, w + dir * 1.2));
      }
      pts.push(dest);
      const lens = pts.slice(1).map((q, k) => q.distanceTo(pts[k]));
      const total = lens.reduce((a, b) => a + b, 0);
      if (total < 0.3) return;
      // start from exactly what the visitor sees, then hand over to the free pose
      free.pos.copy(camera.position);
      free.quat.copy(camera.quaternion);
      const yaw0 = yawOf(camera.quaternion);
      const last = pts[pts.length - 1].clone().sub(pts[pts.length - 2]);
      const yaw1 = Math.atan2(-last.x, -last.z);
      yawOff = 0;
      pitchOff = 0;
      free.blend = 1;
      free.release = false;
      free.anim = {
        pts,
        seg: 0,
        t: 0,
        lens,
        total,
        yaw0,
        yaw1,
        done: () => {
          let best = 0;
          let bd = Infinity;
          stations.forEach((st, k) => {
            const dd = st.pos.distanceTo(dest) + (st.walk ? 1.5 : 0);
            if (dd < bd) {
              bd = dd;
              best = k;
            }
          });
          free.syncIdx = best;
          target = current = best;
          vel = 0;
          onArrive(best);
        },
      };
    },
    lookAround: (dx, dy) => {
      yawOff -= dx * (narrow ? 0.006 : 0.004);
      pitchOff = Math.max(-0.5, Math.min(0.45, pitchOff - dy * 0.003));
    },
    nearest: () => Math.round(current),
    jump: (s) => {
      frozen = null;
      target = current = s;
      vel = 0;
    },
    focusPose: (i, t) => {
      const st = stations.findIndex((x) => x.art === i);
      poseAt(st);
      target = current = st;
      const { to, toLook } = focusTarget(i);
      const e = ease(t);
      frozen = { p: pos.clone().lerp(to, e), l: look.clone().lerp(toLook, e) };
    },
    setPointer: (x, y) => pointer.set(x, y),
    hit: (x, y) => {
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const h = raycaster.intersectObjects(hitMeshes, false)[0];
      return h && h.distance < 14 ? (h.object.userData.index as number) : null;
    },
    setHover: (i) => (hovered = i),
    focus: (i, onDone) => {
      const { to, toLook } = focusTarget(i);
      free.blend = 0;
      free.anim = null;
      focusAnim = { from: camera.position.clone(), fromLook: look.clone(), to, toLook, t0: performance.now(), done: onDone };
    },
    resize,
    dispose: () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
