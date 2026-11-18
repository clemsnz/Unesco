#!/usr/bin/env python3
"""Section 12 du dossier : DOCX éditable + pages A4 au style du dossier (PDF) + aperçu du dossier complet avec la section remplacée.
Usage : python3 build_docs.py [chemin/vers/dossier_overlap.pdf]"""
import os, re, sys, html, subprocess
import dossier_content as D
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "..", "01_Dossier"); os.makedirs(OUT, exist_ok=True)
BLUE = RGBColor(0x11, 0x43, 0xF7); INK = RGBColor(0, 0, 0)

def md(t):  # **gras** -> <b>
    t = html.escape(t, quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)

# ------------------------------------------------------------------ HTML A4
def build_html():
    parts = []
    for b in D.B:
        k = b[0]
        if k == "h1":
            parts.append(f'<div class="h1">{html.escape(b[1].upper())}</div>')
        elif k == "h2": parts.append(f'<h2>{md(b[1])}</h2>')
        elif k == "h3": parts.append(f'<h3>{md(b[1])}</h3>')
        elif k == "p": parts.append(f'<p>{md(b[1])}</p>')
        elif k == "note": parts.append(f'<p class="note">{md(b[1])}</p>')
        elif k == "bullets": parts.append("<ul>" + "".join(f"<li>{md(i)}</li>" for i in b[1]) + "</ul>")
        elif k == "table":
            _, hd, rows, w = b
            cols = "".join(f'<col style="width:{x}%">' for x in (w or []))
            th = "".join(f"<th>{md(h)}</th>" for h in hd)
            tr = "".join("<tr>" + "".join(f"<td>{md(str(c))}</td>" for c in r) + "</tr>" for r in rows)
            parts.append(f"<table><colgroup>{cols}</colgroup><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>")
        elif k == "img":
            _, path, w, cap = b
            parts.append(f'<figure><img src="file://{os.path.abspath(path)}" style="width:{w}mm;max-width:100%"><figcaption>{md(cap)}</figcaption></figure>')
        elif k == "imgs":
            _, items, cap = b
            ims = "".join(f'<img src="file://{os.path.abspath(x)}" style="height:62mm;margin:0 3mm">' for x in items)
            parts.append(f'<figure>{ims}<figcaption>{md(cap)}</figcaption></figure>')
    copy = "".join(f"<tr><td><b>{html.escape(n)}</b></td><td>{html.escape(t)}</td></tr>" for n, t in D.COPY)
    parts.append('<h2 style="break-before:page">Appendix — Copy deck (exact French texts)</h2>'
                 f'<table><colgroup><col style="width:22%"><col style="width:78%"></colgroup><thead><tr><th>Support</th><th>Text</th></tr></thead><tbody>{copy}</tbody></table>')
    fonts = os.path.join(ROOT, "fonts")
    css = f"""
@font-face {{ font-family: OvDisplay; font-weight: 900; src: local("Monument Extended Ultrabold"), local("MonumentExtended-UltraBold"), url("file://{fonts}/unbounded-latin-900-normal.ttf"); }}
@font-face {{ font-family: OvSyne; font-weight: 400; src: url("file://{fonts}/syne-latin-400-normal.ttf"); }}
@font-face {{ font-family: OvSyne; font-weight: 500; src: url("file://{fonts}/syne-latin-500-normal.ttf"); }}
@font-face {{ font-family: OvSyne; font-weight: 700; src: url("file://{fonts}/syne-latin-700-normal.ttf"); }}
@font-face {{ font-family: OvSyne; font-weight: 800; src: url("file://{fonts}/syne-latin-800-normal.ttf"); }}
@page {{ size: A4; margin: 16mm 15mm 18mm; background: #F7F5F0;
  @bottom-center {{ content: "Marketing & Communication · p. " counter(page); font-family: OvSyne; font-size: 8.5pt; color: #000; }} }}
html {{ background: #F7F5F0; }}
body {{ font-family: OvSyne; font-size: 9.6pt; line-height: 1.42; color: #000; margin: 0; }}
.h1 {{ font-family: OvDisplay; font-weight: 900; font-size: 25pt; text-align: center; margin: 2mm 0 6mm; letter-spacing: .01em; }}
h2 {{ font-family: OvSyne; font-weight: 800; font-size: 13.5pt; margin: 6mm 0 2mm; break-after: avoid; }}
h3 {{ font-family: OvSyne; font-weight: 700; font-size: 11pt; margin: 4mm 0 1.5mm; break-after: avoid; }}
p {{ margin: 0 0 2.2mm; text-align: justify; }}
p.note {{ font-size: 8.8pt; color: #1143F7; border-left: 2.5px solid #1143F7; padding-left: 3mm; text-align: left; }}
b {{ font-weight: 700; }}
ul {{ margin: 0 0 2.5mm 5mm; padding: 0; }} li {{ margin-bottom: 1mm; }}
li::marker {{ color: #FE512D; }}
table {{ width: 100%; border-collapse: separate; border-spacing: 0; margin: 1.5mm 0 3.5mm; font-size: 8.2pt; line-height: 1.3; table-layout: fixed; break-inside: auto; }}
thead {{ display: table-header-group; }}
th {{ background: #1143F7; color: #FEF7EC; text-align: left; font-weight: 800; padding: 1.6mm 2mm; }}
th:first-child {{ border-top-left-radius: 3mm; }} th:last-child {{ border-top-right-radius: 3mm; }}
td {{ background: #fff; padding: 1.5mm 2mm; vertical-align: top; border-bottom: .4pt solid #E3DED4; }}
tr {{ break-inside: avoid; }}
figure {{ text-align: center; margin: 3mm 0 4mm; break-inside: avoid; }}
figure img {{ border-radius: 3mm; box-shadow: 0 1mm 3mm rgba(0,0,0,.12); }}
figcaption {{ font-size: 8pt; color: #6E6A64; margin-top: 1.5mm; }}
"""
    doc = f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Overlap — Marketing & Communication</title><style>{css}</style></head><body>{"".join(parts)}</body></html>'
    path = os.path.join(ROOT, "html", "dossier_section_12.html")
    open(path, "w", encoding="utf-8").write(doc)
    return path

