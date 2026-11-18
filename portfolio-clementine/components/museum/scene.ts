import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Work } from "@/content/museum";

/**
 * The museum in WebGL: one long, bright building divided into rooms by partition walls.
 * A subjective camera walks from station to station as the visitor scrolls.
 */

const WALL = 0xf1eee9;
const EYE = 1.62;
const HALF_W = 6;
const H = 4.6;
const Z_FRONT = 10;
const SANS = '"Instrument Sans", Helvetica, Arial, sans-serif';

export type Station = { pos: THREE.Vector3; look: THREE.Vector3; room: keyof RoomNames | "entrance"; art?: number; frieze?: boolean; contact?: boolean; /** a point the visitor walks through without stopping */ walk?: boolean };
type RoomNames = { main: string; cabinet: string; journey: string; about: string; exit: string };

export type ShopItem = { id: string; object: string; name: string; tag: string };
export type MuseumInput = {
  shop: { title: string; sub: string; items: ShopItem[] };
  works: Work[];
  entrance: { room: string; name: string; line: string };
  rooms: RoomNames;
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

const MAIN_START = -15;
const MAIN_STEP = 6.5;
const ENTRY_W = 2.1; // width of one timeline entry on the wall (m)

function layout(input: MuseumInput) {
  const main = input.works.map((w, i) => ({ w, i })).filter((x) => x.w.room === "main");
  const cab = input.works.map((w, i) => ({ w, i })).filter((x) => x.w.room === "cabinet");
  const z: number[] = [];
  const side: (-1 | 1)[] = [];
  main.forEach(({ i }, k) => {
    z[i] = MAIN_START - k * MAIN_STEP;
    side[i] = k % 2 === 0 ? -1 : 1;
  });
  const wallCab = MAIN_START - (main.length - 1) * MAIN_STEP - 4.5;
  cab.forEach(({ i }, k) => {
    z[i] = wallCab - 4.5 - k * 5;
    side[i] = k % 2 === 0 ? -1 : 1;
  });
  const wallJourney = wallCab - 4.5 - (cab.length - 1) * 5 - 4.5;
  // Galerie 03: the timeline on the left wall
  const fz0 = wallJourney - 1.5;
  const fz1 = fz0 - input.journey.length * ENTRY_W;
  // the museum shop
  const wallShop = fz1 - 2;
  const tableZ = wallShop - 6.2;
  const back = wallShop - 9.5;
  return { z, side, wallCab, wallJourney, fz0, fz1, wallShop, tableZ, back };
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
  const plaster = keep(plasterTexture());
  const wallMat = keep(new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.92 }));
  const plasterLong = keep(plaster.clone());
  plasterLong.needsUpdate = true;
  plasterLong.repeat.set(len / 7, 1);
  const wallMatLong = keep(new THREE.MeshStandardMaterial({ map: plasterLong, roughness: 0.92 }));
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
  scene.add(floor);
  if (!narrow) {
    const mirror = new Reflector(keep(new THREE.PlaneGeometry(HALF_W * 2, len)), {
      color: 0x6c6862,
      textureWidth: Math.round(window.innerWidth * 0.6),
      textureHeight: Math.round(window.innerHeight * 0.6),
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.z = midZ;
    scene.add(mirror);
    disposables.push({ dispose: () => mirror.dispose() });
  }

  const ceil = new THREE.Mesh(keep(new THREE.PlaneGeometry(HALF_W * 2, len)), keep(new THREE.MeshBasicMaterial({ color: 0xcfcbc4 })));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, midZ);
  scene.add(ceil);
  const slotMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
  // lighting tracks along both walls
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
  const skylights = (avoid: number[]) => {
    for (let z = Z_FRONT - 3; z > Z_BACK + 2; z -= 4.5) {
      if (avoid.some((a) => Math.abs(a - z) < 2)) continue;
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

  /* the cabinet: deep green walls, oak parquet — like a historic museum cabinet */
  const green = keep(new THREE.MeshStandardMaterial({ color: 0x3a4a40, roughness: 0.9 }));
  partition(L.wallCab, { label: input.rooms.cabinet, sub: "Études & projets personnels", back: green });
  const [jName] = input.rooms.journey.split(" — ");
  partition(L.wallJourney, { label: jName, sub: "Parcours, portrait & contact", front: green });
  const cabLen = L.wallCab - L.wallJourney - 0.3;
  const cabMid = (L.wallCab + L.wallJourney) / 2;
  for (const sd of [-1, 1] as const) {
    const gw = new THREE.Mesh(keep(new THREE.PlaneGeometry(cabLen, H)), green);
    gw.rotation.y = sd === -1 ? Math.PI / 2 : -Math.PI / 2;
    gw.position.set(sd * (HALF_W - 0.004), H / 2, cabMid);
    scene.add(gw);
  }
  // main gallery cut into three rooms by walls with off-centre doorways
  const mainIdxs = works.map((w, i) => (w.room === "main" ? i : -1)).filter((i) => i >= 0);
  const roomWalls: { z: number; doorX: number }[] = [];
  [1, 3].forEach((k, r) => {
    if (mainIdxs[k + 1] === undefined) return;
    const z = (L.z[mainIdxs[k]] + L.z[mainIdxs[k + 1]]) / 2;
    const doorX = r % 2 === 0 ? 2.6 : -2.6;
    roomWalls.push({ z, doorX });
    partition(z, { doorX, half: 1.35 });
  });
  // oak parquet in the cabinet and in Galerie 03
  const parquet = keep(parquetTexture());
  const floorPiece = (z0: number, z1: number) => {
    const l = z0 - z1;
    const tex = keep(parquet.clone());
    tex.needsUpdate = true;
    tex.repeat.set(HALF_W / 1.6, l / 1.6);
    const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(HALF_W * 2, l)), keep(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.48 })));
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, 0.004, (z0 + z1) / 2);
    scene.add(m);
  };
  floorPiece(L.wallCab - 0.15, L.wallJourney + 0.15);
  floorPiece(L.wallJourney - 0.15, L.wallShop + 0.15);
  floorPiece(L.wallShop - 0.15, Z_BACK);
  partition(L.wallShop, { label: input.shop.title, sub: input.shop.sub });
  skylights(partitionZs.concat([-6]));

  /* works */
  const loader = new THREE.TextureLoader();
  const shadowMap = keep(shadowTex());
  const poolMap = keep(scallop());
  const hitMeshes: THREE.Object3D[] = [];
  const pools: THREE.MeshBasicMaterial[] = [];
  const groups: THREE.Group[] = [];

  function hang(opts: { src: string; ratio: number; height: number; kind: "photo" | "print"; side: -1 | 1; z: number; y?: number; index?: number; cartel?: THREE.Texture }) {
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
    g.add(pool);
    spot(opts.side, opts.z);
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

  /* ───────── the museum shop ───────── */
  // coloured end wall with the closing line
  const shopWall = keep(new THREE.MeshStandardMaterial({ color: 0x7a2f35, roughness: 0.9 }));
  const endPaint = new THREE.Mesh(keep(new THREE.PlaneGeometry(HALF_W * 2 - 0.01, H)), shopWall);
  endPaint.position.set(0, H / 2, Z_BACK + 0.006);
  scene.add(endPaint);
  const exitTex = keep(
    canvasTex(3600, 900, (c) => {
      c.textAlign = "center";
      c.fillStyle = "#e9d9cf";
      c.font = `500 64px ${SANS}`;
      spaced(c, input.shop.title.toUpperCase(), 1800, 170, 22, "center");
      c.textAlign = "center";
      c.fillStyle = "#f6ece4";
      c.font = `400 200px ${SANS}`;
      c.fillText(input.exit.line, 1800, 520);
      c.textAlign = "left";
    }),
  );
  const exitMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(8.6, 8.6 * (900 / 3600))), basic(exitTex));
  exitMesh.position.set(0, 2.35, Z_BACK + 0.012);
  scene.add(exitMesh);
  // side shelves with stock, for atmosphere
  const shelfMat = keep(new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 0.7 }));
  const stockColors = [0xcfc4b4, 0x7a2f35, 0x2b2622, 0xb9a07e, 0xe3d6c6, 0x3a4a40];
  for (const sd of [-1, 1] as const) {
    for (const y of [1.0, 1.55, 2.1]) {
      const shelf = new THREE.Mesh(keep(new THREE.BoxGeometry(0.34, 0.035, 4.2)), shelfMat);
      shelf.position.set(sd * (HALF_W - 0.17), y, L.tableZ + 1.2);
      scene.add(shelf);
      let z = L.tableZ + 1.2 - 1.95;
      let k = 0;
      while (z < L.tableZ + 1.2 + 1.9) {
        const w = 0.05 + ((k * 37) % 7) * 0.012;
        const h = 0.22 + ((k * 13) % 5) * 0.03;
        const book = new THREE.Mesh(keep(new THREE.BoxGeometry(0.24, h, w)), keep(new THREE.MeshStandardMaterial({ color: stockColors[(k + (y > 1.5 ? 2 : 0)) % stockColors.length], roughness: 0.8 })));
        book.position.set(sd * (HALF_W - 0.17), y + 0.018 + h / 2, z + w / 2);
        scene.add(book);
        z += w + 0.012 + (k % 6 === 5 ? 0.25 : 0);
        k++;
      }
    }
  }
  // display table
  const tableTop = keep(new THREE.MeshStandardMaterial({ color: 0xc8b192, roughness: 0.5 }));
  const tableBase = keep(new THREE.MeshStandardMaterial({ color: 0xf2efe9, roughness: 0.85 }));
  const TW = 3.6;
  const TD = 1.0;
  const TH = 0.86;
  const base = new THREE.Mesh(keep(new THREE.BoxGeometry(TW - 0.1, TH - 0.04, TD - 0.1)), tableBase);
  base.position.set(0, (TH - 0.04) / 2, L.tableZ);
  scene.add(base);
  const top = new THREE.Mesh(keep(new THREE.BoxGeometry(TW, 0.04, TD)), tableTop);
  top.position.set(0, TH - 0.02, L.tableZ);
  scene.add(top);
  const tableShadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(TW * 1.25, TD * 1.6)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.55, depthWrite: false })));
  tableShadow.rotation.x = -Math.PI / 2;
  tableShadow.position.set(0, 0.008, L.tableZ);
  scene.add(tableShadow);
  // pendant lamps above the table
  const lampMat = keep(new THREE.MeshStandardMaterial({ color: 0x1b1916, roughness: 0.4 }));
  for (const x of [-1.1, 0, 1.1]) {
    const cord = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.004, 0.004, 1.1, 6)), lampMat);
    cord.position.set(x, H - 0.55, L.tableZ);
    scene.add(cord);
    const shade = new THREE.Mesh(keep(new THREE.ConeGeometry(0.17, 0.18, 28, 1, true)), lampMat);
    shade.position.set(x, H - 1.18, L.tableZ);
    scene.add(shade);
    const bulb = new THREE.Mesh(keep(new THREE.CircleGeometry(0.15, 24)), lensMat);
    bulb.rotation.x = Math.PI / 2;
    bulb.position.set(x, H - 1.27, L.tableZ);
    scene.add(bulb);
  }
  const glow = new THREE.Mesh(keep(new THREE.PlaneGeometry(TW * 1.1, TD * 1.3)), keep(new THREE.MeshBasicMaterial({ map: keep(scallop()), transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })));
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(0, TH + 0.002, L.tableZ);
  scene.add(glow);

  // the souvenirs
  const paper = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => keep(canvasTex(w, h, draw));
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
  const sizes: Record<string, [number, number]> = { cv: [0.42, 0.59], portrait: [0.36, 0.48], skills: [0.46, 0.59], linkedin: [0.42, 0.25], contact: [0.5, 0.35] };
  const nItems = input.shop.items.length;
  input.shop.items.forEach((it, k) => {
    const [w, h] = sizes[it.id] ?? [0.4, 0.4];
    const x = -TW / 2 + 0.38 + (k * (TW - 0.76)) / Math.max(nItems - 1, 1);
    const g = new THREE.Group();
    g.position.set(x, TH, L.tableZ + 0.05);
    const tilt = new THREE.Group();
    tilt.rotation.x = -0.18;
    let map: THREE.Texture;
    if (it.id === "portrait") {
      map = keep(loader.load(input.about.portrait.src));
      map.colorSpace = THREE.SRGBColorSpace;
    } else map = souvenirTex[it.id]();
    const card = new THREE.Mesh(keep(new THREE.BoxGeometry(w + (it.id === "portrait" ? 0.04 : 0), h + (it.id === "portrait" ? 0.04 : 0), 0.012)), keep(new THREE.MeshStandardMaterial({ color: 0xfbfaf7, roughness: 0.8 })));
    card.position.set(0, h / 2 + 0.01, 0);
    tilt.add(card);
    const face = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, h)), keep(new THREE.MeshBasicMaterial({ map, transparent: it.id === "skills", toneMapped: false })));
    face.position.set(0, h / 2 + 0.01, 0.0065);
    tilt.add(face);
    g.add(tilt);
    // small easel foot
    const foot = new THREE.Mesh(keep(new THREE.BoxGeometry(w * 0.6, 0.012, 0.12)), lampMat);
    foot.position.set(0, 0.006, -0.02);
    g.add(foot);
    const sh = new THREE.Mesh(keep(new THREE.PlaneGeometry(w * 1.5, 0.35)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.5, depthWrite: false })));
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(0.02, 0.003, -0.06);
    g.add(sh);
    // price tag lying in front
    const tag = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.3, 0.125)), basic(tagTex(it), false));
    tag.rotation.x = -Math.PI / 2 + 0.35;
    tag.position.set(0, 0.012, 0.27);
    g.add(tag);
    [card, face, tag].forEach((m) => {
      m.userData.shop = it.id;
      shopHits.push(m);
    });
    scene.add(g);
    shopGroups.push(g);
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
  works.forEach((w, i) => {
    if (w.room === "cabinet" && !stations.some((s) => s.room === "cabinet")) {
      stations.push({ pos: v3(0, EYE, L.wallCab + 6.5), look: v3(-2.5, 2.1, L.wallCab), room: "main" });
      walkThrough(0, L.wallCab, "cabinet");
      prevZ = null;
    }
    if (prevZ !== null) {
      const door = roomWalls.find((r) => r.z < prevZ! && r.z > L.z[i]);
      if (door) walkThrough(door.doorX, door.z, w.room);
      else walkThrough(0, (prevZ + L.z[i]) / 2, w.room);
    }
    prevZ = L.z[i];
    const wide = w.height * w.art.ratio > 1.9;
    const d = narrow ? (wide ? 5.4 : 4.3) : w.room === "cabinet" ? 4.2 : 4.9;
    stations.push({ ...facing(L.side[i], L.z[i], d, narrow ? 0.25 : 0.45), room: w.room, art: i });
  });
  stations.push({ pos: v3(0, EYE, L.wallJourney + 6.5), look: v3(-2.5, 2.1, L.wallJourney), room: "cabinet" });
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
  walkThrough(0, L.wallShop + 1.2, "about");
  // the shop: first the whole room, then the table up close
  stations.push({ pos: v3(0, EYE, L.wallShop - 0.6), look: v3(0, 2.0, Z_BACK), room: "about" });
  stations.push({ pos: v3(0, narrow ? 1.75 : 1.5, L.tableZ + (narrow ? 3.3 : 2.2)), look: v3(0, narrow ? 0.95 : 0.82, L.tableZ - 0.05), room: "exit", contact: true });

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
      ptrSmooth.lerp(pointer, 1 - Math.exp(-dt * 3));
      camera.position.copy(pos);
      const speed = Math.min(Math.abs(target - current) * 1.2, 1);
      walkT += dt * 7.5 * speed;
      camera.position.y += Math.sin(walkT * 2) * 0.012 * speed;
      right.subVectors(look, pos).cross(camera.up).normalize();
      camera.position.addScaledVector(right, Math.sin(walkT) * 0.01 * speed);
      tmp.copy(look).addScaledVector(right, ptrSmooth.x * 0.35);
      tmp.y -= ptrSmooth.y * 0.2;
      camera.lookAt(tmp);
    }
    pools.forEach((m, i) => {
      const goal = i === hovered ? 0.62 : 0.42;
      m.opacity += (goal - m.opacity) * 0.1;
    });
    renderer.render(scene, camera);
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
    settled: () => !focusAnim && Math.abs(target - current) < 0.02,
    setProgress: (s) => (target = s),
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
