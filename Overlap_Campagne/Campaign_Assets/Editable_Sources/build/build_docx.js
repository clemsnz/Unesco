// Builds Overlap_Marketing_Communication.docx (section 12 of our dossier). node build_docx.js <imgDir> <out.docx>
const fs = require('fs'), path = require('path');
const docx = require(process.env.DOCXLIB || 'docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, ImageRun, AlignmentType, LevelFormat, BorderStyle, PageBreak, Footer, PageNumber } = docx;
const D = require('./data.json');
const { SHOTS } = require('../html/film_data.js');
const IMG = process.argv[2], OUT = process.argv[3];
const BLUE = '1143F7', ORANGE = 'FE512D', GREY = '6E6A64';
const W = 9026; // A4 content width in DXA (2 cm margins)

// --- helpers: **bold** and _italic_ inline markup
function runs(t, base = {}) {
  const out = []; const re = /(\*\*[^*]+\*\*|~~[^~]+~~|(?<![A-Za-z0-9])_[^_]+_(?![A-Za-z0-9]))/g; let last = 0, m;
  while ((m = re.exec(t))) {
    if (m.index > last) out.push(new TextRun({ text: t.slice(last, m.index), ...base }));
    const s = m[0]; out.push(s.startsWith('**') ? new TextRun({ text: s.slice(2, -2), bold: true, ...base }) : s.startsWith('~~') ? new TextRun({ text: s.slice(2, -2), strike: true, color: ORANGE, ...base }) : new TextRun({ text: s.slice(1, -1), italics: true, ...base }));
    last = m.index + s.length;
  }
  if (last < t.length) out.push(new TextRun({ text: t.slice(last), ...base }));
  return out;
}
const P = (t, o = {}) => new Paragraph({ children: runs(t, o.run || {}), spacing: { after: 120, line: 288 }, ...o.p });
const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']; let c1 = 0, c2 = 0, c3 = 0, fig = 0;
const H1 = t => { c1++; c2 = 0; return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(`${ROM[c1 - 1]}. ${t.replace(/^12\.\d\s+/, '')}`)] }); };
const H2 = t => { c2++; c3 = 0; return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(`${String.fromCharCode(64 + c2)}. ${t.replace(/^[A-D]\. /, '')}`)] }); };
const H3 = t => { c3++; return new Paragraph({ heading: HeadingLevel.HEADING_4, children: [new TextRun(`${c3}. ${t.replace(/^C\d — /, '')}`)] }); };
const B = (t, lvl = 0) => new Paragraph({ numbering: { reference: 'bul', level: lvl }, children: runs(t), spacing: { after: 60, line: 276 } });
const NUM = (t) => new Paragraph({ numbering: { reference: 'num', level: 0 }, children: runs(t), spacing: { after: 60, line: 276 } });
const NOTE = t => new Paragraph({ children: runs(t, { color: GREY, size: 18, italics: true }), spacing: { after: 160 } });
const QUOTE = t => new Paragraph({ children: runs(t, { italics: true }), spacing: { before: 120, after: 160 }, indent: { left: 567, right: 567 } });
function IMGP(file, wPx, cap) {
  const buf = fs.readFileSync(path.join(IMG, file));
  const { w, h } = jpgSize(buf, file);
  const out = [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [new ImageRun({ type: file.endsWith('.png') ? 'png' : 'jpg', data: buf, transformation: { width: wPx, height: Math.round(wPx * h / w) }, altText: { title: cap || file, description: cap || file, name: file } })] })];
  if (cap) { fig++; out.push(new Paragraph({ alignment: AlignmentType.CENTER, children: runs(`Figure ${fig} – ${cap}`, { size: 18, color: GREY, italics: true }), spacing: { after: 200 } })); }
  return out;
}
function jpgSize(buf, f) {
  if (f.endsWith('.png')) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  let i = 2; while (i < buf.length) { if (buf[i] !== 0xFF) { i++; continue; } const m = buf[i + 1]; const len = buf.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xC3) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }; i += 2 + len; }
}
const border = { style: BorderStyle.SINGLE, size: 4, color: 'D9D2C7' };
function TABLE(head, rows, widths) {
  const k = W / widths.reduce((a, b) => a + b, 0); widths = widths.map(x => Math.round(x * k)); widths[widths.length - 1] += W - widths.reduce((a, b) => a + b, 0);
  const total = W;
  const cell = (t, i, isHead) => new TableCell({ width: { size: widths[i], type: WidthType.DXA }, borders: { top: border, bottom: border, left: border, right: border },
    shading: isHead ? { type: ShadingType.CLEAR, fill: 'F2F2F2', color: 'auto' } : undefined, margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: String(t).split('\n').map(line => new Paragraph({ children: runs(line, isHead ? { bold: true, size: 19 } : { size: 19 }), spacing: { after: 20 } })) });
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, i, true)) }), ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, i, false)) }))] });
}
const SP = () => new Paragraph({ children: [], spacing: { after: 80 } });