def html_to_pdf(src, dst):
    js = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://{src}');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await p.pdf({{path:'{dst}',preferCSSPageSize:true,printBackground:true}});await b.close();}})()"""
    subprocess.run(["node", "-e", js], check=True)

# ------------------------------------------------------------------ DOCX
def shade(cell, hexcol):
    tcPr = cell._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), hexcol); tcPr.append(sh)

def runs(par, text, size=None, color=None):
    for i, chunk in enumerate(re.split(r"\*\*", text)):
        if not chunk: continue
        r = par.add_run(chunk); r.bold = (i % 2 == 1)
        if size: r.font.size = Pt(size)
        if color: r.font.color.rgb = color

def build_docx():
    doc = Document()
    sec = doc.sections[0]; sec.page_height, sec.page_width = Cm(29.7), Cm(21.0)
    for m in ("left_margin", "right_margin"): setattr(sec, m, Cm(1.8))
    sec.top_margin, sec.bottom_margin = Cm(1.7), Cm(1.8)
    st = doc.styles["Normal"]; st.font.name = "Syne"; st.font.size = Pt(10)
    st.element.rPr.rFonts.set(qn("w:eastAsia"), "Syne")
    for name, font, size in (("Title", "Monument Extended", 24), ("Heading 1", "Syne", 14), ("Heading 2", "Syne", 11.5)):
        s = doc.styles[name]; s.font.name = font; s.font.size = Pt(size); s.font.bold = True; s.font.color.rgb = INK
    foot = sec.footer.paragraphs[0]; foot.text = "Overlap — Marketing & Communication"; foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for b in D.B:
        k = b[0]
        if k == "h1":
            t = doc.add_paragraph(style="Title"); t.add_run(b[1].upper()); t.alignment = WD_ALIGN_PARAGRAPH.CENTER
        elif k == "h2": h = doc.add_heading(level=1); runs(h, b[1])
        elif k == "h3": h = doc.add_heading(level=2); runs(h, b[1])
        elif k == "p": runs(doc.add_paragraph(), b[1])
        elif k == "note": runs(doc.add_paragraph(), b[1], size=9, color=BLUE)
        elif k == "bullets":
            for i in b[1]: runs(doc.add_paragraph(style="List Bullet"), i)
        elif k == "table":
            _, hd, rows, w = b
            t = doc.add_table(rows=1, cols=len(hd)); t.style = "Table Grid"
            for j, h in enumerate(hd):
                c = t.rows[0].cells[j]; c.text = ""; runs(c.paragraphs[0], h, size=8.5, color=RGBColor(0xFE, 0xF7, 0xEC)); shade(c, "1143F7")
            for r in rows:
                cells = t.add_row().cells
                for j, v in enumerate(r): cells[j].text = ""; runs(cells[j].paragraphs[0], str(v), size=8.5)
            if w:
                for row in t.rows:
                    for j, x in enumerate(w): row.cells[j].width = Cm(17.4 * x / 100)
            doc.add_paragraph()
        elif k in ("img", "imgs"):
            items = [b[1]] if k == "img" else b[1]; cap = b[3] if k == "img" else b[2]
            par = doc.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for x in items:
                wcm = min(16.5, (b[2] / 10) if k == "img" else 7.0)
                par.add_run().add_picture(x, width=Cm(wcm))
            c = doc.add_paragraph(); runs(c, cap, size=8, color=RGBColor(0x6E, 0x6A, 0x64)); c.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_page_break(); h = doc.add_heading(level=1); runs(h, "Appendix — Copy deck (exact French texts)")
    t = doc.add_table(rows=1, cols=2); t.style = "Table Grid"
    for j, hname in enumerate(["Support", "Text"]):
        c = t.rows[0].cells[j]; c.text = ""; runs(c.paragraphs[0], hname, size=8.5, color=RGBColor(0xFE, 0xF7, 0xEC)); shade(c, "1143F7")
    for n, tx in D.COPY:
        cells = t.add_row().cells; cells[0].text = ""; runs(cells[0].paragraphs[0], f"**{n}**", size=8.5)
        cells[1].text = ""; runs(cells[1].paragraphs[0], tx, size=8.5)
    for row in t.rows: row.cells[0].width, row.cells[1].width = Cm(4), Cm(13.4)
    path = os.path.join(OUT, "Overlap_Section12_Marketing_Communication.docx"); doc.save(path); return path

if __name__ == "__main__":
    h = build_html()
    pdf = os.path.join(OUT, "Overlap_Section12_Marketing_Communication_A4.pdf"); html_to_pdf(h, pdf)
    print("pdf", pdf); print("docx", build_docx())
    src = sys.argv[1] if len(sys.argv) > 1 else None
    if src and os.path.exists(src):
        from pypdf import PdfReader, PdfWriter
        orig, new = PdfReader(src), PdfReader(pdf); w = PdfWriter()
        for i in range(17): w.add_page(orig.pages[i])          # pages 1–17 inchangées
        for pg in new.pages: w.add_page(pg)                       # page 18 (M&C) remplacée par la section
        for i in range(18, len(orig.pages)): w.add_page(orig.pages[i])  # Sources et suite inchangées
        prev = os.path.join(OUT, "APERCU_dossier_overlap_avec_section12.pdf"); w.write(prev); print("preview", prev, len(new.pages), "pages")
