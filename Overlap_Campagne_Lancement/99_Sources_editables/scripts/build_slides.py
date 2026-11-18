#!/usr/bin/env python3
"""Slides à insérer après l'intercalaire « MARKETING & COMMUNICATION » du Canva (format 1440×810 pt = 20×11,25 in, identique au Canva).
Textes natifs (Monument Extended / Syne) pour rester éditables après import dans Canva ; visuels en PNG."""
import os, json
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
C = json.load(open(os.path.join(ROOT, "campaign.json"), encoding="utf-8"))
V = os.path.join(ROOT, "..", "03_Visuels"); A = os.path.join(ROOT, "assets")
OUT = os.path.join(ROOT, "..", "02_Slides"); os.makedirs(OUT, exist_ok=True)
CREAM, INK, BLUE, RED, ORANGE, YELLOW, MUTE, WHITE = (RGBColor.from_string(x) for x in ("FEF7EC", "000000", "1143F7", "FE512D", "FF751F", "FBB736", "6E6A64", "FFFFFF"))
DISPLAY, TEXT = "Monument Extended", "Syne"

prs = Presentation(); prs.slide_width, prs.slide_height = Inches(20), Inches(11.25)
BL = prs.slide_layouts[6]

def slide():
    s = prs.slides.add_slide(BL); bg = s.background.fill; bg.solid(); bg.fore_color.rgb = CREAM; return s

def text(s, x, y, w, h, t, size=18, font=TEXT, bold=False, color=INK, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, ls=1.1):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0; tf.vertical_anchor = anchor
    for i, line in enumerate(t.split("\n")):
        par = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); par.alignment = align; par.line_spacing = ls
        for j, chunk in enumerate(line.split("**")):
            if not chunk: continue
            r = par.add_run(); r.text = chunk; f = r.font; f.name = font; f.size = Pt(size); f.color.rgb = color; f.bold = bold or (j % 2 == 1)
    return tb

def title(s, t, size=46):
    text(s, 0.7, 0.55, 18.6, 1.2, t, size=size, font=DISPLAY, bold=True)

def pill(s, x, y, w, h, t, fill=BLUE, color=CREAM, size=18, font=TEXT):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.adjustments[0] = 0.5; sh.fill.solid(); sh.fill.fore_color.rgb = fill; sh.line.fill.background(); sh.shadow.inherit = False
    tf = sh.text_frame; tf.margin_left = tf.margin_right = Inches(.1); tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    par = tf.paragraphs[0]; par.alignment = PP_ALIGN.CENTER; r = par.add_run(); r.text = t
    r.font.name = font; r.font.size = Pt(size); r.font.bold = True; r.font.color.rgb = color; return sh

def box(s, x, y, w, h, fill=WHITE, line=None, radius=.12):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.adjustments[0] = radius; sh.fill.solid(); sh.fill.fore_color.rgb = fill; sh.shadow.inherit = False
    if line: sh.line.color.rgb = line; sh.line.width = Pt(2)
    else: sh.line.fill.background()
    return sh

def pic(s, path, x, y, w=None, h=None):
    return s.shapes.add_picture(path, Inches(x), Inches(y), Inches(w) if w else None, Inches(h) if h else None)

def loop(s, x, y, w, name="deco_loop_lavande.png"):
    p = pic(s, os.path.join(A, name), x, y, w=w); return p

def notes(s, t): s.notes_slide.notes_text_frame.text = t

# 1 ─ Insight & objective
s = slide(); loop(s, 13.5, -1.5, 8)
title(s, "Launch insight")
text(s, 0.7, 1.9, 11, 2.6, "“Finding a date is harder\nthan finding a place.”", size=40, font=DISPLAY, bold=True, ls=1.05)
text(s, 0.7, 4.0, 11, .5, "4 individual interviews, 22–25-year-olds · 1/3 of 18–24 say organising outings is hard (Harris Interactive)", size=16, color=MUTE)
steps = [("Target", "18–25 in Paris · Camille, 23"), ("Problem", "Friends want to meet, the plan gets lost in the chat"), ("Alternative", "Group chats, polls, shared calendars"),
         ("Why it matters", "Plans die, people lose touch"), ("Evidence", "4 interviews + market data"), ("Riskiest assumption", "One person can get 2+ friends to confirm"), ("Next test", "Launch evening: plan your NEXT outing")]
