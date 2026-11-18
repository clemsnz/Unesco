#!/usr/bin/env python3
"""Reel / TikTok 15 s, 1080x1920, 30 i/s — « On se tient au jus… jeudi ? »
Animatique motion design : scène de conversation de groupe -> démonstration (écrans réels de la maquette) -> chute -> CTA.
Sorties : ../../03_Visuels/09_Reel_TikTok/ (MP4, plans PNG). Textes de montage : voir TIMELINE ci-dessous.
"""
import os, json, math, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
C = json.load(open(os.path.join(ROOT, "campaign.json"), encoding="utf-8"))
OUT = os.path.join(ROOT, "..", "03_Visuels", "09_Reel_TikTok"); os.makedirs(OUT, exist_ok=True)
F = os.path.join(ROOT, "fonts"); AS = os.path.join(ROOT, "assets")
W, H, FPS, DUR = 1080, 1920, 30, 15.0
CREAM = (254, 247, 236); INK = (0, 0, 0); BLUE = (17, 67, 247); RED = (254, 81, 45); ORANGE = (255, 117, 31)
YELLOW = (251, 183, 54); LAV = (193, 191, 239); VIOLET = (97, 104, 244); MUTE = (110, 106, 100); WHITE = (255, 255, 255)

def font(kind, size):
    path = {"d9": "unbounded-latin-900-normal.ttf", "d7": "unbounded-latin-700-normal.ttf",
            "s4": "syne-latin-500-normal.ttf", "s7": "syne-latin-700-normal.ttf", "s8": "syne-latin-800-normal.ttf"}[kind]
    return ImageFont.truetype(os.path.join(F, path), size)

def ease(p): p = max(0, min(1, p)); return 1 - (1 - p) ** 3

def wrap(text, fnt, maxw, d):
    words, lines, cur = text.split(" "), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if d.textlength(t, font=fnt) <= maxw: cur = t
        else: lines.append(cur); cur = w_
    lines.append(cur); return lines

def bubble(text, who=None, who_col=BLUE, me=False, size=50, bold=False, meta=None):
    tmp = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    fnt = font("s7" if bold else "s4", size); fw = font("s8", 26); fm = font("s4", 22)
    lines = wrap(text, fnt, 760, tmp)
    tw = max(tmp.textlength(l, font=fnt) for l in lines)
    if who: tw = max(tw, tmp.textlength(who, font=fw))
    lh = int(size * 1.25); hh = (36 if who else 0) + lh * len(lines) + (30 if meta else 0)
    bw, bh = int(tw) + 64, hh + 44
    im = Image.new("RGBA", (bw + 10, bh + 10), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 4, bw, bh + 4), 34, fill=(0, 0, 0, 18))
    d.rounded_rectangle((0, 0, bw, bh), 34, fill=BLUE if me else WHITE)
    y = 20
    if who: d.text((32, y), who, font=fw, fill=who_col); y += 36
    for l in lines: d.text((32, y), l, font=fnt, fill=WHITE if me else INK); y += lh
    if meta: d.text((bw - 32 - d.textlength(meta, font=fm), y + 2), meta, font=fm, fill=(220, 228, 255) if me else MUTE)
    im.info["me"] = me
    return im

def paste_alpha(base, im, x, y, a):
    if a <= 0: return
    if a < 1:
        im = im.copy(); al = im.split()[3].point(lambda v: int(v * a)); im.putalpha(al)
    base.alpha_composite(im, (int(x), int(y)))

def text_block(d, x, y, lines, fnt, fill=INK, lh=1.08):
    for l in lines:
        d.text((x, y), l, font=fnt, fill=fill); y += int(fnt.size * lh)
    return y

def pill(d, x, y, text, fnt, bg, fg, padx=34, pady=16):
    w_ = d.textlength(text, font=fnt); bb = fnt.getbbox(text)
    h_ = bb[3] - bb[1] + pady * 2
    d.rounded_rectangle((x, y, x + w_ + padx * 2, y + h_), h_ // 2, fill=bg)
    d.text((x + padx, y + pady - bb[1]), text, font=fnt, fill=fg)
    return x + w_ + padx * 2, y + h_

def loop_curve(d, t, color=LAV):
    pts = []
    for i in range(240):
        u = i / 239 * 2 * math.pi
        pts.append((880 + 260 * math.cos(u + t * .3), 1640 + 180 * math.sin(u * 1.0 + t * .3)))
    d.line(pts, fill=color, width=16, joint="curve")

# --- éléments pré-rendus
mascot = Image.open(os.path.join(AS, "logo_mascot.png")).convert("RGBA")
wm = Image.open(os.path.join(AS, "logo_wordmark_black.png")).convert("RGBA")
def scr(name, w):
    im = Image.open(os.path.join(AS, name)).convert("RGBA"); h = int(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS); return im
S_CAL, S_CHAL, S_MAP = scr("screen_calendar.png", 560), scr("screen_challenge.png", 560), scr("screen_map.png", 560)
def shadowed(im):
    pad = 60; sh = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    m = Image.new("L", sh.size, 0); m.paste(im.split()[3], (pad, pad + 20)); m = m.filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * .35))
    sh.putalpha(m); col = Image.new("RGBA", sh.size, (17, 67, 247, 0)); sh = Image.composite(Image.new("RGBA", sh.size, (17, 40, 120, 255)), col, m)
    sh.alpha_composite(im, (pad, pad)); return sh
