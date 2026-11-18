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

export type Station = { pos: THREE.Vector3; look: THREE.Vector3; room: keyof RoomNames | "entrance"; art?: number; j?: number; contact?: boolean };
type RoomNames = { main: string; cabinet: string; journey: string; about: string; exit: string };

export type MuseumInput = {
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
  /** screen rectangle (px) of the contact form area on the wall, or null if off-screen */
  contactRect: () => { x: number; y: number; w: number; h: number } | null;
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
const MAIN_STEP = 9;

function layout(input: MuseumInput) {
  const main = input.works.map((w, i) => ({ w, i })).filter((x) => x.w.room === "main");
  const cab = input.works.map((w, i) => ({ w, i })).filter((x) => x.w.room === "cabinet");
  const z: number[] = [];
  const side: (-1 | 1)[] = [];
  main.forEach(({ i }, k) => {
    z[i] = MAIN_START - k * MAIN_STEP;
    side[i] = k % 2 === 0 ? -1 : 1;
  });
  const wallCab = MAIN_START - (main.length - 1) * MAIN_STEP - 6;
  cab.forEach(({ i }, k) => {
    z[i] = wallCab - 6 - k * 6;
    side[i] = k % 2 === 0 ? -1 : 1;
  });
  const wallJourney = wallCab - 6 - (cab.length - 1) * 6 - 6;
  const journeyZ = input.journey.map((_, k) => wallJourney - 6 - k * 5.5);
  const wallAbout = journeyZ[journeyZ.length - 1] - 5.5;
  const aboutZ = wallAbout - 7;
  const back = aboutZ - 16;
  return { z, side, wallCab, wallJourney, journeyZ, wallAbout, aboutZ, back };
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
  for (const x of [-0.6, 0.6]) {
    const slot = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.14, len - 4)), slotMat);
    slot.rotation.x = Math.PI / 2;
    slot.position.set(x, H - 0.01, midZ);
    scene.add(slot);
  }

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

  /** Partition wall with a central doorway, the room name painted beside the opening. */
  const OPEN = 2.1;
  function partition(z: number, label: string, sub: string) {
    const wsz = HALF_W - OPEN;
    const g = keep(new THREE.BoxGeometry(wsz, H, 0.3));
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(g, wallMat);
      p.position.set(s * (OPEN + wsz / 2), H / 2, z);
      scene.add(p);
      shadowGap(wsz, s * (OPEN + wsz / 2), z + 0.152, 0);
      const ao = new THREE.Mesh(keep(new THREE.PlaneGeometry(wsz, 0.6)), aoFloor);
      ao.position.set(s * (OPEN + wsz / 2), 0.3, z + 0.155);
      scene.add(ao);
    }
    const lintel = new THREE.Mesh(keep(new THREE.BoxGeometry(OPEN * 2, H - 3.3, 0.3)), wallMat);
    lintel.position.set(0, 3.3 + (H - 3.3) / 2, z);
    scene.add(lintel);
    const tex = keep(
      vinyl(1600, 520, (c) => {
        c.font = `500 74px ${SANS}`;
        spaced(c, label.toUpperCase(), 40, 200, 20);
        c.fillStyle = "#6b6259";
        c.font = `400 56px ${SANS}`;
        c.fillText(sub, 40, 320);
      }),
    );
    const sign = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.1, 1.0)), basic(tex));
    sign.position.set(-(OPEN + wsz / 2) + 0.15, 2.3, z + 0.16);
    scene.add(sign);
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

  partition(L.wallCab, input.rooms.cabinet, "Études & projets personnels");
  const [jName, jSub] = input.rooms.journey.split(" — ");
  partition(L.wallJourney, jName, jSub);
  const [aName, aSub] = input.rooms.about.split(" — ");
  partition(L.wallAbout, aName, aSub);

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

  /* Galerie 03 — journey panels */
  input.journey.forEach((j, k) => {
    const s = k % 2 === 0 ? -1 : 1;
    const tex = keep(
      canvasTex(1000, 1400, (c) => {
        c.fillStyle = "#faf9f5";
        c.fillRect(0, 0, 1000, 1400);
        c.fillStyle = "#8a8178";
        c.font = `500 32px ${SANS}`;
        spaced(c, String(k + 1).padStart(2, "0"), 80, 120, 6);
        c.fillStyle = "#1c1916";
        c.font = `400 92px ${SANS}`;
        c.fillText(j.years, 80, 300);
        c.fillRect(80, 360, 80, 4);
        c.font = `500 50px ${SANS}`;
        let y = 470;
        y += wrap(c, j.title, 80, y, 840, 62) * 62;
        c.fillStyle = "#6b6259";
        c.font = `400 36px ${SANS}`;
        y += wrap(c, j.org, 80, y + 6, 840, 48) * 48 + 60;
        c.fillStyle = "#3a332d";
        c.font = `400 33px ${SANS}`;
        j.details.forEach((d) => {
          c.fillText("—", 80, y);
          y += wrap(c, d, 130, y, 790, 44) * 44 + 16;
        });
      }),
    );
    const g = new THREE.Group();
    g.position.set(s * (HALF_W - 0.06), EYE + 0.05, L.journeyZ[k]);
    g.rotation.y = s === -1 ? Math.PI / 2 : -Math.PI / 2;
    const panel = new THREE.Mesh(keep(new THREE.BoxGeometry(1.6, 2.24, 0.06)), [wallMat, wallMat, wallMat, wallMat, basic(tex, false), wallMat]);
    g.add(panel);
    const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(2.35, 3.25)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.35, depthWrite: false })));
    shadow.position.set(0.04, -0.08, -0.025);
    g.add(shadow);
    scene.add(g);
  });

  /* Galerie 04 — about: portrait + wall text */
  const portrait = hang({ src: input.about.portrait.src, ratio: input.about.portrait.ratio, height: 1.9, kind: "photo", side: -1, z: L.aboutZ });
  const aboutTex = keep(
    vinyl(2000, 1300, (c) => {
      c.font = `400 104px ${SANS}`;
      wrap(c, `« ${input.about.quote} »`, 0, 200, 1900, 130);
      c.fillStyle = "#6b6259";
      c.font = `400 56px ${SANS}`;
      input.about.lines.forEach((l, i) => c.fillText(l, 0, 760 + i * 86));
    }),
  );
  const aboutText = new THREE.Mesh(keep(new THREE.PlaneGeometry(2.6, 1.69)), basic(aboutTex));
  aboutText.rotation.y = Math.PI / 2;
  aboutText.position.set(-HALF_W + 0.012, EYE + 0.1, L.aboutZ - portrait.W / 2 - 1.75);
  scene.add(aboutText);

  const skillsTex = keep(
    vinyl(2000, 1300, (c) => {
      let y = 120;
      input.about.skills.forEach((k) => {
        c.fillStyle = "#8a8178";
        c.font = `500 44px ${SANS}`;
        spaced(c, k.title.toUpperCase(), 0, y, 10);
        c.fillStyle = "#1c1916";
        c.font = `400 58px ${SANS}`;
        y += 90;
        y += wrap(c, k.text, 0, y, 1950, 76) * 76 + 90;
      });
    }),
  );
  const skillsMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.0, 1.95)), basic(skillsTex));
  skillsMesh.rotation.y = -Math.PI / 2;
  skillsMesh.position.set(HALF_W - 0.012, EYE + 0.1, L.aboutZ - 1.2);
  scene.add(skillsMesh);

  /* benches in the main gallery */
  const oak = keep(new THREE.MeshStandardMaterial({ color: 0xc2a985, roughness: 0.6 }));
  const legMat = keep(new THREE.MeshStandardMaterial({ color: 0x1b1916, roughness: 0.5 }));
  const benchShadow = keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.6, depthWrite: false }));
  const mainIdx = works.map((w, i) => (w.room === "main" ? i : -1)).filter((i) => i >= 0);
  [mainIdx[1], mainIdx[4]].filter((i) => i !== undefined).forEach((i) => {
    const b = new THREE.Group();
    b.position.set(0, 0, L.z[i]);
    const seat = new THREE.Mesh(keep(new THREE.BoxGeometry(0.5, 0.07, 1.9)), oak);
    seat.position.y = 0.44;
    b.add(seat);
    for (const dz of [-0.8, 0.8]) {
      const leg = new THREE.Mesh(keep(new THREE.BoxGeometry(0.42, 0.41, 0.05)), legMat);
      leg.position.set(0, 0.205, dz);
      b.add(leg);
    }
    const sh = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.0, 2.6)), benchShadow);
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = 0.006;
    b.add(sh);
    scene.add(b);
  });

  /* Galerie 04 — contact wall (the HTML form is laid over it) */
  const contactZ = L.aboutZ - 6.8;
  const contactTex = keep(
    vinyl(2400, 1650, (c) => {
      c.font = `400 120px ${SANS}`;
      c.fillText("Écrivez-moi", 0, 130);
      c.fillStyle = "#6b6259";
      c.font = `400 54px ${SANS}`;
      c.fillText("Votre message arrive directement dans ma boîte mail.", 0, 230);
      c.strokeStyle = "rgba(28,25,22,0.18)";
      c.lineWidth = 3;
      c.strokeRect(2, 330, 2396, 1316);
      c.fillStyle = "rgba(250,249,245,0.85)";
      c.fillRect(4, 332, 2392, 1312);
    }),
  );
  const CW = 3.2;
  const CH = CW * (1650 / 2400);
  const contactMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(CW, CH)), basic(contactTex));
  contactMesh.rotation.y = -Math.PI / 2;
  contactMesh.position.set(HALF_W - 0.012, EYE + 0.05, contactZ);
  scene.add(contactMesh);
  // form area corners in world space (the light rectangle on the texture)
  const formTop = EYE + 0.05 + CH / 2 - CH * (332 / 1650);
  const formBottom = EYE + 0.05 - CH / 2;
  const formCorners = [
    new THREE.Vector3(HALF_W - 0.012, formTop, contactZ + CW / 2),
    new THREE.Vector3(HALF_W - 0.012, formTop, contactZ - CW / 2),
    new THREE.Vector3(HALF_W - 0.012, formBottom, contactZ + CW / 2),
    new THREE.Vector3(HALF_W - 0.012, formBottom, contactZ - CW / 2),
  ];
  spot(1, contactZ);

  /* Sortie — end wall */
  const exitTex = keep(
    vinyl(3600, 900, (c) => {
      c.font = `400 210px ${SANS}`;
      c.textAlign = "center";
      c.fillText(input.exit.line, 1800, 420);
      c.textAlign = "left";
      c.fillStyle = "#6b6259";
      c.font = `500 64px ${SANS}`;
      spaced(c, input.rooms.exit.toUpperCase(), 1800, 640, 20, "center");
    }),
  );
  const exitMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(8.4, 2.1)), basic(exitTex));
  exitMesh.position.set(0, 2.25, Z_BACK + 0.01);
  scene.add(exitMesh);

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
  works.forEach((w, i) => {
    if (w.room === "cabinet" && !stations.some((s) => s.room === "cabinet")) {
      stations.push({ pos: v3(0, EYE, L.wallCab + 6.5), look: v3(-2.5, 2.1, L.wallCab), room: "main" });
    }
    const wide = w.height * w.art.ratio > 1.9;
    const d = narrow ? (wide ? 5.4 : 4.3) : w.room === "cabinet" ? 4.2 : 4.9;
    stations.push({ ...facing(L.side[i], L.z[i], d, narrow ? 0.25 : 0.45), room: w.room, art: i });
  });
  stations.push({ pos: v3(0, EYE, L.wallJourney + 6.5), look: v3(-2.5, 2.1, L.wallJourney), room: "cabinet" });
  L.journeyZ.forEach((z, k) => stations.push({ ...facing(k % 2 === 0 ? -1 : 1, z, narrow ? 3.2 : 3.9, 0), room: "journey", j: k }));
  stations.push({ pos: v3(0, EYE, L.wallAbout + 6.5), look: v3(-2.5, 2.1, L.wallAbout), room: "journey" });
  if (narrow) {
    stations.push({ pos: v3(-HALF_W + 4.4, EYE, L.aboutZ), look: v3(-HALF_W, EYE + 0.05, L.aboutZ), room: "about" });
    stations.push({ pos: v3(-HALF_W + 4.7, EYE, L.aboutZ - portrait.W / 2 - 1.75), look: v3(-HALF_W, EYE + 0.05, L.aboutZ - portrait.W / 2 - 1.75), room: "about" });
  } else {
    stations.push({ pos: v3(-HALF_W + 5.2, EYE, L.aboutZ - 1.4), look: v3(-HALF_W, EYE + 0.05, L.aboutZ - 1.5), room: "about" });
  }
  stations.push({ pos: v3(narrow ? HALF_W - 4.8 : HALF_W - 5.0, EYE, L.aboutZ - 1.2), look: v3(HALF_W, EYE + 0.05, L.aboutZ - 1.2), room: "about" });
  stations.push({ pos: v3(HALF_W - (narrow ? 4.8 : 4.4), EYE, contactZ), look: v3(HALF_W, EYE + 0.05, contactZ), room: "about", contact: true });
  stations.push({ pos: v3(0, EYE, Z_BACK + (narrow ? 12.5 : 7.2)), look: v3(0, 2.0, Z_BACK), room: "exit" });

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

  function poseAt(s: number) {
    const max = stations.length - 1;
    const c = Math.min(Math.max(s, 0), max);
    const i = Math.min(Math.floor(c), max - 1);
    const f = ease(c - i);
    pos.lerpVectors(stations[i].pos, stations[i + 1].pos, f);
    look.lerpVectors(stations[i].look, stations[i + 1].look, f);
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
      current += (target - current) * (1 - Math.exp(-dt * 4.2));
      poseAt(current);
      ptrSmooth.lerp(pointer, 1 - Math.exp(-dt * 3));
      camera.position.copy(pos);
      const speed = Math.min(Math.abs(target - current) * 1.6, 1);
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

  const proj = new THREE.Vector3();
  return {
    stations,
    contactRect: () => {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const c of formCorners) {
        proj.copy(c).project(camera);
        if (proj.z > 1) return null;
        const x = ((proj.x + 1) / 2) * canvas.clientWidth;
        const y = ((1 - proj.y) / 2) * canvas.clientHeight;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
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