for i, (k, v) in enumerate(steps):
    x = 0.7 + i * 2.7; box(s, x, 5.0, 2.5, 2.4, fill=WHITE)
    text(s, x + .2, 5.2, 2.1, .6, k, size=15, bold=True, color=BLUE if i < 5 else RED)
    text(s, x + .2, 5.85, 2.1, 1.5, v, size=14)
pill(s, 0.7, 8.2, 3.4, .75, "OUR OBJECTIVE", fill=INK, size=16)
text(s, 4.4, 8.05, 15, 1.2, "**10 friend groups** confirm their next outing (15 groups expected on the night).", size=28, font=TEXT)
text(s, 0.7, 9.6, 18, .6, "Documented = from our interviews and research · Objective = a target, not a result", size=13, color=MUTE)
notes(s, "Start from the course logic: target, problem, alternative, why it matters, evidence, riskiest assumption, next test. Our evidence is small (4 interviews) so the campaign is built as a test.")

# 2 ─ Creative idea
s = slide()
pic(s, os.path.join(V, "01_Visuel_principal/01b_KV_paysage_1920x1080.png"), 6.4, 1.9, w=12.9)
title(s, "The creative idea", size=40)
text(s, 0.7, 2.0, 5.2, 4.5, "We all say\n“on se tient au jus”.\n\nWe show the moment it becomes a real date:\n**a day, a time, a place.**", size=22)
for i, (t, f, c) in enumerate([("vague phrase", WHITE, INK), ("jeudi ? = the slot", BLUE, CREAM), ("day · time · place", INK, CREAM)]):
    pill(s, 0.7, 6.4 + i * 1.0, 4.6, .75, t, fill=f, color=c, size=17)
text(s, 0.7, 9.7, 5.2, 1, "Same order as the app: slot first, place second.", size=16, color=MUTE)
notes(s, "Echo of our opening slide 'We'll keep in touch / on se tient au jus'. Bubble → blue pill 'jeudi ?' → black ticket.")

# 3 ─ Visuals in situation (poster + social)
s = slide(); title(s, "Visuals in situation", size=40)
pic(s, os.path.join(V, "20_Mises_en_situation/20_Situation_reseaux_1920x1080.png"), 0.7, 1.8, w=11.6)
pic(s, os.path.join(V, "02_Affiche_A3/02_Affiche_A3.png"), 12.8, 1.8, h=8.6)
text(s, 0.7, 8.6, 11.6, 1.6, "Carousel = recognise · Story = forward to the group · Story = reminder\nA3 poster on campus with a QR to register the group", size=17)
notes(s, "All French copy is in the dossier appendix (copy deck).")

# 4 ─ Reel
s = slide(); title(s, "Reel / TikTok · 15 s", size=40)
plans = sorted(f for f in os.listdir(os.path.join(V, "09_Reel_TikTok")) if f.startswith("Plan_"))
labels = ["0–3.6 s\nGroup chat", "3.6–6.2 s\nNothing happens", "6.2–7.8 s\nSlots compared", "7.8–9.4 s\nOne tap", "9.4–10.9 s\nThen the place", "10.9–12.8 s\n“c'est calé !”", "12.8–15 s\nCTA"]
for i, f in enumerate(plans):
    x = 0.7 + i * 2.7; pic(s, os.path.join(V, "09_Reel_TikTok", f), x, 1.9, w=2.45)
    text(s, x, 6.4, 2.45, 1, labels[i], size=14, bold=False)
text(s, 0.7, 7.8, 18.5, 2, "**Role:** make people recognise their own group chat, then show the benefit in the right order.\n**CTA:** Inscris ton groupe · lien en bio  ·  Boosted on Instagram 1–8 March (€100).", size=19)
notes(s, "MP4 in 03_Visuels/09_Reel_TikTok. Screens are the real mock-ups of the app.")

# 5 ─ Journey & channel roles
s = slide(); title(s, "One journey, one job per channel", size=38)
cols = [("Reel", "Recognise the situation", "09_Reel_TikTok/" + plans[0], 2.6), ("Story to forward", "Trigger the invitation in the group chat", "04_Stories/04_Story_2_Invitation_a_transferer_1080x1920.png", 2.6),
        ("Table tent", "Plan the NEXT outing on the night", "06_Chevalet_table/06_Chevalet_face_A5_apercu.png", 4.4), ("D+1 visual", "Confirm before it gets lost", "07_Suivi_J+1/07_Suivi_J+1_1080x1350.png", 3.4)]