const sub = D.budget.reduce((a, b) => a + b.qty * b.unit, 0), cont = Math.round(sub * D.contingency_rate * 100) / 100, tot = sub + cont;
const eur = v => '€' + v.toFixed(2);

const body = [];
const add = (...x) => x.flat().forEach(e => body.push(e));

add(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('MARKETING & COMMUNICATION')] }),
  P('**Launch campaign « La semaine pro » — Less chatting – More meeting**'),
  P('This section presents our launch strategy, the campaign idea, the creations and their texts, the roll-out calendar, the budget and the pilot that will test the campaign. The print files and editable sources are delivered with the presentation.'));

// 12.1
add(H1('12.1 The question we have to answer'),
  P('We know why a student who often organises outings would try Overlap: she is the one who suffers most from the group chat. The harder question is the one a jury could ask us:'),
  QUOTE('« I see why an organiser would try Overlap. But why would her friends make the effort to join her, and how will you know that your campaign really helped them fix a date? »'),
  P('We built the whole section around this question. Our answer has three parts:'),
  NUM('**Make it cost the friends almost nothing:** 30 seconds and nothing to install during the pilot.'),
  NUM('**Make the invitation come from a friend, not from a brand:** the organiser forwards it in her own group chat.'),
  NUM('**Measure success at group level:** not downloads or likes, but the share of groups that actually meet.'),
  H2('What the course asks, and how we apply it'),
  P('We separate the professor\'s method (left) from our own creative choices (right).'),
  TABLE(['Course requirement (page)', 'How we apply it in this section'], [
    ['1.6 Introduction to Entrepreneurship, p.11: Assumption → Experiment → Evidence → Decision', 'The campaign is built as an experiment: we state the assumption, run a pilot, collect evidence and decide (part VIII).'],
    ['1.6, p.13: attention is scarcer, trust is harder', 'We reach friends through someone they trust (the organiser), not through ads.'],
    ['1.6, p.17: start with what you have', 'We launch on our own campus (EFAP), with our network and a student budget.'],
    ['1.6, p.22: "Here is the evidence we have so far"', 'We show our four interviews and secondary data, with their limits (part II).'],
    ['2.8 From Idea to Concept, p.16: primary research includes prototype tests and actual behaviour', 'The pilot is a prototype test that observes real behaviour: did the group meet?'],
    ['2.8, p.18: behaviour > opinion', 'Our main indicator is a behaviour (a meeting that happened), not a like or an intention.'],
    ['2.8, p.20: AI can generate hypotheses, reality validates them', 'All our targets are hypotheses for steering; only the pilot can validate them.'],
    ['2.8, p.29 (Workshop 2): riskiest assumption, evidence, next test', 'We use these three headings explicitly in part VIII.'],
  ], [4300, 5338]));

