import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
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
  shop: { title: string; sub: string; items: ShopItem[] };
  works: Work[];
  entrance: { room: string; name: string; line: string };
  rooms: RoomNames;
  coulisses: { src: string; ratio: number }[];
  journey: { years: string; title: string; org: string; details: string[] }[];
  about: { portrait: { src: string; ratio: number }; quote: string; lines: string[]; skills: { title: string; text: string }[] };
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, narrow ? 1.5 : 1.75));
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
  const wallMatLong = keep(new THREE.MeshStandardMaterial({ ...pbr("plaster", len / 3.5, H / 3.5), roughness: 0.95, normalScale: new THREE.Vector2(0.35, 0.35) }));
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
  if (!narrow) {
    const mirror = new Reflector(keep(new THREE.PlaneGeometry(HALF_W * 2, len)), {
      color: 0x58544f,
      textureWidth: Math.round(window.innerWidth * 0.6),
      textureHeight: Math.round(window.innerHeight * 0.6),
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.z = midZ;
    scene.add(mirror);
    disposables.push({ dispose: () => mirror.dispose() });
  }

  const ceil = new THREE.Mesh(keep(new THREE.PlaneGeometry(HALF_W * 2, len)), keep(new THREE.MeshStandardMaterial({ ...pbr("plaster", (HALF_W * 2) / 4, len / 4), color: 0xe4e0da, roughness: 1 })));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, midZ);
  scene.add(ceil);
  const slotMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
  // lighting tracks along both walls
  const lampMatSign = keep(new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.6 }));
  const trackMat = keep(new THREE.MeshStandardMaterial({ color: 0x2c2926, roughness: 0.45, metalness: 0.2 }));
  for (const x of [-(HALF_W - 1.5), HALF_W - 1.5]) {
    const track = new THREE.Mesh(keep(new THREE.BoxGeometry(0.03, 0.022, len - 2)), trackMat);
    track.position.set(x, H - 0.015, midZ);
    scene.add(track);
  }
  const spotGeo = keep(new THREE.CylinderGeometry(0.045, 0.06, 0.2, 20));
  const lensMat = keep(new THREE.MeshBasicMaterial({ color: 0xfff6e4, toneMapped: false }));
  const lensGeo = keep(new THREE.CircleGeometry(0.05, 20));
  /** a spot on the track, aimed at the wall */
  const spot = (side: -1 | 1, z: number) => {
    const g = new THREE.Group();
    g.position.set(side * (HALF_W - 1.5), H - 0.05, z);
    const arm = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6)), trackMat);
    arm.position.y = -0.06;
    g.add(arm);
    const head = new THREE.Group();
    head.position.y = -0.14;
    head.rotation.z = side * -0.85;
    const body = new THREE.Mesh(spotGeo, trackMat);
    head.add(body);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.y = -0.101;
    head.add(lens);
    g.add(head);
    scene.add(g);
  };
  const skyGeo = keep(new THREE.PlaneGeometry(1.1, 2.6));
  const skyFrameGeo = keep(new THREE.PlaneGeometry(1.34, 2.84));
  const skyFrameMat = keep(new THREE.MeshBasicMaterial({ color: 0xbdb8b0 }));
  /** recessed ceiling light panels, every few metres, kept clear of partition walls */
  const skylights = (avoid: number[], skip?: [number, number]) => {
    for (let z = Z_FRONT - 3; z > Z_BACK + 2; z -= 4.5) {
      if (avoid.some((a) => Math.abs(a - z) < 2)) continue;
      if (skip && z > skip[0] && z < skip[1]) continue;
      for (const x of [-1.5, 1.5]) {
        const f = new THREE.Mesh(skyFrameGeo, skyFrameMat);
        f.rotation.x = Math.PI / 2;
        f.position.set(x, H - 0.008, z);
        scene.add(f);
        const p = new THREE.Mesh(skyGeo, slotMat);
        p.rotation.x = Math.PI / 2;
        p.position.set(x, H - 0.012, z);
        scene.add(p);
      }
    }
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

  /* Galerie 01 — entrance */
  const partW = 7.6;
  const part = new THREE.Mesh(keep(new THREE.BoxGeometry(partW, 4.0, 0.3)), wallMat);
  part.position.set(-1.6, 2.0, -6);
  scene.add(part);
  shadowGap(partW, -1.6, -5.848, 0);
  const nameTex = keep(
    vinyl(4096, 1400, (c) => {
      c.font = `500 210px ${SANS}`;
      spaced(c, input.entrance.name, 2048, 700, 70, "center");
      c.fillStyle = "#6b6259";
      c.font = `400 84px ${SANS}`;
      spaced(c, input.entrance.line, 2048, 900, 6, "center");
      c.font = `500 58px ${SANS}`;
      spaced(c, input.entrance.room.toUpperCase(), 2048, 300, 18, "center");
    }),
  );
  const nameMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(partW - 0.6, (partW - 0.6) * (1400 / 4096))), basic(nameTex));
  nameMesh.position.set(-1.6, 2.15, -5.84);
  scene.add(nameMesh);
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
          roughness: 0.8,
          normalScale: new THREE.Vector2(0.6, 0.6),
          transparent: !narrow,
          opacity: narrow ? 1 : 0.965,
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
  // the great hall's glass roof: a long lantern of frosted panes
  const hallZ0 = -7;
  const hallZ1 = L.wallJourney + 1;
  const lanternTex = keep(
    canvasTex(512, 1024, (c) => {
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, 512, 1024);
      c.fillStyle = "#bdb6ac";
      for (let y = 0; y <= 1024; y += 128) c.fillRect(0, y - 4, 512, 8);
      c.fillRect(252, 0, 8, 1024);
      c.fillRect(0, 0, 10, 1024);
      c.fillRect(502, 0, 10, 1024);
    }),
  );
  lanternTex.wrapT = THREE.RepeatWrapping;
  lanternTex.repeat.set(1, (hallZ0 - hallZ1) / 4);
  const lantern = new THREE.Mesh(keep(new THREE.PlaneGeometry(5, hallZ0 - hallZ1)), keep(new THREE.MeshBasicMaterial({ map: lanternTex, toneMapped: false })));
  lantern.rotation.x = Math.PI / 2;
  lantern.position.set(0, H - 0.01, (hallZ0 + hallZ1) / 2);
  scene.add(lantern);
  const lanternEdge = keep(new THREE.MeshBasicMaterial({ color: 0x9d968c }));
  for (const x of [-2.6, 2.6]) {
    const e = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.2, hallZ0 - hallZ1)), lanternEdge);
    e.rotation.x = Math.PI / 2;
    e.position.set(x, H - 0.012, (hallZ0 + hallZ1) / 2);
    scene.add(e);
  }
  skylights(partitionZs.concat([-6]), [hallZ1, hallZ0]);
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
  const coulZ = L.fz1 + (cols * colStep) / 2 + 0.8;
  input.coulisses.forEach((ph, k) => {
    const col = Math.floor(k / 2);
    const row = k % 2;
    const z = coulZ + ((cols - 1) / 2 - col) * colStep;
    const h = ph.ratio < 1 ? 0.82 : 0.64;
    hang({ src: ph.src, ratio: ph.ratio, height: h, kind: "photo", side: 1, z, y: row === 0 ? 2.6 : 1.3, lit: false });
  });
  for (let col = 0; col < cols; col += 1) spot(1, coulZ + ((cols - 1) / 2 - col) * colStep);
  const coulWash = new THREE.Mesh(keep(new THREE.PlaneGeometry(cols * colStep + 1.5, H - 0.4)), keep(new THREE.MeshBasicMaterial({ map: keep(gradientTex([[0, "rgba(255,248,235,0.0)"], [0.2, "rgba(255,248,235,0.22)"], [1, "rgba(255,248,235,0)"]])), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
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
  // a low cash desk by the back wall, and a postcard spinner, for atmosphere
  const deskMat = keep(new THREE.MeshStandardMaterial({ color: 0xf2efe9, roughness: 0.8 }));
  const deskTop = keep(new THREE.MeshStandardMaterial({ color: 0xc8b192, roughness: 0.5 }));
  const lampMat = keep(new THREE.MeshStandardMaterial({ color: 0x1b1916, roughness: 0.4 }));
  const desk = new THREE.Mesh(keep(new THREE.BoxGeometry(2.2, 0.95, 0.6)), deskMat);
  desk.position.set(HALF_W - 2.2, 0.475, Z_BACK + 1.6);
  scene.add(desk);
  const deskT = new THREE.Mesh(keep(new THREE.BoxGeometry(2.3, 0.04, 0.68)), deskTop);
  deskT.position.set(HALF_W - 2.2, 0.97, Z_BACK + 1.6);
  scene.add(deskT);
  const deskShadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(2.9, 1.2)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.5, depthWrite: false })));
  deskShadow.rotation.x = -Math.PI / 2;
  deskShadow.position.set(HALF_W - 2.2, 0.008, Z_BACK + 1.6);
  scene.add(deskShadow);
  const caisseTex = keep(
    canvasTex(512, 128, (c) => {
      c.fillStyle = "#1c1916";
      c.font = `500 46px ${SANS}`;
      spaced(c, "CAISSE", 256, 82, 14, "center");
    }),
  );
  const caisse = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.9, 0.22)), basic(caisseTex));
  caisse.position.set(HALF_W - 2.2, 0.68, Z_BACK + 1.91);
  scene.add(caisse);

  // ── merchandise, like a real museum shop ──
  const merchColors = [0x7a2f35, 0xe7dccb, 0x1c1916, 0xc9a66b, 0x3a4a40, 0xf4efe6, 0xb5b0a8, 0x8c5a3c];
  const mat = (c: number, r = 0.8) => keep(new THREE.MeshStandardMaterial({ color: c, roughness: r }));
  const merchMats = merchColors.map((c) => mat(c));
  const rnd = (() => {
    let x = 7;
    return () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  })();
  /** a tall white shelving unit against a side wall, filled with books, boxes and mugs */
  const bookcase = (sd: -1 | 1, z: number, w: number) => {
    const g = new THREE.Group();
    g.position.set(sd * (HALF_W - 0.2), 0, z);
    g.rotation.y = sd === -1 ? Math.PI / 2 : -Math.PI / 2;
    const unit = mat(0xf6f3ee, 0.7);
    for (const x of [-w / 2, w / 2]) {
      const side = new THREE.Mesh(keep(new THREE.BoxGeometry(0.03, 2.3, 0.36)), unit);
      side.position.set(x, 1.15, 0);
      g.add(side);
    }
    for (let k = 0; k < 5; k++) {
      const y = 0.08 + k * 0.52;
      const shelf = new THREE.Mesh(keep(new THREE.BoxGeometry(w, 0.03, 0.36)), unit);
      shelf.position.set(0, y, 0);
      g.add(shelf);
      if (k === 4) break;
      let x = -w / 2 + 0.04;
      const kind = (k + Math.round(z)) % 3;
      while (x < w / 2 - 0.12) {
        if (kind === 2) {
          // mugs
          const mug = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 16)), merchMats[Math.floor(rnd() * 4)]);
          mug.position.set(x + 0.05, y + 0.065, 0.02);
          g.add(mug);
          x += 0.16;
        } else {
          // books, spine out
          const bw = 0.03 + rnd() * 0.05;
          const bh = 0.24 + rnd() * 0.16;
          const book = new THREE.Mesh(keep(new THREE.BoxGeometry(bw, bh, 0.24)), merchMats[Math.floor(rnd() * merchMats.length)]);
          book.position.set(x + bw / 2, y + 0.015 + bh / 2, 0);
          g.add(book);
          x += bw + 0.006;
          if (rnd() < 0.08) x += 0.12;
        }
      }
    }
    const sh = new THREE.Mesh(keep(new THREE.PlaneGeometry(w * 1.25, 0.7)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.45, depthWrite: false })));
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(0, 0.006, 0.1);
    g.add(sh);
    scene.add(g);
  };
  bookcase(-1, L.wallShop - 0.95, 1.2);
  bookcase(1, L.wallShop - 0.95, 1.2);
  bookcase(-1, Z_BACK + 1.6, 2.2);

  // central display table with piles of books, folded totes and mugs
  const tblZ = L.wallShop - 7.4;
  const tblX = 0;
  const tbl = new THREE.Mesh(keep(new THREE.BoxGeometry(2.4, 0.72, 1.1)), mat(0xf2efe9, 0.85));
  tbl.position.set(tblX, 0.36, tblZ);
  scene.add(tbl);
  const tblTop = new THREE.Mesh(keep(new THREE.BoxGeometry(2.5, 0.04, 1.2)), mat(0xc8b192, 0.5));
  tblTop.position.set(tblX, 0.74, tblZ);
  scene.add(tblTop);
  const tblSh = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.2, 1.8)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.5, depthWrite: false })));
  tblSh.rotation.x = -Math.PI / 2;
  tblSh.position.set(tblX, 0.008, tblZ);
  scene.add(tblSh);
  for (const [px, pz, nb] of [
    [-0.8, -0.25, 5],
    [-0.25, 0.2, 3],
    [0.35, -0.2, 6],
    [0.85, 0.22, 4],
  ] as const) {
    let y = 0.76;
    for (let k = 0; k < nb; k++) {
      const t = 0.03 + rnd() * 0.03;
      const book = new THREE.Mesh(keep(new THREE.BoxGeometry(0.28 + rnd() * 0.06, t, 0.36 + rnd() * 0.05)), merchMats[Math.floor(rnd() * merchMats.length)]);
      book.position.set(tblX + px + (rnd() - 0.5) * 0.02, y + t / 2, tblZ + pz);
      book.rotation.y = (rnd() - 0.5) * 0.12;
      scene.add(book);
      y += t;
    }
  }
  for (const [px, pz, c] of [
    [-0.45, -0.35, 0],
    [-0.33, -0.38, 2],
    [0.62, 0.35, 1],
  ] as const) {
    const mug = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.05, 0.05, 0.11, 16)), merchMats[c]);
    mug.position.set(tblX + px, 0.815, tblZ + pz);
    scene.add(mug);
  }

  // tote bags on a rail along the back wall
  const toteTex = (col: string, ink: string) =>
    paper0(300, 380, (c) => {
      c.strokeStyle = col;
      c.lineWidth = 12;
      c.beginPath();
      c.arc(150, 110, 70, Math.PI, 0);
      c.stroke();
      c.fillStyle = col;
      c.fillRect(30, 105, 240, 270);
      c.fillStyle = ink;
      c.font = `italic 400 64px ${SERIF}`;
      c.textAlign = "center";
      c.fillText("CS", 150, 260);
      c.font = `500 14px ${SANS}`;
      c.fillText("LE MUSÉE", 150, 300);
      c.textAlign = "left";
    });
  const rail = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.012, 0.012, 2.6, 8)), keep(new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.35, metalness: 0.8 })));
  rail.rotation.z = Math.PI / 2;
  rail.position.set(-HALF_W + 4.4, 1.85, Z_BACK + 0.12);
  scene.add(rail);
  [["#e7dccb", "#7a2f35"], ["#1c1916", "#e7dccb"], ["#e7dccb", "#1c1916"], ["#7a2f35", "#f4efe6"]].forEach(([col, ink], k) => {
    const t = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.5, 0.63)), keep(new THREE.MeshBasicMaterial({ map: toteTex(col, ink), transparent: true })));
    t.position.set(-HALF_W + 3.4 + k * 0.62, 1.85 - 0.36, Z_BACK + 0.14 + k * 0.004);
    scene.add(t);
  });

  // postcard spinner showing the works
  const spinner = new THREE.Group();
  spinner.position.set(-1.6, 0, L.wallShop - 2.0);
  const pole = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.02, 0.02, 1.7, 8)), mat(0x2b2622, 0.5));
  pole.position.y = 0.85;
  spinner.add(pole);
  const foot = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.28, 0.3, 0.03, 24)), mat(0x2b2622, 0.5));
  foot.position.y = 0.015;
  spinner.add(foot);
  const cards = works.slice(0, 8);
  for (let tier = 0; tier < 3; tier++) {
    for (let k = 0; k < 4; k++) {
      const w = cards[(tier * 4 + k) % cards.length];
      const tx = keep(loader.load(w.art.src));
      tx.colorSpace = THREE.SRGBColorSpace;
      const ch = 0.2;
      const cw = Math.min(ch * w.art.ratio, 0.3);
      const card = new THREE.Mesh(keep(new THREE.PlaneGeometry(cw, cw / w.art.ratio)), keep(new THREE.MeshBasicMaterial({ map: tx, toneMapped: false, side: THREE.DoubleSide })));
      const a = (k / 4) * Math.PI * 2 + tier * 0.4;
      card.position.set(Math.sin(a) * 0.17, 0.75 + tier * 0.32, Math.cos(a) * 0.17);
      card.rotation.y = a;
      spinner.add(card);
    }
  }
  const spSh = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.9, 0.9)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.5, depthWrite: false })));
  spSh.rotation.x = -Math.PI / 2;
  spSh.position.y = 0.006;
  spinner.add(spSh);
  scene.add(spinner);

  // the souvenirs
  const paper = paper0;
  const souvenirTex: Record<string, () => THREE.Texture> = {
    cv: () =>
      paper(600, 840, (c) => {
        c.fillStyle = "#f4efe6";
        c.fillRect(0, 0, 600, 840);
        c.fillStyle = "#7a2f35";
        c.fillRect(0, 0, 600, 16);
        c.fillStyle = "#8a8178";
        c.font = `500 26px ${SANS}`;
        spaced(c, "CURRICULUM VITAE", 300, 150, 7, "center");
        c.fillStyle = "#1c1916";
        c.font = `400 64px ${SANS}`;
        c.textAlign = "center";
        c.fillText("Clémentine", 300, 360);
        c.fillText("Sanchez", 300, 440);
        c.font = `400 26px ${SANS}`;
        c.fillStyle = "#6b6259";
        c.fillText("Marketing & communication", 300, 520);
        c.fillText("EFAP Paris · 2026 — 2027", 300, 560);
        c.textAlign = "left";
        c.fillStyle = "#1c1916";
        c.fillRect(270, 680, 60, 2);
      }),
    skills: () =>
      paper(640, 820, (c) => {
        c.strokeStyle = "#b8a98f";
        c.lineWidth = 22;
        c.beginPath();
        c.arc(320, 230, 150, Math.PI, 0);
        c.stroke();
        c.fillStyle = "#e7dccb";
        c.fillRect(60, 220, 520, 580);
        c.fillStyle = "rgba(120,100,70,0.12)";
        for (let y = 230; y < 800; y += 6) c.fillRect(60, y, 520, 1);
        c.fillStyle = "#7a2f35";
        c.font = `500 30px ${SANS}`;
        spaced(c, "COMPÉTENCES", 320, 330, 8, "center");
        c.fillStyle = "#2b2622";
        c.font = `400 26px ${SANS}`;
        c.textAlign = "center";
        ["Communication de marque", "Influence & RP", "Événementiel", "Social media", "CRM & e-mailing", "Rédaction", "Plan média"].forEach((t, k) => c.fillText(t, 320, 410 + k * 46));
        c.textAlign = "left";
      }),
    linkedin: () =>
      paper(700, 420, (c) => {
        c.fillStyle = "#fbfaf7";
        c.fillRect(0, 0, 700, 420);
        c.fillStyle = "#1c1916";
        c.font = `500 40px ${SANS}`;
        c.fillText("Clémentine Sanchez", 56, 130);
        c.fillStyle = "#6b6259";
        c.font = `400 26px ${SANS}`;
        c.fillText("Marketing & communication", 56, 180);
        c.fillStyle = "#0a66c2";
        c.fillRect(56, 270, 46, 46);
        c.fillStyle = "#fff";
        c.font = `700 30px ${SANS}`;
        c.fillText("in", 64, 304);
        c.fillStyle = "#1c1916";
        c.font = `400 26px ${SANS}`;
        c.fillText("in/clementine-sanchez", 120, 302);
      }),
    contact: () =>
      paper(720, 500, (c) => {
        c.fillStyle = "#efe6d6";
        c.fillRect(0, 0, 720, 500);
        c.strokeStyle = "rgba(90,70,50,0.35)";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(360, 250);
        c.lineTo(720, 0);
        c.stroke();
        c.beginPath();
        c.arc(360, 250, 34, 0, Math.PI * 2);
        c.fillStyle = "#7a2f35";
        c.fill();
        c.fillStyle = "#f6ece4";
        c.font = `500 26px ${SANS}`;
        c.textAlign = "center";
        c.fillText("CS", 360, 259);
        c.fillStyle = "#2b2622";
        c.font = `400 40px ${SANS}`;
        c.fillText("Écrivez-moi", 360, 400);
        c.textAlign = "left";
      }),
  };
  const shopHits: THREE.Object3D[] = [];
  const shopGroups: THREE.Group[] = [];
  const tagTex = (it: ShopItem) =>
    paper(360, 150, (c) => {
      c.fillStyle = "#fbfaf7";
      c.fillRect(0, 0, 360, 150);
      c.fillStyle = "#1c1916";
      c.font = `500 30px ${SANS}`;
      c.fillText(it.name, 20, 52);
      c.fillStyle = "#6b6259";
      c.font = `400 22px ${SANS}`;
      c.fillText(it.object, 20, 88);
      c.fillStyle = "#7a2f35";
      c.font = `500 20px ${SANS}`;
      spaced(c, "OFFERT", 20, 126, 4);
    });
  const sizes: Record<string, [number, number]> = { cv: [0.74, 1.04], portrait: [0.68, 0.9], skills: [0.86, 1.1], linkedin: [0.84, 0.5], contact: [0.92, 0.64] };
  const shelfMat = keep(new THREE.MeshStandardMaterial({ color: 0xf6f3ee, roughness: 0.7 }));
  const brass = keep(new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.35, metalness: 0.8 }));
  // left wall: the first half of the souvenirs, right wall: the rest
  const half = Math.ceil(input.shop.items.length / 2);
  const shopSpots: { side: -1 | 1; z: number }[] = [];
  const shopZ0 = L.wallShop - 2.4;
  input.shop.items.forEach((it, k) => {
    const sd: -1 | 1 = k < half ? -1 : 1;
    const idx = k < half ? k : k - half;
    const z = shopZ0 - idx * 2.05 - (sd === 1 ? 1.0 : 0);
    shopSpots.push({ side: sd, z });
    const [w, h] = sizes[it.id] ?? [0.5, 0.5];
    const g = new THREE.Group();
    g.position.set(sd * (HALF_W - 0.02), 0, z);
    g.rotation.y = sd === -1 ? Math.PI / 2 : -Math.PI / 2;
    const hanging = it.id === "skills";
    const shelfY = 1.15;
    if (hanging) {
      const hook = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8)), brass);
      hook.rotation.x = Math.PI / 2;
      hook.position.set(0, 2.3, 0.06);
      g.add(hook);
    } else {
      const shelf = new THREE.Mesh(keep(new THREE.BoxGeometry(Math.max(w + 0.3, 0.8), 0.04, 0.32)), shelfMat);
      shelf.position.set(0, shelfY, 0.16);
      g.add(shelf);
      const sShadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(Math.max(w + 0.3, 0.8) * 1.3, 0.5)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.45, depthWrite: false })));
      sShadow.position.set(0, shelfY - 0.1, 0.004);
      g.add(sShadow);
    }
    let map: THREE.Texture;
    if (it.id === "portrait") {
      map = keep(loader.load(input.about.portrait.src));
      map.colorSpace = THREE.SRGBColorSpace;
    } else map = souvenirTex[it.id]();
    const holder = new THREE.Group();
    if (hanging) {
      holder.position.set(0, 2.34 - h, 0.03);
    } else {
      holder.position.set(0, shelfY + 0.02, 0.14);
      holder.rotation.x = -0.12;
    }
    const border = it.id === "portrait" ? 0.05 : 0;
    const card = new THREE.Mesh(keep(new THREE.BoxGeometry(w + border, h + border, hanging ? 0.004 : 0.014)), keep(new THREE.MeshStandardMaterial({ color: hanging ? 0xe7dccb : 0xfbfaf7, roughness: 0.8, transparent: hanging, opacity: hanging ? 0 : 1 })));
    card.position.set(0, h / 2, 0);
    holder.add(card);
    const face = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, h)), keep(new THREE.MeshBasicMaterial({ map, transparent: hanging, toneMapped: false })));
    face.position.set(0, h / 2, 0.008);
    holder.add(face);
    g.add(holder);
    // the price tag on the wall, under the souvenir
    const tag = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.36, 0.15)), basic(tagTex(it), false));
    tag.position.set(0, hanging ? 2.34 - h - 0.25 : shelfY - 0.3, 0.004);
    g.add(tag);
    // its own light from the ceiling track
    const poolMat = keep(new THREE.MeshBasicMaterial({ map: poolMap, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }));
    const pool = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.8, H - 0.6)), poolMat);
    pool.position.set(0, (H + 0.6) / 2, 0.002);
    g.add(pool);
    spot(sd, z);
    [card, face, tag].forEach((m) => {
      m.userData.shop = it.id;
      shopHits.push(m);
    });
    scene.add(g);
  });

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
  if (narrow) {
    input.journey.forEach((_, k) => {
      const z = L.fz0 - (k + 0.5) * ENTRY_W;
      stations.push({ pos: v3(-HALF_W + 3.3, EYE, z), look: v3(-HALF_W, 1.62, z), room: "journey", frieze: true });
    });
  } else {
    const m = Math.ceil(n / 3);
    for (let i = 0; i < m; i++) {
      const z = L.fz0 - ((i + 0.5) / m) * n * ENTRY_W;
      stations.push({ pos: v3(-HALF_W + 4.4, EYE, z), look: v3(-HALF_W, 1.7, z), room: "journey", frieze: true });
    }
  }
  stations.push({ pos: v3(HALF_W - (narrow ? 6.6 : 5.6), EYE, coulZ), look: v3(HALF_W, 1.9, coulZ), room: "journey" });
  walkThrough(0, L.wallShop + 1.2, "about");
  // the shop: the whole room, then each wall of souvenirs, then the closing line
  stations.push({ pos: v3(0, EYE, L.wallShop - 0.8), look: v3(0, 2.0, Z_BACK), room: "about" });
  const leftZ = shopSpots.filter((p) => p.side === -1).map((p) => p.z);
  const rightZ = shopSpots.filter((p) => p.side === 1).map((p) => p.z);
  const mid = (a: number[]) => (Math.max(...a) + Math.min(...a)) / 2;
  const dShop = narrow ? 4.6 : 4.3;
  stations.push({ pos: v3(-HALF_W + dShop, EYE, mid(leftZ)), look: v3(-HALF_W, 1.45, mid(leftZ)), room: "about" });
  stations.push({ pos: v3(HALF_W - dShop, EYE, mid(rightZ)), look: v3(HALF_W, 1.45, mid(rightZ)), room: "exit", contact: true });
  stations.push({ pos: v3(0, EYE, Z_BACK + (narrow ? 10 : 7)), look: v3(0, 2.2, Z_BACK), room: "exit" });

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let target = 0;
  let current = 0;
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
      current += (target - current) * (1 - Math.exp(-dt * 2.4));
      poseAt(current);
      let speed = Math.min(Math.abs(target - current) * 1.2, 1);
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
      if (speed > 0.05 && !free.anim) {
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
      const h = raycaster.intersectObjects(shopHits, false)[0];
      return h && h.distance < 8 ? (h.object.userData.shop as string) : null;
    },
    settled: () => !focusAnim && !free.anim && Math.abs(target - current) < 0.02,
    setProgress: (s) => {
      target = s;
      if (free.blend > 0 && !free.anim && Math.abs(s - free.syncIdx) > 0.04) free.release = true;
    },
    floorAt: (x, y) => {
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const hitW = raycaster.intersectObjects(hitMeshes.concat(shopHits, [frieze]), false)[0];
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
    walkTo: (p0, onArrive) => {
      const start = camera.position.clone();
      start.y = EYE;
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
          onArrive(best);
        },
      };
    },
    lookAround: (dx, dy) => {
      yawOff -= dx * 0.004;
      pitchOff = Math.max(-0.5, Math.min(0.45, pitchOff - dy * 0.003));
    },
    nearest: () => Math.round(current),
    jump: (s) => {
      frozen = null;
      target = current = s;
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
