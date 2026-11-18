# Module chargé par build_visuals.py : visuels du volet « Free vs Premium, Pricing & Local Partnerships »
# + mises en situation utilisées dans les slides. Réutilise page(), loop(), ticket(), wordmark(), C, A.
V = "../../03_Visuels/"
PM, PY, PS = C["price_month"], C["price_year"], C["price_student"]

def row(label, val, ok=True, strong=False):
    mark = "✓" if ok else "—"
    col = "var(--blue)" if ok else "var(--mute)"
    return (f'<div style="display:flex;gap:14px;padding:11px 0;border-bottom:1.5px solid rgba(0,0,0,.08);font-size:23px;line-height:1.25">'
            f'<span style="color:{col};font-weight:800;width:22px">{mark}</span><div><b>{label}</b>'
            + (f'<br><span style="font-weight:500;color:var(--mute);font-size:20px">{val}</span>' if val else '') + '</div></div>')

# ---------------------------------------------------------------- 10. Comparatif des offres (FR, public)
free_rows = (row("Inviter ses amis par lien", "les amis répondent sans payer")
  + row("Trouver le créneau commun", "2–3 créneaux proposés, confirmation en 1 clic")
  + row("Choisir un lieu pratique", "selon la position de chacun · lieux sponsorisés signalés")
  + row("Rappels avant la sortie", "")
  + row("1 agenda synchronisé · 3 groupes actifs", "")
  + row("Rituels automatiques", "", ok=False))
prem_rows = (row("Tout Overlap Free", "")
  + row("Rituels automatiques", "Overlap repropose la prochaine sortie de chaque groupe, au rythme choisi")
  + row("Plusieurs agendas synchronisés", "perso + école + boulot")
  + row("Groupes illimités", "")
  + row("Filtres avancés de lieux", "budget, ambiance, accessibilité")
  + row("Aucun lieu sponsorisé", ""))
comp = f"""
{loop(1920,1080,"M2000 820 C 1760 700, 1560 900, 1660 1040 C 1760 1180, 1960 1080, 1920 960", sw=18)}
{wordmark(80,62,230)}
<div class="abs display" style="left:80px;top:130px;font-size:62px">Overlap Free <span style="color:var(--mute)">ou</span> <span class="pill blue" style="font-size:62px">Premium&nbsp;?</span></div>
<div class="abs syne" style="left:80px;top:240px;font-size:28px;font-weight:700;width:1700px">L'essentiel reste gratuit : inviter ses amis, trouver le créneau, choisir le lieu. Même si personne dans le groupe n'a Premium.</div>
<div class="abs" style="left:80px;top:320px;width:560px;height:690px;background:#fff;border:3px solid var(--ink);border-radius:40px;padding:34px 36px">
  <div class="display" style="font-size:40px">Free</div><div class="display" style="font-size:52px;margin:8px 0 14px">0 €</div>{free_rows}</div>
<div class="abs" style="left:680px;top:320px;width:620px;height:690px;background:var(--blue);color:var(--cream);border-radius:40px;padding:34px 36px">
  <div style="display:flex;justify-content:space-between;align-items:center"><div class="display" style="font-size:40px">Premium</div><span class="pill yellow" style="font-size:19px;white-space:nowrap;font-family:OvSyne;font-weight:800">la différence : les Rituels</span></div>
  <div class="display" style="font-size:52px;margin:8px 0 2px">{PM}<span class="syne" style="font-size:24px;font-weight:700"> /mois</span></div>
  <div class="syne" style="font-size:22px;font-weight:700;margin-bottom:8px">ou {PY}/an — {C["price_year_saving"]} d'économie ({C["price_year_saving_pct"]})</div>
  <div style="--mute:#C9D3FF">{prem_rows.replace("rgba(0,0,0,.08)","rgba(255,255,255,.18)").replace("var(--blue)","var(--yellow)")}</div></div>
<div class="abs" style="left:1340px;top:320px;width:500px;height:400px;background:var(--yellow);border-radius:40px;padding:34px 36px">
  <div class="display" style="font-size:36px">Étudiant</div>
  <div class="display" style="font-size:52px;margin:8px 0 6px">{PS}<span class="syne" style="font-size:24px;font-weight:700"> /mois</span></div>
  <div class="syne" style="font-size:23px;font-weight:700;line-height:1.3">Tout Premium. Statut vérifié chaque année (e-mail de l'école ou certificat de scolarité).<br>{C["price_student_saving"]} d'économie par an.</div></div>
<div class="abs" style="left:1340px;top:750px;width:500px;height:260px;background:var(--cream);border:3px dashed var(--ink);border-radius:40px;padding:28px 34px">
  <div class="syne" style="font-size:23px;font-weight:800;line-height:1.3">Un abonnement = une personne.</div>
  <div class="syne" style="font-size:21px;font-weight:500;line-height:1.35;margin-top:8px">Quand un membre Premium organise, tout le groupe profite de ses Rituels et de ses agendas. Les autres restent gratuits.</div></div>
<div class="abs syne" style="left:80px;top:1030px;font-size:18px;color:var(--mute)">Prix TTC envisagés pour la France, à valider par un test · Premium et tarifs = propositions, non encore disponibles</div>
"""
page("10_Comparatif_Free_Premium_1920x1080", 1920, 1080, comp)

