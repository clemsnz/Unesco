import json, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
D = json.load(open('data.json'))
out = sys.argv[1]
wb = Workbook()
H = Font(bold=True, color="FFFFFF"); HF = PatternFill("solid", fgColor="1143F7")
B = Font(bold=True); thin = Side(style="thin", color="CCCCCC")
ws = wb.active; ws.title = "Launch budget"
ws["A1"] = "Overlap — launch budget (EUR, VAT incl.) — ESTIMATES"; ws["A1"].font = Font(bold=True, size=14)
ws["A2"] = D["budget_note"]
hdr = ["#", "Category", "Item", "Qty", "Unit cost (€)", "Total (€)", "Owner", "Indicator", "Status"]
for i, h in enumerate(hdr, 1):
    c = ws.cell(row=4, column=i, value=h); c.font = H; c.fill = HF
r = 5
for n, b in enumerate(D["budget"], 1):
    ws.cell(row=r, column=1, value=n); ws.cell(row=r, column=2, value=b["cat"]); ws.cell(row=r, column=3, value=b["item"])
    ws.cell(row=r, column=4, value=b["qty"]); ws.cell(row=r, column=5, value=b["unit"])
    ws.cell(row=r, column=6, value=f"=D{r}*E{r}"); ws.cell(row=r, column=7, value=b["owner"]); ws.cell(row=r, column=8, value=b["kpi"])
    ws.cell(row=r, column=9, value="Estimate"); r += 1
last = r - 1
ws.cell(row=r, column=3, value="Subtotal").font = B; ws.cell(row=r, column=6, value=f"=SUM(F5:F{last})").font = B; sub = r; r += 1
ws.cell(row=r, column=3, value=f"Contingency ({int(D['contingency_rate']*100)} %)"); ws.cell(row=r, column=6, value=f"=ROUND(F{sub}*{D['contingency_rate']},2)"); cont = r; r += 1
ws.cell(row=r, column=3, value="TOTAL launch envelope").font = Font(bold=True, color="FE512D"); ws.cell(row=r, column=6, value=f"=F{sub}+F{cont}").font = Font(bold=True, color="FE512D"); tot = r; r += 2
ws.cell(row=r, column=3, value="By category").font = B; r += 1
for cat in ["Poster", "Activation", "Pilot", "Social", "Film"]:
    ws.cell(row=r, column=3, value=cat); ws.cell(row=r, column=6, value=f'=SUMIF(B5:B{last},"{cat}",F5:F{last})'); r += 1
r += 1
ws.cell(row=r, column=3, value="Cost per pilot group started (15 groups)"); ws.cell(row=r, column=6, value=f"=ROUND(F{tot}/15,2)"); r += 1
ws.cell(row=r, column=3, value="Cost per group that met (target 9)"); ws.cell(row=r, column=6, value=f"=ROUND(F{tot}/9,2)"); r += 2
ws.cell(row=r, column=3, value="Free / borrowed (not counted): " + D["free_items"])
for row in ws.iter_rows(min_row=5, max_row=tot, min_col=5, max_col=6):
    for c in row: c.number_format = '#,##0.00'
for col, w in zip("ABCDEFGHI", [4, 12, 52, 6, 13, 12, 12, 34, 10]): ws.column_dimensions[col].width = w

# Pilot tracker
t = wb.create_sheet("Pilot tracker")
cols = ["Group ID", "Source (poster / stand / Instagram / friend)", "Group size", "Baseline: plans that happened out of last 3", "Signed up (date)", "Invite sent (1/0)", "Friends invited", "Friends who replied within 48 h", "Slot poll sent (date)", "Date confirmed (1/0)", "Hours from invite to confirmation", "Met (1/0)", "People present", "Check-in answers « yes »", "Notes"]
for i, h in enumerate(cols, 1):
    c = t.cell(row=1, column=i, value=h); c.font = H; c.fill = HF; c.alignment = Alignment(wrap_text=True, vertical="top")
    t.column_dimensions[get_column_letter(i)].width = 16
t.row_dimensions[1].height = 60
for i in range(2, 27): t.cell(row=i, column=1, value=f"G{i-1:02d}")
k = 29
t.cell(row=k, column=1, value="KPI (filled automatically)").font = B; k += 1
kpis = [
 ("Organisers signed up", "=COUNTA(E2:E26)", ""),
 ("Groups started (invite sent)", "=SUM(F2:F26)", ""),
 ("Invite rate", "=IFERROR(SUM(F2:F26)/COUNTA(E2:E26),0)", "≥ 60 %"),
 ("Friend response rate (48 h)", "=IFERROR(SUM(H2:H26)/SUM(G2:G26),0)", "≥ 75 %"),
 ("Date-lock rate", "=IFERROR(SUM(J2:J26)/SUM(F2:F26),0)", "≥ 70 %"),
 ("MAIN — Group meet-up rate", "=IFERROR(SUM(L2:L26)/SUM(F2:F26),0)", "≥ 60 %"),
 ("Show-up rate (met ÷ confirmed)", "=IFERROR(SUM(L2:L26)/SUM(J2:J26),0)", "≥ 85 %"),
 ("Median hours invite → confirmation", "=IFERROR(MEDIAN(K2:K26),0)", "≤ 48 h"),
 ("Baseline: share of past plans that happened", "=IFERROR(SUM(D2:D26)/(3*COUNT(D2:D26)),0)", "compare with meet-up rate"),
]
for name, f, tgt in kpis:
    t.cell(row=k, column=1, value=name).font = B if name.startswith("MAIN") else Font()
    c = t.cell(row=k, column=4, value=f); c.number_format = '0.0' if 'hours' in name else '0%'
    t.cell(row=k, column=5, value=tgt); k += 1
t.column_dimensions["A"].width = 40
wb.save(out)
tot_py = sum(b["qty"] * b["unit"] for b in D["budget"]); print("subtotal", round(tot_py, 2), "cont", round(tot_py*0.1, 2), "total", round(tot_py*1.1, 2))
