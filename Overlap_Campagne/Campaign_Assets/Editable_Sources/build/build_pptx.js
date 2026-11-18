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
  objects: [...footer(false),
    { placeholder: { options: { name: 'kicker', type: 'body', x: 0.9, y: 0.42, w: 14, h: 0.45, fontFace: BODY, fontSize: 15, bold: true, color: C.orange, charSpacing: 3, margin: 0, valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.9, y: 0.9, w: 18.2, h: 1.05, fontFace: HEAD, fontSize: 44, bold: true, color: C.ink, margin: 0, valign: 'top', align: 'left' }, text: '' } }],
  slideNumber: { x: 18.4, y: 10.42, w: 0.7, h: 0.42, fontFace: BODY, fontSize: 13, color: C.grey, align: 'right' } });
pres.defineSlideMaster({ title: 'OV_DARK', background: { color: C.blue },
  objects: [...footer(true),
    { placeholder: { options: { name: 'kicker', type: 'body', x: 0.9, y: 0.6, w: 14, h: 0.45, fontFace: BODY, fontSize: 15, bold: true, color: C.yellow, charSpacing: 3, margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.9, y: 1.4, w: 17, h: 3.8, fontFace: HEAD, fontSize: 50, bold: true, color: C.white, margin: 0, valign: 'top', align: 'left' }, text: '' } }],
  slideNumber: { x: 18.4, y: 10.42, w: 0.7, h: 0.42, fontFace: BODY, fontSize: 13, color: C.white, align: 'right' } });

pres.addSection({ title: '12 · Marketing & Communication' });
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