# ---------------------------------------------------------------- 11. Annonce sponsorisée dans un écran réel (écran Map de la maquette)
SC = 470 / 237  # agrandissement de l'écran réel
sheet = f"""
<div style="position:absolute;left:0;top:{int(300*SC)}px;width:470px;height:{int(176*SC)}px;background:#FDF8F0;border-radius:26px 26px 0 0;
 box-shadow:0 -6px 18px rgba(0,0,0,.08);padding:14px 16px 0;font-family:OvSyne">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <b style="font-size:17px">Lieux pratiques pour vous 4</b>
    <span style="font-size:12px;font-weight:800;background:var(--ink);color:#fff;border-radius:999px;padding:4px 10px">Jeu. 21 · 20h ✓ 4/4</span></div>
  <div style="margin-top:10px;background:#fff;border-radius:18px;padding:10px 12px;display:flex;gap:10px;align-items:center;border:1.5px solid #eee">
    <div style="width:52px;height:52px;border-radius:12px;background:var(--lav);display:flex;align-items:center;justify-content:center;font-size:26px">🎯</div>
    <div style="flex:1"><b style="font-size:15px">La Halte · Bar</b><div style="font-size:12px;color:#555">6 min en moyenne · ouvert jusqu'à 1h · €€</div></div>
    <span style="font-size:11px;font-weight:800;color:var(--blue)">N°1 du groupe</span></div>
  <div style="margin-top:8px;background:#fff;border-radius:18px;padding:10px 12px;border:2px solid var(--orange)">
    <div style="display:flex;gap:10px;align-items:center">
      <div style="width:52px;height:52px;border-radius:12px;background:linear-gradient(180deg,#233CF8,#FC5128);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:18px">PC</div>
      <div style="flex:1"><div style="display:flex;gap:6px;align-items:center"><b style="font-size:15px">Le Point Commun · Bar</b><span class="sponsored" style="font-size:10px">Sponsorisé</span></div>
      <div style="font-size:12px;color:#555">8 min en moyenne · ouvert à 20h · €€</div></div></div>
    <div style="font-size:13px;font-weight:700;margin-top:6px">Offre groupes Overlap : une planche à partager offerte dès 4 personnes.</div>
    <div style="display:flex;gap:8px;margin-top:7px"><span style="flex:1;text-align:center;background:var(--ink);color:#fff;border-radius:999px;padding:7px;font-size:13px;font-weight:800">Ajouter au plan</span>
    <span style="text-align:center;border:1.5px solid var(--ink);border-radius:999px;padding:7px 12px;font-size:13px;font-weight:800">Pourquoi ce lieu ?</span></div></div>
</div>"""
def note(n, y, title, txt):
    return (f'<div class="abs" style="left:600px;top:{y}px;width:420px"><span class="pill orange" style="font-size:24px">{n}</span>'
            f'<div class="syne" style="font-size:26px;font-weight:800;margin-top:10px">{title}</div>'
            f'<div class="syne" style="font-size:22px;font-weight:500;line-height:1.3;margin-top:4px">{txt}</div></div>')
