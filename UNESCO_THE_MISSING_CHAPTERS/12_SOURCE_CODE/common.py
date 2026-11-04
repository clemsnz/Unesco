"""Shared rendering toolkit for THE MISSING CHAPTERS.

Everything here is deterministic (seeded) so any sequence can be re-rendered
identically. Output frames are 3840x2160 RGB uint8 at 24 fps.
"""
import os, subprocess, math
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "12_SOURCE_CODE")
FONTS = os.path.join(SRC, "fonts")
W, H, FPS = 3840, 2160, 24

# UNESCO Education Sector palette (from supplied guidelines, p.11)
PALETTE = {
    "blue": "#0077d4", "red": "#c5192d", "lightgreen": "#95c11f", "purple": "#9f358b",
    "orange": "#f39200", "yellow": "#ffd500", "magenta": "#ec619f", "cyan": "#00b1eb",
    "darkblue": "#004d6d", "darkgreen": "#0e8341",
}

def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def font(weight, size):
    return ImageFont.truetype(os.path.join(FONTS, f"SourceSans3-{weight}.woff"), int(size))

def p(*parts):
    return os.path.join(ROOT, *parts)

# ---------------------------------------------------------------- easing
def smoothstep(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)

def ease_io(x):  # cosine ease in-out
    x = min(max(x, 0.0), 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * x)

def lerp(a, b, t):
    return a + (b - a) * t

# ---------------------------------------------------------------- noise
def smooth_noise(h, w, scale, rng):
    sh, sw = max(2, h // scale + 3), max(2, w // scale + 3)
    small = rng.standard_normal((sh, sw)).astype(np.float32)
    big = cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)
    return big / (big.std() + 1e-6)