// 12.2
add(H1('12.2 Strategy: one audience, one situation, one channel'),
  H2('First audience: the organiser'),
  P('Our priority target in the Canva is students and young professionals aged 18–25. Inside this group, we start with **the person who usually launches the plans**, like our persona Camille (24, Master\'s student in Marketing & Communications with a part-time job, several friend groups). She feels the problem most, and she can bring her friends. Concretely, we start with **EFAP students who tried to plan something with a group of 3 to 6 friends in the last month**. Their friends can study or work anywhere.'),
  H2('The situation'),
  P('Someone writes « on se capte la semaine pro ? » ("shall we catch up next week?") in the group chat. Replies pile up, people are busy on different days, nobody decides, and the plan dies. Camille\'s user scenario in our working document describes exactly this: 40 messages and nothing planned. In December the deadline is real: everyone wants to see each other **before the holidays**.'),
  H2('The channel'),
  P('We meet organisers **in person, on campus**: posters where students wait together and a stand at lunchtime. The invitation then travels **from friend to friend**, inside the group chat they already use. Instagram supports the campaign (a shareable carousel, a "how it works" carousel, a recruiting story and the film).'),
  H2('Evidence we start from'),
  B('**Four interviews** (ages 22–25, Paris region): Capucine: _"After a while, there are like 50 messages and nobody really knows what we decided."_ Julia: a group trying to find a date for 3 months with last-minute postponements. Pablo: a drink missed two weeks ago because of organising the moment. Mathieu: promises made at parties that never happen.'),
  B('**None of the four named the place as a barrier.** Last-minute plans work better than plans made in advance, and group chats stall before a decision.'),
  B('**Secondary data:** about one third of 18–24-year-olds identify organising outings as a challenge (Harris Interactive); 52% of Gen Z use group chats to interact with friends (Morning Consult).'),
  P('**Limits.** Four interviews give us a direction, not a proof. We have no evidence yet that friends will answer an organiser through a tool, that a confirmed date turns into a real meeting, that people will share their calendar, or that anyone will pay. The campaign is designed to test the first two points.'));

// 12.3
add(H1('12.3 The journey on both sides'),
  TABLE(['Step', 'The organiser (Camille)', 'Her friends'], [
    ['1. Trigger', 'Sees the poster in the student lounge, a carousel a friend shared, or the stand.', '—'],
    ['2. Action', 'Signs her group up for the free pilot: 1 minute, at the stand or by replying « GROUPE » to our story.', '—'],
    ['3. Invitation', 'Forwards our ready-made message in her usual group chat, with a link to a temporary planning group.', 'Receive it **from Camille**, in their own chat. Not an ad.'],
    ['4. Answer', 'Sends her own free evenings.', 'Join with one tap and send their free evenings: **30 seconds, nothing to install**.'],
    ['5. Choice', 'Gets 2–3 slots when everyone is free.', 'Tap one slot in the poll.'],
    ['6. Confirmed date', 'When everyone voted for the same slot (5/5), the date is locked + a convenient place.', 'Same. Reminder the day before and 2 hours before.'],
    ['7. Meeting', 'They meet. Next morning, a check-in poll: « Did you meet? »', 'Answer the check-in.'],
  ], [1700, 4100, 3838]),
  H2('Why would her friends join?'),
  NUM('**It comes from a friend.** Camille sends the invitation in their own chat. We never message the friends as a brand first.'),
  NUM('**It costs 30 seconds.** No app, no account during the pilot: one tap to join, one message, one vote.'),
  NUM('**It ends their pain too.** They also dislike the 47 messages. They don\'t negotiate: they tap a slot that already works for everyone.'),
  NUM('**A shared deadline.** « Before the holidays », plus a visible count (4/5 answered). Nobody wants to be the one who blocks the group.'),
  P('**Product decision.** Every extra download is a risk for a group app: our working document already notes that "if a single person in the group does not sign up, the service collapses". Howbout requires every friend to create an account; To Gather lets guests reply by web link. We follow the second model: **only the organiser needs the app; friends join with a guest link.**'),
  P('**Stage of the project.** Overlap is a prototype (screens in our Canva). The call to action is therefore a **free pilot run by our team** (a concierge or "Wizard of Oz" test, as planned in our working document). We do not promise an app download.'));

// 12.4
add(H1('12.4 The campaign idea: « La semaine pro »'),
  P('**Lived detail.** « On se capte la semaine pro » is the sentence every group chat sends and never keeps. Our audience can send it to their group immediately, because everybody recognises it.'),
  P('**Name:** « La semaine pro » ("Next week").'),
  P('**Hook:** « On se capte ~~la semaine pro~~ jeudi 19h30 ✓ » — "Let\'s catch up ~~next week~~ Thursday 7:30 pm".'),
  P('**Visual principle: the strike-out.** A vague promise is crossed out in orange and replaced by a real, confirmed slot in a blue pill, with the group count (5/5). The same device is used on every piece: poster, film, carousels, story, activation board.'),
  P('**What it shows.** The benefit is shown from the friends\' side: no debate, one tap, a date that holds.'),
  P('**Brand.** Cream background, Overlap blue and orange, Monument Extended for titles and Syne for text (from our Visual Identity slides), the mascot logo and our signature **Less chatting – More meeting**.'),
  P('**Language.** The ads are in French because this is how our audience talks; « on se capte » does not translate naturally. All texts for the jury are in English, and every French line is translated in this section and in the presentation notes.'));