spon = f"""
{loop(1080,1350,"M1150 120 C 980 20, 820 140, 900 250 C 980 360, 1120 280, 1080 180", sw=16)}
{wordmark(64,60,200)}
<div class="abs display" style="left:64px;top:120px;font-size:48px;line-height:1.08">Un lieu sponsorisé,<br>au bon moment.</div>
<div class="abs" style="left:64px;top:270px;width:470px;height:{int(514*SC)}px;border-radius:40px;overflow:hidden;box-shadow:0 30px 70px rgba(17,67,247,.22)">
  <img src="{A}screen_map.png" style="width:470px;display:block">{sheet}
  <img src="{A}screen_map.png" style="position:absolute;left:0;top:0;width:470px;clip-path:inset({int(478*SC)}px 0 0 0)">
</div>
{note(1, 280, "Après le créneau", "La carte n'apparaît qu'une fois le jour et l'heure confirmés par le groupe.")}
{note(2, 520, "Toujours signalé", "Mention « Sponsorisé » et bouton « Pourquoi ce lieu ? ».")}
{note(3, 740, "Pratique pour tous", "1 seul lieu sponsorisé par liste, jamais en n°1, et seulement s'il reste pratique pour chacun.")}
{note(4, 990, "Premium", "Aucun lieu sponsorisé : seulement le classement par trajet.")}
<div class="abs syne" style="left:64px;top:1300px;font-size:18px;color:var(--mute)">Écran réel « Map » de la maquette Overlap (agrandi) + panneau ajouté · établissements fictifs</div>
"""
page("11_Annonce_sponsorisee_ecran_1080x1350", 1080, 1350, spon)