S_CAL, S_CHAL, S_MAP = shadowed(S_CAL), shadowed(S_CHAL), shadowed(S_MAP)

B1 = [bubble("il faut trop qu'on se voie !!", "Camille", BLUE),
      bubble("grave, ça me manque", "Léa", ORANGE),
      bubble("on se tient au jus !", "Max", VIOLET, bold=True),
      bubble("vu", "Inès", YELLOW)]
B2 = [bubble("bon on dit quand ?", "Camille", BLUE),
      bubble("moi jeudi pas possible", "Léa", ORANGE),
      bubble("et mardi ? ah non j'ai foot", "Max", VIOLET),
      bubble("je vous redis", "Inès", YELLOW)]
B4 = [bubble("on se tient au jus… jeudi ?", "Camille", BLUE, bold=True, size=52),
      bubble("Jeudi 20h, c'est calé !", None, me=True, bold=True, size=52, meta="4/4 dispos · lieu choisi")]

# TIMELINE (textes de montage) — début, fin, texte à l'écran
TIMELINE = [
 (0.0, 3.6, "PLAN 1 · La scène de groupe", "Toi, dans chaque groupe :"),
 (3.6, 6.2, "PLAN 2 · Le décalage", "3 semaines plus tard…"),
 (6.2, 7.8, "PLAN 3 · Démo 1", "1. Overlap croise vos dispos"),
 (7.8, 9.4, "PLAN 4 · Démo 2", "2. Le groupe valide un créneau"),
 (9.4, 10.9, "PLAN 5 · Démo 3", "3. Puis un lieu pratique"),
 (10.9, 12.8, "PLAN 6 · La chute", C["signature"]),
 (12.8, 15.0, "PLAN 7 · CTA", "Inscris ton groupe · lien en bio"),
]
POPS = []  # instants des sons « notification »

def header(d, title="Les potes"):
    d.rectangle((0, 0, W, 300), fill=CREAM)
    d.ellipse((64, 214, 134, 284), fill=YELLOW); d.text((86, 226), "LP", font=font("s8", 26), fill=INK)
    d.text((154, 216), title, font=font("s8", 34), fill=INK); d.text((154, 256), "Camille, Léa, Max, Inès", font=font("s4", 22), fill=MUTE)
    d.line((0, 300, W, 300), fill=(230, 222, 208), width=2)

def caption(d, txt, y=360, size=60, col=INK):
    lines = wrap(txt, font("d9", size), 950, d); return text_block(d, 64, y, lines, font("d9", size), fill=col, lh=1.12)

def chat(base, bubbles, t0, t, y0, align_me=True, step=.55, start=.25):
    y = y0
    for i, b in enumerate(bubbles):
        ti = t0 + start + i * step
        p = ease((t - ti) / .22)
        if t >= ti and i == len(POPS_SEEN.get(id(bubbles), [])) : pass
        x = W - 64 - b.width if b.info.get("me") else 64
        paste_alpha(base, b, x, y + (1 - p) * 40, p)
        y += b.height + 14
    return y
POPS_SEEN = {}