// 12.5
add(H1('12.5 The creations'),
  H2('A. Launch poster'),
  ...IMGP('Overlap_Poster_A2.jpg', 330, 'Launch poster (A2, also printed in A3)'),
  TABLE(['Element', 'Final text (FR)', 'English'], [
    ['Hook', 'On se capte ~~la semaine pro~~ jeudi 19h30 ✓', 'Let\'s catch up ~~next week~~ Thursday 7:30 pm ✓'],
    ['Card', 'C\'est calé · Jeu. 10 déc · 19h30 · 5/5', 'Locked in · Thu 10 Dec · 7:30 pm · 5/5'],
    ['Body', 'Overlap compare vos dispos et propose 2 à 3 créneaux où tout le groupe est libre. Chacun confirme en un tap.', 'Overlap compares your availability and suggests 2–3 slots when the whole group is free. Everyone confirms in one tap.'],
    ['Call to action', 'Pilote gratuit · 15 groupes · rien à télécharger. Inscris ton groupe au stand Overlap. Hall EFAP · mar. 1er & jeu. 3 déc. · 12h–14h', 'Free pilot · 15 groups · nothing to download. Sign up your group at the Overlap stand. EFAP hall · Tue 1 & Thu 3 Dec · 12–2 pm'],
    ['Signature', 'Less chatting – More meeting', '—'],
  ], [1700, 4100, 3838]),
  P('**Where:** EFAP student lounge, between the lifts and the coffee machine, at eye level. Classmates wait there together, phone in hand, so they read it together and forward the idea. 30 × A3 across campus + 2 × A2 at the stand.'),
  P('**No QR code.** We only print a link or a QR code whose destination exists and has been tested. The pilot form is not online yet, so the action is the stand or a DM. Once the form is live and tested, a QR code can be added in the black call-to-action box.'),
  ...IMGP('Overlap_Poster_in_situ.jpg', 560, 'Mock-up: the poster in the student lounge'),

  H2('B. Vertical film « 47 messages » (28 seconds)'),
  P('Shot on one phone in about three hours, edited in CapCut, subtitled so it works without sound. A full 6-page storyboard with the bilingual script is delivered with the presentation.'),
  ...IMGP('strip_film1.jpg', 600, 'Shots 1–4: the problem'),
  ...IMGP('strip_film2.jpg', 600, 'Shots 5–8: the friends\' side, the confirmed date (shot 6) and the real meeting'),
  TABLE(['#', 'Time', 'Framing', 'Action', 'On screen / sound'], SHOTS.map(s => [String(s.n), `${s.tc}\n${s.dur}`, s.frame, s.action, s.screen + '\nSound: ' + s.sound]), [400, 1050, 2000, 3000, 3188]),
  P('**The confirmation moment (shot 6):** three common slots appear; votes fill up on « Jeu. 10 déc. · 19h30 »: 1/5, 3/5, 5/5. The card turns blue: « C\'est calé ✓ ». In the group chat, Léo writes « ENFIN » ("FINALLY"), then the chat goes quiet.'),
  P('**Real exchanges in the group chat (shot 2):** Léo: « grave chaud » (totally up for it) · Sarah: « mardi j\'peux pas, partiel » (can\'t do Tuesday, exam) · Yanis: « jeudi je suis en alternance jusqu\'à 19h » (Thursday I\'m at my work-study job until 7 pm) · Nora: « mercredi ? » · Léo: « ah non mercredi foot » (no, Wednesday is football) · Sarah: « on dit la semaine d\'après alors ? » (the week after, then?).'),
  P('_The phone screens are illustrative prototype screens. During the pilot, the same steps happen by message._'),

  H2('C. Three social media posts'),
  H3('C1 — Shareable carousel « Le dico des promesses de groupe » (6 screens, 1080 × 1350)'),
  ...IMGP('strip_c1a.jpg', 520), ...IMGP('strip_c1b.jpg', 520, 'Post 1, carousel screens 1–6'),
  P('Each screen "translates" a group-chat promise and corrects it with a real slot: « On se capte la semaine pro » = "we\'ll see each other in 2027" → jeudi 19h30 ✓; « Faut qu\'on se fasse un verre un de ces quatre » = "never, but with love" → mardi 20h ✓; « Dites-moi vos dispos » = "47 messages later, still no date" → 3 créneaux · 1 tap ✓; « Avant les vacances, promis » = "after the holidays, maybe" → sam. 12 déc, 12h ✓.'),
  P('**Caption (FR):** _Le dico officiel des promesses de groupe. Envoie ce carrousel au groupe qui dit « la semaine pro » depuis la rentrée. On sait qu\'il existe. Overlap trouve 2 à 3 créneaux où tout le groupe est libre. Chacun tape le sien, c\'est calé. Pilote gratuit : 15 groupes, 14 jours, rien à télécharger. Stand Overlap, hall EFAP · mar. 1er & jeu. 3 déc. · 12h–14h — ou réponds GROUPE en DM. Less chatting – More meeting._'),
  P('**EN:** The official dictionary of group-chat promises. Send this carousel to the group that has been saying "next week" since September. We know it exists. Overlap finds 2–3 slots when the whole group is free… Free pilot: 15 groups, 14 days, nothing to download.'),
  H3('C2 — Carousel « De 47 messages à 1 date » (how it works, 5 screens)'),
  ...IMGP('strip_c2.jpg', 600, 'Post 2, carousel screens 1–5'),
  P('**Caption (FR):** _De 47 messages à 1 date, en 4 étapes : 1. Tu choisis le groupe. 2. Tes potes donnent leurs dispos (30 secondes, rien à installer pendant le pilote). 3. Overlap propose 2 à 3 créneaux où tout le monde est libre. Chacun tape. 4. Un lieu pratique pour tous + un rappel la veille. Overlap ne lit que « libre / occupé », jamais le contenu de ton agenda._'),
  P('**EN:** From 47 messages to 1 date in 4 steps… Overlap only reads "free / busy", never what is in your calendar. These steps match our "How it works" slide and our Legal section.'),
  H3('C3 — Interactive story « On cherche 15 groupes » (3 frames, 1080 × 1920)'),
  ...IMGP('strip_c3.jpg', 420, 'Post 3, story frames 1–3'),
  TABLE(['Frame', 'Sticker and exact text (FR)', 'English'], [
    ['1', 'Poll: « Ton groupe dit "la semaine pro" depuis… » Options: 1 semaine / 1 mois / Depuis la rentrée / On a arrêté de compter', 'Your group has been saying "next week" for… 1 week / 1 month / Since September / We stopped counting'],
    ['2', 'Question: « Raconte ton dernier "on se capte" resté dans le groupe »', 'Tell us about your last "let\'s catch up" that stayed in the group chat'],
    ['3', 'Call to action: « On cherche 15 groupes pour le pilote · 14 jours, gratuit · Rien à télécharger · Réponds "GROUPE" à cette story, ou viens au stand Overlap »', 'We are looking for 15 groups for the pilot… Reply "GROUPE" to this story, or come to the stand'],
  ], [900, 4500, 4238]),
  P('_Proposed account name: overlap.pilot (to check and reserve before posting). No link is used: the only actions are a DM reply or a visit to the stand._'),

  H2('D. Field activation « Le Mur des Semaines Pro »'),
  ...IMGP('Activation_Scene.jpg', 600, 'Mock-up of the activation in the EFAP hall'),
  P('**The scene, from a participant\'s point of view.** Léa (21, first-year Master\'s) walks to the cafeteria with two classmates. A big board says « Le Mur des Semaines Pro ». Clémentine asks: « Depuis quand ton groupe dit "la semaine pro" ? » ("Since when has your group been saying next week?"). Léa laughs: « depuis septembre ». She writes « Les filles de L3, depuis septembre » on an orange post-it and sticks it in the "graveyard of plans". Opale gives the three of them a transparent week grid each: they cross out the evenings they are busy and stack the sheets. One cell stays clear: that is their slot. They fill in a « C\'est calé » card, take a photo and send it to their group chat. Léa\'s two other friends were not there, so she signs the whole group up for the pilot on Hénora\'s tablet (one minute). That evening, the planning group asks for their free evenings; two days later, a poll with three common slots arrives; the five friends vote; the date is locked.'),
  ...IMGP('Wall_Board_A1.jpg', 520, 'Main on-site support: the A1 wall board'),
  ...IMGP('strip_cards.jpg', 480, '« C\'est calé » card (A6) and transparent week grid (A5)'),
  TABLE(['Item', 'Details'], [
    ['Place and time', 'EFAP Paris hall, near the cafeteria. Tue 1 and Thu 3 Dec 2026, 12:00–14:00 (set-up 11:15). Subject to approval by the school.'],
    ['Partnerships (envisaged, not secured)', 'EFAP administration: space (required, request by Agathe). Student union (BDE): relay of the C3 story (optional). No bar or brand partner, so free drinks do not bias the meeting rate.'],
    ['Team roles', D.roles.map(r => `${r.name}: ${r.activation}`).join('\n')],
    ['Material', 'A1 board on foam board, 2 × A2 posters, 50 transparent A5 grids, 12 dry-erase markers, 300 cards, sticky notes, borrowed table, tablet, coffee and sweets.'],
    ['Cost', '€161.00 for the activation lines (estimate, see part VII).'],
    ['Observable result (targets, hypotheses)', '≈ 120 stand conversations · ≈ 60 post-its · ≈ 20 groups leave with a card · 25 organisers signed up → 15 groups started.'],
  ], [2600, 7038]));

