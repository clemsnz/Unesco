"""Physical page templates and the living-photograph compositor."""
import math
import numpy as np
import cv2
from PIL import Image, ImageDraw
from common import *

PW, PH = 2250, 3000                       # flat page size (px)
WIN = (170, 640, 1910, 1074)              # photo window x, y, w, h (16:9)

CHAPTERS = {
    1: dict(color=PALETTE["darkgreen"], title="First Steps", age="AGE 1",
            caption="He fell. He got up. He tried again.", img="05_MEMORY_ASSETS/mem_ch1_first_steps.png",
            kb=((0.50, 0.42, 1.00), (0.45, 0.38, 1.10))),
    2: dict(color=PALETTE["darkblue"], title="Taking Care", age="AGE 2",
            caption="Soap, water, and a song to count to twenty.", img="05_MEMORY_ASSETS/mem_ch2_taking_care.png",
            kb=((0.50, 0.45, 1.00), (0.42, 0.42, 1.10))),
    3: dict(color=PALETTE["magenta"], title="Learning to Share", age="AGE 3",
            caption="Two brushes, one pot of paint, a first idea of fairness.",
            img="05_MEMORY_ASSETS/mem_ch5_creating_together.png", crop=(250, 435, 1150, 941),
            kb=((0.50, 0.50, 1.00), (0.52, 0.55, 1.08))),
    4: dict(color=PALETTE["orange"], title="Discovering the World", age="AGE 4",
            caption="Every leaf was a question.", img="05_MEMORY_ASSETS/mem_ch4_discovering_world.png",
            kb=((0.50, 0.48, 1.00), (0.44, 0.52, 1.12))),
    5: dict(color=PALETTE["purple"], title="Creating Together", age="AGE 5",
            caption="Two brushes, one sun, a whole world of colour.", img="05_MEMORY_ASSETS/mem_ch5_creating_together.png",
            kb=((0.50, 0.50, 1.00), (0.52, 0.56, 1.10))),
    6: dict(color=PALETTE["blue"], title="My First Day at School", age="AGE 6",
            caption="He was ready. He had been learning for years.", img="03_ENVIRONMENT_REFERENCES/ref_classroom_raised_hand.png",
            kb=((0.5, 0.5, 1.0), (0.5, 0.5, 1.0))),
}

