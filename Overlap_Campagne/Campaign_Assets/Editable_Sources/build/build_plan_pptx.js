// Builds Overlap_Marketing_Communication.pptx — continuation of the group's Canva (1440 x 810 pt = 20 x 11.25 in).
// node build_pptx.js <imgDir> <out.pptx>
const path = require('path');
const pptxgen = require(process.env.PPTXGEN || 'pptxgenjs');
const D = require('./data.json');
const { SHOTS } = require('../html/film_data.js');
const IMG = process.argv[2], OUT = process.argv[3];
const I = f => path.join(IMG, f);

const C = { cream: 'FEF7EC', ink: '000000', ink2: '2B2A28', grey: '6E6A64', blue: '1143F7', orange: 'FE512D', yellow: 'FBB736', violet: '6168F4', white: 'FFFFFF', peach: 'FBE3CF', lav: 'DCE2FF' };
const HEAD = 'Monument Extended', BODY = 'Syne';
const THEME = { name: 'Overlap', headFontFace: HEAD, bodyFontFace: BODY,
  colors: { dk1: '000000', lt1: 'FFFFFF', dk2: '2B2A28', lt2: 'FEF7EC', accent1: '1143F7', accent2: 'FE512D', accent3: 'FBB736', accent4: 'FF751F', accent5: '6168F4', accent6: '6E6A64', hlink: '1143F7', folHlink: '6168F4' } };

const pres = new pptxgen();
pres.defineLayout({ name: 'CANVA', width: 20, height: 11.25 });
pres.layout = 'CANVA';
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };
pres.title = 'Overlap — Marketing & Communication';
pres.author = 'Overlap team';

const footer = (dark) => [
  { image: { x: 0.9, y: 10.42, w: 0.42, h: 0.42, path: I('logo.png') } },
  { text: { text: 'Overlap · 12 · Marketing & Communication', options: { x: 1.42, y: 10.42, w: 8, h: 0.42, fontFace: BODY, fontSize: 13, color: dark ? 'FFFFFF' : '6E6A64', margin: 0, valign: 'middle' } } },
];
pres.defineSlideMaster({ title: 'OV_CONTENT', background: { color: C.cream },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: 0.9, y: 0.42, w: 14, h: 0.45, fontFace: BODY, fontSize: 15, bold: true, color: C.orange, charSpacing: 3, margin: 0, valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.9, y: 0.9, w: 18.2, h: 1.05, fontFace: HEAD, fontSize: 44, bold: true, color: C.ink, margin: 0, valign: 'top', align: 'left' }, text: '' } }],
});
pres.defineSlideMaster({ title: 'OV_DARK', background: { color: C.blue },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: 0.9, y: 0.6, w: 14, h: 0.45, fontFace: BODY, fontSize: 15, bold: true, color: C.yellow, charSpacing: 3, margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.9, y: 1.4, w: 17, h: 3.8, fontFace: HEAD, fontSize: 50, bold: true, color: C.white, margin: 0, valign: 'top', align: 'left' }, text: '' } }],
});

pres.addSection({ title: '12 · Marketing & Communication' });
pres.defineSlideMaster({ title: 'OV_RIGHT', background: { color: C.cream },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: 9.0, y: 0.42, w: 10, h: 0.45, fontFace: BODY, fontSize: 15, bold: true, color: C.orange, charSpacing: 3, margin: 0, valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 9.0, y: 0.9, w: 10, h: 1.05, fontFace: HEAD, fontSize: 44, bold: true, color: C.ink, margin: 0, valign: 'top', align: 'left' }, text: '' } }] });
let N = 0;
function slide(kicker, title, master = 'OV_CONTENT') {
  const s = pres.addSlide({ masterName: master, sectionTitle: '12 · Marketing & Communication' });
  N++;
  s.addText(kicker, { placeholder: 'kicker' });
  s.addText(title, { placeholder: 'title' });
  return s;
}
const F = 1.3;
function scaleRuns(t) { return Array.isArray(t) ? t.map(r => (r.options && r.options.fontSize) ? { text: r.text, options: Object.assign({}, r.options, { fontSize: r.options.fontSize * F }) } : r) : t; }
function T(s, text, o) { o = Object.assign({ fontSize: 20 }, o); if (!o.noScale) o.fontSize = Math.round(o.fontSize * F * 2) / 2; delete o.noScale; s.addText(scaleRuns(text), Object.assign({ isTextBox: true, fontFace: BODY, fontSize: 20, color: C.ink, margin: 0, valign: 'top', paraSpaceAfter: 4 }, o)); }
function box(s, x, y, w, h, fill, o = {}) { s.addShape(pres.shapes.ROUNDED_RECTANGLE, Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.25 }, o)); }
function dot(s, x, y, d, fill, label, fs = 18, color = 'FFFFFF') { s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 } }); T(s, label, { x, y, w: d, h: d, align: 'center', valign: 'middle', fontFace: HEAD, fontSize: fs, color, bold: true }); }
function ref(s, text) { T(s, text, { x: 10.5, y: 10.42, w: 7.7, h: 0.42, fontSize: 12, color: C.grey, align: 'right', valign: 'middle' }); }
function strikeDevice(s, x, y, scale = 1, onDark = false) {
  const fs = 34 * scale;
  T(s, 'On se capte', { x, y, w: 8 * scale, h: 0.75 * scale, fontFace: HEAD, fontSize: fs, bold: true, color: onDark ? C.white : C.ink, noScale: true, valign: 'middle' });
  T(s, 'la semaine pro', { x, y: y + 0.8 * scale, w: 8 * scale, h: 0.75 * scale, fontFace: HEAD, fontSize: fs, bold: true, color: onDark ? C.white : C.ink, noScale: true, valign: 'middle' });
  s.addShape(pres.shapes.LINE, { x: x - 0.1 * scale, y: y + 1.165 * scale, w: 5.1 * scale, h: 0, line: { color: C.orange, width: 8 * scale } });
  box(s, x, y + 1.72 * scale, 5.0 * scale, 0.95 * scale, onDark ? C.white : C.blue, { rectRadius: 0.47 * scale });
  T(s, 'jeudi 19h30 ✓', { x: x + 0.35 * scale, y: y + 1.72 * scale, w: 4.6 * scale, h: 0.95 * scale, fontFace: HEAD, fontSize: fs * 0.95, noScale: true, bold: true, color: onDark ? C.blue : C.white, valign: 'middle' });
}