// 12.7
add(H1('12.7 Launch calendar'),
  TABLE(['When (2026)', 'What', 'Who'], D.calendar.map(c => [c.when, c.what, c.who]), [2000, 5800, 1838]));

// 12.8
add(H1('12.8 Budget'),
  P('_' + D.budget_note + '_'),
  TABLE(['#', 'Item', 'Qty', 'Unit', 'Total', 'Owner', 'Indicator'], [
    ...D.budget.map((b, i) => [String(i + 1), b.item, String(b.qty), eur(b.unit), eur(b.qty * b.unit), b.owner, b.kpi]),
    ['', '**Subtotal**', '', '', '**' + eur(sub) + '**', '', ''],
    ['', 'Contingency (10%)', '', '', eur(cont), '', ''],
    ['', '**TOTAL launch envelope**', '', '', '**' + eur(tot) + '**', '', 'Estimate'],
  ], [400, 3300, 600, 900, 1000, 1200, 2238]),
  P(`By category: posters €54.00 · activation €161.00 · pilot €64.00 · social €40.00 · film €25.00 (= ${eur(sub)}). That is about ${eur(tot / 15)} per group started and ${eur(tot / 9)} per group that meets if we reach the target.`),
  P('**Free or borrowed (not counted):** ' + D.free_items),
  P('Our budget spreadsheet contains the same lines with formulas, next to the pilot tracking sheet.'));

