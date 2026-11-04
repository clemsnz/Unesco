"""Original procedural soundtrack: felt-piano score + ambient pad + paper foley + room tone.

100% synthesised from code (no samples) -> no third-party licensing.
Writes 08_AUDIO/{music,sfx,ambience,mix_premaster}.wav (48 kHz stereo float).
"""
import numpy as np
from scipy import signal
from scipy.io import wavfile
from common import p

SR = 48000
DUR = 60.0
N = int(SR * DUR)
rng = np.random.default_rng(2026)

def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def lp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), "low")
    return signal.lfilter(b, a, x, axis=0)

def bp(x, f1, f2, order=2):
    b, a = signal.butter(order, [f1 / (SR / 2), f2 / (SR / 2)], "band")
    return signal.lfilter(b, a, x, axis=0)

# ---------------------------------------------------------------- piano
def piano_note(m, vel, length=None):
    f = mtof(m)
    tb = float(np.clip(7.5 * (261.6 / f) ** 0.55, 1.4, 11.0))
    L = int(SR * (length or tb * 1.1))
    t = np.arange(L) / SR
    out = np.zeros(L)
    B = 0.00018 * (f / 261.6) ** 0.6
    for k in range(1, 15):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 14000:
            break
        amp = (1 / k ** 1.25) * np.exp(-(k - 1) * (1.15 - vel) * 0.35)
        tk = tb / (1 + 0.42 * (k - 1))
        env = 0.55 * np.exp(-t * 6.9 / (tk * 0.22)) + 0.45 * np.exp(-t * 6.9 / tk)
        det = 1 + 0.35e-3 * (k % 3 - 1) * 0.5
        ph = rng.uniform(0, 2 * np.pi)
        out += amp * env * (np.sin(2 * np.pi * fk * t + ph) + 0.8 * np.sin(2 * np.pi * fk * det * t + ph + 0.3))
    out *= 1 - np.exp(-t / 0.0025)
    ham = lp(rng.standard_normal(L) * np.exp(-t / 0.004), 2500) * 0.25
    out = (out / 4.0 + ham) * vel
    out = lp(out, 1800 + 3200 * vel)                       # felt: darker when soft
    fade = np.ones(L); fade[-int(0.3 * SR):] = np.linspace(1, 0, int(0.3 * SR))
    return out * fade

