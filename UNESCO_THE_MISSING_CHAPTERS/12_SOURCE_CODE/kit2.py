"""One detailed keyframe image per sequence (v2) -> 13_AI_GENERATION_KIT/00_SEQUENCE_IMAGES/

SEQ01  classroom: book missing chapters + torn pages on the floor (supplied photo, graded, 4K)
SEQ02  the boy looks at the first page: Chapter 1 page composited into his book (hand kept in front)
SEQ03-07  Chapter 1-5 pages lying on the sunlit terracotta classroom floor, photo in colour
SEQ08  every chapter counts: the six chapters laid out in order on the sunlit floor
SEQ09  end card (campaign line + signature)
"""
import os, math
import numpy as np
import cv2
from PIL import Image, ImageDraw
from common import *
from pages import build_page, Memory, photo_print, WIN, PW, PH, CHAPTERS
import render

OUT = p("13_AI_GENERATION_KIT", "00_SEQUENCE_IMAGES")
os.makedirs(OUT, exist_ok=True)

def save(f, name):
    u8 = (np.clip(f, 0, 1) * 255 + 0.5).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT, name + "_4K.png"), cv2.cvtColor(u8, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_PNG_COMPRESSION, 6])
    small = cv2.resize(u8, (1920, 1080), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(OUT, name + "_1080p.jpg"), cv2.cvtColor(small, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 94])

def finish(f, seed=0, grain=0.014):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / math.sqrt(2)
    f = f * (1 - 0.20 * smoothstep((d - 0.4) / 0.6))[..., None]
    g = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.7)
    return np.clip(f + g[..., None] * grain, 0, 1)

# ---------------------------------------------------------------- environment
def tile_floor(seed=3, tile=430, rot=-8.0):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    a = math.radians(rot)
    u = (xx * math.cos(a) + yy * math.sin(a)) + 5000
    v = (-xx * math.sin(a) + yy * math.cos(a)) + 5000
    iu, iv = np.floor(u / tile).astype(np.int32), np.floor(v / tile).astype(np.int32)
    fu, fv = (u / tile) % 1, (v / tile) % 1
    tid = (iu * 7919 + iv * 104729) % 9973
    jit = np.random.default_rng(seed).uniform(-1, 1, (9973, 3)).astype(np.float32)
    base = np.array([171, 92, 62], np.float32) / 255
    col = base * (1 + jit[tid] * np.array([0.08, 0.10, 0.10], np.float32))
    mott = smooth_noise(H, W, 70, rng) * 0.05 + smooth_noise(H, W, 14, rng) * 0.035 + smooth_noise(H, W, 3, rng) * 0.03
    wear = np.clip(smooth_noise(H, W, 160, rng), 0, None) * 0.06
    col = col * (1 + mott - wear)[..., None] + wear[..., None] * np.array([0.10, 0.07, 0.05], np.float32)
    # grout + bevel
    e = np.minimum.reduce([fu, 1 - fu, fv, 1 - fv]) * tile
    grout = 1 - smoothstep((e - 4) / 5)
    bevel = 1 - 0.12 * (1 - smoothstep((e - 6) / 26))
    col = col * bevel[..., None]
    col = col * (1 - grout[..., None]) + np.array([0.42, 0.33, 0.27], np.float32) * grout[..., None] * (1 + mott[..., None])
    gloss = smooth_noise(H, W, 400, rng) * 0.02
    col = col + gloss[..., None]
    return np.clip(cv2.GaussianBlur(col, (0, 0), 1.3), 0, 1).astype(np.float32)

def sun_light(seed=0, angle=-35.0, period=900, duty=0.58, mullion_period=1300):
    """Sunlight through a window: bright diagonal bands broken by mullions (as in the supplied floor photo)."""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    a = math.radians(angle)
    s = xx * math.cos(a) + yy * math.sin(a)
    t = -xx * math.sin(a) + yy * math.cos(a)
    bands = smoothstep((duty / 2 - np.abs(((s / period) % 1) - 0.5)) * period / 70)
    mull = smoothstep((np.abs(((t / mullion_period) % 1) - 0.5) - 0.035) * mullion_period / 50)
    lit = cv2.GaussianBlur((bands * mull).astype(np.float32), (0, 0), 14)
    warm = np.array([1.12, 1.02, 0.88], np.float32)
    shade = np.array([0.74, 0.73, 0.78], np.float32)
    return shade + (warm - shade) * lit[..., None], lit

