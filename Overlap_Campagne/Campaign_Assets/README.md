# Overlap — Campaign « La semaine pro » — asset index

Everything here is used in `../Overlap_Marketing_Communication.pptx` / `.pdf` and in `../Overlap_Marketing_Communication.docx` (section 12).

| Folder | Files | Use |
|---|---|---|
| `01_Poster/` | `Overlap_Poster_A2_print.pdf` (vector, 420 × 594 mm, prints at A3 too) · `Overlap_Poster_A2.png` (3968 × 5613) · `Overlap_Poster_in_situ.png` | Print + deck |
| `02_Film/` | `Overlap_Film_Storyboard.pdf` (6 pages, A4) · `Film_Shot_List.md` · `frames/Shot_1…8.png` (1080 × 1920) | Shoot on Sat 28 Nov |
| `03_Social/` | `C1_Share_Carousel_1…6.png`, `C2_How_It_Works_1…5.png` (1080 × 1350) · `C3_Pilot_Story_1…3.png` (1080 × 1920) · `Captions_ready_to_post.md` (FR + EN) | Instagram |
| `04_Activation/` | `Wall_Board_A1_print.pdf` + `.png` (main support) · `Transparent_Week_Grid_A5_print.pdf` (print in black on transparency film) · `RDV_Card_A6_print.pdf` · `Activation_Scene.png` · `Activation_Run_Sheet.md` | Stand 1 & 3 Dec |
| `05_Pilot_Budget/` | `Overlap_Budget_and_Pilot_Tracker.xlsx` (budget with formulas + pilot tracker with automatic KPIs) · `Pilot_Playbook.md` (flow + exact messages) | Pilot 1–18 Dec |
| `06_Brand/` | `Overlap_logo_icon.png` (from our Canva) · `Overlap_palette.png` | Reference |
| `Editable_Sources/` | `html/*.html` (every creation as editable HTML/CSS: open in a browser, change the text) · `css/brand.css` · `fonts/` (Syne, Unbounded, Inter — OFL) · `build/` (scripts that re-export PNG/PDF, the deck and the Word file; `build/data.json` holds the budget, KPIs and calendar used everywhere) | Editing |

## Notes
- **Fonts.** The deck and Word file name *Monument Extended* (titles) and *Syne* (text), as in our Canva. Monument Extended is a commercial font that was not available here, so the PNG/PDF renders use **Unbounded** (free, similar wide geometry) as a stand-in for titles. In Canva or on a computer with Monument installed, the PPTX titles show in Monument.
- **No QR code or link** is printed: no pilot form exists online yet, and we only print destinations we have tested. Actions are: come to the stand, or reply « GROUPE » to the story. Proposed Instagram name `overlap.pilot` must be checked and reserved.
- **Screens are illustrative prototype screens**, in the style of our Canva app screens. During the pilot, the same steps run by WhatsApp (concierge test).
- **All budget amounts and targets are estimates / steering hypotheses.** Study figures keep their source (Harris Interactive, Morning Consult).
- To re-export after editing: `npm i playwright pptxgenjs docx`, then `node build/render.js` (all creations) — see the top of each build script.
