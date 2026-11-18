import * as THREE from "three";
import type { Artwork } from "@/content/museum";

/**
 * The museum in WebGL: one long, bright gallery.
 * A subjective camera walks from station to station as the visitor scrolls.
 */

const WALL = 0xf1eee9;
const EYE = 1.62;
const HALF_W = 6; // gallery is 12 m wide
const H = 4.6; // ceiling height
const Z_FRONT = 10;
const Z_BACK = -46;

export type Station = { pos: THREE.Vector3; look: THREE.Vector3; label: string; art?: number };

type Museum = {
  stations: Station[];
  /** set the walk position immediately (used to film the prototype) */
  jump: (s: number) => void;
  /** pose the camera part-way into a work, t in [0,1] (used to film the prototype) */
  focusPose: (i: number, t: number) => void;
  setProgress: (s: number) => void;
  setPointer: (x: number, y: number) => void;
  hit: (x: number, y: number) => number | null;
  setHover: (i: number | null) => void;
  focus: (i: number, onDone: () => void) => void;
  resize: () => void;
  dispose: () => void;
};

/* ───────── canvas textures ───────── */

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, srgb = true) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c);
  const t = new THREE.CanvasTexture(cv);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Draws text with manual letter-spacing (canvas letterSpacing is not supported everywhere). */
function spaced(c: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: "left" | "center" = "left") {
  const widths = Array.from(text).map((ch) => c.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1);
  let cx = align === "center" ? x - total / 2 : x;
  Array.from(text).forEach((ch, i) => {
    c.fillText(ch, cx, y);
    cx += widths[i] + spacing;
  });
}

const SANS = '"Instrument Sans", Helvetica, Arial, sans-serif';

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
    // slab joints
    c.strokeStyle = "rgba(120,110,100,0.35)";
    c.lineWidth = 2;
    c.strokeRect(1, 1, 1022, 1022);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 19);
  return t;
}

function gradientTex(stops: [number, string][], vertical = true) {
  return canvasTex(vertical ? 4 : 256, vertical ? 256 : 4, (c) => {
    const g = vertical ? c.createLinearGradient(0, 0, 0, 256) : c.createLinearGradient(0, 0, 256, 0);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });
}

/** Wall wash of a ceiling spot: brightest just above the work, fading softly downwards. */
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

/** Soft rectangular drop shadow (shadowBlur works in every browser, unlike ctx.filter). */
const shadowTex = () =>
  canvasTex(256, 256, (c) => {
    c.shadowColor = "rgba(30,22,15,0.55)";
    c.shadowBlur = 34;
    c.shadowOffsetX = 1000;
    c.fillStyle = "#000";
    c.fillRect(48 - 1000, 48, 160, 160);
  });

function cartelTex(a: Artwork) {
  return canvasTex(720, 440, (c) => {
    c.fillStyle = "#fbfaf7";
    c.fillRect(0, 0, 720, 440);
    c.fillStyle = "#8a8178";
    c.font = `500 26px ${SANS}`;
    spaced(c, a.n, 48, 86, 4);
    c.fillStyle = "#1f1b18";
    c.font = `500 40px ${SANS}`;
    wrap(c, a.title, 48, 150, 620, 48);
    c.fillStyle = "#5f574f";
    c.font = `400 25px ${SANS}`;
    c.fillText(a.line, 48, 300);
    c.fillText(a.role, 48, 340);
  });
}

function wrap(c: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (c.measureText(test).width > max && line) {
      c.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = test;
  }
  c.fillText(line, x, y);
}

/* ───────── scene ───────── */