x = 0.7
for i, (n, r, path, w) in enumerate(cols):
    pic(s, os.path.join(V, path), x, 2.0, w=w)
    pill(s, x, 7.0, min(w, 3.6), .65, n, fill=[BLUE, ORANGE, RED, INK][i], size=16)
    text(s, x, 7.85, max(w, 3.2), 1.2, r, size=17)
    x += w + 1.2
text(s, 0.7, 9.6, 18.6, .8, "Instagram + TikTok + our own group chats + campus posters: what a team of six can really run.", size=16, color=MUTE)

# 6 ─ Event
s = slide(); title(s, "On se tient au jus… jeudi ?", size=40)
pill(s, 0.7, 1.75, 9.4, .8, "Thursday 11 March 2027 · 18:30–21:30 · Paris", fill=INK, size=19)
pic(s, os.path.join(V, "20_Mises_en_situation/20_Situation_evenement_1920x1080.png"), 10.6, 1.75, w=8.7)
text(s, 0.7, 2.9, 9.4, 1.2, "The evening already has a date. So guests use it to fix their **next** outing.", size=22)
for i, t in enumerate(["Scan · everyone adds their availability (2 min)", "Absent friends get the same link in the group chat", "20:45 · the screen shows your common slot + 2 places", "Vote → “C'est calé” card → D+1 confirmation"]):
    pill(s, 0.7, 4.4 + i * 1.05, .75, .75, str(i + 1), fill=[YELLOW, ORANGE, RED, BLUE][i], color=INK if i == 0 else CREAM, size=18, font=DISPLAY)
    text(s, 1.7, 4.5 + i * 1.05, 8.4, .8, t, size=19)
text(s, 10.6, 7.0, 8.7, 3, "**60 guests** ≈ 15 groups of 4 · 75 places open\n**Venue (prospect):** Le Comptoir Général, Paris 10e — not confirmed\n**Registration:** free, by group of 3 to 5, one form\n**Prototype test:** the team calculates slots by hand (concierge test)", size=17)

# 7 ─ Calendar
s = slide(); title(s, "Calendar · D−21 to D+14", size=40)
items = [("D−21", "18 Feb", "Kick-off · venues contacted"), ("D−15", "24 Feb", "Venue + URL → QR → print proof"), ("D−14", "25 Feb", "Reel + teasing story"),
         ("D−12", "27 Feb", "Carousel"), ("D−10", "1 Mar", "Registrations open · invitation · posters · boost"), ("D−3", "8 Mar", "Reminder story"),
         ("D", "11 Mar", "Launch evening"), ("D+1", "12 Mar", "Confirm the outing"), ("D+7", "18 Mar", "Did you meet?"), ("D+14", "25 Mar", "Second outing · decision")]
line = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.9), Inches(5.0), Inches(18.2), Inches(.08)); line.fill.solid(); line.fill.fore_color.rgb = INK; line.line.fill.background()
for i, (d, dt, t) in enumerate(items):
    x = 0.7 + i * 1.86; ev = d == "D"
    pill(s, x, 4.62, 1.6, .85, d, fill=RED if ev else (BLUE if d.startswith("D−") else INK), size=17, font=DISPLAY)
    text(s, x, 2.9 if i % 2 == 0 else 5.8, 1.75, .5, dt, size=15, bold=True)
    text(s, x, 3.35 if i % 2 == 0 else 6.25, 1.75, 1.3, t, size=13.5)
text(s, 0.7, 8.6, 18.6, 1.2, "Full timeline and editorial calendar (content · channel · date · owner · CTA) in the dossier and in the planning spreadsheet.", size=16, color=MUTE)

