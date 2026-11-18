#!/usr/bin/env python3
"""Génère les sources HTML éditables de tous les visuels de la campagne Overlap.
Toutes les infos variables (date, horaires, ville, CTA, URL) viennent de ../campaign.json.
Usage : python3 build_visuals.py   puis   node render.js   (voir build_all.sh)
"""
import json, os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = json.load(open(os.path.join(ROOT, "campaign.json"), encoding="utf-8"))
OUT = os.path.join(ROOT, "html")
A = "../assets/"
VISUALS = []  # (fichier, largeur, hauteur, sortie, mode)


def page(name, w, h, body, css="", out=None, mode="png", unit="px"):
    doc = f"""<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>{name}</title><link rel="stylesheet" href="overlap.css">
<style>html,body{{width:{w}{unit};height:{h}{unit};}} .canvas{{width:{w}{unit};height:{h}{unit};}} {css}</style></head>
<body><div class="canvas">{body}</div></body></html>"""
    open(os.path.join(OUT, name + ".html"), "w", encoding="utf-8").write(doc)
    VISUALS.append({"html": name + ".html", "w": w, "h": h, "unit": unit, "out": out or name, "mode": mode})


def esc(s):
    return html.escape(s, quote=False)


def loop(w, h, d, color="var(--lav)", sw=16, op=1, extra=""):
    return (f'<svg class="loop" style="left:0;top:0;opacity:{op};{extra}" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/></svg>')


def qr(size, label_size=20):
    if C.get("registration_url"):
        return f'<div class="qr ready" style="width:{size}px;height:{size}px"><img src="{A}qr_inscription.png" alt="QR inscription"></div>'
    return (f'<div class="qr" style="width:{size}px;height:{size}px;font-size:{label_size}px;line-height:1.15">'
            f'<div style="padding:8px">QR inscription<div style="font-weight:500;font-size:{int(label_size*.75)}px;margin-top:6px">emplacement réservé :<br>URL à fournir avant BAT</div></div></div>')


def wordmark(x, y, w, color="black"):
    return f'<img class="abs" src="{A}logo_wordmark_{color}.png" style="left:{x}px;top:{y}px;width:{w}px">'


def ticket(day, hour, place, scale=1.0, labels=("Jour", "Heure", "Lieu"), vs=38):
    return (f'<div class="ticket" style="transform:scale({scale});transform-origin:left top;grid-template-columns:1.25fr 1.25fr .8fr">'
            f'<div><div class="lab">{labels[0]}</div><div class="val" style="font-size:{vs}px;white-space:nowrap">{day}</div></div>'
            f'<div><div class="lab">{labels[1]}</div><div class="val" style="font-size:{vs}px;white-space:nowrap">{hour}</div></div>'
            f'<div><div class="lab">{labels[2]}</div><div class="val" style="font-size:{vs}px;white-space:nowrap">{place}</div></div></div>')


LINE1, LINE2 = "On se tient<br>au jus…", "jeudi&nbsp;?"
DAY, HOUR, CITY = C["event_day_short"], C["event_start"], C["event_city"]
SIG = C["signature"]
CTA = f'{C["cta_register"]} · {C["cta_where"]}'

# ---------------------------------------------------------------- 1. KV 1080x1350
kv_body = f"""
{loop(1080,1350,"M1180 260 C 900 100, 620 230, 700 440 C 780 650, 1060 600, 1010 400 C 960 200, 640 300, 560 600 C 470 900, 900 1060, 1180 960", sw=18)}
{wordmark(64,70,230)}
<div class="abs chip" style="right:64px;top:62px;font-size:24px;background:var(--ink);color:var(--cream)">Lancement · Paris</div>
<img class="abs" src="{A}logo_mascot.png" style="left:790px;top:170px;width:250px;transform:rotate(8deg)">
<div class="abs chat" style="left:64px;top:160px;width:680px">
  <div class="msg fade" style="font-size:32px"><span class="who" style="color:var(--orange)">Léa</span>faut trop qu'on se voie 😭</div>
  <div class="msg fade" style="font-size:32px"><span class="who" style="color:var(--violet)">Max</span>grave, ce mois-ci promis</div>
  <div class="msg" style="font-size:40px;font-weight:700"><span class="who" style="color:var(--blue)">Camille</span>on se tient au jus !</div>
</div>
<div class="abs display" style="left:64px;top:545px;font-size:94px">{LINE1}</div>
<div class="abs" style="left:56px;top:745px;transform:rotate(-3deg)"><span class="pill blue" style="font-size:118px">{LINE2}</span></div>
<div class="abs" style="left:64px;top:960px;width:952px">{ticket(DAY, HOUR, CITY)}</div>
<div class="abs syne" style="left:64px;top:1110px;width:952px;font-size:32px;font-weight:700;line-height:1.2">La soirée où ton groupe cale sa prochaine sortie.</div>
<div class="abs pill orange" style="left:64px;top:1180px;font-size:28px;font-family:OvSyne;font-weight:800;padding:20px 32px">{CTA} →</div>
<div class="abs sig" style="left:64px;top:1290px;font-size:22px">{SIG}</div>
"""
page("01_KV_1080x1350", 1080, 1350, kv_body)

