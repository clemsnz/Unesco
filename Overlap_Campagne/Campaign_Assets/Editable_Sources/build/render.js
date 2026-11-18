// Renders the editable HTML sources to PNG / PDF.
// Usage: node render.js [filter]   (needs the "playwright" package and a Chromium)
const path = require('path');
const { chromium } = require('playwright');
const SRC = path.resolve(__dirname, '../html');
const OUT = path.resolve(__dirname, '../..');

// [html file, out png (relative to Campaign_Assets), width, height, deviceScaleFactor, out pdf or null, pdf size]
const JOBS = [
  ['poster.html', '01_Poster/Overlap_Poster_A2.png', 1587, 2245, 2.5, '01_Poster/Overlap_Poster_A2_print.pdf', ['420mm', '594mm']],
  ['poster_in_situ.html', '01_Poster/Overlap_Poster_in_situ.png', 1920, 1080, 2, null],
  ...[1, 2, 3, 4, 5, 6].map(i => [`c1_carousel.html#s${i}`, `03_Social/C1_Share_Carousel_${i}.png`, 1080, 1350, 1, null]),
  ...[1, 2, 3, 4, 5].map(i => [`c2_howitworks.html#s${i}`, `03_Social/C2_How_It_Works_${i}.png`, 1080, 1350, 1, null]),
  ...[1, 2, 3].map(i => [`c3_story.html#s${i}`, `03_Social/C3_Pilot_Story_${i}.png`, 1080, 1920, 1, null]),
  ...[1, 2, 3, 4, 5, 6, 7, 8].map(i => [`film_frames.html#s${i}`, `02_Film/frames/Shot_${i}.png`, 1080, 1920, 1, null]),
  ['storyboard.html', null, 1123, 794, 1, '02_Film/Overlap_Film_Storyboard.pdf', ['297mm', '210mm']],
  ['wall_board.html', '04_Activation/Wall_Board_A1.png', 3179, 2245, 1, '04_Activation/Wall_Board_A1_print.pdf', ['841mm', '594mm']],
  ['grid_a5.html', '04_Activation/Transparent_Week_Grid_A5.png', 794, 559, 2, '04_Activation/Transparent_Week_Grid_A5_print.pdf', ['210mm', '148mm']],
  ['rdv_card.html', '04_Activation/RDV_Card_A6.png', 559, 397, 3, '04_Activation/RDV_Card_A6_print.pdf', ['148mm', '105mm']],
  ['activation_scene.html', '04_Activation/Activation_Scene.png', 1920, 1080, 2, null],
  ...['C1_feed', 'C2_feed', 'C3_story_1', 'C3_story_2', 'C3_story_3'].map((n, i) => [`ig_mockups.html#s${i + 1}`, `03_Social/Seen_on_Instagram_${n}.png`, 840, 1750, 2, null, null, true]),
];

(async () => {
  const filter = process.argv[2];
  const browser = await chromium.launch();
  for (const [file, png, w, h, dsf, pdf, size, transparent] of JOBS) {
    if (filter && !file.includes(filter)) continue;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf });
    const page = await ctx.newPage();
    const [f, hash] = file.split('#');
    await page.goto('file://' + path.join(SRC, f) + (hash ? '#' + hash : ''));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    if (png) await page.screenshot({ path: path.join(OUT, png), clip: { x: 0, y: 0, width: w, height: h }, omitBackground: !!transparent });
    if (pdf) await page.pdf({ path: path.join(OUT, pdf), width: size[0], height: size[1], printBackground: true, preferCSSPageSize: true });
    console.log('ok', file, png || '', pdf || '');
    await ctx.close();
  }
  await browser.close();
})();