# ---------------------------------------------------------------- detailed page
def detailed_page(ch, photo="colour"):
    pg = build_page(ch, seed=500 + ch)
    rgb = pg["rgb"].copy()
    wx, wy, ww, wh = WIN
    lum = pg["lum"][wy:wy + wh, wx:wx + ww]
    if CHAPTERS[ch]["img"]:
        m = Memory(ch)
        ph = m.frame(0.0 if photo == "sepia" else 0.15, 0.0 if photo == "sepia" else 1.0, 2.0)
    else:  # Chapter 3: undeveloped / faded print, to be generated
        yy, xx = np.mgrid[0:wh, 0:ww].astype(np.float32)
        r = np.sqrt(((xx - ww / 2) / (ww / 2)) ** 2 + ((yy - wh / 2) / (wh / 2)) ** 2)
        ph = (np.array([0.93, 0.89, 0.80], np.float32) * (1 - 0.16 * smoothstep(r - 0.35))[..., None]).astype(np.float32)
    rgb[wy:wy + wh, wx:wx + ww] = photo_print(ph, lum, np.ones_like(lum))
    # photo-album corner mounts
    im = Image.fromarray((rgb * 255).astype(np.uint8)).convert("RGBA")
    ov = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    s = 150
    for (cx, cy, sx, sy) in ((wx, wy, 1, 1), (wx + ww, wy, -1, 1), (wx + ww, wy + wh, -1, -1), (wx, wy + wh, 1, -1)):
        o = 28
        tri = [(cx - sx * o, cy - sy * o), (cx + sx * s, cy - sy * o), (cx - sx * o, cy + sy * s)]
        d.polygon([(x + 6, y + 8) for x, y in tri], fill=(0, 0, 0, 60))
        d.polygon(tri, fill=(58, 40, 30, 235))
        d.line([tri[1], tri[2]], fill=(95, 70, 52, 255), width=4)
    ov = ov.filter(__import__("PIL.ImageFilter", fromlist=["GaussianBlur"]).GaussianBlur(1.2))
    im = Image.alpha_composite(im, ov)
    rgb = np.asarray(im.convert("RGB")).astype(np.float32) / 255
    # gentle paper undulation (curl) shading
    yy, xx = np.mgrid[0:PH, 0:PW].astype(np.float32)
    und = 1 + 0.035 * np.sin(xx / PW * math.pi * 1.3 + 0.4) * np.sin(yy / PH * math.pi * 0.9) \
        - 0.06 * smoothstep(((xx / PW) + (1 - yy / PH) - 1.55) / 0.45)
    rgb = np.clip(rgb * und[..., None], 0, 1)
    return rgb, pg["alpha"]

def place(canvas, rgb, alpha, dst_quad, shadow=True, light_offset=(46, 30)):
    Hm = cv2.getPerspectiveTransform(np.float32([(0, 0), (PW, 0), (PW, PH), (0, PH)]), np.float32(dst_quad))
    rgba = np.dstack([rgb, alpha]).astype(np.float32)
    wpd = cv2.warpPerspective(rgba, Hm, (W, H), flags=cv2.INTER_CUBIC)
    a = np.clip(wpd[..., 3], 0, 1)
    if shadow:
        soft = cv2.GaussianBlur(np.roll(np.roll(a, light_offset[1], 0), light_offset[0], 1), (0, 0), 22)
        tight = cv2.GaussianBlur(np.roll(a, 4, 0), (0, 0), 4)
        canvas = canvas * (1 - (0.45 * soft + 0.25 * tight) * (1 - a))[..., None]
    return canvas * (1 - a[..., None]) + wpd[..., :3] * a[..., None], a