# ---------------------------------------------------------------- 1b. KV paysage 1920x1080 (slides)
kvl = f"""
{loop(1920,1080,"M2000 120 C 1600 -40, 1240 160, 1330 420 C 1420 690, 1780 640, 1720 400 C 1660 170, 1260 260, 1180 560 C 1090 900, 1600 1100, 2000 960", sw=20)}
{wordmark(96,84,300)}
<div class="abs display" style="left:96px;top:250px;font-size:128px">{LINE1}</div>
<div class="abs" style="left:86px;top:520px;transform:rotate(-3deg)"><span class="pill blue" style="font-size:170px">{LINE2}</span></div>
<div class="abs" style="left:96px;top:800px;width:1000px">{ticket(DAY, HOUR, CITY)}</div>
<div class="abs chat" style="left:1240px;top:150px;width:600px">
  <div class="msg fade"><span class="who" style="color:var(--orange)">Léa</span>faut trop qu'on se voie 😭</div>
  <div class="msg fade"><span class="who" style="color:var(--violet)">Max</span>grave, ce mois-ci promis</div>
  <div class="msg" style="font-weight:700"><span class="who" style="color:var(--blue)">Camille</span>on se tient au jus !</div>
  <div class="msg me" style="font-weight:700">…jeudi&nbsp;? 18h30 👀<span class="meta">lu par 4</span></div>
</div>
<img class="abs" src="{A}logo_mascot.png" style="left:1600px;top:660px;width:240px">
<div class="abs sig" style="left:1240px;top:940px;font-size:28px">{SIG}</div>
"""
page("01b_KV_paysage_1920x1080", 1920, 1080, kvl)

# ---------------------------------------------------------------- 2. Affiche A3 (303x426 mm avec 3 mm de fond perdu)
a3 = f"""
<div class="abs" style="inset:0;font-size:3.78px"></div>
{loop(1145,1610,"M1260 260 C 980 60, 640 230, 730 470 C 820 720, 1130 680, 1060 440 C 990 210, 620 300, 560 640 C 480 1060, 960 1250, 1260 1100", sw=20)}
{wordmark(80,84,330)}
<div class="abs chip" style="right:80px;top:84px;font-size:26px;background:var(--ink);color:var(--cream)">Lancement · {CITY}</div>
<img class="abs" src="{A}logo_mascot.png" style="left:790px;top:180px;width:300px;transform:rotate(8deg)">
<div class="abs chat" style="left:80px;top:210px;width:720px">
  <div class="msg fade"><span class="who" style="color:var(--orange)">Léa</span>faut trop qu'on se voie 😭</div>
  <div class="msg fade"><span class="who" style="color:var(--violet)">Max</span>grave, ce mois-ci promis</div>
  <div class="msg" style="font-size:42px;font-weight:700"><span class="who" style="color:var(--blue)">Camille</span>on se tient au jus !</div>
</div>
<div class="abs display" style="left:80px;top:660px;font-size:112px">{LINE1}</div>
<div class="abs" style="left:70px;top:900px;transform:rotate(-3deg)"><span class="pill blue" style="font-size:150px">{LINE2}</span></div>
<div class="abs" style="left:80px;top:1150px;width:985px">{ticket(C["event_day_short"], C["event_hours"].replace(" – ","–"), CITY, vs=32)}</div>
<div class="abs syne" style="left:80px;top:1290px;width:720px;font-size:31px;font-weight:800;line-height:1.18">La soirée où ton groupe cale sa prochaine sortie.</div>
<div class="abs syne" style="left:80px;top:1400px;width:700px;font-size:25px;font-weight:500;line-height:1.3">Gratuit · inscription par groupe de {C["group_size"]} amis<br>Scanne le QR · {C["event_address_note"]}</div>
<div class="abs" style="right:80px;top:1290px">{qr(230,24)}</div>
<div class="abs sig" style="left:80px;bottom:60px;font-size:26px">{SIG}</div>
"""
# conçue en px à l'échelle 1145x1610 (= 303x426 mm à ~96 dpi) puis exportée en PDF vectoriel au format exact
page("02_Affiche_A3", 1145, 1610, a3, out="02_Affiche_A3", mode="a3")

