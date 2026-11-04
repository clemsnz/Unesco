"""Build the AI-generation kit: keyframes, page plates, character board, end card, storyboard.

Output: 13_AI_GENERATION_KIT/
"""
import os, json, math
import numpy as np
import cv2
from PIL import Image, ImageDraw
from common import *
from pages import PageShot, build_page, Memory, photo_print, WIN, PW, PH, CHAPTERS
import render

KIT = p("13_AI_GENERATION_KIT")
HD = (1920, 1080)

def save(img_f, rel, size=None, jpg=False):
    path = os.path.join(KIT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    u8 = img_f if img_f.dtype == np.uint8 else (np.clip(img_f, 0, 1) * 255 + 0.5).astype(np.uint8)
    if size:
        u8 = cv2.resize(u8, size, interpolation=cv2.INTER_AREA if size[0] < u8.shape[1] else cv2.INTER_LANCZOS4)
    bgr = cv2.cvtColor(u8, cv2.COLOR_RGBA2BGRA if u8.shape[2] == 4 else cv2.COLOR_RGB2BGR)
    cv2.imwrite(path, bgr, [cv2.IMWRITE_JPEG_QUALITY, 95] if jpg else [cv2.IMWRITE_PNG_COMPRESSION, 6])
    return path

def still_frame(img_rel, z, cx, cy, rot=0.0):
    src = upscale(grade_photo(load_rgb(p(img_rel))), 2.0)
    sh, sw = src.shape[:2]
    cx, cy = clamp_center(sw, sh, z, cx * sw, cy * sh)
    A = cam_matrix(sw, z, cx, cy, rot)
    return cv2.warpAffine(src, A, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

def page_render(shot, page_rgba_u8, z, cx, cy, rot=0.0):
    A = cam_matrix(shot.CW, z, cx, cy, rot)
    bg = cv2.warpAffine(shot.bg_u8, A, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    Hout = np.vstack([A, [0, 0, 1]]).astype(np.float64) @ shot.Hp
    pg = cv2.warpPerspective(page_rgba_u8, Hout, (W, H), flags=cv2.INTER_LINEAR)
    a = pg[..., 3:4].astype(np.float32) / 255
    out = bg.astype(np.float32) / 255 * (1 - a) + pg[..., :3].astype(np.float32) / 255 * a
    wx, wy, ww, wh = WIN
    corners = np.array([[wx, wy, 1], [wx + ww, wy, 1], [wx + ww, wy + wh, 1], [wx, wy + wh, 1]], float) @ Hout.T
    return out, (corners[:, :2] / corners[:, 2:]).round(1).tolist()

def build_pages():
    meta = {}
    for ch in range(1, 7):
        shot = PageShot(ch)
        wx, wy, ww, wh = WIN
        pc = lambda x, y: tuple((np.array([x, y, 1.0]) @ shot.Hp.T)[:2] / (np.array([x, y, 1.0]) @ shot.Hp.T)[2])
        end_c = pc(wx + ww / 2, wy + wh / 2 - 30)
        green = shot.page_u8.copy()
        green[wy:wy + wh, wx:wx + ww, :3] = (0, 255, 0)
        d = f"04_PAGE_PLATES/CH{ch}"
        f, c_start = page_render(shot, green, 1.0, *shot.page_c)
        save(f, f"{d}/CH{ch}_plate_WIDE_greenwindow_4K.png")
        f, c_end = page_render(shot, green, 2.55, *end_c)
        save(f, f"{d}/CH{ch}_plate_CLOSE_greenwindow_4K.png")
        still = shot.page_with_photo(0.0, 0.0, 0.0)
        alive = shot.page_with_photo(1.0, 1.0, 4.0)
        save(page_render(shot, still, 1.0, *shot.page_c)[0], f"{d}/CH{ch}_preview_WIDE_sepia_print.jpg", HD, True)
        save(page_render(shot, alive, 2.55, *end_c)[0], f"{d}/CH{ch}_preview_CLOSE_alive_colour.jpg", HD, True)
        # flat page (transparent) with green window, for any other compositing tool
        flat = np.dstack([shot.page["rgb"], shot.page["alpha"]])
        flat[wy:wy + wh, wx:wx + ww, :3] = (0, 1, 0)
        save(flat, f"{d}/CH{ch}_page_flat_transparent_greenwindow.png")
        meta[f"CH{ch}"] = dict(title=CHAPTERS[ch]["title"], window_corners_4K_wide=c_start,
                               window_corners_4K_close=c_end, window_flat_xywh=list(WIN), flat_size=[PW, PH])
        del shot
    with open(os.path.join(KIT, "04_PAGE_PLATES", "window_corners.json"), "w") as fh:
        json.dump(meta, fh, indent=2)

def build_keyframes():
    K = "02_KEYFRAMES"
    # S01 incomplete book
    save(still_frame("02_CHARACTER_REFERENCES/ref_boy_chapter6_book.png", 1.04, 0.50, 0.50), f"{K}/S01_FIRST_frame.png", HD)
    save(still_frame("02_CHARACTER_REFERENCES/ref_boy_chapter6_book.png", 1.20, 0.56, 0.58, -0.4), f"{K}/S01_LAST_frame.png", HD)
    # S02 discovery
    save(still_frame("03_ENVIRONMENT_REFERENCES/ref_pages_on_floor.png", 1.04, 0.66, 0.62), f"{K}/S02_FIRST_frame.png", HD)
    save(still_frame("03_ENVIRONMENT_REFERENCES/ref_pages_on_floor.png", 2.15, 0.255, 0.27, -0.6), f"{K}/S02_LAST_frame.png", HD)
    # S03-S07 memory clips: clean 16:9 first frames (no page) for image-to-video
    for ch, s in zip((1, 2, 4, 5), ("S03", "S04", "S06", "S07")):
        src = grade_photo(load_rgb(p(CHAPTERS[ch]["img"])))
        save(src, f"{K}/{s}_CH{ch}_MEMORY_first_frame.png", HD)
    # S08 restored chapters (first / last of the pull-back) and S09 end card
    bg, L1, L2 = render.end_card_layers()
    card = bg * (1 - L1[..., 3:]) + L1[..., :3] * L1[..., 3:]
    card_full = card * (1 - L2[..., 3:]) + L2[..., :3] * L2[..., 3:]
    save(card, "05_END_CARD/END_CARD_A_campaign_line_4K.png")
    save(card_full, "05_END_CARD/END_CARD_B_full_signature_4K.png")
    save(L1, "05_END_CARD/layer_campaign_line_transparent_4K.png")
    save(L2, "05_END_CARD/layer_signature_transparent_4K.png")
    save(bg, "05_END_CARD/layer_paper_background_4K.jpg", None, True)

def build_restored_row():
    S = 2.0
    CW, CHh = int(W * S), int(H * S)
    wood, light = wood_texture(CHh, CW, 88, blur=10)
    canvas = wood
    rng = np.random.default_rng(8)
    sc, spacing = 0.48, 1176
    centers = []
    for k, ch in enumerate(range(1, 7)):
        rgba = render.flat_page_rgba(ch, sc)
        ph, pw = rgba.shape[:2]
        cx = CW / 2 + (k - 2.5) * spacing
        cy = CHh / 2 + (32 if k % 2 else -32) + rng.uniform(-16, 16)
        ang = rng.uniform(-2.6, 2.6)
        pad = 220
        x0, y0 = int(cx - pw / 2 - pad), int(cy - ph / 2 - pad)
        rw, rh = pw + 2 * pad, ph + 2 * pad
        M = cv2.getRotationMatrix2D((pw / 2, ph / 2), ang, 1.0); M[0, 2] += pad; M[1, 2] += pad
        wp = cv2.warpAffine(rgba, M, (rw, rh), flags=cv2.INTER_LINEAR)
        a = wp[..., 3]
        sh = cv2.GaussianBlur(np.roll(np.roll(a, 27, 0), 18, 1), (0, 0), 22)
        roi = canvas[y0:y0 + rh, x0:x0 + rw]
        roi *= (1 - 0.4 * sh)[..., None]
        canvas[y0:y0 + rh, x0:x0 + rw] = roi * (1 - a[..., None]) + wp[..., :3] * light[y0:y0 + rh, x0:x0 + rw, None] ** 0.5 * a[..., None]
        centers.append((cx, cy))
    def view(z, cx, cy):
        return cv2.warpAffine(canvas, cam_matrix(CW, z, cx, cy), (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    save(view(2.7, *centers[0]), "02_KEYFRAMES/S08_FIRST_frame.png", HD)
    save(view(1.02, CW / 2, CHh / 2), "02_KEYFRAMES/S08_LAST_frame.png", HD)
    save(view(1.02, CW / 2, CHh / 2), "03_REFERENCE_BOARDS/restored_six_chapters_4K.jpg", None, True)

def label(img, text, sub=None):
    im = Image.fromarray(img)
    d = ImageDraw.Draw(im)
    d.rectangle([0, im.height - 78, im.width, im.height], fill=(20, 24, 32))
    d.text((18, im.height - 72), text, font=font(600, 34), fill=(255, 255, 255))
    if sub:
        d.text((18, im.height - 34), sub, font=font(400, 24), fill=(200, 200, 200))
    return np.asarray(im)

def build_character_board():
    # (image, crop box in source px x0,y0,x1,y1, label)
    crops = [
        ("05_MEMORY_ASSETS/mem_ch1_first_steps.png", (440, 160, 880, 600), "AGE 1", "Chapter 1 · First steps"),
        ("05_MEMORY_ASSETS/mem_ch2_taking_care.png", (110, 120, 640, 650), "AGE 2", "Chapter 2 · Taking care"),
        (None, None, "AGE 3", "Chapter 3 · TO GENERATE"),
        ("05_MEMORY_ASSETS/mem_ch4_discovering_world.png", (220, 110, 900, 790), "AGE 4", "Chapter 4 · Discovering"),
        ("05_MEMORY_ASSETS/mem_ch5_creating_together.png", (330, 70, 930, 670), "AGE 5", "Chapter 5 · Creating"),
        ("02_CHARACTER_REFERENCES/ref_boy_chapter6_book.png", (560, 0, 1160, 600), "AGE 6", "Hero · present day"),
    ]
    tiles = []
    for img, box, t, sub in crops:
        if img is None:
            tile = np.full((600, 600, 3), 214, np.uint8)
            im = Image.fromarray(tile); d = ImageDraw.Draw(im)
            d.text((120, 260), "IMAGE TO GENERATE", font=font(600, 40), fill=(120, 108, 92))
            tile = np.asarray(im)
        else:
            src = load_rgb(p(img))
            x0, y0, x1, y1 = box
            tile = cv2.resize(src[y0:y1, x0:x1], (600, 600), interpolation=cv2.INTER_LANCZOS4)
        tiles.append(label(tile, t, sub))
    board = np.full((600 * 2 + 30 + 160, 600 * 3 + 40, 3), 245, np.uint8)
    im = Image.fromarray(board); d = ImageDraw.Draw(im)
    d.text((20, 30), "HERO BOY — character continuity board (same child, ages 1 to 6)", font=font(600, 44), fill=(31, 42, 58))
    d.text((20, 90), "Dark curly hair · warm light-brown skin · brown eyes · round cheeks · Latin American family · blue/gold graduation cap & cape in memories", font=font(400, 26), fill=(90, 90, 90))
    board = np.asarray(im).copy()
    for i, tl in enumerate(tiles):
        r, c = divmod(i, 3)
        y, x = 160 + r * 615, 10 + c * 610
        board[y:y + 600, x:x + 600] = tl
    path = os.path.join(KIT, "03_REFERENCE_BOARDS", "character_continuity_board.jpg")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cv2.imwrite(path, cv2.cvtColor(board, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 93])

def build_storyboard():
    K = os.path.join(KIT, "02_KEYFRAMES")
    PP = os.path.join(KIT, "04_PAGE_PLATES")
    rows = [
        ("S01 · 0:00–0:08 · The incomplete book", f"{K}/S01_FIRST_frame.png"),
        ("S02 · 0:08–0:15 · The discovery", f"{K}/S02_LAST_frame.png"),
        ("S03 · 0:15–0:22 · Ch.1 First steps", f"{PP}/CH1/CH1_preview_CLOSE_alive_colour.jpg"),
        ("S04 · 0:22–0:29 · Ch.2 Taking care", f"{PP}/CH2/CH2_preview_CLOSE_alive_colour.jpg"),
        ("S05 · 0:29–0:36 · Ch.3 Learning to share", f"{PP}/CH3/CH3_preview_CLOSE_alive_colour.jpg"),
        ("S06 · 0:36–0:43 · Ch.4 Discovering the world", f"{PP}/CH4/CH4_preview_CLOSE_alive_colour.jpg"),
        ("S07 · 0:43–0:50 · Ch.5 Creating together", f"{PP}/CH5/CH5_preview_CLOSE_alive_colour.jpg"),
        ("S08 · 0:50–0:54 · Every chapter counts", f"{K}/S08_LAST_frame.png"),
        ("S09 · 0:54–1:00 · Campaign line + signature", os.path.join(KIT, "05_END_CARD", "END_CARD_B_full_signature_4K.png")),
    ]
    tw, th = 960, 540
    board = Image.new("RGB", (3 * tw + 80, 3 * (th + 70) + 140), (245, 242, 236))
    d = ImageDraw.Draw(board)
    d.text((20, 30), "THE MISSING CHAPTERS — 60 s storyboard (keyframes)", font=font(600, 52), fill=(31, 42, 58))
    for i, (t, f) in enumerate(rows):
        r, c = divmod(i, 3)
        x, y = 20 + c * (tw + 20), 130 + r * (th + 70)
        board.paste(Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS), (x, y))
        d.text((x, y + th + 10), t, font=font(600, 32), fill=(31, 42, 58))
    board.save(os.path.join(KIT, "03_REFERENCE_BOARDS", "storyboard_60s.jpg"), quality=92)

if __name__ == "__main__":
    import sys
    steps = sys.argv[1:] or ["keyframes", "pages", "row", "character", "storyboard"]
    for s in steps:
        {"keyframes": build_keyframes, "pages": build_pages, "row": build_restored_row,
         "character": build_character_board, "storyboard": build_storyboard}[s]()
        print("done", s, flush=True)