# ---------------------------------------------------------------- 12. Fiche commerciale A4 (FR) pour un établissement
fiche = f"""
<div class="abs" style="left:0;top:0;width:794px;height:250px;background:linear-gradient(120deg,#233CF8 0%,#8F4690 60%,#FC5128 100%)"></div>
<img class="abs" src="{A}logo_wordmark_cream.png" style="left:44px;top:38px;width:150px">
<img class="abs" src="{A}logo_mascot.png" style="right:40px;top:30px;width:150px">
<div class="abs display" style="left:44px;top:92px;font-size:34px;color:var(--cream);line-height:1.08">Des groupes d'amis<br>qui ont déjà leur date.</div>
<div class="abs syne" style="left:44px;top:186px;width:560px;font-size:15px;color:var(--cream);font-weight:700;line-height:1.35">Devenez lieu partenaire fondateur d'Overlap à Paris — lancement le {C["event_day_long"]}.</div>
<div class="abs syne" style="left:44px;top:280px;width:340px;font-size:13.5px;line-height:1.42">
 <div class="display7" style="font-size:16px;margin-bottom:6px">Overlap, c'est quoi&nbsp;?</div>
 Une app qui aide les 18–25 ans à transformer « on se tient au jus » en vraie sortie : elle trouve d'abord le <b>créneau commun</b> du groupe, puis propose un <b>lieu pratique</b> pour tout le monde.
 <div class="display7" style="font-size:16px;margin:16px 0 6px">Ce que vous y gagnez</div>
 • des groupes de 3 à 8 personnes qui ont <b>déjà choisi leur jour et leur heure</b>&nbsp;;<br>
 • du monde en semaine, du lundi au jeudi, quand vous le choisissez&nbsp;;<br>
 • une offre claire, affichée « Sponsorisé », jamais intrusive&nbsp;;<br>
 • un bilan mensuel : sorties confirmées chez vous, taille des groupes.
 <div class="display7" style="font-size:16px;margin:16px 0 6px">Nos règles</div>
 Lieu montré seulement s'il est pratique pour tout le groupe, ouvert au créneau choisi et adapté à sa taille. Max. 1 lieu sponsorisé par liste. Offres sans incitation à consommer de l'alcool (loi Évin).
</div>
<div class="abs" style="left:410px;top:280px;width:340px;background:#fff;border-radius:22px;padding:18px 20px;border:2px solid var(--ink);font-size:13.5px;line-height:1.4">
 <div class="display7" style="font-size:16px">Notre proposition</div>
 <div style="margin-top:10px"><span class="pill yellow" style="font-size:12px">Pilote</span> <b>{C["pilot_months"]} mois offerts</b> pour les lieux fondateurs.</div>
 <div style="margin-top:10px"><span class="pill blue" style="font-size:12px">Ensuite</span> <b>{C["venue_cpp"]} par sortie confirmée</b> chez vous (groupe d'au moins 3, créneau validé dans l'app, non annulé).</div>
 <div style="margin-top:10px"><span class="pill orange" style="font-size:12px">Activités sur réservation</span> <b>{C["venue_commission"]}</b> des réservations portant le code OVERLAP.</div>
 <div style="margin-top:10px;font-size:12.5px;color:var(--mute)">Sans engagement · facture mensuelle détaillée · aucun frais d'entrée.</div>
</div>
<div class="abs" style="left:410px;top:620px;width:340px;height:330px;border-radius:22px;background:#fff;border:2px solid var(--ink);overflow:hidden">
 <div style="position:absolute;left:14px;top:0;width:160px;height:330px;overflow:hidden"><img src="{V}11_Annonce_sponsorisee/11_Annonce_sponsorisee_ecran_1080x1350.png" style="position:absolute;width:349px;left:-21px;top:-87px"></div>
 <div style="position:absolute;left:186px;top:22px;width:140px;font-size:13px;line-height:1.38"><div class="display7" style="font-size:14px;margin-bottom:6px">Votre lieu dans l'app</div>Affiché après le choix du créneau, avec la mention <b>« Sponsorisé »</b> et votre offre groupe.<div style="margin-top:8px;color:var(--mute);font-size:11.5px">Exemple d'interface, établissement fictif.</div></div>
</div>
<div class="abs" style="left:44px;top:770px;width:340px;background:var(--ink);color:var(--cream);border-radius:22px;padding:18px 20px;font-size:13.5px;line-height:1.4">
 <div class="display7" style="font-size:15px;color:var(--yellow)">Pour démarrer</div>
 1. Vous choisissez une offre groupe (ex. planche offerte dès 4).<br>2. On crée votre fiche dans l'app.<br>3. Vous recevez chaque mois la liste des sorties confirmées.
</div>
<div class="abs syne" style="left:44px;top:960px;width:706px;font-size:12px;color:var(--mute);line-height:1.4">Overlap est un projet étudiant (EFAP) en phase de prototype : les volumes ci-dessus sont des objectifs, pas des résultats. Contact : ____________________ (à compléter par l'équipe).</div>
<div class="abs sig" style="left:44px;bottom:36px;font-size:15px">{C["signature"]}</div>
"""
page("12_Fiche_commerciale_A4", 794, 1123, fiche, mode="a4")

# ---------------------------------------------------------------- 20. Mises en situation (pour les slides)
def phone(src, x, y, w, h, r=46):
    return (f'<div class="abs" style="left:{x}px;top:{y}px;width:{w+24}px;height:{h+24}px;background:#111;border-radius:{r+10}px;padding:12px;box-shadow:0 30px 60px rgba(0,0,0,.25)">'
            f'<img src="{src}" style="width:{w}px;height:{h}px;border-radius:{r}px;display:block;object-fit:cover"></div>')