# ---------------------------------------------------------------- 3. Carrousel 4 pages 1080x1350
def car_frame(n, inner, bg="var(--cream)"):
    return f"""<div class="abs" style="inset:0;background:{bg}"></div>{inner}
<div class="abs syne" style="right:64px;bottom:50px;font-size:24px;font-weight:800">{n}/4</div>
<img class="abs" src="{A}logo_app_icon.png" style="left:64px;bottom:40px;width:62px;border-radius:16px">"""

c1 = car_frame(1, f"""
{loop(1080,1350,"M-80 1180 C 200 1000, 500 1240, 760 1060 C 1020 880, 980 600, 1160 520", sw=18)}
<div class="abs display" style="left:64px;top:110px;font-size:84px;width:960px">« On se tient au jus&nbsp;! »</div>
<div class="abs syne" style="left:64px;top:330px;font-size:40px;font-weight:700;width:900px">On l'a tous écrit. Et après&nbsp;?</div>
<div class="abs chat" style="left:64px;top:470px;width:900px">
 <div class="msg" style="font-size:46px;font-weight:700"><span class="who" style="color:var(--blue)">Camille</span>on se tient au jus !</div>
 <div class="msg" style="opacity:.6"><span class="who" style="color:var(--orange)">Léa</span>trop ❤️</div>
 <div class="msg" style="opacity:.35"><span class="who" style="color:var(--violet)">Max</span>vu</div>
 <div class="msg" style="opacity:.15">…</div>
</div>
<div class="abs syne" style="left:64px;top:1130px;font-size:30px;font-weight:700">Swipe → la suite, c'est jeudi.</div>""")
page("03_Carrousel_1_1080x1350", 1080, 1350, c1)

c2 = car_frame(2, f"""
<div class="abs display" style="left:64px;top:110px;font-size:70px;width:960px;line-height:1.1">Le lieu, on trouve.<br><span style="color:var(--red)">La date, jamais.</span></div>
<div class="abs syne" style="left:64px;top:380px;font-size:34px;font-weight:500;width:930px;line-height:1.3">Ce qu'on a entendu dans nos entretiens : trouver une date est plus dur que trouver un lieu. Les réponses arrivent en décalé, les dispos changent… et la proposition se perd.</div>
<div class="abs chat" style="left:64px;top:600px;width:950px">
 <div class="msg"><span class="who" style="color:var(--orange)">Léa</span>moi jeudi pas possible</div>
 <div class="msg"><span class="who" style="color:var(--violet)">Max</span>et mardi ? ah non j'ai foot</div>
 <div class="msg me">je vous redis 🙃<span class="meta">lu par 2 · il y a 3 j</span></div>
 <div class="typing"><i></i><i></i><i></i></div>
</div>""")
page("03_Carrousel_2_1080x1350", 1080, 1350, c2)

