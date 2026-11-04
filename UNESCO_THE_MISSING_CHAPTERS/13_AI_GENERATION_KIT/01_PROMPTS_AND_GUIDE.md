# THE MISSING CHAPTERS — Kit de génération IA

This kit contains everything needed to generate the film in an **image-to-video** tool such as Kling, Runway Gen-4, Google Veo, Luma or Hailuo.

## Workflow (à lire d'abord)
1. **Generate the 4 missing images (section A)** in an image tool such as Midjourney, Nano Banana, Flux or Firefly. Give it `03_REFERENCE_BOARDS/character_continuity_board.jpg` as the character reference so the boy stays the same.
2. **Generate each shot (section B)** in image-to-video mode, starting from the `FIRST_frame` file. When the tool accepts an end frame (*first + last frame*), also give it the `LAST_frame` file. Generate 2–3 takes per shot and keep the best one.
3. **The "living photograph" (Ch. 1–5):** generate the memory clip on its own, full frame, from `S0x_CHx_MEMORY_first_frame.png`. Then composite it into the page:
   - **Option A (recommended):** send me the clips. My pipeline (`12_SOURCE_CODE`) replaces the stills with the clips and re-renders the whole film automatically.
   - **Option B:** in After Effects, Premiere or DaVinci, key out the green window of `04_PAGE_PLATES/CHx/CHx_plate_*_greenwindow_4K.png` and place the clip behind it. The exact window corners are in `window_corners.json`.
   - Never ask the AI to animate the page itself: the text and the frame would warp.
4. **Typography and the end card** are already in `05_END_CARD`, in 4K with transparent layers. Never ask the AI to generate text.

## Constant style block
Add this to the end of every prompt:
> *Photorealistic cinematic film still, warm late-afternoon sunlight, soft shadows, gentle highlight roll-off, natural wood and paper textures, shallow depth of field, subtle 35mm film grain, warm ivory / honey / amber palette with soft sage green, restrained UNESCO-blue accents, Latin American setting, authentic and intimate, no text, no logo.*

**Negative prompt** (for tools that accept one):
> *text, letters, watermark, logo, subtitles, extra fingers, deformed hands, distorted face, plastic skin, cartoon, 3D render, oversaturated, lens flare, fast camera, zoom burst, morphing, flicker*

**Constant character** (see the board): a boy with dark brown curly hair, warm light-brown skin, brown eyes and round cheeks. Age 6 in the present: white short-sleeve school shirt. In the memories (ages 1–5): a **blue graduation cap with a gold tassel and a blue cape trimmed in gold**. This is the campaign's visual device: he was already learning, so he was already "graduating".

---

## A. Images manquantes à générer (texte→image ou image→image)

| ID | File to create | Prompt (EN) |
|---|---|---|
| **G1** | `05_MEMORY_ASSETS/mem_ch3_learning_to_share.png` (16:9) | *A 3-year-old boy with dark curly hair wearing a small blue graduation cap with a gold tassel and a blue cape trimmed with gold, sitting on a woven rug in a sunlit Latin American living room with a little girl of the same age. He holds a colourful wooden toy close to his chest, hesitates, then holds it out to her; her face lights up. Wooden blocks around them, terracotta floor, plants, warm window light, eye-level medium shot.* + style block |
| **G2** | `S02b_FIRST_frame` (16:9) | *Low floor-level close-up under an old wooden school desk: a 6-year-old boy's hand (white school shirt sleeve) reaching toward torn, aged, blank paper pages scattered on terracotta tiles, golden sunlight from a window grazing the paper edges, dust in the light, shallow depth of field.* + style block |
| **G3** | `S08b_FIRST_frame` (16:9) | *Over-the-shoulder shot: the same 6-year-old boy in a white school shirt carefully slides five torn, aged paper pages back into the front of an old hardcover storybook open on his wooden desk, sunlit classroom softly blurred behind him, quiet concentration, gentle smile.* + style block, reference: `S01_FIRST_frame.png` |
| **G4** | `S08b_LAST_frame` (16:9) | *The old storybook now complete and closed on the wooden desk, the boy's hands resting on the cover, slight smile, camera slightly higher and wider, warm sunlight, peaceful resolution.* + style block |

The paper pages in G2 and G3 must stay **blank**. The text is added in compositing.

---

## B. Plans vidéo (image→vidéo)