def place(buf, x, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * l * gain
    buf[i:i + len(x), 1] += x * r * gain

def reverb(x, rt=3.0, wet=0.34, pre=0.022):
    L = int(SR * rt * 1.2)
    t = np.arange(L) / SR
    ir = rng.standard_normal((L, 2)) * np.exp(-t * 6.9 / rt)[:, None]
    ir = lp(ir, 5500)
    ir[: int(pre * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    y = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - wet) + y * wet * 1.6

# score -------------------------------------------------------------
# (start, bass_midi, chord tones for arpeggio, arp_vel, arp_step)
SECTIONS = [
    (0.0, None, [], 0, 0),
    (8.0, 43, [55, 59, 62, 66], 0.20, 0.86),              # discovery: Gmaj7, sparse
    (16.3, 38, [62, 66, 69, 74], 0.24, 0.64),             # Ch1 D
    (23.3, 45, [61, 64, 69, 73], 0.26, 0.64),             # Ch2 A
    (30.3, 47, [62, 66, 71, 74], 0.27, 0.53),             # Ch3 Bm
    (37.3, 43, [62, 67, 71, 74], 0.29, 0.53),             # Ch4 G
    (44.3, 40, [62, 67, 71, 76], 0.31, 0.43),             # Ch5 Em7
    (47.6, 45, [61, 64, 69, 76], 0.32, 0.43),             #     -> A (lift)
    (50.0, 43, [62, 67, 71, 74], 0.27, 0.53),             # restored book: G
    (52.2, 42, [62, 66, 69, 74], 0.22, 0.64),             #     -> D/F#
    (54.4, None, [], 0, 0),                               # campaign line: space
]
MELODY = [  # (time, midi, vel)
    (1.8, 66, 0.30), (3.3, 74, 0.26), (4.6, 73, 0.24), (6.1, 71, 0.27),
    (10.4, 69, 0.26), (12.0, 71, 0.27), (13.6, 74, 0.30),
    (16.3, 78, 0.34), (18.8, 76, 0.28), (20.3, 74, 0.28),
    (23.3, 76, 0.34), (25.6, 73, 0.28), (27.4, 71, 0.27),
    (30.3, 74, 0.34), (32.4, 73, 0.28), (34.3, 71, 0.30),
    (37.3, 79, 0.35), (39.4, 78, 0.30), (41.3, 74, 0.30),
    (44.3, 79, 0.37), (46.0, 78, 0.32), (47.6, 81, 0.38), (49.0, 78, 0.32),
    (50.6, 74, 0.32), (52.2, 78, 0.30), (53.4, 76, 0.26),
]
CODA = [(54.4, [43, 50, 59, 66, 69], 0.30), (56.9, [38, 45, 54, 64, 69, 74], 0.36)]

def build_music():
    buf = np.zeros((N, 2))
    buf_pad = np.zeros((N, 2))
    place(buf, piano_note(47, 0.22), 1.0, -0.2, 0.9)                     # opening low B
    for i, (t0, bass, tones, v, step) in enumerate(SECTIONS):
        t1 = SECTIONS[i + 1][0] if i + 1 < len(SECTIONS) else 54.4
        if bass is None:
            continue
        place(buf, piano_note(bass, v + 0.12), t0, -0.35, 1.0)
        place(buf, piano_note(bass + 12, v), t0 + 0.02, -0.2, 0.6)
        k, t = 0, t0 + step
        pattern = [0, 2, 1, 3, 2, 1]
        while t < t1 - 0.05:
            m = tones[pattern[k % len(pattern)]]
            place(buf, piano_note(m, v * rng.uniform(0.85, 1.05)), t + rng.normal(0, 0.008), 0.15 + 0.25 * ((k % 4) / 3 - 0.5), 0.8)
            k += 1; t += step
        # pad on chord tones
        L = int((t1 - t0 + 2.5) * SR)
        tt = np.arange(L) / SR
        env = np.minimum(1, tt / 1.6) * np.clip((t1 - t0 + 2.5 - tt) / 2.5, 0, 1)
        pad = sum(np.sin(2 * np.pi * mtof(m - 12) * tt + rng.uniform(0, 6)) * (1 + 0.3 * np.sin(2 * np.pi * 0.2 * tt + j))
                  for j, m in enumerate(tones[:3]))
        place(buf_pad, lp(pad * env, 900) * 0.035, t0, 0.0, 1.0)
    for t, m, v in MELODY:
        place(buf, piano_note(m, v), t, 0.1, 1.0)
    for t, ch, v in CODA:
        for j, m in enumerate(ch):
            place(buf, piano_note(m, v * (1.05 if j == 0 else 0.85), length=6.0), t + j * 0.035, -0.3 + 0.12 * j, 0.9)
    mus = reverb(buf, 3.2, 0.36) + reverb(buf_pad, 4.0, 0.5)
    t = np.arange(N) / SR
    mus *= np.clip((60.0 - t) / 2.4, 0, 1)[:, None] ** 1.5                    # tail fade to silence at 60 s
    return mus

# ---------------------------------------------------------------- foley
def rustle(d, level=1.0, bright=1.0):
    L = int(d * SR)
    t = np.arange(L) / SR
    env = np.minimum(1, t / 0.05) * np.exp(-np.maximum(0, t - 0.05) / (d * 0.45))
    crackle = np.zeros(L)
    idx = rng.integers(0, L, int(380 * d))
    crackle[idx] = rng.uniform(0.2, 1, len(idx)) * rng.choice([-1, 1], len(idx))
    crackle = signal.lfilter([1], [1, -0.92], crackle)
    hiss = bp(rng.standard_normal(L), 1400, 7500) * 0.5
    swish = bp(rng.standard_normal(L), 250, 1100) * 0.35
    mod = 0.6 + 0.4 * np.abs(lp(rng.standard_normal(L), 18) * 6).clip(0, 1)
    x = (bp(crackle, 1500, 9000) * 0.6 * bright + hiss * mod * bright + swish) * env
    x /= np.abs(x).max() + 1e-9
    st = np.stack([x, np.roll(x, int(0.0004 * SR))], 1)
    return st * level

def thump(level=1.0):
    L = int(0.35 * SR)
    t = np.arange(L) / SR
    x = np.sin(2 * np.pi * 85 * t) * np.exp(-t / 0.05) + lp(rng.standard_normal(L) * np.exp(-t / 0.012), 900) * 0.4
    return np.stack([x, x], 1) * level

def swell(d=0.9, level=1.0):
    L = int(d * SR)
    t = np.arange(L) / SR
    env = (t / d) ** 2.2 * np.exp(-np.maximum(0, t - d * 0.92) / 0.05)
    x = bp(rng.standard_normal((L, 2)), 3500, 10000) * env[:, None]
    return x / (np.abs(x).max() + 1e-9) * level

def put(buf, x, t, gain):
    i = int(t * SR)
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x * gain

def build_sfx():
    buf = np.zeros((N, 2))
    put(buf, thump(), 0.9, 0.28)                    # book cover settles
    put(buf, rustle(0.9, bright=0.8), 1.05, 0.22)   # book opens
    put(buf, rustle(0.6), 5.6, 0.12)                # fingers on torn stubs
    put(buf, rustle(0.7), 13.9, 0.20)               # he picks up the first page
    for k, t in enumerate([15.0, 22.0, 29.0, 36.0, 43.0]):
        put(buf, rustle(1.0), t - 0.15, 0.22)       # page brought into view
        put(buf, swell(0.95), t + 1.3 - 0.95, 0.035)  # the photograph comes alive
        put(buf, rustle(0.4, bright=0.6), t + 3.8, 0.06)
    for k, t in enumerate([50.1, 50.7, 51.2, 51.8, 52.3]):
        put(buf, rustle(0.5), t, 0.10 + 0.02 * (k % 2))   # pages laid back in order
    return buf

def build_ambience():
    t = np.arange(N) / SR
    white = rng.standard_normal((N, 2))
    b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    pink = signal.lfilter(b, a, white, axis=0)
    room = lp(pink, 420) * 0.5 + bp(white, 2000, 6000) * 0.02
    room /= np.abs(room).max()
    env = np.clip(t / 1.5, 0, 1) * np.clip((58.6 - t) / 1.4, 0, 1)
    # classroom murmur bed for the present-day scenes (very low), quieter in memories
    present = np.clip(1 - (t - 14.5) / 1.0, 0, 1) + np.clip((t - 50.0) / 1.0, 0, 1) * np.clip((54.4 - t) / 1.0, 0, 1)
    return room * (env * (0.55 + 0.45 * present))[:, None] * 0.03

if __name__ == "__main__":
    import os
    os.makedirs(p("08_AUDIO"), exist_ok=True)
    mus, sfx, amb = build_music(), build_sfx(), build_ambience()
    mus *= 0.55 / (np.abs(mus).max() + 1e-9)
    mix = mus + sfx + amb
    mix *= 0.7 / np.abs(mix).max()
    for name, x in (("music", mus), ("sfx", sfx), ("ambience", amb), ("mix_premaster", mix)):
        wavfile.write(p("08_AUDIO", f"{name}.wav"), SR, x.astype(np.float32))
        print(name, "peak", float(np.abs(x).max()))