c3 = car_frame(3, f"""
<div class="abs display" style="left:64px;top:96px;font-size:62px;width:960px;line-height:1.1">D'abord le créneau.<br><span style="color:var(--blue)">Ensuite le lieu.</span></div>
<div class="abs" style="left:64px;top:300px;width:470px">
  <span class="pill yellow" style="font-size:30px">1</span>
  <div class="syne" style="font-size:31px;font-weight:700;margin-top:14px;line-height:1.25">Overlap compare les dispos de tout le groupe et propose 2–3 créneaux communs.</div>
</div>
<div class="abs" style="left:560px;top:300px;width:456px">
  <span class="pill orange" style="font-size:30px">2</span>
  <div class="syne" style="font-size:31px;font-weight:700;margin-top:14px;line-height:1.25">Vous confirmez en un clic. Puis Overlap suggère un lieu pratique pour tous.</div>
</div>
<img class="screen" src="{A}screen_challenge.png" style="left:140px;top:560px;width:300px">
<img class="screen" src="{A}screen_map.png" style="left:620px;top:560px;width:300px">
<div class="abs tag-real" style="left:150px;top:1268px">Écrans de la maquette Overlap (prototype)</div>""")
page("03_Carrousel_3_1080x1350", 1080, 1350, c3)

c4 = car_frame(4, f"""
{loop(1080,1350,"M1150 160 C 860 40, 620 240, 760 420 C 900 600, 1120 470, 1040 300", sw=18)}
<div class="abs display" style="left:64px;top:110px;font-size:80px">{LINE1}</div>
<div class="abs" style="left:56px;top:300px;transform:rotate(-3deg)"><span class="pill blue" style="font-size:110px">{LINE2}</span></div>
<div class="abs syne" style="left:64px;top:500px;font-size:36px;font-weight:700;width:950px;line-height:1.25">Le {C["event_day_long"]}, viens avec ta bande ({C["group_size"]}). Vous repartez avec la date ET le lieu de votre prochaine sortie.</div>
<div class="abs" style="left:64px;top:720px;width:952px">{ticket(C["event_day_short"], C["event_hours"].replace(" – ","–"), CITY, vs=32)}</div>
<div class="abs syne" style="left:64px;top:900px;font-size:28px;font-weight:500;width:950px">Gratuit · jus d'accueil offert · {C["event_address_note"]}</div>
<div class="abs pill orange" style="left:64px;top:990px;font-size:34px;font-family:OvSyne;font-weight:800;padding:24px 38px">{CTA} →</div>
<div class="abs sig" style="left:64px;top:1150px;font-size:24px">{SIG}</div>""")
page("03_Carrousel_4_1080x1350", 1080, 1350, c4)

# ---------------------------------------------------------------- 4. Stories 1080x1920 (zones sûres : 250 px en haut, 300 px en bas)
s1 = f"""
{loop(1080,1920,"M-60 1500 C 260 1300, 520 1640, 820 1460 C 1100 1290, 980 980, 1160 900", sw=18)}
{wordmark(64,260,240)}
<div class="abs syne" style="left:64px;top:420px;font-size:34px;font-weight:700">Nouveau message dans « Les potes 🍻 »</div>
<div class="abs chat" style="left:64px;top:500px;width:950px">
 <div class="msg" style="font-size:52px;font-weight:700"><span class="who" style="color:var(--blue);font-size:26px">Camille</span>on se tient au jus…</div>
 <div class="typing" style="padding:30px 36px"><i></i><i></i><i></i></div>
</div>
<div class="abs display" style="left:64px;top:900px;font-size:92px;line-height:1.05">La suite<br>arrive<br><span style="color:var(--blue)">jeudi.</span></div>
<div class="abs" style="left:64px;top:1290px"><span class="pill black" style="font-size:44px">{C["event_day_num"]}</span>
<span class="pill yellow" style="font-size:44px;margin-left:10px">{CITY}</span></div>
<div class="abs syne" style="left:64px;top:1440px;font-size:34px;font-weight:700;width:900px">Active le rappel ↓</div>
<div class="abs" style="left:64px;top:1500px;width:620px;height:150px;border:3px dashed var(--mute);border-radius:28px;display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--mute);font-weight:700">zone sticker « Compte à rebours » (à poser dans Instagram)</div>
"""
page("04_Story_1_Teasing_1080x1920", 1080, 1920, s1)