const C_ = C;
// New slides for the marketing & communication plan (inserted by assemble_plan.py into build_plan_pptx.js)
const PL = require('./plan.json');
function table(s, head, rows, x, y, w, colW, fs = 16, rowH = 0.8) {
  const H = t => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: C.blue } } });
  s.addTable([head.map(H), ...rows], { x, y, w, colW, fontFace: BODY, fontSize: fs, color: C.ink, border: { type: 'solid', color: 'E7E1D8', pt: 1 }, fill: { color: 'FFFFFF' }, rowH, valign: 'middle', margin: 0.08 });
}
function phoneImg(s, f, x, y, h) { s.addImage({ path: I(f), x, y, w: h * 840 / 1750, h, altText: f }); return h * 840 / 1750; }

// ===== MARKETING =====
function sOpener() {
  const s = slide('12 · MARKETING & COMMUNICATION', 'Our marketing & communication plan', 'OV_DARK');
  const rows = [['TARGET', 'Students aged 18–25 who organise the plans, and their friends'], ['IDEA', '« La semaine pro »: we strike out the promise and give a real date'], ['CHANNELS', 'Campus posters + stand, Instagram & TikTok, group-chat word of mouth'], ['GOAL', '25 organisers, 15 groups, ≥ 11 confirmed dates before the holidays'], ['BUDGET', '€378.40 (student estimate)']];
  rows.forEach(([k, v], i) => {
    T(s, k, { x: 0.9, y: 4.0 + i * 1.12, w: 2.6, h: 0.5, fontSize: 14, bold: true, color: C.yellow, charSpacing: 3 });
    T(s, v, { x: 3.6, y: 3.92 + i * 1.12, w: 9.4, h: 0.9, fontSize: 21, color: C.white });
  });
  strikeDevice(s, 13.4, 5.2, 1.0, true);
  s.addNotes('Here is our plan in one slide. We target the students who organise the plans, and through them their friends. Our idea is "La semaine pro": we strike out the promise every group chat makes and replace it with a real date. We use the campus, Instagram and TikTok, and word of mouth in group chats. Our goal is 25 organisers and 15 groups before the holidays, for about 380 euros.');
}
function sObjectives() {
  const s = slide('12.1 · MARKETING', 'Objectives');
  T(s, 'MARKETING OBJECTIVES', { x: 0.9, y: 2.15, w: 9, h: 0.5, fontSize: 14, bold: true, color: C.orange, charSpacing: 3 });
  PL.objectives.marketing.forEach(([k, d, t], i) => {
    const y = 2.75 + i * 2.3;
    box(s, 0.9, y, 9.6, 2.05, C.white);
    T(s, k, { x: 1.25, y: y + 0.25, w: 4, h: 0.6, fontFace: HEAD, fontSize: 20, bold: true });
    T(s, d, { x: 1.25, y: y + 0.85, w: 4.6, h: 1.1, fontSize: 15 });
    T(s, t, { x: 6.0, y: y + 0.3, w: 4.2, h: 1.5, fontSize: 16, bold: true, color: C.blue, valign: 'middle' });
  });
  T(s, 'COMMUNICATION OBJECTIVES', { x: 11.2, y: 2.15, w: 8, h: 0.5, fontSize: 14, bold: true, color: C.orange, charSpacing: 3 });
  PL.objectives.communication.forEach(([k, d], i) => {
    const y = 2.75 + i * 2.3;
    box(s, 11.2, y, 7.9, 2.05, i === 2 ? C.blue : C.ink);
    T(s, k, { x: 11.55, y: y + 0.25, w: 7.2, h: 0.5, fontSize: 15, bold: true, color: C.yellow });
    T(s, d, { x: 11.55, y: y + 0.75, w: 7.2, h: 1.2, fontSize: 17, color: C.white });
  });
  s.addNotes('Our marketing objectives follow the funnel: be known on campus and in group chats, get organisers to sign their group up for the free beta, and turn those sign-ups into real plans. Our communication objectives are simple: people must understand what Overlap does, recognise their own group, and take one action: sign the group up. All figures are targets for steering.');
}
function sTargets() {
  const s = slide('12.1 · MARKETING', 'Who we talk to');
  PL.targets.forEach(([k, h, d, p], i) => {
    const x = 0.9 + i * 4.6, c = [C.orange, C.blue, C.violet, C.grey][i];
    box(s, x, 2.25, 4.3, 7.6, i === 3 ? 'F3ECE1' : C.white);
    T(s, k.toUpperCase(), { x: x + 0.35, y: 2.55, w: 3.7, h: 0.45, fontSize: 13, bold: true, color: c, charSpacing: 2 });
    T(s, h, { x: x + 0.35, y: 3.0, w: 3.7, h: 1.1, fontFace: HEAD, fontSize: 21, bold: true });
    T(s, d, { x: x + 0.35, y: 4.2, w: 3.65, h: 3.6, fontSize: 15.5 });
    if (p !== '—') T(s, [{ text: 'Her pain: ', options: { bold: true } }, { text: p }], { x: x + 0.35, y: 7.9, w: 3.65, h: 1.7, fontSize: 14.5, color: c });
  });
  s.addNotes('We speak first to the organiser, like our persona Camille: she launches the plans and suffers most from the group chat. The friends are our second target: they do not look for an app, they receive it from her. Campus relays like the student union help us spread the content. The two other segments from our Canva come after the campus launch.');
}
function sPositioning() {
  const s = slide('12.2 · MARKETING', 'Positioning');
  box(s, 0.9, 2.2, 9.0, 7.6, C.blue);
  T(s, 'POSITIONING STATEMENT', { x: 1.3, y: 2.55, w: 8, h: 0.5, fontSize: 14, bold: true, color: C.yellow, charSpacing: 3 });
  T(s, PL.positioning, { x: 1.3, y: 3.15, w: 8.2, h: 6.4, fontSize: 19.5, color: C.white, lineSpacingMultiple: 1.1 });
  // map
  const mx = 10.6, my = 2.2, mw = 8.5, mh = 7.6;
  box(s, mx, my, mw, mh, C.white);
  s.addShape(pres.shapes.LINE, { x: mx + 0.5, y: my + mh / 2, w: mw - 1.0, h: 0, line: { color: C.ink, width: 1.5, endArrowType: 'triangle', beginArrowType: 'triangle' } });
  s.addShape(pres.shapes.LINE, { x: mx + mw / 2, y: my + 0.5, w: 0, h: mh - 1.0, line: { color: C.ink, width: 1.5, endArrowType: 'triangle', beginArrowType: 'triangle' } });
  T(s, 'Automated', { x: mx + mw / 2 + 0.1, y: my + 0.4, w: 2.2, h: 0.4, fontSize: 12, color: C.grey });
  T(s, 'Manual', { x: mx + mw / 2 + 0.1, y: my + mh - 0.8, w: 2.2, h: 0.4, fontSize: 12, color: C.grey });
  T(s, 'Strangers', { x: mx + 0.3, y: my + mh / 2 + 0.1, w: 2, h: 0.4, fontSize: 12, color: C.grey });
  T(s, 'Existing friends', { x: mx + mw - 2.5, y: my + mh / 2 + 0.1, w: 2.3, h: 0.4, fontSize: 12, color: C.grey, align: 'right' });
  const chip = (t, x, y, fill, col = C.ink) => { box(s, x, y, 2.1, 0.55, fill, { rectRadius: 0.27 }); T(s, t, { x, y, w: 2.1, h: 0.55, fontSize: 13, bold: true, color: col, align: 'center', valign: 'middle' }); };
  chip('Overlap', mx + mw - 2.7, my + 0.9, C.blue, C.white);
  chip('Howbout', mx + mw / 2 + 0.4, my + 1.8, 'F3ECE1'); chip('To Gather', mx + mw / 2 + 1.2, my + 2.6, 'F3ECE1');
  chip('Timeleft', mx + 0.7, my + 1.4, 'F3ECE1'); chip('Bumble BFF', mx + 1.3, my + 2.4, 'F3ECE1'); chip('Frimake', mx + 0.6, my + 5.0, 'F3ECE1');
  chip('WhatsApp', mx + mw - 2.7, my + 5.4, 'F3ECE1'); chip('Doodle', mx + mw / 2 + 0.6, my + 6.1, 'F3ECE1');
  s.addNotes('Our positioning: for young people who want to see their friends but get lost in group chats, Overlap finds the slot when the whole group is free and locks it in one tap. On the map, WhatsApp and Doodle stay manual, Timeleft and Bumble For Friends are about strangers. Our closest competitors, Howbout and To Gather, also sync calendars; our difference is simplicity and friends joining without an account.');
}
function sMix() {
  const s = slide('12.2 · MARKETING', 'Marketing mix');
  PL.mix.forEach(([k, d], i) => {
    const x = 0.9 + (i % 2) * 9.2, y = 2.2 + Math.floor(i / 2) * 3.9;
    box(s, x, y, 8.9, 3.6, C.white);
    dot(s, x + 0.4, y + 0.4, 1.0, [C.blue, C.orange, C.violet, C.yellow][i], k[0], 26, i === 3 ? C.ink : C.white);
    T(s, k, { x: x + 1.7, y: y + 0.5, w: 6.8, h: 0.7, fontFace: HEAD, fontSize: 23, bold: true });
    T(s, d, { x: x + 1.7, y: y + 1.3, w: 6.8, h: 2.15, fontSize: 17 });
  });
  s.addNotes('Our marketing mix. Product: the core promise, two or three common slots and one-tap confirmation, with guest access for friends. Price: free during the launch beta; monetisation is in the business model section. Place: we start on our campus, then the app stores, and every organiser brings her group. Promotion: the campaign we present next.');
}
function sPhases() {
  const s = slide('12.2 · MARKETING', 'Launch in four phases');
  PL.phases.forEach(([k, when, goal, what], i) => {
    const x = 0.9 + i * 4.6, c = [C.yellow, C.orange, C.blue, C.violet][i];
    box(s, x, 2.25, 4.3, 1.5, c, { rectRadius: 0.2 });
    T(s, [{ text: k, options: { breakLine: true, fontFace: HEAD, fontSize: 19 } }, { text: when, options: { fontSize: 14 } }], { x: x + 0.3, y: 2.3, w: 3.8, h: 1.4, bold: true, color: i === 0 ? C.ink : C.white, valign: 'middle' });
    if (i < 3) s.addShape(pres.shapes.LINE, { x: x + 4.32, y: 3.0, w: 0.26, h: 0, line: { color: C.ink, width: 3, endArrowType: 'triangle' } });
    box(s, x, 4.0, 4.3, 5.8, C.white);
    T(s, [{ text: 'GOAL', options: { bold: true, color: C.grey, fontSize: 12, breakLine: true } }, { text: goal, options: { breakLine: true } }, { text: ' ', options: { fontSize: 8, breakLine: true } }, { text: 'WHAT WE DO', options: { bold: true, color: C.grey, fontSize: 12, breakLine: true } }, { text: what }], { x: x + 0.3, y: 4.3, w: 3.75, h: 5.3, fontSize: 16 });
  });
  s.addNotes('We launch in four phases. Teaser in the week of 23 November: a first post with "47 messages, 0 date" and no full reveal. Launch from 30 November: posters, the carousel, the film, and the stand on 1 and 3 December. Engagement until the holidays with a meme, a countdown and a TikTok. In January, we open to other campuses and the other segments.');
}
// ===== COMMUNICATION =====
function sPlatform() {
  const s = slide('12.3 · COMMUNICATION', 'Communication platform');
  PL.platform.forEach(([k, d], i) => {
    const y = 2.2 + i * 1.6;
    box(s, 0.9, y, 18.2, 1.4, i === 4 ? C.ink : C.white);
    T(s, k.toUpperCase(), { x: 1.3, y, w: 3.0, h: 1.4, fontSize: 15, bold: true, color: i === 4 ? C.yellow : C.orange, charSpacing: 2, valign: 'middle' });
    T(s, d, { x: 4.4, y, w: 14.4, h: 1.4, fontSize: i === 4 ? 24 : 17.5, bold: i === 4, color: i === 4 ? C.white : C.ink, valign: 'middle', fontFace: i === 4 ? HEAD : BODY });
  });
  s.addNotes('Our communication platform. The insight: "on se capte la semaine pro" is the sentence every group chat sends and never keeps. The promise: less chatting, more meeting. The proof: two or three common slots, one tap, thirty seconds for the friends, and only free or busy is read. The tone is the tone of a group chat: funny and short. And we keep our signature.');
}
function sIdea() {
  const s = slide('12.3 · COMMUNICATION', 'Campaign idea: « La semaine pro »');
  strikeDevice(s, 0.9, 2.5, 1.2);
  T(s, 'The phrase every group chat sends, and never keeps. We strike it out and replace it with a real slot.', { x: 0.9, y: 6.3, w: 8.6, h: 1.4, fontSize: 22, bold: true });
  const rows = [['Name', '« La semaine pro » ("Next week").'], ['Hook', '« On se capte la semaine pro jeudi 19h30 ✓ »: let\'s catch up next week Thursday 7:30 pm.'], ['Visual principle', 'The strike-out: a vague promise crossed out in orange, replaced by a confirmed slot in a blue pill, with the group count (5/5).'], ['Used on', 'Poster, film, every post, the activation board.'], ['Language', 'French for the ads (it is how our audience talks), English for the jury.']];
  rows.forEach(([k, v], i) => {
    const y = 2.2 + i * 1.62;
    T(s, k.toUpperCase(), { x: 10.3, y, w: 2.6, h: 0.5, fontSize: 14, bold: true, color: C.orange, charSpacing: 2 });
    T(s, v, { x: 12.9, y, w: 6.2, h: 1.55, fontSize: 17 });
  });
  s.addNotes('Our creative idea starts from a lived detail: "on se capte la semaine pro". Everybody has sent it, and everybody knows it means "maybe never". The visual principle is simple and repeatable: we strike out the vague promise in orange and replace it with a real slot in a blue pill. It shows the benefit for the whole group.');
}
function sMessages() {
  const s = slide('12.3 · COMMUNICATION', 'Key messages');
  PL.messages.forEach(([k, fr, en], i) => {
    const y = 2.2 + i * 2.6, c = [C.orange, C.blue, C.violet][i];
    box(s, 0.9, y, 18.2, 2.35, C.white);
    dot(s, 1.3, y + 0.62, 1.1, c, String(i + 1), 24);
    T(s, k, { x: 2.8, y: y + 0.35, w: 4.2, h: 1.6, fontFace: HEAD, fontSize: 21, bold: true, valign: 'middle' });
    T(s, [{ text: fr, options: { bold: true, breakLine: true } }, { text: en, options: { color: C.grey, italic: true } }], { x: 7.2, y: y + 0.35, w: 11.6, h: 1.7, fontSize: 19, valign: 'middle' });
  });
  s.addNotes('One message per audience. To the organiser: stop chasing everyone, Overlap finds the slot. To her friends: thirty seconds, nothing to install, you just tap. To campus relays: share the dictionary of group promises, because everybody has a group like that.');
}
function sChannels() {
  const s = slide('12.4 · COMMUNICATION', 'Channel mix');
  PL.channels.forEach(([k, what, why], i) => {
    const x = 0.9 + (i % 2) * 9.2, y = 2.2 + Math.floor(i / 2) * 3.9, c = [C.blue, C.orange, C.yellow, C.violet][i];
    box(s, x, y, 8.9, 3.6, C.white);
    T(s, k.toUpperCase(), { x: x + 0.4, y: y + 0.35, w: 8, h: 0.6, fontFace: HEAD, fontSize: 22, bold: true, color: c === C.yellow ? 'C98A00' : c });
    T(s, what, { x: x + 0.4, y: y + 1.05, w: 8.1, h: 1.5, fontSize: 17 });
    T(s, [{ text: 'Role: ', options: { bold: true } }, { text: why }], { x: x + 0.4, y: y + 2.6, w: 8.1, h: 0.85, fontSize: 15.5, color: C.grey });
  });
  s.addNotes('Our channels mix owned, earned, paid and event. Owned: our Instagram and TikTok, the posters and the stand. Earned is the most important: shares in group chats and reposts by student associations, because friends trust friends more than ads. Paid is small: forty euros to boost the film and the recruiting story. And the event brings us face to face with organisers.');
}
function sSocialStrategy() {
  const s = slide('12.4 · SOCIAL MEDIA', 'Social media strategy');
  T(s, [{ text: 'Platforms: ', options: { bold: true } }, { text: 'Instagram (feed, Reels, stories) as our home, TikTok for reach. ' }, { text: 'Rhythm: ', options: { bold: true } }, { text: '8 posts in 2 weeks + live stories on stand days. ' }, { text: 'Account: ', options: { bold: true } }, { text: 'overlap.pilot (to reserve).' }],
    { x: 0.9, y: 2.15, w: 18.2, h: 1.0, fontSize: 18 });
  PL.pillars.forEach(([k, d, p], i) => {
    const x = 0.9 + i * 6.15, c = [C.orange, C.blue, C.violet][i];
    box(s, x, 3.45, 5.8, 3.0, C.white);
    T(s, k, { x: x + 0.4, y: 3.7, w: 5, h: 0.6, fontFace: HEAD, fontSize: 22, bold: true, color: c });
    T(s, d, { x: x + 0.4, y: 4.35, w: 5.0, h: 1.3, fontSize: 16 });
    T(s, p, { x: x + 0.4, y: 5.7, w: 5.0, h: 0.5, fontSize: 15, bold: true });
  });
  ['ig_P1_feed.png', 'ig_C1_feed.png', 'ig_P3_reel.png', 'ig_C2_feed.png', 'ig_C3_story_3.png', 'ig_P6_feed.png', 'ig_P7_story.png'].forEach((f, i) => {
    const w = phoneImg(s, f, 1.3 + i * 2.6, 6.7, 3.25);
    T(s, 'P' + (i + 1), { x: 1.3 + i * 2.6, y: 10.0, w, h: 0.45, fontSize: 14, bold: true, align: 'center', color: C.blue });
  });
  s.addNotes('On social media, Instagram is our home and TikTok brings reach. We post eight pieces in two weeks around three content pillars: relatable humour that people share, how it works, and a clear call to join. Below you can see the posts in order, as people will see them on their phone.');
}
function sEditorial() {
  const s = slide('12.4 · SOCIAL MEDIA', 'Editorial calendar');
  table(s, ['#', 'When', 'Post', 'Format', 'Pillar', 'KPI'], PL.posts.map(p => [{ text: p.id, options: { bold: true, color: C.blue } }, p.date, { text: p.name, options: { bold: true } }, p.format, p.pillar, p.kpi]), 0.9, 2.15, 18.2, [0.7, 2.4, 5.6, 4.0, 1.9, 3.6], 15.5, 0.92);
  s.addNotes('Here is the editorial calendar: eight posts from the teaser on 27 November to the TikTok on 9 December, each with a format, a pillar and an indicator. Captions are ready in French with an English translation.');
}
function sTeaserMeme() {
  const s = slide('12.4 · SOCIAL MEDIA', 'P1 teaser · P6 meme');
  const w1 = phoneImg(s, 'ig_P1_feed.png', 0.9, 1.95, 8.55);
  T(s, [{ text: 'P1 · Fri 27 Nov', options: { bold: true, color: C.blue, breakLine: true } }, { text: '« 47 messages. 0 date. Ça te dit quelque chose ? Lundi, on règle ça. »', options: { breakLine: true } }, { text: 'Sound familiar? On Monday, we fix it.', options: { italic: true, color: C.grey } }], { x: 0.9 + w1 + 0.3, y: 2.2, w: 5.0, h: 4.0, fontSize: 16 });
  const x2 = 10.4; const w2 = phoneImg(s, 'ig_P6_feed.png', x2, 1.95, 8.55);
  T(s, [{ text: 'P6 · Sat 5 Dec', options: { bold: true, color: C.blue, breakLine: true } }, { text: '« Le motivé, le flou, le pris, le fantôme et le fataliste. Tague celui que tu es. Et ton groupe. »', options: { breakLine: true } }, { text: 'Tag who you are. And your group.', options: { italic: true, color: C.grey } }], { x: x2 + w2 + 0.3, y: 2.2, w: 19.1 - (x2 + w2 + 0.3), h: 4.5, fontSize: 16 });
  s.addNotes('Two relatable posts. The teaser opens the campaign without revealing everything: just "47 messages, 0 date". The meme lists the five answers every group chat gets when someone proposes a date; people tag themselves and their group in the comments, which spreads Overlap in exactly the right group chats.');
}
function sReelCountdown() {
  const s = slide('12.4 · SOCIAL MEDIA', 'P3 Reel · P7 countdown · P8 TikTok');
  const w1 = phoneImg(s, 'ig_P3_reel.png', 0.9, 1.95, 8.55);
  T(s, [{ text: 'P3 · Tue 1 Dec', options: { bold: true, color: C.blue, breakLine: true } }, { text: 'The 28-second film « 47 messages » as a Reel and on TikTok. Caption: « 47 messages. 0 date. Ça vous parle ? »', options: {} }], { x: 0.9 + w1 + 0.3, y: 2.2, w: 4.6, h: 3.6, fontSize: 16 });
  const x2 = 10.0; const w2 = phoneImg(s, 'ig_P7_story.png', x2, 1.95, 8.55);
  T(s, [{ text: 'P7 · Mon 7 Dec', options: { bold: true, color: C.blue, breakLine: true } }, { text: 'Countdown sticker to the holidays + « réponds GROUPE ».', options: { breakLine: true } }, { text: ' ', options: { breakLine: true } }, { text: 'P8 · Wed 9 Dec', options: { bold: true, color: C.blue, breakLine: true } }, { text: 'TikTok « POV : tu proposes une date dans le groupe »: face cam → chat at 47 → the 5/5 screen, trending audio, 12 s.' }], { x: x2 + w2 + 0.3, y: 2.2, w: 19.1 - (x2 + w2 + 0.3), h: 7.5, fontSize: 16 });
  s.addNotes('The film is posted as a Reel and on TikTok on 1 December. On 7 December, a countdown story reminds everyone that the holidays are close: "has your group met?". On 9 December, a short TikTok in the "POV" format reuses the film footage to reach people who do not follow us yet.');
}
function sKpis() {
  const s = slide('12.6 · BUDGET & RESULTS', 'How we measure success');
  table(s, ['Level', 'Indicator', 'Target', 'Source'], PL.kpis.map(k => [{ text: k[0], options: { bold: true, color: k[0] === 'Result' ? C.orange : C.blue } }, k[1], { text: k[2], options: { bold: true } }, k[3]]), 0.9, 2.15, 18.2, [2.4, 8.6, 3.6, 3.6], 16, 0.88);
  T(s, 'Targets are hypotheses for steering. A confirmed date is an intention; a meeting that happened is the result we judge the campaign on.', { x: 0.9, y: 10.05, w: 18.2, h: 0.6, fontSize: 14, color: C.grey });
  s.addNotes('Finally, how we measure success, from awareness to the real result. We follow reach and stand conversations, then shares and Reel views, then sign-ups, and at the end the two numbers that matter: groups with a confirmed date, and groups that really met. A confirmed date is only an intention; the meeting is what we judge the campaign on.');
}
function sClose() {
  const s = slide('12 · MARKETING & COMMUNICATION', 'Less chatting – More meeting', 'OV_DARK');
  T(s, [{ text: 'One audience: the organiser, and her group.', options: { bullet: true, breakLine: true } }, { text: 'One idea: strike out « la semaine pro », give a real date.', options: { bullet: true, breakLine: true } }, { text: 'One result: groups that actually meet before the holidays.', options: { bullet: true } }], { x: 0.9, y: 3.4, w: 11.0, h: 4.6, fontSize: 24, color: C.white, paraSpaceAfter: 12 });
  s.addImage({ path: I('logo.png'), x: 13.6, y: 3.6, w: 2.6, h: 2.6 });
  T(s, 'Overlap', { x: 12.6, y: 6.35, w: 6.0, h: 0.9, fontFace: HEAD, fontSize: 40, bold: true, color: C.white, align: 'center' });
  s.addNotes('To sum up: one audience, the organiser and her group; one idea, strike out "la semaine pro"; and one result we care about, groups that really meet. Less chatting, more meeting.');
}
function kPoster() {
// ---------- 7. Poster ----------
{
  const s = slide('12.5 · CREATIONS · POSTER', 'The poster', 'OV_RIGHT');
  s.addImage({ path: I('Overlap_Poster_A2.jpg'), x: 0.9, y: 0.4, h: 10.45, w: 10.45 * 1587 / 2245, altText: 'Overlap launch poster' });
  const x = 9.0;
  const rows = [['FORMAT', 'A2 for the stand and lounge, A3 across campus (print PDF + PNG in Campaign_Assets/01_Poster).'], ['WHERE', 'EFAP student lounge, by the lifts and the coffee machine: classmates wait there together, phone in hand.'], ['HOOK (FR)', '« On se capte la semaine pro jeudi 19h30 ✓ » — EN: "Let\'s catch up next week Thursday 7:30 pm".'], ['BODY', 'Overlap compares your availability and suggests 2–3 slots when the whole group is free. Everyone confirms in one tap.'], ['CALL TO ACTION', 'Free pilot · 15 groups · nothing to download. Sign up your group at the Overlap stand, EFAP hall, Tue 1 & Thu 3 Dec, 12–2 pm.'], ['NO QR CODE', 'We print a QR code only once the pilot form is live and tested. Today the action is the stand or a DM.']];
  rows.forEach(([k, v], i) => {
    const y = 2.2 + i * 1.38;
    T(s, k, { x, y, w: 3.2, h: 0.45, fontSize: 13, bold: true, color: i === 5 ? C.orange : C.blue, charSpacing: 2 });
    T(s, v, { x: x + 3.3, y, w: 6.8, h: 1.3, fontSize: 16.5 });
  });
  s.addNotes('This is the launch poster. The hook is the strike-out: "on se capte la semaine pro" is crossed out and replaced with "jeudi 19h30". The card below shows what the friends get: a date locked at 5 out of 5. The call to action matches the real stage of the project: Overlap is a prototype, so we invite people to a free pilot at our stand. We did not print a QR code, because we only print a link we have tested.');
}
// ---------- 8. Poster in situ ----------
{
  const s = slide('12.5 · CREATIONS · POSTER', 'Where the poster lives');
  s.addImage({ path: I('Overlap_Poster_in_situ.jpg'), x: 2.8, y: 2.1, w: 14.4, h: 8.1, altText: 'Mock-up of the poster in the EFAP student lounge' });
  s.addNotes('We place the poster where the scene happens: in the student lounge, near the lifts and the coffee machine. People wait there with friends and their phone in hand, so they can read it together and forward the idea to their group. Thirty A3 posters on campus, two A2 at the stand.');
}

}
function kFilm() {
// ---------- 9-10. Storyboard ----------
const SHORT = {
  1: ['Extreme close-up, phone', 'Camille sends « On se capte la semaine pro ? »', 'Keyboard + send'],
  2: ['Screen recording', 'Replies pile up, badge 2 → 47. Caption: « 47 messages. 0 date. »', 'Pings speed up'],
  3: ['Medium shot, metro', 'Deadpan look. Types « bon… on laisse tomber ? », deletes. « Ça fait 3 semaines. »', 'Music cuts, sigh'],
  4: ['Over the shoulder', 'Opens Overlap, picks « Les Inséparables (5) ».', 'Beat drop on tap'],
  5: ['Split screen ×3', 'Léo, Sarah, Yanis get the invite and send free evenings. « 30 s. Pas de débat. »', '3 taps on the beat'],
  6: ['Close-up, screen', 'KEY MOMENT: votes 1/5 → 5/5 on Thu 10 Dec 19:30. « C\'est calé ✓ ». Léo: « ENFIN ».', 'Taps + "ding"'],
  7: ['Handheld, bar', 'They meet. Sarah: « Pour une fois, personne n\'a annulé. » Strike-out caption.', 'Live + music'],
  8: ['End card', 'Logo · Less chatting – More meeting · stand EFAP, 1 & 3 Dec.', 'Music ends'],
};
[0, 1].forEach(p => {
  const s = slide('12.5 · CREATIONS · FILM (28 s)', p === 0 ? 'Film · the problem (shots 1–4)' : 'Film · the date is locked (5–8)');
  SHOTS.slice(p * 4, p * 4 + 4).forEach((sh, i) => {
    const x = 0.9 + i * 4.6, w = 3.0, h = w * 16 / 9;
    if (sh.n === 6) box(s, x - 0.15, 2.0, 4.45, 8.45, C.white, { line: { color: C.orange, width: 3 } });
    s.addImage({ path: I(`Shot_${sh.n}.jpg`), x, y: 2.15, w, h, altText: `Shot ${sh.n}` });
    T(s, String(sh.n), { x: x + 3.1, y: 2.15, w: 1.2, h: 0.9, fontFace: HEAD, fontSize: 40, bold: true, color: sh.n === 6 ? C.orange : C.blue });
    T(s, [{ text: sh.tc, options: { bold: true, breakLine: true } }, { text: sh.dur }], { x: x + 3.1, y: 3.1, w: 1.4, h: 1.2, fontSize: 13 });
    const [fr, act, snd] = SHORT[sh.n];
    T(s, [{ text: fr, options: { bold: true, breakLine: true, color: C.grey } }, { text: act, options: { breakLine: true } }, { text: 'Sound: ' + snd, options: { color: C.grey } }],
      { x, y: 2.15 + h + 0.15, w: 4.15, h: 10.15 - (2.15 + h + 0.15), fontSize: 15, paraSpaceAfter: 3 });
  });
  ref(s, 'Full storyboard with framing, lines and sound: Campaign_Assets/02_Film/Overlap_Film_Storyboard.pdf');
  s.addNotes(p === 0
    ? 'The film is 28 seconds, vertical, shot on a phone in one afternoon. Shots one to four show the problem: Camille sends "on se capte la semaine pro", 47 messages follow with no date, three weeks pass. Then she moves the group to Overlap. All lines are subtitled, so it works without sound.'
    : 'Shots five to eight show the friends\' side, which is the heart of our answer. Each friend gets the invite and answers in thirty seconds. Shot six is the key moment: the votes go from 1 out of 5 to 5 out of 5 and the date is locked. Then we see them really meeting on Thursday. The screens are illustrative prototype screens; during the pilot, the same steps happen by message.');
});

}
// ---------- 11-13. Social ----------
function igSlide(kicker, title, phoneImg, screens, cols, txt, notes) {
  const s = slide(kicker, title);
  const ph = 8.55, pw = ph * 840 / 1750;
  s.addImage({ path: I(phoneImg), x: 0.9, y: 1.95, w: pw, h: ph, altText: 'Post as seen on Instagram' });
  const x0 = 0.9 + pw + 0.6, gw = 19.1 - x0, gap = 0.25;
  const rowsN0 = Math.ceil(screens.length / cols);
  const w = Math.min((gw - gap * (cols - 1)) / cols, ((6.7 - gap * (rowsN0 - 1)) / rowsN0) * 1080 / 1350), h = w * 1350 / 1080;
  screens.forEach((f, i) => s.addImage({ path: I(f), x: x0 + (i % cols) * (w + gap), y: 2.0 + Math.floor(i / cols) * (h + gap), w, h, altText: f }));
  const rowsN = Math.ceil(screens.length / cols), ty = 2.0 + rowsN * (h + gap) + 0.1;
  T(s, txt, { x: x0, y: ty, w: gw, h: 10.6 - ty, fontSize: 15, paraSpaceAfter: 6 });
  s.addNotes(notes);
}
function kC3() {
{
  const s = slide('12.4 · SOCIAL MEDIA', 'P5 · Interactive story');
  const ph = 8.55, pw = ph * 840 / 1750;
  ['C3_story_1', 'C3_story_2', 'C3_story_3'].forEach((n, i) => s.addImage({ path: I(`ig_${n}.png`), x: 0.9 + i * (pw + 0.35), y: 1.95, w: pw, h: ph, altText: `Story frame ${i + 1}` }));
  const xs = 0.9 + 3 * (pw + 0.35) + 0.25;
  const st = [['1 · POLL', '« Ton groupe dit "la semaine pro" depuis… » 1 semaine / 1 mois / Depuis la rentrée / On a arrêté de compter'], ['2 · QUESTION', '« Raconte ton dernier "on se capte" resté dans le groupe »'], ['3 · REPLY « GROUPE »', '15 groups · 14 days · free · nothing to download. Or come to the stand.']];
  st.forEach(([k, v], i) => {
    T(s, k, { x: xs, y: 2.0 + i * 2.55, w: 19.1 - xs, h: 0.45, fontSize: 13, bold: true, color: C.orange, charSpacing: 2 });
    T(s, v, { x: xs, y: 2.45 + i * 2.55, w: 19.1 - xs, h: 2.0, fontSize: 15.5 });
  });
  T(s, 'Thu 3 Dec (last call Fri 4 Dec)', { x: xs, y: 9.75, w: 19.1 - xs, h: 0.5, fontSize: 14, color: C.blue });
  s.addNotes('Third post: the story that recruits for the pilot, shown frame by frame as people see it. The poll makes people admit how long their group has been saying "next week". The question sticker collects real stories, which we reuse with permission. The last frame asks for one action: reply "GROUPE". No link is needed, so nothing can break. Translation of the poll: "Your group has been saying next week for: one week, one month, since September, we stopped counting".');
}

}
function kAct() {
// ---------- 14-15. Activation ----------
{
  const s = slide('12.5 · CREATIONS · EVENT', '« Le Mur des Semaines Pro »');
  s.addImage({ path: I('Activation_Scene.jpg'), x: 2.8, y: 2.1, w: 14.4, h: 8.1, altText: 'Mock-up of the activation in the EFAP hall' });
  s.addNotes('Our field activation is "The Next-Week Wall", two lunch breaks in the EFAP hall. A visitor confesses her dead plan on a post-it. If her friends are with her, each one crosses out busy evenings on a transparent grid; when we stack the sheets, the cell that stays clear is their slot. It is the Overlap idea, made physical. They leave with a "C\'est calé" card and send its photo to the group. If friends are not there, the organiser signs the group up for the pilot.');
}
{
  const s = slide('12.5 · CREATIONS · EVENT', 'Running it on a student budget');
  box(s, 0.9, 2.2, 5.6, 7.7, C.white);
  T(s, [{ text: 'WHERE & WHEN', options: { bold: true, color: C.orange, breakLine: true, fontSize: 15 } }, { text: 'EFAP hall, near the cafeteria. Tue 1 & Thu 3 Dec, 12:00–14:00.', options: { breakLine: true } }, { text: ' ', options: { breakLine: true, fontSize: 8 } },
    { text: 'PARTNERS (ENVISAGED, NOT SECURED)', options: { bold: true, color: C.orange, breakLine: true, fontSize: 15 } }, { text: 'EFAP administration: space (required). Student union (BDE): story relay (optional). No bar partner, so free drinks don\'t bias the result.', options: { breakLine: true } }, { text: ' ', options: { breakLine: true, fontSize: 8 } },
    { text: 'MATERIAL', options: { bold: true, color: C.orange, breakLine: true, fontSize: 15 } }, { text: 'A1 board, 50 transparent A5 grids, 12 markers, 300 cards, post-its, tablet, coffee. Cost: €161 (estimate).' }],
    { x: 1.2, y: 2.45, w: 5.0, h: 7.3, fontSize: 18 });
  const rows = [[{ text: 'Team member', options: { bold: true, color: 'FFFFFF', fill: { color: C.blue } } }, { text: 'Role on site', options: { bold: true, color: 'FFFFFF', fill: { color: C.blue } } }],
    ...D.roles.map(r => [{ text: r.name, options: { bold: true } }, r.activation])];
  s.addTable(rows, { x: 6.8, y: 2.2, w: 7.2, colW: [1.8, 5.4], fontFace: BODY, fontSize: 18, color: C.ink, border: { type: 'solid', color: 'E7E1D8', pt: 1 }, fill: { color: 'FFFFFF' }, rowH: 0.95, valign: 'middle', margin: 0.08 });
  box(s, 14.3, 2.2, 4.8, 7.7, C.ink);
  T(s, [{ text: 'OBSERVABLE RESULT', options: { bold: true, color: C.yellow, breakLine: true, fontSize: 15 } }, { text: 'Targets for the 2 days (hypotheses)', options: { color: 'BBBBBB', breakLine: true, fontSize: 15 } }, { text: ' ', options: { breakLine: true, fontSize: 8 } },
    { text: '120', options: { fontFace: HEAD, fontSize: 30, bold: true, breakLine: true } }, { text: 'stand conversations', options: { breakLine: true } },
    { text: '60', options: { fontFace: HEAD, fontSize: 30, bold: true, breakLine: true } }, { text: 'post-its on the wall', options: { breakLine: true } },
    { text: '20', options: { fontFace: HEAD, fontSize: 30, bold: true, breakLine: true } }, { text: 'groups leave with a card', options: { breakLine: true } },
    { text: '25 → 15', options: { fontFace: HEAD, fontSize: 30, bold: true, breakLine: true } }, { text: 'organisers signed up → groups started' }],
    { x: 14.6, y: 2.45, w: 4.3, h: 7.3, fontSize: 18, color: C.white });
  s.addNotes('Everything here is doable with student means. We need two lunch slots in the hall, which Agathe asks the school for; the student union can relay our story, but nothing is signed yet. The material costs about 161 euros. Each of us has one clear role. And the result is observable on the day: conversations, post-its, groups that leave with a card, and pilot sign-ups.');
}

}
function kBudget() {
// ---------- 21. Budget ----------
{
  const s = slide('12.6 · BUDGET & RESULTS', 'Budget: €378.40 (estimate)');
  const sub = D.budget.reduce((a, b) => a + b.qty * b.unit, 0), cont = Math.round(sub * D.contingency_rate * 100) / 100, tot = sub + cont;
  const eur = v => '€' + v.toFixed(2);
  const H = (t) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: C.blue } } });
  const rows = [[H('Item'), H('Qty'), H('Unit'), H('Total'), H('Owner'), H('Indicator')],
    ...D.budget.map(b => [b.item, String(b.qty), eur(b.unit), eur(b.qty * b.unit), b.owner, b.kpi]),
    [{ text: 'Subtotal', options: { bold: true } }, '', '', { text: eur(sub), options: { bold: true } }, '', ''],
    ['Contingency (10 %)', '', '', eur(cont), '', ''],
    [{ text: 'TOTAL', options: { bold: true, color: C.orange } }, '', '', { text: eur(tot), options: { bold: true, color: C.orange } }, '', 'All amounts are estimates (VAT incl.)']];
  s.addTable(rows, { x: 0.9, y: 2.05, w: 18.2, colW: [7.2, 0.9, 1.3, 1.5, 1.9, 5.4], fontFace: BODY, fontSize: 17, color: C.ink, border: { type: 'solid', color: 'E7E1D8', pt: 1 }, fill: { color: 'FFFFFF' }, rowH: 0.48, valign: 'middle', margin: [0.03, 0.08, 0.03, 0.08] });
  T(s, `No budget was validated in our documents yet, so this is our proposal. Free: campus space (to request), team phones, CapCut, Canva, Google Forms. ≈ €${(tot / 15).toFixed(2)} per group started, €${(tot / 9).toFixed(2)} per group that meets (target).`, { x: 0.9, y: 9.78, w: 18.2, h: 0.55, fontSize: 12.5, color: C.grey });
  s.addNotes(`Our documents do not contain a validated budget yet, so we propose a student envelope of ${eur(tot)}, with 10 percent contingency. Every line has an owner and an indicator. The biggest costs are printing and the activation. That is about ${(tot / 15).toFixed(0)} euros per group in the pilot. The detailed file with formulas is in the Pilot_Budget folder.`);
}

}

