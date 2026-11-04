# THE MISSING CHAPTERS — Production notes

**Version:** v1 cinematic animatic. It is built from the 7 supplied reference images, without generative video.
**Status:** student creative proposal for UNESCO × EFAP Sprint Days. It is not an official UNESCO production.

## What this version is
This is a 60 s film at 3840×2160, 24 fps, in H.264 with AAC audio. It is assembled entirely by code from the team's 7 AI reference stills. Motion comes from:
- camera moves (dolly-in, pull-back, handheld micro-drift);
- the living-photograph composite. Each memory is a still sepia print that "develops" into colour. It then gets a slow inner push, drifting sunlight and dust motes.

The characters themselves do not move. No video-generation model was available in the production environment: no API key, and the network policy blocks the providers. This version should therefore be presented as an **animatic or prototype**. The brief explicitly accepts that for the video pitch.

## Structure (exact)
| # | In–Out | Content | Source |
|---|---|---|---|
| 1 | 0–8 s | The incomplete book: dolly-in on the boy and the torn stubs before Chapter 6 | `02_CHARACTER_REFERENCES/ref_boy_chapter6_book.png` |
| 2 | 8–15 s | The discovery: glide to the scattered pages, push into "Chapter 1" | `03_ENVIRONMENT_REFERENCES/ref_pages_on_floor.png` |
| 3 | 15–22 s | Ch.1 First Steps (Age 1) | `05_MEMORY_ASSETS/mem_ch1_first_steps.png` |
| 4 | 22–29 s | Ch.2 Taking Care (Age 2): hand-washing | `mem_ch2_taking_care.png` |
| 5 | 29–36 s | Ch.3 Learning to Share (Age 3): **PLACEHOLDER, image not supplied** | none |
| 6 | 36–43 s | Ch.4 Discovering the World (Age 4) | `mem_ch4_discovering_world.png` |
| 7 | 43–50 s | Ch.5 Creating Together (Age 5) | `mem_ch5_creating_together.png` |
| 8 | 50–60 s | All six chapters laid out in order (Ch.6 = classroom), then the end card | `ref_classroom_raised_hand.png` |

The sequences are joined by 0.5 s dissolves, centred on each boundary at +0 to +0.5 s.

## Living photograph (`12_SOURCE_CODE/pages.py`)
1. A procedural aged-paper page (2250×3000) with fibres, foxing, edge ageing and a torn binding edge with a lighter fibre rim. Typography is set in post: chapter number, title, age and caption. Nothing is AI-generated text.
2. A fixed 16:9 photo window. The memory image is graded and given a print treatment: paper-limited black point, paper tooth, inner edge darkening and a faint sheen. Canvas lighting is baked in.
3. The page sits on a defocused wooden desk with a baked contact shadow and soft shadow. It has a slight rotation and keystone.
4. A **single combined homography** (camera ∘ page placement) warps the page *and* its photo in one operation. The memory cannot slide or float relative to the paper.
5. Each memory starts as a sepia print, develops into colour over 1 s at t = 1.3 s, and keeps a slow inner push.

## Sound (`12_SOURCE_CODE/audio.py`)
The whole soundtrack is original and synthesised from code: no samples, no third-party licences.
- **Music:** additive felt-piano model (inharmonic partials, two-string beating, hammer noise) and an ambient pad, through a convolution reverb. The harmonic plan changes at each "photo comes alive" moment and resolves on the signature at 56.9 s.
- **Foley:** book thump and opening, paper rustles on every page, a soft shimmer swell on each memory develop, pages laid back in order.
- **Ambience:** room tone.
- **Master:** EBU R128, −16 LUFS integrated, −1.5 dBTP.
- **No voice-over:** no TTS was available. The campaign line appears on screen.

## Branding
- **Palette:** UNESCO Education Sector guidelines (p.11). Chapter colours are Dark Green, Dark Blue, Magenta, Orange, Purple and UNESCO Blue #0077D4. The end-card five-colour bar uses the same palette.
- **Typography:** Myriad Pro is the required typeface but was not available because it's licensed. The fallback is **Source Sans 3** (Adobe, SIL OFL), installed from npm `@fontsource/source-sans-3`. Swap in Myriad Pro files at `12_SOURCE_CODE/fonts/` (same naming) and re-render.
- **Logo:** no official logo file was supplied, so **no UNESCO logo appears**. It was deliberately not recreated or extracted from PDFs.
- **Disclaimer:** "A student creative proposal · UNESCO × EFAP Sprint Days 2026".

## Known limitations
- No character animation (no video model). Seq. 8 shows the restored chapters laid out instead of the boy physically re-inserting the pages.
- The sources are about 1672 px wide, so the 4K master is upscaled (Lanczos and unsharp mask, then grain). It is softer than native 4K, most visibly at the end of each push-in.
- Chapter 3 has no source image. Drop it at `05_MEMORY_ASSETS/mem_ch3_learning_to_share.png`, set `img=` in `pages.py`, then re-run `render.py 5` and `assemble.sh`.
- Some baked text in the supplied stills ("CHAPTER 6", "My First Day at School", "1er grado") comes from the reference images.
- The audio was verified by measurement only (loudness, spectrogram, waveform), not by listening.

## Rebuild
```
cd 12_SOURCE_CODE
for n in 1 2 3 4 5 6 7 8; do python3 render.py $n; done   # → 09_EDITING/sequences
python3 audio.py                                          # → 08_AUDIO
bash assemble.sh                                          # → 11_FINAL_EXPORTS, 09_EDITING/individual_sequences, QC sheet
```
Dependencies: Python 3, numpy, pillow, opencv-python-headless, scipy, FFmpeg ≥ 6.
