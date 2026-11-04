"""Render one sequence: python3 render.py <1-8>

Sequences 1-7 are rendered with a 0.5 s tail handle used by the 0.5 s dissolves
at assembly; sequence 8 has none. Output: 09_EDITING/sequences/seqN.mp4
"""
import sys, time, math
import numpy as np
import cv2
from PIL import Image, ImageDraw
from common import *
import pages
from pages import PageShot, build_page, Memory, photo_print, WIN, PW, PH, CHAPTERS

NOMINAL = {1: 8, 2: 7, 3: 7, 4: 7, 5: 7, 6: 7, 7: 7, 8: 10}
HANDLE = 0.5

def nframes(n):
    return int(round((NOMINAL[n] + (HANDLE if n < 8 else 0)) * FPS))

def out_path(n):
    return p("09_EDITING", "sequences", f"seq{n}.mp4")

# ---------------------------------------------------------------- still-photo shots
def photo_shot(n, img_rel, path_fn, fade_in=0.0, seed=0, dust=1.0):
    src = upscale(grade_photo(load_rgb(p(img_rel))), 2.0)
    sh, sw = src.shape[:2]
    src_u8 = (src * 255 + 0.5).astype(np.uint8)
    fin = Finisher(seed=seed)
    wr = Writer(out_path(n))
    N = nframes(n)
    for i in range(N):
        t = i / FPS
        z, cx, cy, rot = path_fn(t)
        cx, cy = clamp_center(sw, sh, z, cx * sw, cy * sh)
        dx, dy, dr = handheld(t, 1.0, seed)
        A = cam_matrix(sw, z, cx, cy, rot + dr)
        A[0, 2] += dx; A[1, 2] += dy
        f = cv2.warpAffine(src_u8, A, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT).astype(np.float32) / 255
        if fade_in and t < fade_in:
            f *= smoothstep(t / fade_in)
        wr.write(fin.apply(f, i, t, dust))
    return wr.close()

def seq1():
    # The incomplete book: slow dolly-in towards the torn stubs before Chapter 6.
    def path(t):
        m = ease_io(t / 8.5)
        return lerp(1.04, 1.20, m), lerp(0.50, 0.56, m), lerp(0.50, 0.58, m), lerp(0.0, -0.4, m)
    return photo_shot(1, "02_CHARACTER_REFERENCES/ref_boy_chapter6_book.png", path, fade_in=1.2, seed=11)

def seq2():
    # The discovery: from the boy at his desk, glide down to the scattered pages, push into Chapter 1.
    def path(t):
        m = ease_io(max(0.0, t - 0.6) / 6.9)
        return lerp(1.04, 2.15, m ** 1.4), lerp(0.66, 0.255, m), lerp(0.62, 0.27, m), lerp(0.3, -0.6, m)
    return photo_shot(2, "03_ENVIRONMENT_REFERENCES/ref_pages_on_floor.png", path, seed=12)

# ---------------------------------------------------------------- living-photograph pages
def page_seq(n, ch):
    shot = PageShot(ch)
    fin = Finisher(seed=20 + ch, dust=40)
    wx, wy, ww, wh = WIN
    def pc(x, y):
        c = np.array([x, y, 1.0]) @ shot.Hp.T
        return c[0] / c[2], c[1] / c[2]
    end_c = pc(wx + ww / 2, wy + wh / 2 - 30)
    wr = Writer(out_path(n))
    T = NOMINAL[n] + HANDLE
    t_alive, d_alive = 1.3, 1.0
    for i in range(nframes(n)):
        t = i / FPS
        m = ease_io(max(0.0, t - 0.35) / (T - 0.35))
        z = lerp(1.0, 2.55, m)
        cx, cy = lerp(shot.page_c[0], end_c[0], smoothstep(m * 1.15)), lerp(shot.page_c[1], end_c[1], smoothstep(m * 1.15))
        dx, dy, dr = handheld(t, 0.8, ch)
        alive = smoothstep((t - t_alive) / d_alive)
        u = max(0.0, t - t_alive) / (T - t_alive)
        f = shot.render(z, cx + dx, cy + dy, lerp(0, -0.7, m) + dr, u, alive, t)
        wr.write(fin.apply(f, i, t, 0.5))
    return wr.close()

# ---------------------------------------------------------------- every chapter counts
def flat_page_rgba(ch, scale):
    pg = build_page(ch, seed=300 + ch)
    wx, wy, ww, wh = WIN
    mem = Memory(ch)
    lum = pg["lum"][wy:wy + wh, wx:wx + ww]
    photo = photo_print(mem.frame(1.0, 1.0, 3.0), lum, np.ones_like(lum))
    rgb = pg["rgb"].copy()
    rgb[wy:wy + wh, wx:wx + ww] = photo
    rgba = np.dstack([rgb, pg["alpha"]])
    return cv2.resize(rgba, (int(PW * scale), int(PH * scale)), interpolation=cv2.INTER_AREA)