def page_alpha(seed):
    """Alpha with a torn left (binding) edge and lightly worn other edges + light torn rim."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:PH, 0:PW].astype(np.float32)
    left = 34 + fractal_1d(PH, rng)                                    # torn edge
    right = PW - 14 + fractal_1d(PH, rng, ((300, 3), (20, 1.2), (4, 0.6)))
    top = 14 + fractal_1d(PW, rng, ((300, 3), (20, 1.2), (4, 0.6)))
    bot = PH - 14 + fractal_1d(PW, rng, ((300, 3), (20, 1.2), (4, 0.6)))
    dl = xx - left[:, None]
    d = np.minimum.reduce([dl, right[:, None] - xx, yy - top[None, :], bot[None, :] - yy])
    alpha = np.clip(d + 0.5, 0, 1)
    rim = np.clip(1 - dl / 9.0, 0, 1) * (dl > 0) * (0.6 + 0.4 * np.abs(smooth_noise(PH, PW, 3, rng)).clip(0, 1))
    edge_age = smoothstep(1 - np.clip(d / 140, 0, 1))
    return alpha.astype(np.float32), rim.astype(np.float32), edge_age.astype(np.float32)

def _swoosh(draw, x0, x1, y, tmax, color, s):
    pts_top, pts_bot = [], []
    for i in range(121):
        u = i / 120
        x = x0 + (x1 - x0) * u
        yc = y - 40 * s * math.sin(math.pi * u * 0.85) + 14 * s * u
        th = tmax * (u ** 0.9) * (1 - u ** 6) + 1.0 * s
        pts_top.append((x, yc - th / 2)); pts_bot.append((x, yc + th / 2))
    draw.polygon(pts_top + pts_bot[::-1], fill=color)

def build_page(ch, seed=None):
    """Return dict: rgb (PH,PW,3 float), alpha, paper_lum, window."""
    c = CHAPTERS[ch]
    seed = 100 + ch if seed is None else seed
    paper, lum = paper_texture(PH, PW, seed)
    alpha, rim, edge_age = page_alpha(seed + 7)
    # ageing: yellow-brown towards edges, lighter fibrous rim on torn edge
    paper = paper * (1 - edge_age[..., None] * np.array([0.05, 0.10, 0.20], np.float32))
    paper = paper + rim[..., None] * np.array([0.05, 0.05, 0.06], np.float32)
    # ink layer drawn at 2x for antialiasing
    s = 2
    ink = Image.new("RGBA", (PW * s, PH * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(ink)
    col = hex2rgb(c["color"]) + (240,)
    _swoosh(d, 980 * s, 2080 * s, 300 * s, 44 * s, col, s)
    f_ch, f_num = font(600, 92 * s), font(700, 210 * s)
    num = str(ch)
    nb = d.textbbox((0, 0), num, font=f_num)
    nx = 2080 * s - (nb[2] - nb[0])
    d.text((nx - nb[0], 330 * s), num, font=f_num, fill=col)
    word = "CHAPTER"
    cx = nx - 24 * s
    # letter-spaced word, right aligned to number, baseline aligned near number bottom
    widths = [d.textlength(ch_, font=f_ch) for ch_ in word]
    track = 9 * s
    total = sum(widths) + track * (len(word) - 1)
    x = cx - total
    for ch_, wdt in zip(word, widths):
        d.text((x, 432 * s), ch_, font=f_ch, fill=col)
        x += wdt + track
    wx, wy, ww, wh = WIN
    dark = (34, 44, 62, 238)
    d.text((wx * s, (wy + wh + 120) * s), c["title"], font=font(600, 124 * s), fill=dark)
    d.text((wx * s + 4 * s, (wy + wh + 290) * s), c["age"], font=font(600, 54 * s), fill=col)
    d.text((wx * s, (wy + wh + 400) * s), c["caption"], font=font(300, 76 * s), fill=(70, 62, 55, 230))
    pn = str(ch * 2 - 1)
    pb = d.textbbox((0, 0), pn, font=font(400, 52 * s))
    d.text(((PW * s - (pb[2] - pb[0])) / 2, (PH - 190) * s), pn, font=font(400, 52 * s), fill=(110, 100, 90, 220))
    ink = np.asarray(ink.resize((PW, PH), Image.LANCZOS)).astype(np.float32) / 255.0
    a = ink[..., 3:4] * (0.86 + 0.14 * np.clip(lum[..., None], 0.8, 1.2))        # ink takes paper texture
    rgb = paper * (1 - a) + ink[..., :3] * paper * 1.08 * a
    return dict(rgb=np.clip(rgb, 0, 1).astype(np.float32), alpha=alpha, lum=lum, win=WIN, ch=ch)

def photo_print(img_f, lum_win, light_win):
    """Make a (graded, float) image look printed on this paper."""
    wx, wy, ww, wh = WIN
    f = 0.055 + img_f * 0.91                                   # paper-limited black & white points
    f = f * (0.95 + 0.05 * lum_win[..., None])                 # paper tooth shows through
    yy, xx = np.mgrid[0:wh, 0:ww].astype(np.float32)
    e = np.minimum.reduce([xx, yy, ww - 1 - xx, wh - 1 - yy])
    f = f * (1 - 0.10 * np.exp(-e / 7.0))[..., None]           # thin inner edge darkening
    sheen = np.exp(-(((xx - ww * 0.75) + (yy - wh * 0.15) * 0.8) / (ww * 0.22)) ** 2) * 0.035
    f = f + sheen[..., None]
    return np.clip(f * light_win[..., None], 0, 1)

def placeholder_photo(ch):
    wx, wy, ww, wh = WIN
    im = Image.new("RGB", (ww, wh), (214, 204, 186))
    d = ImageDraw.Draw(im)
    for i in range(0, ww + wh, 46):
        d.line([(i, 0), (i - wh, wh)], fill=(206, 196, 178), width=10)
    t1, t2 = "IMAGE TO BE SUPPLIED", f"Chapter {ch} memory · {CHAPTERS[ch]['title']}"
    for txt, f, y in ((t1, font(600, 74), wh / 2 - 70), (t2, font(400, 54), wh / 2 + 30)):
        b = d.textbbox((0, 0), txt, font=f)
        d.text(((ww - (b[2] - b[0])) / 2, y), txt, font=f, fill=(120, 108, 92))
    return np.asarray(im).astype(np.float32) / 255.0

class Memory:
    """Source memory image with its slow inner camera move ('the photo comes alive')."""
    def __init__(self, ch):
        c = CHAPTERS[ch]
        self.ch = ch
        if c["img"]:
            raw = load_rgb(p(c["img"]))
            if c.get("crop"):
                x0, y0, x1, y1 = c["crop"]
                raw = raw[y0:y1, x0:x1]
            src = grade_photo(raw)
            self.src = upscale(src, 1.6)
        else:
            self.src = None
            self.ph = placeholder_photo(ch)
        self.kb = c["kb"]
        self.rng = np.random.default_rng(ch)
        ww, wh = WIN[2], WIN[3]
        self.dust_pos = self.rng.uniform(0, 1, (26, 2))
        self.dust_vel = self.rng.normal(0, 1, (26, 2)) * 0.01 + np.array([0.004, -0.006])

    def frame(self, u, alive, t):
        """u: 0..1 progress of the inner move, alive: 0..1 develop amount."""
        ww, wh = WIN[2], WIN[3]
        if self.src is None:
            return self.ph
        sh, sw = self.src.shape[:2]
        (x0, y0, z0), (x1, y1, z1) = self.kb
        m = ease_io(u)
        z = lerp(z0, z1, m) * 1.03
        cx, cy = lerp(x0, x1, m) * sw, lerp(y0, y1, m) * sh
        k = ww / sw * z
        cx, cy = min(max(cx, ww / k / 2), sw - ww / k / 2), min(max(cy, wh / k / 2), sh - wh / k / 2)
        M = np.array([[k, 0, ww / 2 - k * cx], [0, k, wh / 2 - k * cy]], np.float32)
        f = cv2.warpAffine(self.src, M, (ww, wh), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        # living light: a slow warm sunlight breath moving across the scene
        yy, xx = np.mgrid[0:wh:8, 0:ww:8].astype(np.float32)
        bx = ww * (0.25 + 0.5 * (0.5 + 0.5 * math.sin(t * 0.35 + self.ch)))
        breath = 1 + 0.05 * np.exp(-(((xx - bx) / (ww * 0.35)) ** 2 + ((yy - wh * 0.3) / (wh * 0.6)) ** 2))
        breath = cv2.resize(breath, (ww, wh), interpolation=cv2.INTER_LINEAR)
        f = f * breath[..., None] * np.array([1.0, 0.99, 0.96], np.float32) + (breath[..., None] - 1) * 0.15
        # motes in the memory's sunlight
        layer = np.zeros((wh // 4, ww // 4), np.float32)
        pos = (self.dust_pos + self.dust_vel * t) % 1.0
        for i, (x, y) in enumerate(pos):
            b = 0.25 + 0.2 * math.sin(t * 1.7 + i)
            cv2.circle(layer, (int(x * ww), int(y * wh)), 6, b, -1, cv2.LINE_AA, 2)
        layer = cv2.resize(cv2.GaussianBlur(layer, (0, 0), 1.0), (ww, wh))
        f = f + layer[..., None] * np.array([1, 0.94, 0.8], np.float32) * 0.6
        f = np.clip(f, 0, 1)
        if alive < 1:
            f = print_look(f) * (1 - alive) + f * alive
        return f

class PageShot:
    """A page lying on the desk, photographed from slightly above; memory embedded in window."""
    def __init__(self, ch, canvas_scale=1.6, rot=-1.3, seed=0):
        self.page = build_page(ch)
        self.mem = Memory(ch)
        self.CW, self.CH = int(W * canvas_scale), int(H * canvas_scale)
        cw, chh = self.CW, self.CH
        # page placement in canvas: centred, slight rotation + gentle keystone (page tilted away)
        hs = PH * 0.97 / 2 * (chh / 3456)
        ws = PW / PH * hs * 2 / 2
        cxp, cyp = cw / 2, chh / 2 + 20
        a = math.radians(rot)
        key = 0.035
        corners = [(-ws * (1 - key), -hs), (ws * (1 - key), -hs), (ws, hs), (-ws, hs)]
        dst = [(cxp + x * math.cos(a) - y * math.sin(a), cyp + x * math.sin(a) + y * math.cos(a)) for x, y in corners]
        self.Hp = cv2.getPerspectiveTransform(np.float32([(0, 0), (PW, 0), (PW, PH), (0, PH)]), np.float32(dst))
        # desk + baked page shadow
        wood, light = wood_texture(chh, cw, 40 + ch)
        a_c = cv2.warpPerspective(self.page["alpha"], self.Hp, (cw, chh))
        sh_soft = cv2.GaussianBlur(np.roll(np.roll(a_c, 55, 0), 38, 1), (0, 0), 45)
        sh_tight = cv2.GaussianBlur(np.roll(a_c, 6, 0), (0, 0), 7)
        self.bg = np.clip(wood * (1 - 0.42 * sh_soft - 0.25 * sh_tight)[..., None], 0, 1)
        self.bg_u8 = (self.bg * 255).astype(np.uint8)
        # bake canvas lighting into the flat page (incl. window region)
        Hinv = np.linalg.inv(self.Hp)
        lf = cv2.warpPerspective(light, Hinv, (PW, PH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        lf = 0.55 + 0.45 * lf / max(lf.max(), 1e-6) * 1.0
        lf = cv2.GaussianBlur(lf, (0, 0), 25) * 1.04
        rgb = np.clip(self.page["rgb"] * lf[..., None], 0, 1)
        wx, wy, ww, wh = WIN
        self.lum_win = self.page["lum"][wy:wy + wh, wx:wx + ww]
        self.light_win = lf[wy:wy + wh, wx:wx + ww]
        rgba = np.dstack([rgb, self.page["alpha"]])
        self.page_u8 = (rgba * 255 + 0.5).astype(np.uint8)
        # window centre in canvas coords
        c = np.array([wx + ww / 2, wy + wh / 2, 1.0]) @ self.Hp.T
        self.win_c = (c[0] / c[2], c[1] / c[2])
        self.page_c = (cxp, cyp)

    def page_with_photo(self, u, alive, t):
        wx, wy, ww, wh = WIN
        photo = photo_print(self.mem.frame(u, alive, t), self.lum_win, self.light_win)
        pg = self.page_u8.copy()
        pg[wy:wy + wh, wx:wx + ww, :3] = (photo * 255 + 0.5).astype(np.uint8)
        return pg

    def render(self, z, cx, cy, rot, u, alive, t):
        A = cam_matrix(self.CW, z, cx, cy, rot)
        out_bg = cv2.warpAffine(self.bg_u8, A, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        A3 = np.vstack([A, [0, 0, 1]]).astype(np.float64)
        Hout = A3 @ self.Hp
        pg = cv2.warpPerspective(self.page_with_photo(u, alive, t), Hout, (W, H), flags=cv2.INTER_LINEAR)
        a = pg[..., 3:4].astype(np.float32) / 255.0
        out = out_bg.astype(np.float32) / 255.0 * (1 - a) + pg[..., :3].astype(np.float32) / 255.0 * a
        return out
