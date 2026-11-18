import * as THREE from "three";
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

export type Station = { pos: THREE.Vector3; look: THREE.Vector3; room: keyof RoomNames | "entrance"; art?: number };
type RoomNames = { main: string; cabinet: string; journey: string; about: string; exit: string };

export type MuseumInput = {
  works: Work[];
  entrance: { room: string; name: string; line: string };
  rooms: RoomNames;
  journey: { years: string; title: string; org: string }[];
  about: { portrait: { src: string; ratio: number }; quote: string; lines: string[] };
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
  const back = aboutZ - 13;
  return { z, side, wallCab, wallJourney, journeyZ, wallAbout, aboutZ, back };
}

/* ───────── scene ───────── */

export function createMuseum(canvas: HTMLCanvasElement, input: MuseumInput): MuseumApi {
  const { works } = input;
  const L = layout(input);
  const Z_BACK = L.back;
  const len = Z_FRONT - Z_BACK;
  const midZ = (Z_FRONT + Z_BACK) / 2;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(WALL);
  scene.fog = new THREE.Fog(WALL, 14, 46);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 140);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd6cfc3, 2.4));
  const sun = new THREE.DirectionalLight(0xfff4e6, 0.7);
  sun.position.set(3, 10, 6);
  scene.add(sun);

  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);
  const basic = (map: THREE.Texture, transparent = true) => keep(new THREE.MeshBasicMaterial({ map, transparent, toneMapped: false }));

  const wallMat = keep(new THREE.MeshStandardMaterial({ color: WALL, roughness: 0.95 }));

  /* architecture */
  const floorTex = keep(concreteTexture());
  floorTex.repeat.set(4, len / 3);
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(HALF_W * 2, len)), keep(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 })));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = midZ;
  scene.add(floor);

  const ceil = new THREE.Mesh(keep(new THREE.PlaneGeometry(HALF_W * 2, len)), keep(new THREE.MeshBasicMaterial({ color: 0xe9e6e0 })));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, midZ);
  scene.add(ceil);
  const slotMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
  for (const x of [-3, 3]) {
    const slot = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.22, len - 4)), slotMat);
    slot.rotation.x = Math.PI / 2;
    slot.position.set(x, H - 0.01, midZ);
    scene.add(slot);
  }

  const wallGeo = keep(new THREE.PlaneGeometry(len, H));
  for (const s of [-1, 1] as const) {
    const w = new THREE.Mesh(wallGeo, wallMat);
    w.rotation.y = s === -1 ? Math.PI / 2 : -Math.PI / 2;
    w.position.set(s * HALF_W, H / 2, midZ);
    scene.add(w);
  }
  const endGeo = keep(new THREE.PlaneGeometry(HALF_W * 2, H));
  const back = new THREE.Mesh(endGeo, wallMat);
  back.position.set(0, H / 2, Z_BACK);
  scene.add(back);
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
  const poolMap = keep(wash());
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

    const poolMat = keep(new THREE.MeshBasicMaterial({ map: poolMap, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending }));
    pools.push(poolMat);
    const pool = new THREE.Mesh(keep(new THREE.PlaneGeometry(W * 2.2, Hh * 2.3)), poolMat);
    pool.position.set(0, 0.45, 0.002);
    g.add(pool);
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
      canvasTex(900, 1200, (c) => {
        c.fillStyle = "#faf9f5";
        c.fillRect(0, 0, 900, 1200);
        c.fillStyle = "#8a8178";
        c.font = `500 34px ${SANS}`;
        spaced(c, String(k + 1).padStart(2, "0"), 80, 140, 6);
        c.fillStyle = "#1c1916";
        c.font = `400 96px ${SANS}`;
        c.fillText(j.years, 80, 480);
        c.fillRect(80, 560, 80, 4);
        c.font = `500 52px ${SANS}`;
        const l = wrap(c, j.title, 80, 700, 740, 64);
        c.fillStyle = "#6b6259";
        c.font = `400 38px ${SANS}`;
        wrap(c, j.org, 80, 700 + l * 64 + 40, 740, 52);
      }),
    );
    const g = new THREE.Group();
    g.position.set(s * (HALF_W - 0.06), EYE + 0.05, L.journeyZ[k]);
    g.rotation.y = s === -1 ? Math.PI / 2 : -Math.PI / 2;
    const panel = new THREE.Mesh(keep(new THREE.BoxGeometry(1.5, 2.0, 0.06)), [wallMat, wallMat, wallMat, wallMat, basic(tex, false), wallMat]);
    g.add(panel);
    const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(2.2, 2.9)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.35, depthWrite: false })));
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

  /* Sortie — end wall */
  const exitTex = keep(
    vinyl(3600, 900, (c) => {
      c.font = `400 210px ${SANS}`;
      c.textAlign = "center";
      c.fillText(input.exit.line, 1800, 420);
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
    { pos: v3(-1.2, EYE, 1.6), look: v3(-1.5, 2.05, -6), room: "entrance" },
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
    stations.push({ ...facing(L.side[i], L.z[i], w.room === "cabinet" ? 4.2 : 4.9), room: w.room, art: i });
  });
  stations.push({ pos: v3(0, EYE, L.wallJourney + 6.5), look: v3(-2.5, 2.1, L.wallJourney), room: "cabinet" });
  L.journeyZ.forEach((z, k) => stations.push({ ...facing(k % 2 === 0 ? -1 : 1, z, 3.9, 0), room: "journey" }));
  stations.push({ pos: v3(0, EYE, L.wallAbout + 6.5), look: v3(-2.5, 2.1, L.wallAbout), room: "journey" });
  stations.push({ pos: v3(-HALF_W + 5.2, EYE, L.aboutZ - 1.4), look: v3(-HALF_W, EYE + 0.05, L.aboutZ - 1.5), room: "about" });
  stations.push({ pos: v3(0, EYE, Z_BACK + 8.2), look: v3(0, 2.0, Z_BACK), room: "exit" });

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let target = 0;
  let current = 0;
  const pointer = new THREE.Vector2();
  const ptrSmooth = new THREE.Vector2();
  let hovered: number | null = null;
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
      right.subVectors(look, pos).cross(camera.up).normalize();
      tmp.copy(look).addScaledVector(right, ptrSmooth.x * 0.35);
      tmp.y -= ptrSmooth.y * 0.2;
      camera.lookAt(tmp);
    }
    pools.forEach((m, i) => {
      const goal = i === hovered ? 0.6 : 0.32;
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
    camera.fov = w / h < 1.2 ? 62 : 50;
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