sOpener(); sObjectives(); sTargets(); sPositioning(); sMix(); sPhases();
sPlatform(); sIdea(); sMessages(); sChannels();
kPoster(); kFilm();
sSocialStrategy(); sEditorial(); sTeaserMeme();
igSlide('12.4 · SOCIAL MEDIA', 'P2 · The group-chat dictionary', 'ig_C1_feed.png', [1, 2, 3, 4, 5, 6].map(i => `C1_Share_Carousel_${i}.jpg`), 3,
  [{ text: 'Mon 30 Nov · carousel, 6 screens: ', options: { bold: true } }, { text: 'each screen translates a group-chat promise and corrects it with a real slot. Caption: « Envoie ce carrousel au groupe qui dit "la semaine pro" depuis la rentrée. » (Send this to the group that has been saying "next week" since September.)' }],
  'The shareable post. It is a dictionary of group-chat promises with their real translation: for example "avant les vacances, promis" means "after the holidays, maybe". Each screen ends with the Overlap correction: a real slot. People send it to their group as a joke, and the group starts talking about its own problem.');
sReelCountdown();
igSlide('12.4 · SOCIAL MEDIA', 'P4 · How it works', 'ig_C2_feed.png', [1, 2, 3, 4, 5].map(i => `C2_How_It_Works_${i}.jpg`), 3,
  [{ text: 'Wed 2 Dec · carousel, 5 screens: ', options: { bold: true } }, { text: 'choose the group · friends share free times · 2–3 common slots, one tap each · convenient place + reminder. Privacy on screen: Overlap reads only free / busy.' }],
  'The explanation post, in four steps that match our How it works slide: choose the group, friends share their free times, Overlap proposes two or three common slots and everyone taps, then a convenient place and a reminder. Privacy is on screen, as promised in our legal section.');
kC3();
kAct();
kBudget(); sKpis(); sClose();
(async () => {
  await pres.writeFile({ fileName: OUT });
  const { applyTheme } = require(process.env.APPLY_THEME);
  await applyTheme(OUT, THEME);
  console.log('slides', N, OUT);
})();
