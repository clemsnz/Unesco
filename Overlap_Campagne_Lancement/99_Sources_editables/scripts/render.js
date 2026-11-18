// Rend chaque source HTML en PNG (taille réelle) et, pour les supports imprimés, en PDF au format exact.
// Usage : node render.js [filtre]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(ROOT, '..', '03_Visuels');
const list = JSON.parse(fs.readFileSync(path.join(ROOT, 'html', '_visuals.json')));
const FOLDERS = { '01': '01_Visuel_principal', '02': '02_Affiche_A3', '03': '03_Carrousel_Instagram', '04': '04_Stories',
  '05': '05_Invitation_digitale', '06': '06_Chevalet_table', '07': '07_Suivi_J+1', '08': '08_Carte_Cest_cale', '09': '09_Reel_TikTok',
  '10': '10_Offres_Free_Premium', '11': '11_Annonce_sponsorisee', '12': '12_Fiche_commerciale', '20': '20_Mises_en_situation' };
const PRINT = { a3: { w: '303mm', h: '426mm', scale: 3 }, a4: { w: '210mm', h: '297mm', scale: 3 }, a6: { w: '105mm', h: '148mm', scale: 4 }, a4l: { w: '297mm', h: '210mm', scale: 2 } };
(async () => {
  const filter = process.argv[2] || '';
  const browser = await chromium.launch();
  for (const v of list) {
    if (filter && !v.html.includes(filter)) continue;
    const dir = path.join(OUT, FOLDERS[v.html.slice(0, 2)] || 'autres');
    fs.mkdirSync(dir, { recursive: true });
    const pr = PRINT[v.mode];
    const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: pr ? pr.scale : 1 });
    const page = await ctx.newPage();
    await page.goto('file://' + path.join(ROOT, 'html', v.html));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(dir, v.out + '.png'), clip: { x: 0, y: 0, width: v.w, height: v.h } });
    if (pr) {
      await page.pdf({ path: path.join(dir, v.out + '.pdf'), width: pr.w, height: pr.h, printBackground: true,
        pageRanges: '1', margin: { top: 0, right: 0, bottom: 0, left: 0 }, scale: 1 });
    }
    await ctx.close();
    console.log('ok', v.out);
  }
  await browser.close();
})();