s2 = f"""
<div class="abs" style="inset:0;background:var(--blue)"></div>
{loop(1080,1920,"M1180 260 C 900 120, 700 340, 820 520 C 940 700, 1160 560, 1080 380", color="#4F72FA", sw=18)}
<div class="abs syne" style="left:64px;top:260px;font-size:36px;font-weight:800;color:var(--cream)">↪ À transférer dans le groupe</div>
<div class="abs syne" style="left:64px;top:330px;font-size:30px;font-weight:500;color:var(--cream);width:900px">celui où on écrit toujours « faut qu'on se voie »</div>
<div class="abs" style="left:64px;top:470px;width:952px;background:var(--cream);border-radius:44px;padding:56px 54px 50px">
  <div class="display" style="font-size:66px;line-height:1.05">On se tient<br>au jus… <span class="pill blue" style="font-size:66px">jeudi&nbsp;?</span></div>
  <div class="syne" style="font-size:34px;font-weight:700;margin-top:34px;line-height:1.25">On vient à {C["group_size"]}, on boit un jus, et on repart avec la date de notre prochaine sortie.</div>
  <div style="margin-top:38px">{ticket(C["event_day_short"], C["event_start"], CITY, scale=.92)}</div>
  <div class="syne" style="font-size:28px;font-weight:500;margin-top:6px">{C["event_hours"]} · gratuit · {C["event_address_note"]}</div>
</div>
<div class="abs syne" style="left:64px;top:1380px;font-size:40px;font-weight:800;color:var(--cream);width:950px;line-height:1.2">1 personne inscrit le groupe.<br>Les autres disent juste « go ».</div>
<div class="abs" style="left:64px;top:1520px;width:620px;height:140px;border:3px dashed var(--cream);border-radius:28px;display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--cream);font-weight:700;text-align:center">zone sticker « Lien » → formulaire d'inscription</div>
<img class="abs" src="{A}logo_mascot.png" style="left:740px;top:1430px;width:260px">
"""
page("04_Story_2_Invitation_a_transferer_1080x1920", 1080, 1920, s2)

s3 = f"""
{loop(1080,1920,"M-60 420 C 240 260, 520 520, 820 380 C 1080 260, 1020 120, 1160 60", sw=18)}
<div class="abs syne" style="left:64px;top:260px;font-size:34px;font-weight:700">Les potes 🍻</div>
<div class="abs chat" style="left:64px;top:330px;width:950px">
 <div class="msg me" style="font-size:42px">On s'inscrit à la soirée Overlap ?<span class="meta">Vu par 5</span></div>
</div>
<div class="abs syne" style="left:64px;top:560px;font-size:30px;font-weight:700;color:var(--mute)">… 2 jours plus tard, toujours rien.</div>
<div class="abs display" style="left:64px;top:700px;font-size:84px;line-height:1.06">Vu par 5.<br>Réponses : 0.<br><span style="color:var(--red)">Classique.</span></div>
<div class="abs syne" style="left:64px;top:1080px;font-size:38px;font-weight:700;width:950px;line-height:1.25">C'est exactement pour ça qu'on a créé Overlap. Inscrivez-vous avant le {C["registration_deadline"]}.</div>
<div class="abs" style="left:64px;top:1290px;width:952px">{ticket(C["event_day_short"], C["event_start"], CITY)}</div>
<div class="abs" style="left:64px;top:1500px;width:620px;height:140px;border:3px dashed var(--mute);border-radius:28px;display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--mute);font-weight:700;text-align:center">zone sticker « Lien » → formulaire d'inscription</div>
<img class="abs" src="{A}logo_mascot.png" style="left:740px;top:1440px;width:250px;transform:scaleX(-1)">
"""
page("04_Story_3_Relance_1080x1920", 1080, 1920, s3)

