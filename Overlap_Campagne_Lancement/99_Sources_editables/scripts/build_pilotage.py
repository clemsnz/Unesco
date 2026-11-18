#!/usr/bin/env python3
"""Tableur de pilotage : rétroplanning, calendrier éditorial, budget (formules), suivi des groupes (KPI), prospects, exemple de revenus."""
import os
import dossier_content as D
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "..", "04_Pilotage"); os.makedirs(OUT, exist_ok=True)
HEAD = PatternFill("solid", fgColor="1143F7"); HF = Font(bold=True, color="FEF7EC", name="Syne")
thin = Border(bottom=Side(style="thin", color="E3DED4"))
wb = Workbook()

def sheet(name, headers, rows, widths, first=False):
    ws = wb.active if first else wb.create_sheet(); ws.title = name
    ws.append(headers)
    for c in ws[1]: c.fill = HEAD; c.font = HF; c.alignment = Alignment(vertical="center", wrap_text=True)
    for r in rows: ws.append(r)
    for i, w in enumerate(widths, 1): ws.column_dimensions[get_column_letter(i)].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row: c.alignment = Alignment(wrap_text=True, vertical="top"); c.border = thin
    ws.freeze_panes = "A2"; return ws

strip = lambda t: t.replace("**", "")
sheet("Retroplanning", ["Jour", "Date", "Tâche", "Responsable", "Fait ?"], [[*map(strip, r), ""] for r in D.TL], [8, 12, 70, 24, 8], first=True)
sheet("Calendrier_editorial", ["Date", "Contenu", "Canal", "Responsable", "CTA", "Publié ?", "Vues / partages"], [[*r, "", ""] for r in D.EC], [12, 36, 26, 14, 30, 9, 16])

ws = sheet("Budget", ["Poste", "Quantité", "Coût unitaire (€ TTC)", "Total (€ TTC)", "Réel (€)"], [], [52, 10, 18, 16, 12])
for i, (n, q, u) in enumerate(D.BUD, start=2):
    ws.append([n, q, u, f"=B{i}*C{i}", None])
n = len(D.BUD) + 1
ws.append(["Sous-total", None, None, f"=SUM(D2:D{n})", f"=SUM(E2:E{n})"])
ws.append(["Imprévus (10 %)", None, None, f"=D{n+1}*0.1", None])
ws.append(["TOTAL (estimation)", None, None, f"=D{n+1}+D{n+2}", None])
for r in ws.iter_rows(min_row=n + 1, max_row=n + 3):
    for c in r: c.font = Font(bold=True)
for r in ws.iter_rows(min_row=2, min_col=3, max_col=5):
    for c in r: c.number_format = '#,##0.00 €'

ws = sheet("Suivi_groupes_KPI", ["ID groupe (e-mail organisateur)", "Nom du groupe", "Inscrits (nb)", "Présents (nb)", "Dispos reçues (présents)", "Dispos reçues (absents)",
     "Créneau choisi (jour + heure)", "Lieu choisi", "Date dans les 14 j ? (OUI/NON)", "Confirmations (nb)", "ACTIVÉ ?", "J+7 sortie faite ? (OUI/NON)", "J+14 2e sortie ? (OUI/NON)", "Doublon de (ID)"],
     [], [30, 18, 10, 10, 12, 12, 20, 20, 14, 12, 10, 14, 14, 18])
for r in range(2, 32):
    ws.cell(row=r, column=11, value=f'=IF(AND(N{r}="",E{r}+F{r}>=3,G{r}<>"",H{r}<>"",I{r}="OUI",J{r}>=3),"OUI","")')