sit1 = f"""
{loop(1920,1080,"M-60 900 C 300 700, 700 1020, 1100 860 C 1500 700, 1600 300, 2000 260", sw=20)}
{phone(V+"03_Carrousel_Instagram/03_Carrousel_1_1080x1350.png", 150, 170, 420, 525)}
{phone(V+"04_Stories/04_Story_2_Invitation_a_transferer_1080x1920.png", 750, 60, 420, 747)}
{phone(V+"04_Stories/04_Story_3_Relance_1080x1920.png", 1350, 170, 420, 747)}
<div class="abs syne" style="left:150px;top:760px;width:440px;font-size:26px;font-weight:800">Feed : reconnaître la situation</div>
<div class="abs syne" style="left:750px;top:900px;width:440px;font-size:26px;font-weight:800">Story : à transférer au groupe</div>
<div class="abs syne" style="left:1350px;top:960px;width:440px;font-size:26px;font-weight:800">Story : relance</div>
"""
page("20_Situation_reseaux_1920x1080", 1920, 1080, sit1)
sit2 = f"""
<div class="abs" style="inset:0;background:linear-gradient(180deg,#E9E4DA 0%,#D9D2C5 100%)"></div>
<div class="abs" style="left:0;top:880px;width:1920px;height:200px;background:#BDB4A5"></div>
<div class="abs" style="left:300px;top:90px;width:520px;height:731px;box-shadow:0 30px 60px rgba(0,0,0,.25)"><img src="{V}02_Affiche_A3/02_Affiche_A3.png" style="width:520px"></div>
<div class="abs" style="left:900px;top:240px;width:380px;height:534px;box-shadow:0 30px 60px rgba(0,0,0,.2);transform:rotate(2deg)"><img src="{V}02_Affiche_A3/02_Affiche_A3.png" style="width:380px"></div>
<div class="abs" style="left:1380px;top:300px;width:400px">
 <div class="display" style="font-size:40px">Affiche A3</div>
 <div class="syne" style="font-size:24px;font-weight:600;margin-top:12px;line-height:1.35">Couloirs de l'EFAP et des écoles voisines (avec accord), tables du café de l'événement. QR vers l'inscription de groupe.</div></div>
"""
page("20_Situation_affiche_1920x1080", 1920, 1080, sit2)
sit3 = f"""
<div class="abs" style="inset:0;background:radial-gradient(circle at 40% 40%,#B98A5E 0%,#8A5E3B 70%,#6E4A2E 100%)"></div>
<div class="abs" style="left:120px;top:150px;width:794px;height:561px;transform:scale(.95) rotate(-3deg);transform-origin:left top;box-shadow:0 30px 50px rgba(0,0,0,.35)"><img src="{V}06_Chevalet_table/06_Chevalet_face_A5_apercu.png" style="width:794px"></div>
<div class="abs" style="left:940px;top:520px;width:300px;transform:rotate(6deg);box-shadow:0 20px 40px rgba(0,0,0,.35)"><img src="{V}08_Carte_Cest_cale/08_Carte_Cest_cale_A6.png" style="width:300px;display:block"></div>
{phone(V+"07_Suivi_J+1/07_Suivi_J+1_1080x1350.png", 1340, 140, 440, 550)}
<div class="abs syne" style="left:1340px;top:740px;width:470px;font-size:26px;font-weight:800;color:#fff">Sur la table → carte « C'est calé » → message J+1</div>
<div class="abs" style="left:900px;top:300px;width:170px;height:170px;border-radius:50%;background:radial-gradient(circle,#F6B33A 0%,#E9861B 70%);box-shadow:0 18px 30px rgba(0,0,0,.3)"></div>
<div class="abs syne" style="left:905px;top:375px;width:160px;text-align:center;font-weight:800;color:#fff;font-size:20px">le jus offert</div>
"""
page("20_Situation_evenement_1920x1080", 1920, 1080, sit3)