// 12.6
add(H1('12.6 How we will test the campaign'),
  H2('Evidence'),
  P('In all four interviews, plans failed because of **timing**, not place: "50 messages", three months without a date, a missed drink, party promises never kept. Last-minute plans work better. Around one third of 18–24-year-olds say organising outings is a challenge (Harris Interactive).'),
  H2('Riskiest assumption'),
  QUOTE('When an organiser invites them, at least 3 out of 4 friends send their free times within 48 hours, without installing anything, and the group locks a date that it really keeps.'),
  P('It is our riskiest assumption because a group app fails as soon as one person does not join, and because a confirmed date is still only an intention.'),
  H2('Next test: a 14-day concierge pilot'),
  TABLE(['Question', 'Our plan'], [
    ['Who we recruit', D.pilot.recruit + ' Target: 25 organisers → 15 groups (≈ 60 people).'],
    ['How long', D.pilot.window],
    ['What participants do', 'Organiser: sign up (1 min) and forward the invitation. Friends: join a temporary planning group (1 tap), send free evenings (30 s), vote in a poll with 2–3 common slots, receive reminders, meet, answer the check-in.'],
    ['How we collect results', 'The team plays the app by hand on one shared WhatsApp number (as planned in our working document, "Wizard of Oz" test). One row per group in a Google Sheet (our tracking template computes every rate automatically), check-in poll the morning after each meeting, end survey (5 questions) and 5 short calls with groups that did not lock a date.'],
    ['Privacy', 'Consent form at sign-up; we never join the friends\' own group chat; only first names and free evenings are collected; data deleted by 31 Jan 2027 (in line with our Legal section).'],
  ], [2400, 7238]),
  H2('Confirmed date vs. meeting that happened'),
  B(D.pilot.definitions.started),
  B(D.pilot.definitions.confirmed),
  B(D.pilot.definitions.met),
  H2('Main indicator (group level)'),
  P(`**${D.pilot.primary.name}** = ${D.pilot.primary.formula}.`),
  P(`**Success threshold: ${D.pilot.primary.threshold}.** ${D.pilot.primary.why} To see whether the campaign changes behaviour, we compare it with each group\'s baseline, asked at sign-up: "Of the last 3 plans you tried to make in this group chat, how many actually happened?"`),
  TABLE(['Step', 'Metric', 'Target (hypothesis)', 'Owner'], D.pilot.funnel.map(f => [f.step, f.metric, f.target, f.owner]), [2100, 3800, 2100, 1638]),
  NOTE('All targets are steering hypotheses, not results. Study data is quoted with its source; our own figures are estimates.'),
  H2('Decisions we take in advance'),
  P('**Case A — many people discover the campaign, but few invite their friends** (invite rate below 40%). The problem is the organiser\'s ask, not the friends. We call 5 organisers who did not invite ("What stopped you?"), rewrite the invitation message and let organisers send it with us at the stand. If the rate is still below 40% after one week, the pain is too weak in this situation: we test segment 3 (friends who live far away) or the "free tonight" idea from our working document.'),
  P('**Case B — many groups start the trial, but few confirm a date** (date-lock rate below 50%). The friend side breaks. If friends do not answer: a reminder at 24 hours and a quorum rule (lock at 4/5, the missing person is informed). If they answer but no slot fits: a wider window or last-minute slots. Product consequence: keep guest access without download.'),
  P('**Case C — dates are confirmed, but few groups meet** (show-up rate below 85%). Commitment is weak: we add a reminder 2 hours before, send the place earlier and ask in the survey why people cancelled.'));