# ---------------------------------------------------------------- 5. Invitation digitale 1080x1350 (à envoyer dans les conversations)
inv = f"""
<div class="abs" style="left:0;top:0;width:1080px;height:520px;background:linear-gradient(180deg,#233CF8 0%,#8F4690 55%,#FC5128 100%)"></div>
<img class="abs" src="{A}logo_wordmark_cream.png" style="left:64px;top:70px;width:260px">
<div class="abs syne" style="right:64px;top:74px;font-size:26px;font-weight:800;color:var(--cream)">Invitation</div>
<div class="abs display" style="left:64px;top:190px;font-size:84px;color:var(--cream);line-height:1.04">On se tient<br>au jus…</div>
<div class="abs" style="left:56px;top:400px;transform:rotate(-3deg)"><span class="pill" style="font-size:100px;background:var(--cream);color:var(--blue)">jeudi&nbsp;?</span></div>
<div class="abs syne" style="left:64px;top:610px;width:950px;font-size:34px;font-weight:700;line-height:1.25">Soirée de lancement Overlap. Venez à {C["group_size"]}, on vous offre le jus, et vous calez sur place la date et le lieu de votre prochaine sortie.</div>
<div class="abs" style="left:64px;top:800px;width:952px">{ticket(C["event_day_short"], C["event_hours"].replace(" – ","–"), CITY, vs=32)}</div>
<div class="abs syne" style="left:64px;top:975px;width:600px;font-size:28px;line-height:1.35">
 <b>Inscription :</b> gratuite, une personne inscrit tout le groupe via le formulaire ({C["cta_where"]} ou QR).<br>
 <b>Adresse :</b> {C["event_address_note"]}.<br><b>Clôture :</b> {C["registration_deadline"]}.</div>
<div class="abs" style="right:64px;top:985px">{qr(240,24)}</div>
<div class="abs sig" style="left:64px;bottom:48px;font-size:24px">{SIG}</div>
"""
page("05_Invitation_digitale_1080x1350", 1080, 1350, inv)

# ---------------------------------------------------------------- 6. Chevalet de table (A4 plié en deux : deux faces A5 paysage)
def tent_face(back=False):
    return f"""
<div style="position:relative;width:794px;height:561px;background:var(--cream);overflow:hidden">
 {loop(794,561,"M840 60 C 660 -20, 520 120, 600 220 C 680 320, 820 250, 780 150", sw=10)}
 <img class="abs" src="{A}logo_wordmark_black.png" style="left:34px;top:30px;width:150px">
 <div class="abs syne" style="right:34px;top:30px;font-size:16px;font-weight:800">Table ___ · Groupe ___</div>
 <div class="abs display" style="left:34px;top:80px;font-size:33px;line-height:1.1;width:740px">Votre prochaine sortie,<br>on la cale <span class="pill blue" style="font-size:33px">ici.</span></div>
 <div class="abs" style="left:34px;top:200px;width:520px;font-size:19px;line-height:1.28">
  <div style="display:flex;gap:14px;margin-bottom:13px"><span class="pill yellow" style="font-size:20px;height:fit-content">1</span><div><b>Scannez.</b> Chacun met ses dispos des 2 prochaines semaines + sa station de départ. 2 minutes.</div></div>
  <div style="display:flex;gap:14px;margin-bottom:13px"><span class="pill orange" style="font-size:20px;height:fit-content">2</span><div><b>Il manque quelqu'un ?</b> Envoyez le même lien dans votre conversation de groupe.</div></div>
  <div style="display:flex;gap:14px"><span class="pill red" style="font-size:20px;height:fit-content">3</span><div><b>À 20h45, regardez l'écran.</b> Votre créneau commun + 2 lieux pratiques. Votez → c'est calé.</div></div>
 </div>
 <div class="abs" style="right:34px;top:200px">{qr(190,17)}</div>
 <div class="abs syne" style="right:34px;top:400px;width:190px;text-align:center;font-size:14px;font-weight:700">Même lien pour les potes absents</div>
 <div class="abs syne" style="left:34px;bottom:24px;font-size:14px;color:var(--mute);width:520px">Prototype en test : vos réponses servent uniquement à proposer votre créneau ce soir et à vous recontacter à J+1 (consentement dans le formulaire).</div>
 <div class="abs sig" style="right:34px;bottom:24px;font-size:14px">{SIG}</div>
</div>"""

tent = f"""<div style="width:794px;height:1123px;background:#fff">
 <div style="transform:rotate(180deg)">{tent_face(True)}</div>
 <div style="height:1px;border-top:1px dashed #aaa"></div>
 {tent_face()}
</div>"""
page("06_Chevalet_table_A4_plie", 794, 1123, tent, mode="a4")
page("06_Chevalet_face_A5_apercu", 794, 561, tent_face())