# ---------------------------------------------------------------- 09. Storyboard du Reel (A4 paysage) — images = plans exportés du MP4
import glob as _g
_plans = sorted(_g.glob(os.path.join(ROOT, "..", "03_Visuels", "09_Reel_TikTok", "Plan_*.png")))
_txt = [
 ("0,0–3,6 s", "Scène de groupe", "Bulles qui tombent : « il faut trop qu'on se voie !! » / « grave, ça me manque » / « on se tient au jus ! » / « vu ».", "Toi, dans chaque groupe :"),
 ("3,6–6,2 s", "Le décalage", "« bon on dit quand ? » / « moi jeudi pas possible » / « et mardi ? ah non j'ai foot » / « je vous redis » + points de saisie.", "3 semaines plus tard… / Trouver un lieu : facile. Une date : jamais."),
 ("6,2–7,8 s", "Démo 1 · créneau", "Écran réel Calendar de la maquette.", "1. Overlap croise les dispos de tout le groupe"),
 ("7,8–9,4 s", "Démo 2 · validation", "Écran réel Friendship Challenge, tap sur « Thu 21 · 20h ».", "2. Il propose 2–3 créneaux. Un clic et c'est validé"),
 ("9,4–10,9 s", "Démo 3 · lieu", "Écran réel Map : lieux pratiques pour le groupe.", "3. Puis un lieu pratique pour tout le monde"),
 ("10,9–12,8 s", "La chute", "« on se tient au jus… jeudi ? » → « Jeudi 20h, c'est calé ! » (4/4 dispos).", C["signature"]),
 ("12,8–15,0 s", "CTA", "Carton final : date de l'événement + bouton.", f'{C["event_day_short"]} · {C["event_start"]} · {C["event_city"]} — Inscris ton groupe · lien en bio'),
]
cells = ""
for k, (tc, name, act, ost) in enumerate(_txt):
    img = os.path.relpath(_plans[k], OUT) if k < len(_plans) else ""
    cells += (f'<div style="width:138px"><img src="{img}" style="width:138px;height:245px;border-radius:12px;border:1.5px solid #000;display:block">'
              f'<div class="syne" style="font-size:11px;font-weight:800;margin-top:6px">PLAN {k+1} · {tc}</div>'
              f'<div class="display7" style="font-size:11px;margin-top:2px">{name}</div>'
              f'<div class="syne" style="font-size:9.5px;margin-top:4px;line-height:1.3">{act}</div>'
              f'<div class="syne" style="font-size:9.5px;margin-top:4px;line-height:1.3;color:var(--blue);font-weight:700">Texte écran : {ost}</div></div>')
sb = f"""
<div class="abs display" style="left:36px;top:28px;font-size:24px">Reel / TikTok 15 s — « {C["campaign_line"]} »</div>
<div class="abs syne" style="left:36px;top:66px;font-size:12px;width:1050px">Rôle : faire reconnaître la situation (le « on se tient au jus » qui ne débouche sur rien) puis montrer le bénéfice dans l'ordre du projet : créneau d'abord, lieu ensuite. 1080×1920, 30 i/s, sons de notification, sous-titres incrustés (lecture sans le son). Fichier : Reel_On_se_tient_au_jus_jeudi_15s_1080x1920.mp4</div>
<div class="abs" style="left:36px;top:110px;display:flex;gap:12px">{cells}</div>
<div class="abs syne" style="left:36px;top:640px;width:1050px;font-size:11px;line-height:1.45">
<b>Version tournée (optionnelle, même minutage)</b> — Plans 1–2 : 4 amis filmés chacun chez soi / dans le métro, téléphone en main, on voit la bulle arriver ; plan 6 : les 4 se retrouvent à une table, Camille pose le téléphone « c'est calé ». Matériel : 2 smartphones, montage CapCut, 1 demi-journée (Opale + Francesca). Les plans 3–5 restent les écrans de la maquette.<br>
<b>Légende Instagram/TikTok</b> : « On se tient au jus » = on ne se reverra jamais 🫠 Overlap trouve le créneau commun de ton groupe, puis le lieu pratique. Viens le tester avec ta bande le {C["event_day_long"]} à {C["event_city"]} (gratuit, inscription par groupe, lien en bio). #onsetientaujus #overlap<br>
<b>Limite</b> : les écrans proviennent des maquettes en basse définition du Canva ; les remplacer par des exports haute définition s'ils existent.</div>
"""
page("09_Storyboard_Reel", 1123, 794, sb, mode="a4l")