// 12.9
add(H1('12.9 What the pilot will teach us'),
  B('Whether friends answer an organiser within 48 hours **without installing anything**: this tells us if our friend-side flow works.'),
  B('Whether confirmed dates turn into **real meetings** more often than in their group chat today.'),
  B('**Which step breaks first** (the invitation, the slots or the reminder), so we know what to build next.'),
  P('Whatever the result, the decision rules above tell us what we change. Less chatting, more meeting.'),
  H1('Sources'),
  B('Course material: « 1.6 Introduction to Entrepreneurship » (p.11, 13, 17, 22) and « 2.8 From Idea to Concept » (p.16, 18, 20, 29), Octave Friant, EFAP.'),
  B('Our working document « Entrepreneurship »: interviews (Pablo, Capucine, Mathieu, Julia), Workshop 2 (riskiest assumption, next test), persona Camille, competitor analysis (Howbout, To Gather).'),
  B('Harris Interactive (organising outings, 18–24-year-olds); Morning Consult, Gen Z 2025 (group chats) — as cited in our Canva and working document.'));

const doc = new Document({
  creator: 'Overlap team', title: '12. Marketing & Communication — Overlap',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 22, bold: true, color: '000000' }, paragraph: { spacing: { before: 0, after: 240 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 22, bold: true, color: '000000' }, paragraph: { spacing: { before: 280, after: 120 }, keepNext: true, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 22, bold: true, color: '000000' }, paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, outlineLevel: 2 } },
      { id: 'Heading4', name: 'Heading 4', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 22, bold: true, italics: false, color: '000000' }, paragraph: { spacing: { before: 160, after: 80 }, keepNext: true, outlineLevel: 3 } },
    ] },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
    { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
  ] },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], color: GREY, size: 16 })] })] }) },
    children: body }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('ok', OUT); });