# ---------------------------------------------------------------- 7. Suivi J+1 1080x1350
j1 = f"""
{loop(1080,1350,"M1150 1000 C 900 860, 660 1080, 760 1240 C 860 1400, 1080 1300, 1040 1180", sw=18)}
{wordmark(64,66,240)}
<div class="abs syne" style="right:64px;top:70px;font-size:26px;font-weight:800">J+1</div>
<div class="abs display" style="left:64px;top:170px;font-size:96px">Alors,<br>c'est <span class="pill blue" style="font-size:96px">calé&nbsp;?</span></div>
<div class="abs syne" style="left:64px;top:430px;width:950px;font-size:34px;font-weight:700;line-height:1.28">Hier soir, votre table a trouvé un créneau. Ne le laissez pas se perdre dans le groupe&nbsp;: confirmez-le aujourd'hui.</div>
<div class="abs" style="left:64px;top:620px;width:952px">{ticket("__ / __", "__ h __", "_______", labels=("Votre jour","Votre heure","Votre lieu"))}</div>
<div class="abs syne" style="left:64px;top:800px;width:950px;font-size:28px;line-height:1.35"><b>Vous avez la carte « C'est calé »&nbsp;?</b> Prenez-la en photo et envoyez-la dans la conversation.<br><b>Vous l'avez perdue&nbsp;?</b> Répondez « RETROUVER » à ce message : on vous renvoie votre créneau.</div>
<div class="abs pill orange" style="left:64px;top:1030px;font-size:32px;font-family:OvSyne;font-weight:800;padding:22px 34px">Confirmer notre sortie →</div>
<div class="abs syne" style="left:64px;top:1140px;font-size:22px;color:var(--mute);width:620px">Lien personnel envoyé avec ce visuel · gratuit · prototype Overlap</div>
<img class="abs" src="{A}logo_mascot.png" style="left:800px;top:1060px;width:220px">
<div class="abs sig" style="left:64px;bottom:44px;font-size:22px">{SIG}</div>
"""
page("07_Suivi_J+1_1080x1350", 1080, 1350, j1)

# ---------------------------------------------------------------- 8. Carte « C'est calé » A6 (support ajouté au plan média)
card = f"""
<div class="abs" style="inset:0;background:var(--blue)"></div>
{loop(397,559,"M420 60 C 300 0, 220 100, 270 170 C 320 240, 410 190, 390 120", color="#4F72FA", sw=8)}
<img class="abs" src="{A}logo_wordmark_cream.png" style="left:24px;top:24px;width:110px">
<div class="abs display" style="left:24px;top:70px;font-size:40px;color:var(--cream)">C'est<br>calé.</div>
<div class="abs" style="left:24px;top:190px;width:349px;background:var(--cream);border-radius:20px;padding:10px 18px 16px;font-family:OvSyne;font-size:15px"><div style="display:flex;gap:8px;align-items:flex-end;height:36px"><b style="white-space:nowrap">Le groupe :</b><span style="flex:1;border-bottom:1.5px solid var(--ink);height:22px"></span></div><div style="display:flex;gap:8px;align-items:flex-end;height:36px"><b style="white-space:nowrap">Jour :</b><span style="flex:1;border-bottom:1.5px solid var(--ink);height:22px"></span></div><div style="display:flex;gap:8px;align-items:flex-end;height:36px"><b style="white-space:nowrap">Heure :</b><span style="flex:1;border-bottom:1.5px solid var(--ink);height:22px"></span></div><div style="display:flex;gap:8px;align-items:flex-end;height:36px"><b style="white-space:nowrap">Lieu :</b><span style="flex:1;border-bottom:1.5px solid var(--ink);height:22px"></span></div><div style="display:flex;gap:8px;align-items:flex-end;height:36px"><b style="white-space:nowrap">On sera :</b><span style="flex:1;border-bottom:1.5px solid var(--ink);height:22px"></span></div></div>
<div class="abs syne" style="left:24px;top:410px;width:250px;font-size:13px;color:var(--cream);line-height:1.35">Prenez la carte en photo et envoyez-la dans la conversation de groupe. Elle fait foi.</div>
<div class="abs sig" style="left:24px;bottom:22px;font-size:12px;color:var(--cream)">{SIG}</div>
<img class="abs" src="{A}logo_mascot.png" style="right:16px;bottom:14px;width:100px">
"""
page("08_Carte_Cest_cale_A6", 397, 559, card, mode="a6")

exec(open(os.path.join(os.path.dirname(__file__),"build_visuals_offres.py"),encoding="utf-8").read())
json.dump(VISUALS, open(os.path.join(OUT, "_visuals.json"), "w"), indent=1)
print(len(VISUALS), "visuels générés")