def end_card_layers():
    rng = np.random.default_rng(5)
    bg, _ = paper_texture(H, W, 77, base=(242, 235, 218))
    bg = np.clip(bg * 1.01, 0, 1)
    ink = (31, 42, 58)
    blue = hex2rgb(PALETTE["blue"])
    def layer():
        return Image.new("RGBA", (W, H), (0, 0, 0, 0))
    def centered(d, y, parts):
        total = sum(d.textlength(t, font=f) for t, f, c in parts)
        x = (W - total) / 2
        for t, f, c in parts:
            d.text((x, y), t, font=f, fill=c)
            x += d.textlength(t, font=f)
    f_line = font(300, 150)
    L1 = layer(); d = ImageDraw.Draw(L1)
    centered(d, 560, [("Just because we don’t count those years", f_line, ink + (255,))])
    centered(d, 760, [("doesn’t mean they ", f_line, ink + (255,)), ("don’t count.", font(600, 150), blue + (255,))])
    L2 = layer(); d = ImageDraw.Draw(L2)
    cols = [CHAPTERS[c]["color"] for c in (1, 2, 3, 4, 5)]
    bw, bh, gap = 130, 12, 14
    x0 = (W - (5 * bw + 4 * gap)) / 2
    for k, c in enumerate(cols):
        d.rounded_rectangle([x0 + k * (bw + gap), 1290, x0 + k * (bw + gap) + bw, 1290 + bh], radius=6, fill=hex2rgb(c) + (255,))
    word = "THE YEARS WE DON’T COUNT."
    fs = font(600, 86)
    widths = [d.textlength(c, font=fs) for c in word]
    tr = 10
    x = (W - (sum(widths) + tr * (len(word) - 1))) / 2
    for c, wdt in zip(word, widths):
        d.text((x, 1360), c, font=fs, fill=ink + (255,)); x += wdt + tr
    centered(d, 1500, [("Education Starts Early", font(600, 104), blue + (255,))])
    centered(d, 1930, [("A student creative proposal  ·  UNESCO × EFAP Sprint Days 2026", font(400, 46), (110, 104, 96, 255))])
    to_f = lambda im: np.asarray(im).astype(np.float32) / 255.0
    return bg.astype(np.float32), to_f(L1), to_f(L2)

def seq8():
    S = 2.5
    CW, CHh = int(W * S), int(H * S)
    wood, light = wood_texture(CHh, CW, 88, blur=11)
    canvas = wood
    del wood
    rng = np.random.default_rng(8)
    sc, spacing = 0.6, 1470
    centers = []
    for k, ch in enumerate(range(1, 7)):
        rgba = flat_page_rgba(ch, sc)
        ph, pw = rgba.shape[:2]
        cx = CW / 2 + (k - 2.5) * spacing
        cy = CHh / 2 + (40 if k % 2 else -40) + rng.uniform(-20, 20)
        ang = rng.uniform(-2.6, 2.6)
        # work inside a padded region of interest only (memory-safe)
        pad = 260
        x0, y0 = int(cx - pw / 2 - pad), int(cy - ph / 2 - pad)
        rw, rh = pw + 2 * pad, ph + 2 * pad
        M = cv2.getRotationMatrix2D((pw / 2, ph / 2), ang, 1.0)
        M[0, 2] += pad; M[1, 2] += pad
        warped = cv2.warpAffine(rgba, M, (rw, rh), flags=cv2.INTER_LINEAR)
        a = warped[..., 3]
        shadow = cv2.GaussianBlur(np.roll(np.roll(a, 34, 0), 22, 1), (0, 0), 28)
        roi = canvas[y0:y0 + rh, x0:x0 + rw]
        roi *= (1 - 0.4 * shadow)[..., None]
        lit = warped[..., :3] * light[y0:y0 + rh, x0:x0 + rw, None] ** 0.5
        canvas[y0:y0 + rh, x0:x0 + rw] = roi * (1 - a[..., None]) + lit * a[..., None]
        del warped, rgba, lit, shadow
        centers.append((cx, cy))
    canvas_u8 = (np.clip(canvas, 0, 1) * 255 + 0.5).astype(np.uint8)
    del canvas, light
    bg, L1, L2 = end_card_layers()
    fin = Finisher(seed=88, dust=30)
    wr = Writer(out_path(8))
    p1 = centers[0]
    for i in range(nframes(8)):
        t = i / FPS
        if t < 4.3:
            m = ease_io(t / 4.2)
            z = lerp(2.7, 1.02, m)
            cx, cy = lerp(p1[0], CW / 2, smoothstep(m * 1.2)), lerp(p1[1], CHh / 2, m)
            dx, dy, dr = handheld(t, 0.8, 8)
            A = cam_matrix(CW, z, cx, cy, lerp(-0.6, 0.0, m) + dr)
            A[0, 2] += dx; A[1, 2] += dy
            shot = cv2.warpAffine(canvas_u8, A, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32) / 255
        x = smoothstep((t - 3.6) / 0.7)                          # dissolve to end card
        a1 = smoothstep((t - 4.4) / 0.8)
        a2 = smoothstep((t - 6.9) / 0.7)
        card = bg
        card = card * (1 - L1[..., 3:] * a1) + L1[..., :3] * L1[..., 3:] * a1
        card = card * (1 - L2[..., 3:] * a2) + L2[..., :3] * L2[..., 3:] * a2
        f = shot * (1 - x) + card * x if x < 1 else card
        f = f * (1 - smoothstep((t - 9.65) / 0.35))              # final fade
        wr.write(fin.apply(f.astype(np.float32), i, t, 0.6 * (1 - x)))
    return wr.close()

if __name__ == "__main__":
    n = int(sys.argv[1])
    t0 = time.time()
    if n == 1: k = seq1()
    elif n == 2: k = seq2()
    elif 3 <= n <= 7: k = page_seq(n, n - 2)
    else: k = seq8()
    print(f"seq{n}: {k} frames (expected {nframes(n)}) in {time.time() - t0:.0f}s", flush=True)