export function createMuseum(
  canvas: HTMLCanvasElement,
  { artworks, name, line, room }: { artworks: Artwork[]; name: string; line: string; room: string },
): Museum {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(WALL);
  scene.fog = new THREE.Fog(WALL, 14, 44);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd6cfc3, 2.4));
  const sun = new THREE.DirectionalLight(0xfff4e6, 0.7);
  sun.position.set(3, 10, 6);
  scene.add(sun);

  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  const wallMat = keep(new THREE.MeshStandardMaterial({ color: WALL, roughness: 0.95 }));
  const len = Z_FRONT - Z_BACK;
  const midZ = (Z_FRONT + Z_BACK) / 2;

  // floor
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(HALF_W * 2, len)), keep(new THREE.MeshStandardMaterial({ map: keep(concreteTexture()), roughness: 0.9 })));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = midZ;
  scene.add(floor);

  // ceiling with two long light slots
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

  // walls
  const wallGeo = keep(new THREE.PlaneGeometry(len, H));
  for (const side of [-1, 1] as const) {
    const w = new THREE.Mesh(wallGeo, wallMat);
    w.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
    w.position.set(side * HALF_W, H / 2, midZ);
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

  // ambient-occlusion strips where walls meet floor and ceiling (cheap, but grounds the architecture)
  const aoFloor = keep(new THREE.MeshBasicMaterial({ map: keep(gradientTex([[0, "rgba(40,30,20,0)"], [1, "rgba(40,30,20,0.22)"]])), transparent: true, depthWrite: false }));
  const aoCeil = keep(new THREE.MeshBasicMaterial({ map: keep(gradientTex([[0, "rgba(40,30,20,0.12)"], [1, "rgba(40,30,20,0)"]])), transparent: true, depthWrite: false }));
  const stripGeo = keep(new THREE.PlaneGeometry(len, 0.7));
  for (const side of [-1, 1] as const) {
    for (const [mat, y] of [
      [aoFloor, 0.35],
      [aoCeil, H - 0.35],
    ] as const) {
      const s = new THREE.Mesh(stripGeo, mat);
      s.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
      s.position.set(side * (HALF_W - 0.005), y, midZ);
      scene.add(s);
    }
  }

  // entrance partition with the name in vinyl lettering
  const partW = 7.6;
  const part = new THREE.Mesh(keep(new THREE.BoxGeometry(partW, 4.0, 0.3)), wallMat);
  part.position.set(-1.6, 2.0, -6);
  scene.add(part);
  const nameTex = keep(
    canvasTex(4096, 1400, (c) => {
      c.fillStyle = "#1c1916";
      c.font = `500 210px ${SANS}`;
      spaced(c, name, 2048, 700, 70, "center");
      c.fillStyle = "#6b6259";
      c.font = `400 84px ${SANS}`;
      spaced(c, line, 2048, 900, 6, "center");
      c.font = `500 58px ${SANS}`;
      spaced(c, room.toUpperCase(), 2048, 300, 18, "center");
    }),
  );
  const nameMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(partW - 0.6, (partW - 0.6) * (1400 / 4096))), keep(new THREE.MeshBasicMaterial({ map: nameTex, transparent: true, toneMapped: false })));
  nameMesh.position.set(-1.6, 2.15, -5.84);
  scene.add(nameMesh);
  const partAo = new THREE.Mesh(keep(new THREE.PlaneGeometry(partW, 0.6)), aoFloor);
  partAo.position.set(-1.6, 0.3, -5.845);
  scene.add(partAo);

  // wayfinding sign at the back
  const signTex = keep(
    canvasTex(2048, 600, (c) => {
      c.fillStyle = "#1c1916";
      c.font = `500 92px ${SANS}`;
      spaced(c, "GALERIE 03", 1024, 250, 26, "center");
      c.fillStyle = "#6b6259";
      c.font = `400 70px ${SANS}`;
      spaced(c, "Parcours  →", 1024, 400, 6, "center");
    }),
  );
  const sign = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.4, 1)), keep(new THREE.MeshBasicMaterial({ map: signTex, transparent: true, toneMapped: false })));
  sign.position.set(-2.6, 2.4, Z_BACK + 0.01);
  scene.add(sign);
  const doorTex = keep(
    canvasTex(256, 512, (c) => {
      const g = c.createLinearGradient(0, 0, 0, 512);
      g.addColorStop(0, "#e2ddd5");
      g.addColorStop(0.55, "#f8f6f1");
      g.addColorStop(1, "#d6d0c6");
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 512);
      const s2 = c.createLinearGradient(0, 0, 256, 0);
      s2.addColorStop(0, "rgba(60,50,40,0.18)");
      s2.addColorStop(0.18, "rgba(60,50,40,0)");
      s2.addColorStop(0.82, "rgba(60,50,40,0)");
      s2.addColorStop(1, "rgba(60,50,40,0.18)");
      c.fillStyle = s2;
      c.fillRect(0, 0, 256, 512);
    }),
  );
  const door = new THREE.Mesh(keep(new THREE.PlaneGeometry(2.4, 3.3)), keep(new THREE.MeshBasicMaterial({ map: doorTex, toneMapped: false })));
  door.position.set(2.2, 1.65, Z_BACK + 0.01);
  scene.add(door);

  const room2Tex = keep(
    canvasTex(2048, 400, (c) => {
      c.fillStyle = "#1c1916";
      c.font = `500 84px ${SANS}`;
      spaced(c, "GALERIE 02", 40, 160, 24);
      c.fillStyle = "#6b6259";
      c.font = `400 64px ${SANS}`;
      spaced(c, "Œuvres choisies", 40, 290, 4);
    }),
  );
  const room2 = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.2, 0.62)), keep(new THREE.MeshBasicMaterial({ map: room2Tex, transparent: true, toneMapped: false })));
  room2.rotation.y = -Math.PI / 2;
  room2.position.set(HALF_W - 0.01, 2.6, -9.5);
  scene.add(room2);

  /* ───────── artworks ───────── */

  const loader = new THREE.TextureLoader();
  const shadowMap = keep(shadowTex());
  const poolMap = keep(wash());
  const hitMeshes: THREE.Object3D[] = [];
  const pools: THREE.MeshBasicMaterial[] = [];
  const groups: THREE.Group[] = [];
  const videos: HTMLVideoElement[] = [];

  artworks.forEach((a, i) => {
    const g = new THREE.Group();
    g.position.set(a.side * (HALF_W - 0.02), EYE + 0.08, a.z);
    g.rotation.y = a.side === -1 ? Math.PI / 2 : -Math.PI / 2;

    const imgH = a.height;
    const imgW = imgH * a.ratio;
    const mat = a.kind === "photo" ? 0.2 : 0;
    const border = a.kind === "photo" ? 0.045 : a.kind === "poster" ? 0.022 : 0.05;
    const W = imgW + 2 * (mat + border);
    const Hh = imgH + 2 * (mat + border);

    // light pool on the wall + soft drop shadow
    const poolMat = keep(new THREE.MeshBasicMaterial({ map: poolMap, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending }));
    pools.push(poolMat);
    const pool = new THREE.Mesh(keep(new THREE.PlaneGeometry(W * 2.2, Hh * 2.3)), poolMat);
    pool.position.set(0, 0.45, 0.002);
    g.add(pool);
    const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(W * 1.45, Hh * 1.45)), keep(new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.55, depthWrite: false })));
    shadow.position.set(0.04, -0.09, 0.004);
    g.add(shadow);

    const frame = new THREE.Mesh(keep(new THREE.BoxGeometry(W, Hh, 0.045)), keep(new THREE.MeshStandardMaterial({ color: a.kind === "photo" ? 0x2b2622 : 0x141312, roughness: 0.55 })));
    frame.position.z = 0.0225;
    g.add(frame);
    hitMeshes.push(frame);
    frame.userData.index = i;

    if (mat > 0) {
      const passe = new THREE.Mesh(keep(new THREE.PlaneGeometry(imgW + 2 * mat, imgH + 2 * mat)), keep(new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 1 })));
      passe.position.z = 0.046;
      g.add(passe);
    }

    let map: THREE.Texture;
    if (a.kind === "screen") {
      const v = document.createElement("video");
      v.src = a.src;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.crossOrigin = "anonymous";
      v.preload = "auto";
      videos.push(v);
      map = keep(new THREE.VideoTexture(v));
    } else {
      map = keep(loader.load(a.src));
    }
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    const art = new THREE.Mesh(keep(new THREE.PlaneGeometry(imgW, imgH)), keep(new THREE.MeshBasicMaterial({ map, toneMapped: false })));
    art.position.z = 0.048;
    art.userData.index = i;
    g.add(art);
    hitMeshes.push(art);

    // cartel
    const cartel = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.42, 0.257)), keep(new THREE.MeshBasicMaterial({ map: keep(cartelTex(a)), toneMapped: false })));
    cartel.position.set(W / 2 + 0.5, -Hh / 2 + 0.2, 0.006);
    g.add(cartel);
    hitMeshes.push(cartel);
    cartel.userData.index = i;

    scene.add(g);
    groups.push(g);
  });

  /* ───────── the walk ───────── */

  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const stations: Station[] = [
    { pos: v3(0.6, EYE, 8.5), look: v3(-1.4, 1.95, -6), label: "Entrée" },
    { pos: v3(-1.2, EYE, 1.6), look: v3(-1.5, 2.05, -6), label: "Entrée" },
    { pos: v3(4.0, EYE, -5.2), look: v3(3.0, EYE, -16), label: "Galerie 02" },
  ];
  artworks.forEach((a, i) => {
    const d = 4.9;
    stations.push({
      pos: v3(a.side * (HALF_W - d), EYE, a.z + 0.2),
      look: v3(a.side * HALF_W, EYE - 0.02, a.z + (a.side === -1 ? -0.45 : 0.45)),
      label: a.title,
      art: i,
    });
  });
  stations.push({ pos: v3(0, EYE, -39), look: v3(0, 1.9, Z_BACK), label: "Galerie 03" });

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
  function frame() {
    raf = requestAnimationFrame(frame);
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
      tmp.copy(look);
      // the visitor's head follows the pointer, very slightly
      const right = new THREE.Vector3().subVectors(look, pos).cross(camera.up).normalize();
      tmp.addScaledVector(right, ptrSmooth.x * 0.35).add(new THREE.Vector3(0, -ptrSmooth.y * 0.2, 0));
      camera.lookAt(tmp);
    }
    // gently brighten the hovered work
    pools.forEach((m, i) => {
      const goal = hovered === i ? 0.6 : 0.32;
      m.opacity += (goal - m.opacity) * 0.1;
    });
    // play videos only when close
    artworks.forEach((a, i) => {
      if (a.kind !== "screen") return;
      const v = videos[artworks.filter((x, j) => x.kind === "screen" && j < i).length];
      const near = Math.abs(camera.position.z - a.z) < 9;
      if (near && v.paused) v.play().catch(() => {});
      if (!near && !v.paused) v.pause();
    });
    renderer.render(scene, camera);
  }

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the gallery readable on narrower screens
    camera.fov = w / h < 1.2 ? 62 : 50;
    camera.updateProjectionMatrix();
  };
  resize();
  poseAt(0);
  frame();

  const raycaster = new THREE.Raycaster();
  const focusTarget = (i: number) => {
    const g = groups[i];
    const a = artworks[i];
    const center = new THREE.Vector3();
    g.getWorldPosition(center);
    const vfov = (camera.fov * Math.PI) / 180;
    const dist = (a.height * 0.62) / Math.tan(vfov / 2);
    return { to: center.clone().addScaledVector(new THREE.Vector3(-a.side, 0, 0), dist), toLook: center };
  };
  return {
    stations,
    jump: (s) => {
      frozen = null;
      target = current = s;
    },
    focusPose: (i, t) => {
      const st = stations.findIndex((x) => x.art === i);
      poseAt(st);
      const { to, toLook } = focusTarget(i);
      focusAnim = null;
      const e = ease(t);
      target = current = st;
      frozen = { p: pos.clone().lerp(to, e), l: look.clone().lerp(toLook, e) };
    },
    setProgress: (s) => (target = s),
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
      videos.forEach((v) => {
        v.pause();
        v.removeAttribute("src");
        v.load();
      });
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