# 8 ─ Budget & measurement
s = slide(); title(s, "Budget & measurement", size=40)
box(s, 0.7, 1.9, 7.2, 7.8, fill=WHITE)
text(s, 1.1, 2.2, 6.6, .6, "Campaign budget (estimate)", size=19, bold=True)
for i, (n, v) in enumerate([("Welcome juices × 60", "€240"), ("Meta boost", "€100"), ("Print (posters, tents, cards, badges)", "€86"), ("Supplies", "€25"), ("Venue hire (to negotiate)", "€0"), ("Contingency 10%", "€45")]):
    text(s, 1.1, 3.0 + i * .72, 4.9, .6, n, size=16); text(s, 6.0, 3.0 + i * .72, 1.5, .6, v, size=16, bold=True, align=PP_ALIGN.RIGHT)
pill(s, 1.1, 7.6, 6.4, .9, "Total ≈ €496", fill=BLUE, size=24, font=DISPLAY)
text(s, 8.5, 1.9, 10.8, 1, "North Star: **activated groups**", size=26, font=TEXT)
text(s, 8.5, 2.75, 10.8, 1.6, "≥ 3 people sent availability · one slot AND one place · date within 14 days · ≥ 3 confirmations. One group ID per organiser e-mail, merged if 2/3 of members overlap.", size=15, color=MUTE)
kp = [("75", "registrations"), ("60", "on site"), ("30", "absent friends answer"), ("10", "activated groups"), ("7", "outings at D+7"), ("3", "2nd outings D+14")]
for i, (n, l) in enumerate(kp):
    x = 8.5 + (i % 3) * 3.65; y = 4.6 + (i // 3) * 2.5
    box(s, x, y, 3.4, 2.2, fill=BLUE if n == "10" else WHITE)
    text(s, x + .3, y + .25, 3, 1, n, size=44, font=DISPLAY, bold=True, color=CREAM if n == "10" else BLUE)
    text(s, x + .3, y + 1.35, 3, .7, l, size=15, color=CREAM if n == "10" else INK)
text(s, 8.5, 9.75, 10.8, .8, "Objectives, not results. Decision at D+14: ≥ 8 activated groups → persevere; < 5 → rethink the invitation step.", size=14, color=MUTE)

# 9 ─ NEW · Free vs Premium & Pricing
s = slide(); title(s, "Free vs Premium & Pricing", size=40)
box(s, 0.7, 1.9, 5.6, 7.7, fill=WHITE, line=INK)
text(s, 1.1, 2.2, 5, .8, "Free · €0", size=28, font=DISPLAY, bold=True)
text(s, 1.1, 3.2, 4.9, 6, "Invite friends by link\nFind the common slot\nChoose a convenient place\nReminders\n1 calendar · 3 groups\n\nThe whole journey works even if nobody pays.", size=17, ls=1.35)
box(s, 6.7, 1.9, 6.6, 7.7, fill=BLUE)
text(s, 7.1, 2.2, 6, .8, "Premium", size=28, font=DISPLAY, bold=True, color=CREAM)
pill(s, 10.2, 2.25, 2.8, .6, "the reason to pay", fill=YELLOW, color=INK, size=14)
text(s, 7.1, 3.2, 5.9, 2, "**Rituals:** Overlap proposes each group's next 2 common slots, at the rhythm you choose.", size=19, color=CREAM)
text(s, 7.1, 5.0, 5.9, 3, "+ several calendars · unlimited groups\n+ advanced place filters · no sponsored places\nIndividual plan: the friends stay free.", size=16, color=CREAM, ls=1.3)
text(s, 7.1, 7.8, 5.9, 1.6, "Camille sets “La bande de Lyon – once a month”. Overlap sends 2 slots; she taps once.", size=15, color=CREAM)
for i, (n, pr, sub) in enumerate([("Monthly", C["price_month"], "per month"), ("Annual", C["price_year"], "save €12.89 (−27%)"), ("Student", C["price_student"], "per month · verified")]):
    y = 1.9 + i * 2.6; box(s, 13.7, y, 5.6, 2.35, fill=YELLOW if i == 2 else WHITE)
    text(s, 14.0, y + .2, 5, .5, n, size=16, bold=True); text(s, 14.0, y + .7, 5, .9, pr, size=34, font=DISPLAY, bold=True)
    text(s, 14.0, y + 1.65, 5, .5, sub, size=14)
text(s, 0.7, 9.85, 18.6, .8, "Proposed prices incl. VAT · benchmark: Spotify Student €7.07, TimeTree US$4.49 · test: “book your 1st month for €1” at D+7 (success ≥ 5%)", size=14, color=MUTE)

# 10 ─ NEW · Sponsored places
s = slide(); title(s, "Sponsored Places in the App", size=40)
pic(s, os.path.join(V, "11_Annonce_sponsorisee/11_Annonce_sponsorisee_ecran_1080x1350.png"), 0.7, 1.7, h=9.2)
rules = [("When", "Only after the group confirmed its slot (step “Choose where to meet”)."), ("How often", "Max. 1 sponsored place per list, never first · same venue max. 2× per user per week."),
         ("Relevance", "Open at the slot, fits the group size and budget, no one travels 10+ min more than with the best option."),
         ("Who", "Bars, restaurants, bowling, escape games, culture. No dating, gambling, tobacco, credit, no alcohol promotion (Loi Évin)."),
         ("Premium", "No sponsored places at all — only the ranking by travel time.")]
for i, (k, v) in enumerate(rules):
    y = 1.9 + i * 1.65; pill(s, 8.6, y, 2.6, .7, k, fill=[BLUE, ORANGE, RED, INK, YELLOW][i], color=INK if i == 4 else CREAM, size=16)
    text(s, 11.5, y - .02, 7.8, 1.5, v, size=18)
text(s, 8.6, 10.2, 10.7, .6, "Formats: place card · map pin · 1 card in 6 in “Discover”. Venues shown are fictional.", size=14, color=MUTE)

# 11 ─ NEW · Local partners & revenue model
s = slide(); title(s, "Local Partners & Revenue Model", size=38)
pros = [("Bar", "Le Comptoir Général", "10e · Canal St-Martin", "Launch venue (priority)"), ("Restaurant", "Bouillon République", "3e · République", "Mon–Thu group tables"),
        ("Bowling", "Bowling Mouffetard", "5e · Latin Quarter", "Weeknight lanes"), ("Escape game", "Gamescape", "11e · République", "Off-peak sessions")]
for i, (cat, n, area, off) in enumerate(pros):
    y = 1.85 + i * 1.62; box(s, 0.7, y, 8.6, 1.42, fill=BLUE if i == 0 else WHITE)
    col = CREAM if i == 0 else INK
    text(s, 1.0, y + .15, 2.3, .5, cat, size=14, bold=True, color=YELLOW if i == 0 else BLUE)
    text(s, 1.0, y + .55, 4.6, .6, n, size=19, bold=True, color=col)
    text(s, 5.6, y + .2, 3.5, .5, area, size=14, color=col); text(s, 5.6, y + .7, 3.5, .6, off, size=14, color=col)
text(s, 0.7, 8.4, 8.6, 1, "All are **prospects** (checked on official websites, no contact yet).", size=15, color=MUTE)
mods = [("A · Monthly subscription", C["venue_subscription"] + "/month", "Paid in advance · hard to sell before we have users", WHITE),
        ("B · Commission per booking", C["venue_commission"], "Escape game, bowling: code OVERLAP in their booking system", WHITE),
        ("C · Paid placement per confirmed plan", C["venue_cpp"] + " / plan", "Our choice at launch, after a 3-month free pilot: works for walk-in bars", YELLOW)]
for i, (n, pr, d, f) in enumerate(mods):
    y = 1.85 + i * 2.0; box(s, 9.9, y, 9.4, 1.8, fill=f)
    text(s, 10.2, y + .2, 6, .6, n, size=17, bold=True); text(s, 16.0, y + .15, 3.1, .7, pr, size=22, font=DISPLAY, bold=True, align=PP_ALIGN.RIGHT)
    text(s, 10.2, y + .85, 8.8, .9, d, size=15)
box(s, 9.9, 7.95, 9.4, 1.9, fill=INK)
text(s, 10.2, 8.1, 8.9, 1.7, "**Example, month 4 (assumptions):** 20 sponsored plans × €2 = €40 · 6 bookings = €52 · 12 Premium = €26 → **≈ €118/month**. Goal: prove the trigger, not profit.", size=16, color=CREAM)
text(s, 0.7, 9.95, 18.6, .7, "Bill only what we can check: a confirmed plan in Overlap (bar) or a paid booking with our code (escape game).", size=14, color=MUTE)

prs.save(os.path.join(OUT, "Overlap_MC_slides_a_inserer_apres_intercalaire.pptx"))
print("slides:", len(prs.slides))