last = 31
ws.cell(row=last + 2, column=1, value="Groupes inscrits").font = Font(bold=True); ws.cell(row=last + 2, column=3, value=f'=COUNTA(A2:A{last})-COUNTIF(N2:N{last},"?*")')
ws.cell(row=last + 3, column=1, value="Personnes inscrites").font = Font(bold=True); ws.cell(row=last + 3, column=3, value=f"=SUM(C2:C{last})")
ws.cell(row=last + 4, column=1, value="Présents").font = Font(bold=True); ws.cell(row=last + 4, column=3, value=f"=SUM(D2:D{last})")
ws.cell(row=last + 5, column=1, value="Invitations : amis absents ayant répondu").font = Font(bold=True); ws.cell(row=last + 5, column=3, value=f"=SUM(F2:F{last})")
ws.cell(row=last + 6, column=1, value="GROUPES ACTIVÉS (North Star)").font = Font(bold=True, color="1143F7"); ws.cell(row=last + 6, column=3, value=f'=COUNTIF(K2:K{last},"OUI")')
ws.cell(row=last + 7, column=1, value="Sorties faites à J+7").font = Font(bold=True); ws.cell(row=last + 7, column=3, value=f'=COUNTIFS(K2:K{last},"OUI",L2:L{last},"OUI")')
ws.cell(row=last + 8, column=1, value="2e sorties à J+14").font = Font(bold=True); ws.cell(row=last + 8, column=3, value=f'=COUNTIF(M2:M{last},"OUI")')
ws.cell(row=last + 10, column=1, value="Règles : un groupe = un ID (e-mail de l'organisateur). Remplir « Doublon de » si 2/3 des membres sont déjà dans un autre groupe : la ligne n'est alors plus comptée. Activé = ≥ 3 personnes ont envoyé leurs dispos + créneau ET lieu + date sous 14 jours + ≥ 3 confirmations.")
ws.cell(row=last + 11, column=1, value="Objectifs : 75 inscrits · 60 présents · 30 amis absents · 10 groupes activés (seuil de décision : ≥ 8 on continue, < 5 on revoit l'invitation) · 7 sorties à J+7 · 3 deuxièmes sorties.")

sheet("Prospects_partenaires", ["Catégorie", "Établissement (prospect)", "Adresse", "Source officielle", "Offre proposée", "Modèle", "Statut", "Contact pris le", "Réponse"], [
 ["Bar", "Le Comptoir Général", "84 quai de Jemmapes, 75010", "lecomptoirgeneral.com", "Accueil de la soirée du 11 mars (~60 pers.) + pilote 3 mois offerts", "C · 2 € HT / sortie confirmée après pilote", "Prospect PRIORITAIRE — non contacté", "", ""],
 ["Restaurant", "Bouillon République", "39 bd du Temple, 75003", "bouillonlesite.com", "Lieu sponsorisé lun–jeu + tables réservées code OVERLAP", "C ou B (1 € HT / couvert honoré)", "Prospect — non contacté", "", ""],
 ["Bowling", "Bowling Mouffetard", "73 rue Mouffetard, 75005", "bowlingmouffetard.fr", "Pistes lun–jeu soir avec code OVERLAP + offre groupe à négocier", "B · 8 % HT", "Prospect — non contacté", "", ""],
 ["Escape game", "Gamescape", "17 rue de la Pierre Levée, 75011", "fr.gamescape.fr", "Commission sur réservations code OVERLAP + fiche « Discover »", "B · 8 % HT", "Prospect — non contacté", "", ""],
], [12, 24, 28, 24, 44, 26, 26, 14, 20])

ws = sheet("Revenus_exemple_mois4", ["Ligne", "Hypothèse", "Quantité", "Montant unitaire (€)", "Taux", "Revenu HT (€)"], [], [30, 60, 10, 18, 10, 16])
ws.append(["Placement payant (C)", "20 sorties confirmées dans un lieu sponsorisé", 20, 2, 1, "=C2*D2*E2"])
ws.append(["Commission escape game (B)", "3 sessions de 5 joueurs à 25 €", 3, 125, 0.08, "=C3*D3*E3"])
ws.append(["Commission bowling (B)", "3 réservations : 4 pers. × 2 parties × 11,50 €", 3, 92, 0.08, "=C4*D4*E4"])
ws.append(["Premium étudiant", "6 abonnés à 2,49 € TTC", 6, 2.49, None, "=C5*D5/1.2*0.85"])
ws.append(["Premium mensuel", "4 abonnés à 3,99 € TTC", 4, 3.99, None, "=C6*D6/1.2*0.85"])
ws.append(["Premium annuel", "2 abonnés à 34,99 €/an (÷ 12)", 2, "=34.99/12", None, "=C7*D7/1.2*0.85"])
ws.append(["TOTAL", "Premium : TTC → HT (÷ 1,2) puis − 15 % commission des stores", None, None, None, "=SUM(F2:F7)"])
for c in ws[8]: c.font = Font(bold=True)
for r in ws.iter_rows(min_row=2, min_col=4, max_col=6):
    for c in r: c.number_format = '0.00'

path = os.path.join(OUT, "Overlap_Pilotage_Campagne.xlsx"); wb.save(path); print(path)