| Shot | Duration | First frame / Last frame | Video prompt (EN) |
|---|---|---|---|
| **S01** The incomplete book | 8 s | `S01_FIRST_frame.png` → `S01_LAST_frame.png` | *Slow, smooth dolly-in on the boy as he looks at the open storybook. He runs his fingertips over the torn stubs where pages were ripped out before the first chapter, frowns slightly, puzzled and curious. Classmates move softly in the blurred background. Very subtle handheld micro-movement.* |
| **S02** The discovery | 7 s | `S02_FIRST_frame.png` → `S02_LAST_frame.png` | *The camera slowly glides from the boy at his desk down toward the loose torn pages scattered on the terracotta floor, golden sunlight grazing their edges, dust floating in the light; gentle push-in toward the first page.* |
| S02b (optional) | 3 s | G2 | *His hand gently picks up the first torn page from the floor; realistic paper bending; shallow depth of field.* |
| **S03** Ch. 1 First steps (memory) | 6–8 s | `S03_CH1_MEMORY_first_frame.png` | *The baby boy takes his first wobbly steps across the tiled floor toward his father's open hands, arms out for balance, laughing; his mother claps and cheers in the background; the cape sways. Locked-off camera with a very slow push-in.* |
| **S04** Ch. 2 Taking care (memory) | 6–8 s | `S04_CH2_MEMORY_first_frame.png` | *The 2-year-old boy rubs soapy hands under the running tap, copying his mother beside him; he splashes a little, laughs, and tries again more carefully; water and foam move naturally. Static camera with a slight push-in.* |
| **S05** Ch. 3 Learning to share (memory) | 6–8 s | G1 | *He hesitates, holding the wooden toy, then offers it to the little girl; she takes it, smiles, and they start playing together. Natural, spontaneous children's movement. Static camera.* |
| **S06** Ch. 4 Discovering the world (memory) | 6–8 s | `S06_CH4_MEMORY_first_frame.png` | *Through the magnifying glass, the 4-year-old boy discovers a small red ladybug crawling across the green leaf his grandmother holds; his eyes widen with wonder; she smiles warmly; leaves sway in a light breeze, dappled sunlight. Very slow push-in.* |
| **S07** Ch. 5 Creating together (memory) | 6–8 s | `S07_CH5_MEMORY_first_frame.png` | *The 5-year-old boy and the older girl paint together on a large sheet of paper: brushes moving, colours mixing, the girl dips her brush in his paint pot, they laugh. Gentle lateral drift.* |
| **S08** Every chapter counts | 4 s | `S08_FIRST_frame.png` → `S08_LAST_frame.png` | *Slow, steady pull-back from the first page to reveal all six chapters laid in order on the wooden desk; warm sunlight; dust in the air; no movement of the pages.* Alternatively, use G3 → G4 with: *the boy slides the pages back into the book, turns through them, and closes the complete book; the camera slowly pulls back.* |
| **S09** End card | 6 s | `05_END_CARD/` | Not generated. Line from 54.4 s, signature from 56.9 s. |

### Assembly timing (60 s)
0:00 S01 · 0:08 S02 · 0:15 S03 (Ch. 1) · 0:22 S04 (Ch. 2) · 0:29 S05 (Ch. 3) · 0:36 S06 (Ch. 4) · 0:43 S07 (Ch. 5) · 0:50 S08 · 0:54 end card. 0.5 s dissolves. For Ch. 1–5, the photo stays sepia for 1.3 s, then moves into colour and motion over 1 s.

---

## Contenu du kit
- `02_KEYFRAMES/`: start and end frames for every shot (1920×1080 PNG), plus the clean memory images to animate.
- `03_REFERENCE_BOARDS/`: `storyboard_60s.jpg`, `character_continuity_board.jpg`, `restored_six_chapters_4K.jpg`.
- `04_PAGE_PLATES/CH1…CH6/`:
  - wide and close 4K page plates with a **green window** (#00FF00) for keying;
  - previews of the sepia print and the colour photo;
  - the flat page with transparency.
  - `window_corners.json` gives the exact corners of the window.
- `05_END_CARD/`: full end card (A: line only, B: line plus signature) and transparent 4K layers.

## Limites
- Only the 7 images you supplied are photographic. The pages, desk, end card and boards are composites I built by code. I couldn't generate G1–G4 here: no image model is available.
- The typeface is Source Sans 3, standing in for Myriad Pro. There is no UNESCO logo: add the official file in post.
- Student proposal, not an official UNESCO production.