def fractal_1d(n, rng, octaves=((220, 18), (60, 8), (14, 4), (3, 1.6))):
    out = np.zeros(n, np.float32)
    for scale, amp in octaves:
        k = rng.standard_normal(n // scale + 4).astype(np.float32)
        x = np.linspace(0, len(k) - 3, n)
        out += np.interp(x, np.arange(len(k)), k) * amp
    return out

# ---------------------------------------------------------------- grading
def grade_photo(img):
    """Warm, soft, filmic grade for source photographs (float32 0-1 RGB)."""
    f = img.astype(np.float32) / 255.0 if img.dtype == np.uint8 else img
    lum = f @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    f = lum[..., None] + (f - lum[..., None]) * 0.90           # gentle desaturation
    f = f * np.array([1.02, 1.0, 0.955], np.float32)            # warm ivory balance
    f = 0.025 + f * 0.965                                       # lifted blacks
    f = f / (1 + 0.18 * f) * 1.18                               # highlight roll-off
    return np.clip(f, 0, 1)

def print_look(f):
    """Aged print (still, before the memory 'comes alive')."""
    lum = f @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    lum = 0.5 + (lum - 0.5) * 0.78
    sep = lum[..., None] * np.array([1.06, 0.95, 0.76], np.float32) + 0.05
    return np.clip(sep, 0, 1)

def load_rgb(path):
    return cv2.cvtColor(cv2.imread(path, cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGB)

def upscale(img, factor):
    """Lanczos upscale + light unsharp mask (sources are ~1672 px wide)."""
    h, w = img.shape[:2]
    big = cv2.resize(img, (int(w * factor), int(h * factor)), interpolation=cv2.INTER_LANCZOS4)
    blur = cv2.GaussianBlur(big, (0, 0), 2.0)
    return np.clip(big * 1.35 - blur * 0.35, 0, 1) if big.dtype != np.uint8 else big

# ---------------------------------------------------------------- camera
def cam_matrix(src_w, z, cx, cy, rot_deg=0.0):
    """Affine mapping source pixels -> output so that zoom z=1 fits src width."""
    k = W / src_w * z
    a = math.radians(rot_deg)
    c, s = math.cos(a) * k, math.sin(a) * k
    return np.array([[c, -s, W / 2 - c * cx + s * cy],
                     [s, c, H / 2 - s * cx - c * cy]], np.float32)

def clamp_center(src_w, src_h, z, cx, cy, margin=1.0):
    vw, vh = src_w / z, src_w / z * H / W
    cx = min(max(cx, vw / 2 * margin), src_w - vw / 2 * margin)
    cy = min(max(cy, vh / 2 * margin), src_h - vh / 2 * margin)
    return cx, cy

def handheld(t, amp=1.0, seed=0):
    """Very small, slow, organic camera drift (output pixels / degrees)."""
    r = np.random.default_rng(seed)
    ph = r.uniform(0, 6.28, 6)
    dx = amp * (3.0 * math.sin(0.37 * t + ph[0]) + 1.4 * math.sin(0.91 * t + ph[1]))
    dy = amp * (2.4 * math.sin(0.29 * t + ph[2]) + 1.1 * math.sin(0.83 * t + ph[3]))
    dr = amp * 0.05 * math.sin(0.23 * t + ph[4])
    return dx, dy, dr

# ---------------------------------------------------------------- finishing
class Finisher:
    """Vignette + animated film grain + floating dust motes, applied in output space."""
    def __init__(self, seed=1, grain=0.022, vignette=0.22, dust=60):
        rng = np.random.default_rng(seed)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / math.sqrt(2)
        self.vig = (1 - vignette * smoothstep((d - 0.35) / 0.65)).astype(np.float32)[..., None]
        self.grains = []
        for _ in range(4):
            g = rng.standard_normal((H // 2, W // 2)).astype(np.float32)
            g = cv2.resize(g, (W, H), interpolation=cv2.INTER_LINEAR)
            g += 0.5 * rng.standard_normal((H, W)).astype(np.float32)
            self.grains.append((g * grain / 1.1).astype(np.float32))
        self.rng = rng
        self.n = dust
        self.dpos = rng.uniform(0, 1, (dust, 2)).astype(np.float32)
        self.dvel = rng.normal(0, 1, (dust, 2)).astype(np.float32) * np.array([0.006, 0.004], np.float32)
        self.dvel[:, 1] -= 0.003
        self.dsize = rng.uniform(1.0, 3.2, dust)
        self.dbright = rng.uniform(0.12, 0.42, dust)
        self.dphase = rng.uniform(0, 6.28, dust)

    def dust_layer(self, t, w=W // 4, h=H // 4):
        layer = np.zeros((h, w), np.float32)
        pos = (self.dpos + self.dvel * t) % 1.0
        for i in range(self.n):
            x, y = pos[i, 0] * w, pos[i, 1] * h
            b = self.dbright[i] * (0.6 + 0.4 * math.sin(1.3 * t + self.dphase[i]))
            cv2.circle(layer, (int(x * 4), int(y * 4)), int(self.dsize[i] * 4), b, -1, cv2.LINE_AA, 2)
        layer = cv2.GaussianBlur(layer, (0, 0), 1.2)
        return layer

    def apply(self, frame_f, fi, t, dust_amt=1.0):
        f = frame_f
        if dust_amt > 0:
            d = cv2.resize(self.dust_layer(t), (W, H), interpolation=cv2.INTER_LINEAR)
            lum = cv2.resize(f[::8, ::8].mean(axis=2), (W, H), interpolation=cv2.INTER_LINEAR)
            f = f + (d * dust_amt * smoothstep((lum - 0.35) / 0.5))[..., None] * np.array([1.0, 0.93, 0.8], np.float32)
        f = f * self.vig + self.grains[fi % 4][..., None]
        return np.clip(f * 255.0 + 0.5, 0, 255).astype(np.uint8)

# ---------------------------------------------------------------- output
class Writer:
    def __init__(self, path, crf=12, preset="fast"):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.proc = subprocess.Popen(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
             "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", preset,
             "-crf", str(crf), "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709",
             "-color_trc", "bt709", "-r", str(FPS), path], stdin=subprocess.PIPE)
        self.n = 0

    def write(self, frame_u8):
        self.proc.stdin.write(np.ascontiguousarray(frame_u8).tobytes())
        self.n += 1

    def close(self):
        self.proc.stdin.close()
        self.proc.wait()
        return self.n

# ---------------------------------------------------------------- materials
def paper_texture(h, w, seed, base=(239, 229, 207)):
    """Aged cream paper: mottling, fibres, foxing. Returns float32 RGB 0-1."""
    rng = np.random.default_rng(seed)
    basec = np.array(base, np.float32) / 255.0
    mott = smooth_noise(h, w, 260, rng) * 0.011 + smooth_noise(h, w, 60, rng) * 0.006
    fine = cv2.GaussianBlur(rng.standard_normal((h, w)).astype(np.float32), (0, 0), 0.9) * 0.018
    lum = 1 + mott + fine
    # fibres: short faint strokes
    fib = np.zeros((h, w), np.float32)
    for _ in range(int(h * w / 9000)):
        x, y = rng.uniform(0, w), rng.uniform(0, h)
        a, L = rng.uniform(0, math.pi), rng.uniform(8, 40)
        cv2.line(fib, (int(x), int(y)), (int(x + L * math.cos(a)), int(y + L * math.sin(a))),
                 float(rng.uniform(-1, 1)), 1, cv2.LINE_AA)
    lum += cv2.GaussianBlur(fib, (0, 0), 0.6) * 0.035
    img = lum[..., None] * basec
    # foxing spots
    fox = np.zeros((h, w), np.float32)
    for _ in range(int(h * w / 160000)):
        r = rng.uniform(4, 34)
        cv2.circle(fox, (int(rng.uniform(0, w)), int(rng.uniform(0, h))), int(r), float(rng.uniform(0.25, 1)), -1, cv2.LINE_AA)
    fox = cv2.GaussianBlur(fox, (0, 0), 6) * 0.09
    img = img * (1 - fox[..., None] * np.array([0.25, 0.45, 0.8], np.float32))
    return np.clip(img, 0, 1).astype(np.float32), lum.astype(np.float32)

def wood_texture(h, w, seed, blur=9.0):
    """Honey-toned school-desk wood, long horizontal grain, defocused (shallow DOF)."""
    rng = np.random.default_rng(seed)
    def streaks(sy, sx):
        n = rng.standard_normal((max(2, h // sy), max(2, w // sx))).astype(np.float32)
        n = cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC)
        return n / (n.std() + 1e-6)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    bend = smooth_noise(h, w, 900, rng) * 25
    bands = 0.5 + 0.5 * np.sin((yy + bend) / 37.0 + smooth_noise(h, w, 1200, rng) * 1.2)
    t = 0.52 + 0.10 * streaks(6, 300) + 0.06 * streaks(2, 90) + 0.08 * (bands ** 3) + 0.05 * smooth_noise(h, w, 500, rng)
    t = np.clip(t, 0, 1)
    dark = np.array([122, 78, 42], np.float32) / 255
    light = np.array([200, 146, 90], np.float32) / 255
    img = dark + (light - dark) * t[..., None]
    img = cv2.GaussianBlur(img, (0, 0), blur)
    d = np.sqrt((xx / w) ** 2 + (yy / h) ** 2) / math.sqrt(2)
    light_map = 1.12 - 0.40 * d
    stripes = 0.5 + 0.5 * np.sin((xx * 0.7 + yy * 0.7) / (w * 0.11) * math.pi)
    light_map *= 1 - 0.12 * smoothstep((stripes - 0.55) / 0.35)
    light_map = cv2.GaussianBlur(light_map, (0, 0), 30)
    return np.clip(img * light_map[..., None], 0, 1).astype(np.float32), light_map.astype(np.float32)