// ---------- 1. Opener ----------
{
  const s = slide('12 · MARKETING & COMMUNICATION', '« I see why an organiser would try Overlap. Why would her friends make the effort, and how will you know it worked? »', 'OV_DARK');
  T(s, [{ text: 'Our answer in one line: ', options: { bold: true } }, { text: 'we make it cost the friends 30 seconds, we make the invitation come from a friend, and we count the groups that actually meet.' }],
    { x: 0.9, y: 5.6, w: 9.6, h: 2.2, fontSize: 24, color: C.white });
  strikeDevice(s, 11.6, 5.7, 1.05, true);
  s.addNotes('This is the question we expect from the jury, so we built the whole section around it. The organiser is easy to convince; the real challenge is the friends. Our answer has three parts: the friends pay almost nothing (30 seconds, no app), the invitation comes from someone they trust, and we measure success at the group level: did the group really meet?');
}
// ---------- 2. Strategy ----------
{
  const s = slide('12.1 · STRATEGY', 'One audience, one situation, one channel');
  const cols = [
    ['WHO', 'The organiser', 'Students aged 18–25 who usually launch the plans, like our persona Camille (24, Master\'s student + part-time job). We start with EFAP students and their group of 3–6 friends.', C.blue],
    ['WHEN', 'The chat that stalls', 'Someone writes « on se capte la semaine pro ? » ("shall we catch up next week?"). Replies pile up, nobody decides. In December the deadline is real: « before the holidays ».', C.orange],
    ['HOW', 'Campus + friend-to-friend', 'We meet organisers in person on campus (posters + a stand). The invitation then travels in their own group chat, from a friend, not from a brand. Instagram supports and retargets.', C.violet],
  ];
  cols.forEach(([k, h, d, c], i) => {
    const x = 0.9 + i * 6.15;
    box(s, x, 2.35, 5.8, 6.1, C.white);
    dot(s, x + 0.45, 2.75, 0.9, c, String(i + 1), 22);
    T(s, k, { x: x + 1.55, y: 2.82, w: 3.8, h: 0.4, fontSize: 15, bold: true, color: c, charSpacing: 3 });
    T(s, h, { x: x + 1.55, y: 3.18, w: 4.1, h: 0.5, fontFace: HEAD, fontSize: 22, bold: true });
    T(s, d, { x: x + 0.45, y: 4.45, w: 4.95, h: 3.85, fontSize: 20, lineSpacingMultiple: 1.05 });
  });
  T(s, [{ text: 'Why EFAP first? ', options: { bold: true } }, { text: 'It is where we are, who we know and what we can test in two weeks with a student budget. Attention is scarce and trust is hard, so we use people, not ads, to open the door.' }],
    { x: 0.9, y: 8.75, w: 18.2, h: 1.0, fontSize: 20 });
  ref(s, 'Course 1.6: p.13 (attention scarcer, trust harder) · p.17 (start with what you have)');
  s.addNotes('We do not target all 18 to 25 year-olds at once. We start with the person who already organises the plans, because she feels the pain most. The moment is precise: the group chat after "on se capte la semaine pro". And the channel is human: we meet organisers on our own campus, and then the invitation is passed on by the organiser herself. That is how we reach the friends.');
}
// ---------- 3. Evidence ----------
{
  const s = slide('12.2 · EVIDENCE', 'What we already know, and what we don\'t');
  const quotes = [
    ['« After a while, there are like 50 messages and nobody really knows what we decided. »', 'Capucine, 23, law student'],
    ['A group chat trying to find a date for 3 months, with last-minute postponements.', 'Julia, 24, acting student'],
    ['A drink missed two weeks ago: the barrier was organising the moment, not the place.', 'Pablo, 22, history student'],
    ['Plans to meet again made at parties, "and in the end, it never happens".', 'Mathieu, 25'],
  ];
  quotes.forEach(([q, w], i) => {
    const x = 0.9 + (i % 2) * 5.3, y = 2.3 + Math.floor(i / 2) * 3.05;
    box(s, x, y, 5.0, 2.8, C.white);
    T(s, q, { x: x + 0.35, y: y + 0.3, w: 4.3, h: 1.75, fontSize: 18, bold: i === 0 });
    T(s, w, { x: x + 0.35, y: y + 2.15, w: 4.3, h: 0.4, fontSize: 15, color: C.grey });
  });
  T(s, '1/3', { x: 11.7, y: 2.25, w: 2.5, h: 1.0, fontFace: HEAD, fontSize: 48, bold: true, color: C.blue });
  T(s, 'of 18–24-year-olds say organising outings is a challenge (Harris Interactive)', { x: 11.7, y: 3.3, w: 3.1, h: 1.6, fontSize: 16 });
  T(s, '52%', { x: 15.2, y: 2.25, w: 3.6, h: 1.0, fontFace: HEAD, fontSize: 48, bold: true, color: C.blue });
  T(s, 'of Gen Z use group chats to interact with friends (Morning Consult)', { x: 15.2, y: 3.3, w: 3.4, h: 1.6, fontSize: 16 });
  box(s, 11.7, 5.2, 7.4, 3.3, C.ink);
  T(s, 'NOT PROVEN YET', { x: 12.05, y: 5.4, w: 6.8, h: 0.4, fontSize: 15, bold: true, color: C.yellow, charSpacing: 3 });
  T(s, [
    { text: 'Friends answer when an organiser asks them through a tool.', options: { bullet: true, breakLine: true } },
    { text: 'A confirmed date turns into a real meet-up.', options: { bullet: true, breakLine: true } },
    { text: 'People will share their calendar (free / busy only).', options: { bullet: true, breakLine: true } },
    { text: 'Anyone will pay for it.', options: { bullet: true } }], { x: 12.05, y: 5.85, w: 6.8, h: 2.55, fontSize: 15.5, color: C.white, paraSpaceAfter: 4 });
  T(s, 'Our 4 interviews (ages 22–25, Paris region) say the problem is the date, not the place. That gives us a direction, not a proof.', { x: 0.9, y: 8.8, w: 18.2, h: 0.9, fontSize: 19, bold: true });
  ref(s, 'Course 2.8: p.18 (behaviour > opinion) · 1.6: p.22 ("here is the evidence we have so far")');
  s.addNotes('This is our starting evidence. In all four interviews, plans failed because of timing: fifty messages, three months without a date, a missed drink, promises after parties. Nobody named the place as a barrier. Secondary data agrees: one third of 18 to 24 year-olds find organising outings hard. But we are honest about the limits: four interviews are a direction, not a proof. What we have not proven is on the right, and the campaign is designed to test the first two points.');
}
// ---------- 4. Journey ----------
{
  const s = slide('12.3 · TWO-SIDED JOURNEY', 'One plan, two sides');
  const lane = (y, label, color, steps) => {
    T(s, label, { x: 0.9, y: y + 0.15, w: 2.6, h: 1.4, fontFace: HEAD, fontSize: 20, bold: true, color });
    steps.forEach(([h, d], i) => {
      const x = 3.6 + i * 3.75;
      box(s, x, y, 3.45, 2.55, C.white);
      dot(s, x + 0.25, y + 0.25, 0.62, color, String(h[0]), 16);
      T(s, h.slice(2), { x: x + 1.0, y: y + 0.27, w: 2.3, h: 0.6, fontSize: 17, bold: true, valign: 'middle' });
      T(s, d, { x: x + 0.25, y: y + 1.0, w: 3.0, h: 1.45, fontSize: 15.5 });
      if (i < steps.length - 1) s.addShape(pres.shapes.LINE, { x: x + 3.48, y: y + 1.27, w: 0.25, h: 0, line: { color, width: 3, endArrowType: 'triangle' } });
    });
  };
  lane(2.2, 'The organiser', C.orange, [['1 Trigger', 'Sees the poster in the lounge, a friend\'s shared carousel, or the stand.'], ['2 Sign-up', 'Signs her group up for the pilot: 1 minute, at the stand or by DM « GROUPE ».'], ['3 Invites', 'Forwards our ready-made message in her usual group chat.'], ['4 Taps', 'Votes like everyone else. No more chasing people.']]);
  lane(5.05, 'Her friends', C.blue, [['5 Receive', 'Get the invite from Camille, in their own chat. Not an ad.'], ['6 Answer', 'One tap to join, send free evenings: 30 seconds, nothing to install.'], ['7 Choose', 'See 2–3 slots when everyone is free and tap one.'], ['8 Meet', 'Reminder the day before + a convenient place.']]);
  box(s, 3.6, 7.95, 7.3, 1.5, C.blue);
  T(s, [{ text: 'CONFIRMED DATE', options: { bold: true, color: C.yellow, breakLine: true, fontSize: 14 } }, { text: 'Everyone voted for the same slot (5/5)' }], { x: 3.95, y: 8.1, w: 6.8, h: 1.25, fontSize: 19, color: C.white });
  s.addShape(pres.shapes.LINE, { x: 10.95, y: 8.7, w: 0.6, h: 0, line: { color: C.ink, width: 3, endArrowType: 'triangle' } });
  box(s, 11.6, 7.95, 7.5, 1.5, C.ink);
  T(s, [{ text: 'MEETING THAT HAPPENED', options: { bold: true, color: C.yellow, breakLine: true, fontSize: 14 } }, { text: 'Next morning, 2+ members say « yes, we met »' }], { x: 11.95, y: 8.1, w: 7.0, h: 1.25, fontSize: 19, color: C.white });
  s.addNotes('Here is the journey on both sides. The organiser is triggered by the poster, the stand or a carousel a friend shared. She signs up her group in one minute and forwards our message. Her friends receive it from her, answer in thirty seconds, and tap one of the slots. The plan has two finish lines: first a confirmed date, when everybody chose the same slot; then the real meeting, which we check the next morning.');
}
// ---------- 5. Why friends join ----------
{
  const s = slide('12.3 · THE FRIENDS\' SIDE', 'Why would her friends join?');
  const R = [['It comes from a friend', 'Camille sends the invite in their own chat. We never message the friends as a brand first.', C.orange],
    ['It costs 30 seconds', 'No app and no account during the pilot: one tap to join, one message, one vote.', C.blue],
    ['It ends their pain too', 'They also hate the 47 messages. No debate: they tap a slot that already works for everyone.', C.violet],
    ['A shared deadline', '« Before the holidays » + a visible count (4/5 answered). Nobody wants to be the one who blocks.', C.yellow]];
  R.forEach(([h, d, c], i) => {
    const x = 0.9 + (i % 2) * 9.2, y = 2.3 + Math.floor(i / 2) * 3.05;
    box(s, x, y, 8.9, 2.75, C.white);
    dot(s, x + 0.4, y + 0.42, 1.0, c, String(i + 1), 24, i === 3 ? C.ink : C.white);
    T(s, h, { x: x + 1.75, y: y + 0.45, w: 6.8, h: 0.6, fontFace: HEAD, fontSize: 22, bold: true });
    T(s, d, { x: x + 1.75, y: y + 1.15, w: 6.8, h: 1.4, fontSize: 20 });
  });
  box(s, 0.9, 8.55, 18.1, 1.25, C.ink);
  T(s, [{ text: 'Product decision: ', options: { bold: true, color: C.yellow } }, { text: 'friends must be able to join without downloading the app (a guest link, like To Gather\'s web replies). Only the organiser needs the app.' }], { x: 1.25, y: 8.7, w: 17.4, h: 1.0, fontSize: 20, color: C.white, valign: 'middle' });
  s.addNotes('This slide answers the first half of the jury question. Friends join for four reasons: the request comes from a friend, it costs them thirty seconds, it removes something they also dislike, and there is a real shared deadline: seeing each other before the holidays. It also changes our product: since every extra download kills group apps, friends should be able to answer without installing anything. Howbout requires every friend to create an account; To Gather lets guests reply by link. We follow the second model.');
}
// ---------- 6. Campaign idea ----------
{
  const s = slide('12.4 · CAMPAIGN IDEA', '« La semaine pro »');
  strikeDevice(s, 0.9, 2.5, 1.2);
  T(s, 'The phrase every group chat sends, and never keeps. We strike it out and replace it with a real slot.', { x: 0.9, y: 6.3, w: 8.6, h: 1.4, fontSize: 22, bold: true });
  const rows = [['Name', '« La semaine pro » ("Next week").'], ['Hook', '« On se capte la semaine pro jeudi 19h30 ✓ »: let\'s catch up next week Thursday 7:30 pm.'], ['Visual principle', 'The strike-out: a vague promise crossed out in orange, replaced by a confirmed slot in a blue pill, with the group count (5/5).'], ['What it shows', 'What changes for the friends: no debate, one tap, a date that holds.'], ['Language', 'French for the ads (it is how our audience talks), English for the jury. Signature kept: Less chatting – More meeting.']];
  rows.forEach(([k, v], i) => {
    const y = 2.2 + i * 1.62;
    T(s, k.toUpperCase(), { x: 10.3, y, w: 2.6, h: 0.5, fontSize: 14, bold: true, color: C.orange, charSpacing: 2 });
    T(s, v, { x: 12.9, y, w: 6.2, h: 1.55, fontSize: 17 });
  });
  s.addNotes('Our creative idea starts from a lived detail: "on se capte la semaine pro". Everybody has sent it, and everybody knows it means "maybe never". The visual principle is simple and repeatable: we strike out the vague promise in orange and replace it with a real slot in a blue pill. It shows the benefit for the whole group, not only for the organiser. Translation: "Let\'s catch up next week" becomes "Let\'s catch up Thursday 7:30 pm".');
}
// ---------- 7. Poster ----------
{
  const s = slide('12.5 · A · LAUNCH POSTER', 'The poster');
  s.addImage({ path: I('Overlap_Poster_A2.jpg'), x: 0.9, y: 2.15, h: 8.05, w: 8.05 * 1587 / 2245, altText: 'Overlap launch poster' });
  const x = 7.3;
  const rows = [['FORMAT', 'A2 for the stand and lounge, A3 across campus (print PDF + PNG in Campaign_Assets/01_Poster).'], ['WHERE', 'EFAP student lounge, by the lifts and the coffee machine: classmates wait there together, phone in hand.'], ['HOOK (FR)', '« On se capte la semaine pro jeudi 19h30 ✓ » — EN: "Let\'s catch up next week Thursday 7:30 pm".'], ['BODY', 'Overlap compares your availability and suggests 2–3 slots when the whole group is free. Everyone confirms in one tap.'], ['CALL TO ACTION', 'Free pilot · 15 groups · nothing to download. Sign up your group at the Overlap stand, EFAP hall, Tue 1 & Thu 3 Dec, 12–2 pm.'], ['NO QR CODE', 'We print a QR code only once the pilot form is live and tested. Today the action is the stand or a DM.']];
  rows.forEach(([k, v], i) => {
    const y = 2.2 + i * 1.38;
    T(s, k, { x, y, w: 3.2, h: 0.45, fontSize: 13, bold: true, color: i === 5 ? C.orange : C.blue, charSpacing: 2 });
    T(s, v, { x: x + 3.3, y, w: 8.5, h: 1.3, fontSize: 17.5 });
  });
  s.addNotes('This is the launch poster. The hook is the strike-out: "on se capte la semaine pro" is crossed out and replaced with "jeudi 19h30". The card below shows what the friends get: a date locked at 5 out of 5. The call to action matches the real stage of the project: Overlap is a prototype, so we invite people to a free pilot at our stand. We did not print a QR code, because we only print a link we have tested.');
}
// ---------- 8. Poster in situ ----------
{
  const s = slide('12.5 · A · LAUNCH POSTER', 'Where the poster lives');
  s.addImage({ path: I('Overlap_Poster_in_situ.jpg'), x: 2.8, y: 2.1, w: 14.4, h: 8.1, altText: 'Mock-up of the poster in the EFAP student lounge' });
  s.addNotes('We place the poster where the scene happens: in the student lounge, near the lifts and the coffee machine. People wait there with friends and their phone in hand, so they can read it together and forward the idea to their group. Thirty A3 posters on campus, two A2 at the stand.');
}
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
  const s = slide('12.5 · B · VERTICAL FILM (28 s)', p === 0 ? 'Film « 47 messages » · shots 1–4' : 'Film « 47 messages » · shots 5–8');
  SHOTS.slice(p * 4, p * 4 + 4).forEach((sh, i) => {
    const x = 0.9 + i * 4.6, w = 2.6, h = w * 16 / 9;
    if (sh.n === 6) box(s, x - 0.15, 2.0, 4.45, 8.25, C.white, { line: { color: C.orange, width: 3 } });
    s.addImage({ path: I(`Shot_${sh.n}.jpg`), x, y: 2.15, w, h, altText: `Shot ${sh.n}` });
    T(s, String(sh.n), { x: x + 2.75, y: 2.15, w: 1.4, h: 0.9, fontFace: HEAD, fontSize: 40, bold: true, color: sh.n === 6 ? C.orange : C.blue });
    T(s, [{ text: sh.tc, options: { bold: true, breakLine: true } }, { text: sh.dur }], { x: x + 2.75, y: 3.1, w: 1.6, h: 0.9, fontSize: 15 });
    const [fr, act, snd] = SHORT[sh.n];
    T(s, [{ text: fr, options: { bold: true, breakLine: true, color: C.grey } }, { text: act, options: { breakLine: true } }, { text: 'Sound: ' + snd, options: { color: C.grey } }],
      { x, y: 2.15 + h + 0.15, w: 4.15, h: 10.15 - (2.15 + h + 0.15), fontSize: 15, paraSpaceAfter: 3 });
  });
  ref(s, 'Full storyboard with framing, lines and sound: Campaign_Assets/02_Film/Overlap_Film_Storyboard.pdf');
  s.addNotes(p === 0
    ? 'The film is 28 seconds, vertical, shot on a phone in one afternoon. Shots one to four show the problem: Camille sends "on se capte la semaine pro", 47 messages follow with no date, three weeks pass. Then she moves the group to Overlap. All lines are subtitled, so it works without sound.'
    : 'Shots five to eight show the friends\' side, which is the heart of our answer. Each friend gets the invite and answers in thirty seconds. Shot six is the key moment: the votes go from 1 out of 5 to 5 out of 5 and the date is locked. Then we see them really meeting on Thursday. The screens are illustrative prototype screens; during the pilot, the same steps happen by message.');
});
// ---------- 11-13. Social ----------
{
  const s = slide('12.5 · C · SOCIAL 1/3 · MADE TO BE SHARED', 'Carousel « Le dico des promesses de groupe »');
  for (let i = 1; i <= 6; i++) s.addImage({ path: I(`C1_Share_Carousel_${i}.jpg`), x: 0.9 + (i - 1) * 3.07, y: 2.15, w: 2.9, h: 2.9 * 1350 / 1080, altText: `Carousel screen ${i}` });
  T(s, [{ text: 'Goal: ', options: { bold: true } }, { text: 'be forwarded to "the group that says next week". Each screen translates a group-chat promise and corrects it with a real slot.', options: { breakLine: true } },
    { text: 'Caption (FR): ', options: { bold: true } }, { text: '« Envoie ce carrousel au groupe qui dit "la semaine pro" depuis la rentrée. On sait qu\'il existe. » ', options: { italic: true } }, { text: '— Send this to the group that has been saying "next week" since September. We know it exists.', options: { color: C.grey } }],
    { x: 0.9, y: 6.0, w: 18.2, h: 2.2, fontSize: 19, paraSpaceAfter: 8 });
  T(s, [{ text: 'Format ', options: { bold: true } }, { text: '6 screens, 1080 × 1350 · ' }, { text: 'Posted ', options: { bold: true } }, { text: 'Mon 30 Nov, 6 pm · ' }, { text: 'Measured by ', options: { bold: true } }, { text: 'shares and DMs « GROUPE »' }], { x: 0.9, y: 8.4, w: 18.2, h: 0.6, fontSize: 18, color: C.blue });
  s.addNotes('First social post: the shareable one. It is a dictionary of group-chat promises with their "real translation", for example "avant les vacances, promis" means "after the holidays, maybe". Each screen ends with the Overlap correction: a real slot. People send it to their group as a joke, and that is exactly the moment we want: the group talks about its own problem.');
}
{
  const s = slide('12.5 · C · SOCIAL 2/3 · HOW IT WORKS', 'Carousel « De 47 messages à 1 date »');
  for (let i = 1; i <= 5; i++) s.addImage({ path: I(`C2_How_It_Works_${i}.jpg`), x: 0.9 + (i - 1) * 3.68, y: 2.15, w: 3.45, h: 3.45 * 1350 / 1080, altText: `How it works screen ${i}` });
  T(s, [{ text: '4 steps, true to the documented features: ', options: { bold: true } }, { text: 'choose the group · friends share free times (calendar sync in the app, a message during the pilot) · 2–3 common slots, one tap each · convenient place + reminder. Privacy is on screen: Overlap reads only free / busy.' }],
    { x: 0.9, y: 6.7, w: 18.2, h: 1.6, fontSize: 19 });
  T(s, 'Posted Wed 2 Dec, 6 pm · measured by saves and DMs « GROUPE »', { x: 0.9, y: 8.5, w: 18.2, h: 0.6, fontSize: 18, color: C.blue });
  s.addNotes('Second post: how Overlap works, in four steps that match our "How it works" slide: choose the group, friends share free times, Overlap proposes two or three common slots and everyone taps, then a convenient place and a reminder. We show privacy on the screen because our legal section promises that we only read free or busy.');
}
{
  const s = slide('12.5 · C · SOCIAL 3/3 · JOIN THE PILOT', 'Interactive story « On cherche 15 groupes »');
  for (let i = 1; i <= 3; i++) s.addImage({ path: I(`C3_Pilot_Story_${i}.jpg`), x: 0.9 + (i - 1) * 3.75, y: 2.1, w: 3.5, h: 3.5 * 16 / 9, altText: `Story frame ${i}` });
  const xs = 12.4;
  const st = [['1 · POLL', '« Ton groupe dit "la semaine pro" depuis… » 1 semaine / 1 mois / Depuis la rentrée / On a arrêté de compter'], ['2 · QUESTION', '« Raconte ton dernier "on se capte" resté dans le groupe »'], ['3 · REPLY « GROUPE »', '15 groups · 14 days · free · nothing to download · a date before the holidays. Or come to the stand.']];
  st.forEach(([k, v], i) => {
    T(s, k, { x: xs, y: 2.15 + i * 2.15, w: 6.7, h: 0.45, fontSize: 15, bold: true, color: C.orange, charSpacing: 2 });
    T(s, v, { x: xs, y: 2.6 + i * 2.15, w: 6.7, h: 1.6, fontSize: 18.5 });
  });
  T(s, 'Posted Thu 3 Dec (last call Fri 4 Dec) · measured by poll votes and replies « GROUPE »', { x: 0.9, y: 8.6, w: 18.2, h: 0.6, fontSize: 18, color: C.blue });
  s.addNotes('Third post: the story that recruits for the pilot. The poll makes people admit how long their group has been saying "next week". The question sticker collects real stories, which we reuse with permission. The last frame asks for one action: reply "GROUPE". No link is needed, so nothing can break. Translation of the poll: "Your group has been saying next week for: one week, one month, since September, we stopped counting".');
}
// ---------- 14-15. Activation ----------
{
  const s = slide('12.5 · D · FIELD ACTIVATION', '« Le Mur des Semaines Pro »');
  s.addImage({ path: I('Activation_Scene.jpg'), x: 2.8, y: 2.1, w: 14.4, h: 8.1, altText: 'Mock-up of the activation in the EFAP hall' });
  s.addNotes('Our field activation is "The Next-Week Wall", two lunch breaks in the EFAP hall. A visitor confesses her dead plan on a post-it. If her friends are with her, each one crosses out busy evenings on a transparent grid; when we stack the sheets, the cell that stays clear is their slot. It is the Overlap idea, made physical. They leave with a "C\'est calé" card and send its photo to the group. If friends are not there, the organiser signs the group up for the pilot.');
}
{
  const s = slide('12.5 · D · FIELD ACTIVATION', 'How we run it with student means');
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
// ---------- 16. Evidence / Riskiest / Next test ----------
{
  const s = slide('12.6 · TESTING THE CAMPAIGN', 'Evidence · Riskiest assumption · Next test');
  const cols = [['EVIDENCE', 'What justifies the campaign', 'In 4 of 4 interviews, plans failed on timing, not place: "50 messages", 3 months without a date, a missed drink, party promises. Last-minute plans work better. 1/3 of 18–24s find organising outings hard (Harris Interactive).', C.white, C.ink],
    ['RISKIEST ASSUMPTION', 'What is still fragile', 'When an organiser invites them, at least 3 out of 4 friends send their free times within 48 h, without installing anything, and the group locks a date it really keeps.', C.orange, C.white],
    ['NEXT TEST', 'What could change our mind', 'A 14-day concierge pilot with 15 real friend groups (1–18 Dec). We count groups that actually meet. Below 60 %, we change the friend-side flow, or our first target.', C.blue, C.white]];
  cols.forEach(([k, h, d, bg, fg], i) => {
    const x = 0.9 + i * 6.15;
    box(s, x, 2.3, 5.8, 7.0, bg);
    T(s, k, { x: x + 0.45, y: 2.65, w: 5.0, h: 0.45, fontSize: 16, bold: true, color: i === 0 ? C.orange : C.yellow, charSpacing: 3 });
    T(s, h, { x: x + 0.45, y: 3.15, w: 5.0, h: 1.0, fontFace: HEAD, fontSize: 21, bold: true, color: fg });
    T(s, d, { x: x + 0.45, y: 4.4, w: 4.95, h: 4.7, fontSize: 20, color: fg, lineSpacingMultiple: 1.1 });
  });
  ref(s, 'Course 2.8, Workshop 2 (p.29): riskiest assumption · evidence · next test · 1.6 p.11: assumption → experiment → evidence → decision');
  s.addNotes('We apply the course rubric from Workshop 2. Evidence: the interviews say timing is the problem. Riskiest assumption: that friends will answer an organiser and keep the date, because a group app dies if one person does not join. Next test: a two-week pilot with fifteen real groups, where we count real meetings. If fewer than 60 percent of groups meet, we change our mind.');
}
// ---------- 17. Pilot design ----------
{
  const s = slide('12.6 · THE PILOT', 'A 14-day concierge pilot with 15 real groups');
  const q = [['WHO', 'Organisers aged 18–25 at EFAP who tried to plan something with 3–6 friends in the last month. Friends can be anywhere.'], ['HOW LONG', 'Sign-ups 1–4 Dec. Each group has 14 days; meet-ups by Fri 18 Dec, before the holidays.'], ['WHAT THEY DO', 'Join a temporary planning group (1 tap), send free evenings (30 s), vote in a poll with 2–3 common slots, get a reminder, meet.'], ['HOW WE COLLECT', 'The team plays the app on one WhatsApp number. One row per group in a Google Sheet, check-in poll the next morning, end survey + 5 calls.']];
  q.forEach(([k, v], i) => {
    const y = 2.25 + i * 1.75;
    T(s, k, { x: 0.9, y, w: 3.2, h: 0.5, fontSize: 14, bold: true, color: C.blue, charSpacing: 2 });
    T(s, v, { x: 4.3, y, w: 7.2, h: 1.6, fontSize: 18.5 });
  });
  box(s, 12.0, 2.25, 7.1, 3.35, C.white);
  T(s, [{ text: 'CONFIRMED DATE', options: { bold: true, color: C.blue, breakLine: true, fontSize: 15 } }, { text: 'Every member voted for the same slot. It is an intention.' }], { x: 12.4, y: 2.55, w: 6.4, h: 2.8, fontSize: 20 });
  box(s, 12.0, 5.85, 7.1, 3.35, C.ink);
  T(s, [{ text: 'MEETING THAT HAPPENED', options: { bold: true, color: C.yellow, breakLine: true, fontSize: 15 } }, { text: 'Next morning, at least 2 members (one who is not the organiser) answer « yes, we met ». It is a behaviour, and the one we judge on.' }], { x: 12.4, y: 6.15, w: 6.4, h: 2.9, fontSize: 20, color: C.white });
  ref(s, 'Our working document, Next test n°2 ("Wizard of Oz" with real friend groups) · Course 2.8 p.16: prototype tests, actual behaviour');
  s.addNotes('Overlap is a prototype, so the pilot is a concierge test, as planned in our working document: we play the app by hand. Organisers sign up at the stand, their friends join a temporary planning group, send their free evenings, and vote. We separate two things: a confirmed date is an intention; a meeting that happened is a behaviour. We judge the campaign on the second one.');
}
// ---------- 18. KPI ----------
{
  const s = slide('12.6 · HOW WE WILL KNOW', 'One main indicator, at group level');
  box(s, 0.9, 2.2, 7.4, 7.7, C.blue);
  T(s, [{ text: 'MAIN INDICATOR', options: { bold: true, color: C.yellow, breakLine: true, fontSize: 15 } }, { text: 'Group meet-up rate', options: { fontFace: HEAD, bold: true, fontSize: 28, breakLine: true } }, { text: ' ', options: { breakLine: true, fontSize: 10 } },
    { text: 'groups that actually met within 14 days', options: { breakLine: true } }, { text: '÷', options: { fontSize: 28, bold: true, breakLine: true } }, { text: 'groups that started the trial', options: { breakLine: true } }, { text: ' ', options: { breakLine: true, fontSize: 10 } },
    { text: 'Success: ≥ 60 % (9 of 15)', options: { fontFace: HEAD, bold: true, fontSize: 22, breakLine: true } },
    { text: 'Same bar as our working document: 3 groups out of 5 meet within 2 weeks. Compared with each group\'s baseline: "of your last 3 plans, how many happened?"', options: { fontSize: 16 } }],
    { x: 1.3, y: 2.5, w: 6.6, h: 7.2, fontSize: 20, color: C.white });
  const rows = [[{ text: 'Step', options: { bold: true, color: 'FFFFFF', fill: { color: C.ink } } }, { text: 'Metric', options: { bold: true, color: 'FFFFFF', fill: { color: C.ink } } }, { text: 'Target (hypothesis)', options: { bold: true, color: 'FFFFFF', fill: { color: C.ink } } }],
    ...D.pilot.funnel.map(f => [{ text: f.step, options: { bold: true, color: f.step.includes('main') ? C.blue : C.ink } }, f.metric, f.target])];
  s.addTable(rows, { x: 8.7, y: 2.2, w: 10.4, colW: [2.6, 4.9, 2.9], fontFace: BODY, fontSize: 17, color: C.ink, border: { type: 'solid', color: 'E7E1D8', pt: 1 }, fill: { color: 'FFFFFF' }, rowH: 0.95, valign: 'middle', margin: 0.08 });
  s.addNotes('This answers the second half of the jury question: how will we know the campaign helped groups fix a date? Our main indicator is measured at group level: the share of groups that really met within fourteen days. Success is 60 percent, the same bar we wrote in our working document. The funnel on the right shows where it breaks if it fails. All targets are hypotheses for steering, not results.');
}
// ---------- 19. Decisions ----------
{
  const s = slide('12.6 · DECISIONS', 'What we do if it breaks');
  const D2 = [['A', 'Many discover, few invite', 'Invite rate < 40 %', 'The problem is the organiser\'s ask, not the friends. We call 5 non-inviters ("what stopped you?"), rewrite the invite message, and let organisers send it with us at the stand. Still < 40 % after one week: the pain is too weak in this situation, so we test segment 3 (friends far away) or the "free tonight" idea.', C.orange],
    ['B', 'Many start, few confirm', 'Date-lock rate < 50 %', 'The friend side breaks. If friends don\'t answer: reminder at 24 h, quorum rule (lock at 4/5). If they answer but no slot fits: wider window or last-minute slots. Product consequence: keep guest access without download.', C.blue],
    ['C', 'Dates confirmed, few meet', 'Show-up rate < 85 %', 'Commitment is weak. We add a reminder 2 h before, send the place earlier, and ask in the survey what made people cancel.', C.violet]];
  D2.forEach(([l, h, trig, d, c], i) => {
    const y = 2.2 + i * 2.6;
    box(s, 0.9, y, 18.2, 2.35, C.white);
    dot(s, 1.25, y + 0.55, 1.2, c, l, 30);
    T(s, h, { x: 2.8, y: y + 0.4, w: 4.6, h: 0.9, fontFace: HEAD, fontSize: 20, bold: true });
    T(s, trig, { x: 2.8, y: y + 1.35, w: 4.6, h: 0.5, fontSize: 17, bold: true, color: c });
    T(s, d, { x: 7.7, y: y + 0.32, w: 11.1, h: 1.85, fontSize: 18 });
  });
  s.addNotes('We decided in advance what we will do with each result. Case A: lots of people see the campaign but few invite their friends. Then the problem is the ask, so we fix the invitation before touching the product. Case B: groups start but do not confirm. Then the friend side is the problem, so we add reminders, a quorum rule or last-minute slots. Case C covers confirmed dates that do not happen.');
}
// ---------- 20. Calendar ----------
{
  const s = slide('12.7 · LAUNCH CALENDAR', 'Four weeks, from today to the decision');
  const cal = D.calendar;
  cal.forEach((c, i) => {
    const col = i < 5 ? 0 : 1, row = i % 5;
    const x = 0.9 + col * 9.25, y = 2.2 + row * 1.6;
    box(s, x, y, 2.75, 1.35, [3, 4, 6, 8].includes(i) ? C.blue : C.ink, { rectRadius: 0.2 });
    T(s, c.when, { x: x + 0.15, y, w: 2.45, h: 1.35, fontSize: 16, bold: true, color: C.white, align: 'center', valign: 'middle' });
    T(s, [{ text: c.what, options: { breakLine: true } }, { text: c.who, options: { color: C.grey, fontSize: 14 } }], { x: x + 2.95, y: y + 0.02, w: 6.0, h: 1.35, fontSize: 15.5, valign: 'middle' });
  });
  s.addNotes('Here is the calendar. This week we ask for permissions. Next week we print and test the pilot on one of our own groups. We shoot the film on Saturday 28 November. Posters and the first carousel go out on 30 November, the stand runs on 1 and 3 December, sign-ups close on the 4th, and the groups have until 18 December to meet. We decide on 21 December.');
}
// ---------- 21. Budget ----------
{
  const s = slide('12.8 · BUDGET', 'A student envelope: €378.40 (estimated)');
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
// ---------- 22. Close ----------
{
  const s = slide('12.9 · WHAT WE WILL LEARN', 'In three weeks, we will know if friends follow the organiser', 'OV_DARK');
  T(s, [{ text: 'Will friends answer an organiser in 48 h without installing anything?', options: { bullet: true, breakLine: true } },
    { text: 'Do confirmed dates turn into real meetings, more often than in their group chat today?', options: { bullet: true, breakLine: true } },
    { text: 'Which step breaks first, so we know what to build next: the invite, the slots or the reminder.', options: { bullet: true } }], { x: 0.9, y: 5.3, w: 11.0, h: 3.6, fontSize: 24, color: C.white, paraSpaceAfter: 12 });
  s.addImage({ path: I('logo.png'), x: 13.6, y: 5.0, w: 2.6, h: 2.6 });
  T(s, 'Overlap', { x: 12.6, y: 7.75, w: 6.0, h: 0.9, fontFace: HEAD, fontSize: 40, bold: true, color: C.white, align: 'center' });
  T(s, 'LESS CHATTING – MORE MEETING', { x: 11.9, y: 8.6, w: 7.4, h: 0.5, fontSize: 14, color: C.white, align: 'center', charSpacing: 3 });
  s.addNotes('To conclude: the campaign is a test as much as a launch. In three weeks we will know three things: whether friends answer an organiser without installing anything, whether confirmed dates turn into real meetings, and which step breaks first. Whatever the result, it tells us what to build next. Less chatting, more meeting.');
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  const { applyTheme } = require(process.env.APPLY_THEME);
  await applyTheme(OUT, THEME);
  console.log('slides', N, OUT);
})();
