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