def quad(cx, cy, h, rot, key=0.03):
    w = h * PW / PH
    r = math.radians(rot)
    pts = [(-w / 2 * (1 - key), -h / 2), (w / 2 * (1 - key), -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]
    return [(cx + x * math.cos(r) - y * math.sin(r), cy + x * math.sin(r) + y * math.cos(r)) for x, y in pts]

# ---------------------------------------------------------------- sequences
def seq01():
    src = upscale(grade_photo(load_rgb(p("03_ENVIRONMENT_REFERENCES/ref_pages_on_floor.png"))), W / 1672)
    save(finish(cv2.resize(src, (W, H), interpolation=cv2.INTER_AREA), 1), "SEQ01_classroom_book_missing_chapters_pages_on_floor")
    src = upscale(grade_photo(load_rgb(p("02_CHARACTER_REFERENCES/ref_boy_chapter6_book.png"))), W / 1672)
    save(finish(cv2.resize(src, (W, H), interpolation=cv2.INTER_AREA), 2), "SEQ01_ALT_boy_discovers_book_starts_at_chapter6")

def seq02():
    srcu8 = load_rgb(p("02_CHARACTER_REFERENCES/ref_boy_chapter6_book.png"))
    k = W / 1672
    base = grade_photo(srcu8)
    base = cv2.resize(upscale(base, k), (W, H), interpolation=cv2.INTER_AREA)
    # book left page quad (source px), measured on the supplied image
    q_src = np.float32([(434, 458), (958, 538), (1080, 896), (262, 902)])
    q = q_src * k
    rgb, alpha = detailed_page(1, photo="sepia")
    # page sits inside the book: hard rectangular alpha (no torn edge), keep inside quad
    alpha = np.ones_like(alpha)
    Hm = cv2.getPerspectiveTransform(np.float32([(0, 0), (PW, 0), (PW, PH), (0, PH)]), q)
    wpd = cv2.warpPerspective(np.dstack([rgb, alpha]), Hm, (W, H), flags=cv2.INTER_CUBIC)
    a = wpd[..., 3]
    a = cv2.GaussianBlur(a, (0, 0), 1.5)
    # illumination of the original page: max-filter (paper white) then blur, normalised
    lum = base.mean(axis=2)
    paper = cv2.dilate(lum, np.ones((61, 61), np.uint8))
    paper = cv2.GaussianBlur(paper, (0, 0), 40)
    shade = np.clip(paper / np.percentile(paper[a > 0.5], 95), 0.55, 1.08)
    new = wpd[..., :3] * shade[..., None] * np.array([1.0, 0.99, 0.97], np.float32)
    # keep the boy's hand (skin) in front of the page
    hsv = cv2.cvtColor(srcu8, cv2.COLOR_RGB2HSV).astype(np.float32)
    hh, ss, vv = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    skin = ((hh < 25) & (ss > 50) & (ss < 200) & (vv > 60)).astype(np.float32)
    skin[:, 520:] = 0; skin[720:, :] = 0
    skin = cv2.morphologyEx(skin, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    skin = cv2.GaussianBlur(cv2.resize(skin, (W, H), interpolation=cv2.INTER_LINEAR), (0, 0), 3)
    a = a * (1 - skin)
    out = base * (1 - a[..., None]) + new * a[..., None]
    save(finish(out, 3), "SEQ02_boy_looks_at_first_page_chapter1")

def floor_page_shot(ch, name, rot=-5.0, seed=0):
    floor = tile_floor(seed=10 + ch)
    light, lit = sun_light(angle=-35 + ch * 3, period=980 + 40 * ch)
    rgb, alpha = detailed_page(ch)
    hgt = 2200
    canvas, a = place(floor, rgb, alpha, quad(W / 2 + 40, H / 2 + 125, hgt, rot))
    out = canvas * light
    out = out * (1 + 0.04 * (lit[..., None] - 0.5))
    save(finish(out, seed + ch), name)

def seq08():
    floor = tile_floor(seed=80)
    light, lit = sun_light(angle=-32, period=1100)
    canvas = floor
    hgt = 1000
    rng = np.random.default_rng(8)
    for k, ch in enumerate(range(1, 7)):
        r, c = divmod(k, 3)
        cx = W / 2 + (c - 1) * 1060 + rng.uniform(-20, 20)
        cy = H / 2 + (r - 0.5) * 1030 + rng.uniform(-15, 15)
        rgb, alpha = detailed_page(ch)
        canvas, _ = place(canvas, rgb, alpha, quad(cx, cy, hgt, rng.uniform(-4, 4)), light_offset=(24, 16))
    save(finish(canvas * light, 80), "SEQ08_every_chapter_counts_six_chapters_in_order")

def seq09():
    bg, L1, L2 = render.end_card_layers()
    card = bg * (1 - L1[..., 3:]) + L1[..., :3] * L1[..., 3:]
    card = card * (1 - L2[..., 3:]) + L2[..., :3] * L2[..., 3:]
    save(card, "SEQ09_end_card_campaign_line_signature")

if __name__ == "__main__":
    import sys
    todo = sys.argv[1:] or ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
    names = {3: "SEQ03_chapter1_first_steps", 4: "SEQ04_chapter2_taking_care", 5: "SEQ05_chapter3_learning_to_share",
             6: "SEQ06_chapter4_discovering_the_world", 7: "SEQ07_chapter5_creating_together"}
    for s in todo:
        n = int(s)
        if n == 1: seq01()
        elif n == 2: seq02()
        elif 3 <= n <= 7: floor_page_shot(n - 2, names[n], rot=[-5, 4, -3, 5, -4][n - 3])
        elif n == 8: seq08()
        else: seq09()
        print("done", n, flush=True)