def frame(t):
    base = Image.new("RGBA", (W, H), CREAM + (255,)); d = ImageDraw.Draw(base)
    if t < 3.6:
        header(d); caption(d, "Toi, dans chaque groupe :", y=360, size=56)
        chat(base, B1, 0, t, 560)
    elif t < 6.2:
        header(d); caption(d, "3 semaines plus tard…", y=360, size=56)
        y = chat(base, B2, 3.6, t, 560, step=.45, start=.15)
        if t > 5.4:
            k = int(t * 6) % 3; x0 = 64; d.rounded_rectangle((x0, y, x0 + 190, y + 86), 43, fill=WHITE)
            for i in range(3): d.ellipse((x0 + 40 + i * 42, y + 34, x0 + 58 + i * 42, y + 52), fill=INK if i == k else (190, 183, 170))
        if t > 5.0:
            caption(d, "Trouver un lieu : facile. Une date : jamais.", y=1640, size=44, col=RED)
    elif t < 10.9:
        idx = 0 if t < 7.8 else (1 if t < 9.4 else 2); t0 = [6.2, 7.8, 9.4][idx]
        txt = ["1. Overlap croise les dispos de tout le groupe", "2. Il propose 2–3 créneaux. Un clic et c'est validé", "3. Puis un lieu pratique pour tout le monde"][idx]
        caption(d, txt, y=230, size=50)
        im = [S_CAL, S_CHAL, S_MAP][idx]; p = ease((t - t0) / .35)
        x = (W - im.width) // 2; y = 400 + (1 - p) * 120
        paste_alpha(base, im, x, y, p)
        if idx == 1 and t > 8.5:  # tap sur « Thu 21 · 20h » (écran réel)
            r = 24 + (t - 8.5) * 90; cx = x + 60 + int(560 * 0.506)
            cy = int(y + 60 + (991 - 624) / (1135 - 624) * (S_CHAL.height - 120))
            d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=ORANGE, width=8)
        d.text((64, 1830), "Écrans de la maquette Overlap (prototype)", font=font("s7", 24), fill=MUTE)
    elif t < 12.8:
        header(d); y = chat(base, B4, 10.9, t, 560, step=.7, start=.1)
        if t > 11.9:
            p = ease((t - 11.9) / .4)
            lines = wrap(C["signature"], font("d9", 66), 950, d)
            ov = Image.new("RGBA", (W, 400), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
            text_block(od, 64, 0, lines, font("d9", 66), fill=INK)
            paste_alpha(base, ov, 0, 1300 + (1 - p) * 40, p)
            m = mascot.resize((300, int(mascot.height * 300 / mascot.width))); paste_alpha(base, m, 720, 1560, p)
    else:
        p = ease((t - 12.8) / .4)
        loop_curve(d, t)
        base.alpha_composite(wm.resize((300, int(wm.height * 300 / wm.width))), (64, 230))
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        y = text_block(od, 64, 420, ["On se tient", "au jus…"], font("d9", 104))
        pill(od, 56, y + 20, "jeudi ?", font("d9", 130), BLUE, CREAM, padx=44, pady=26)
        od.rounded_rectangle((64, 920, 1016, 1080), 34, fill=INK)
        for i, (lab, val) in enumerate([("JOUR", C["event_day_short"]), ("HEURE", C["event_start"]), ("LIEU", C["event_city"])]):
            x = 64 + [0, 420, 730][i]
            if i: od.line((x, 935, x, 1065), fill=(90, 90, 90), width=3)
            od.text((x + 28, 942), lab, font=font("s8", 24), fill=YELLOW); od.text((x + 28, 980), val, font=font("d9", 40), fill=CREAM)
        text_block(od, 64, 1130, wrap("Viens à " + C["group_size"] + " : vous repartez avec la date de votre prochaine sortie.", font("s7", 44), 950, od), font("s7", 44), lh=1.25)
        pill(od, 64, 1330, "Inscris ton groupe · lien en bio", font("s8", 36), ORANGE, CREAM, padx=40, pady=26)
        od.text((64, 1480), C["signature"], font=font("d7", 34), fill=INK)
        paste_alpha(base, ov, 0, (1 - p) * 60, p)
    return base.convert("RGB")

# --- sons : petits « pop » de notification aux apparitions de bulles
def pops():
    ts = [0.25 + i * .55 for i in range(4)] + [3.75 + i * .45 for i in range(4)] + [6.2, 7.8, 8.5, 9.4, 11.0, 11.7, 12.8]
    sr = 44100; a = np.zeros(int(sr * DUR), dtype=np.float32)
    for k, t0 in enumerate(ts):
        n = int(sr * .12); tt = np.arange(n) / sr; f = 880 if k % 2 else 1175
        a[int(t0 * sr):int(t0 * sr) + n] += (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 38) * .35).astype(np.float32)
    a = np.clip(a, -1, 1); path = os.path.join(HERE, "_pops.wav")
    with wave.open(path, "w") as w_:
        w_.setnchannels(1); w_.setsampwidth(2); w_.setframerate(sr); w_.writeframes((a * 32767).astype(np.int16).tobytes())
    return path

if __name__ == "__main__":
    wav = pops(); mp4 = os.path.join(OUT, "Reel_On_se_tient_au_jus_jeudi_15s_1080x1920.mp4")
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-i", wav, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "128k",
                           "-shortest", "-movflags", "+faststart", mp4], stdin=subprocess.PIPE)
    for i in range(int(DUR * FPS)):
        ff.stdin.write(frame(i / FPS).tobytes())
    ff.stdin.close(); ff.wait(); os.remove(wav)
    for k, (a, b, name, txt) in enumerate(TIMELINE):
        tm = a + (b - a) * .75
        frame(tm).save(os.path.join(OUT, f"Plan_{k+1}_{a:04.1f}s-{b:04.1f}s.png"))
    json.dump([{"debut": a, "fin": b, "plan": n, "texte": t_} for a, b, n, t_ in TIMELINE], open(os.path.join(OUT, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("ok", mp4)
