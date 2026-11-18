const PL = require('./plan.json');
const sub = D.budget.reduce((a, b) => a + b.qty * b.unit, 0), cont = Math.round(sub * D.contingency_rate * 100) / 100, tot = sub + cont;
const eur = v => '€' + v.toFixed(2);
const body = [];
const add = (...x) => x.flat().forEach(e => body.push(e));

add(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('MARKETING & COMMUNICATION')] }),
  P('**Launch campaign « La semaine pro » — Less chatting – More meeting**'),
  P('This section presents our marketing plan (objectives, targets, positioning, marketing mix and launch phases) and our communication plan (platform, campaign idea, channels, creations, social media plan, budget and indicators).'));

// MARKETING
add(H1('Objectives'),
  H2('Marketing objectives'),
  TABLE(['Objective', 'What we want', 'Target (hypothesis)'], PL.objectives.marketing, [1800, 4300, 2926]),
  H2('Communication objectives'),
  TABLE(['Level', 'What our audience should know, feel or do'], PL.objectives.communication, [2200, 6826]),
  NOTE('All targets are steering hypotheses for the launch period (23 November – 18 December 2026).'));

add(H1('Targets'),
  TABLE(['Role', 'Who', 'Profile', 'Pain point'], PL.targets, [1500, 1700, 3900, 1926]),
  P('Our core target is the **organiser**, the person who usually launches the plans in a friend group. Our persona Camille (24, Master\'s student in Marketing & Communications with a part-time job, several friend groups) is exactly this person: _"I text my friends every day, yet we barely see each other because we can never agree on a time."_ Through her, we reach her friends, who receive the invitation from someone they trust.'));

add(H1('Positioning'),
  QUOTE(PL.positioning),
  P('**Competitors.** WhatsApp groups and Doodle polls are manual: information gets lost and someone has to chase everyone. Timeleft, Bumble For Friends and Frimake help people meet strangers, not their existing friends. Our closest competitors, Howbout and To Gather, also compare calendars; we stand out by our simplicity (one promise: finding the slot) and because friends can join without creating an account.'),
  P('**Brand values used in our communication:** Connection, Simplicity, Trust & Privacy.'));

add(H1('Marketing mix'),
  TABLE(['Lever', 'Our choice'], PL.mix, [1800, 7226]));

add(H1('Launch strategy'),
  TABLE(['Phase', 'When', 'Goal', 'What we do'], PL.phases, [1800, 1900, 2500, 2826]));

// COMMUNICATION
add(H1('Communication platform'),
  TABLE(['Element', 'Content'], PL.platform, [1800, 7226]),
  H2('Campaign idea: « La semaine pro »'),
  P('**Lived detail.** « On se capte la semaine pro » ("shall we catch up next week?") is the sentence every group chat sends and never keeps. Everybody recognises it, so our audience can forward the campaign to their own group.'),
  P('**Hook:** « On se capte ~~la semaine pro~~ jeudi 19h30 ✓ » — "Let\'s catch up ~~next week~~ Thursday 7:30 pm".'),
  P('**Visual principle: the strike-out.** A vague promise is crossed out in orange and replaced by a confirmed slot in a blue pill, with the group count (5/5). It is used on every piece: poster, film, posts and the event board. The design keeps our identity: cream background, Overlap blue and orange, Monument Extended for titles, Syne for text, the mascot logo and the signature.'),
  P('**Language.** Ads are in French, because this is how our audience talks. Every French line is translated in this section.'),
  H2('Key messages'),
  TABLE(['Audience', 'Message (FR)', 'English'], PL.messages, [1800, 3800, 3426]));

add(H1('Channel mix'),
  TABLE(['Type', 'Channels', 'Role'], PL.channels, [1300, 4700, 3026]),
  P('**Ambassadors.** One volunteer per class relays our posts in class group chats and brings their friends to the stand. **Student union (BDE):** repost of the posts and the story (envisaged, not yet confirmed).'));

add(H1('Creations'),
  H2('Launch poster'),
  ...IMGP('Overlap_Poster_A2.jpg', 300, 'Launch poster (A2, also printed in A3)'),
  TABLE(['Element', 'Text (FR)', 'English'], [
    ['Hook', 'On se capte ~~la semaine pro~~ jeudi 19h30 ✓', 'Let\'s catch up ~~next week~~ Thursday 7:30 pm ✓'],
    ['Body', 'Overlap compare vos dispos et propose 2 à 3 créneaux où tout le groupe est libre. Chacun confirme en un tap.', 'Overlap compares your availability and suggests 2–3 slots when the whole group is free. Everyone confirms in one tap.'],
    ['Call to action', 'Pilote gratuit · 15 groupes · rien à télécharger. Inscris ton groupe au stand Overlap. Hall EFAP · mar. 1er & jeu. 3 déc. · 12h–14h', 'Free pilot · 15 groups · nothing to download. Sign up your group at the Overlap stand, EFAP hall, Tue 1 & Thu 3 Dec, 12–2 pm'],
  ], [1600, 3900, 3526]),
  P('**Placement:** 30 × A3 across campus (student lounge by the lifts and the coffee machine, cafeteria) and 2 × A2 at the stand, at eye level, where classmates wait together, phone in hand.'),
  ...IMGP('Overlap_Poster_in_situ.jpg', 520, 'The poster in the student lounge (mock-up)'),
  H2('Film « 47 messages » (28 seconds, vertical)'),
  P('Shot on a phone in three hours and posted as a Reel and on TikTok. Camille sends « On se capte la semaine pro ? », 47 messages follow without a date; she moves the group to Overlap; her friends answer in 30 seconds; the slot reaches 5/5 (« C\'est calé ✓ »); on Thursday at 19:30 they actually meet. All lines are subtitled.'),
  ...IMGP('strip_film1.jpg', 560, 'Shots 1–4: the problem'),
  ...IMGP('strip_film2.jpg', 560, 'Shots 5–8: the friends answer, the date is locked, they meet'),
  H2('Event « Le Mur des Semaines Pro »'),
  P('Two lunch breaks in the EFAP hall (Tue 1 and Thu 3 Dec, 12:00–14:00). Students stick their « plan that never happened » on the wall; groups of friends cross out their busy evenings on transparent week grids and stack them: the cell that stays clear is their slot. They leave with a « C\'est calé » card to post in their group chat, and organisers sign their group up for the free pilot.'),
  ...IMGP('Activation_Scene.jpg', 540, 'The event in the EFAP hall (mock-up)'),
  TABLE(['Item', 'Details'], [
    ['Team roles', D.roles.map(r => `${r.name}: ${r.activation}`).join('\n')],
    ['Material', 'A1 board, 2 × A2 posters, 50 transparent A5 grids, 12 markers, 300 « C\'est calé » cards, sticky notes, tablet, coffee.'],
    ['Partners (envisaged)', 'EFAP administration (space), student union (story relay).'],
    ['Expected result', '≈ 120 conversations · ≈ 60 post-its · ≈ 20 groups leave with a card · 25 organisers signed up.'],
  ], [2200, 6826]));

add(H1('Social media plan'),
  H2('Strategy'),
  P('**Platforms:** Instagram (feed, Reels, stories) is our home; TikTok brings reach. **Rhythm:** 8 posts in two weeks, plus live stories on the two stand days. **Account:** overlap.pilot (name to reserve).'),
  TABLE(['Content pillar', 'Purpose', 'Posts'], PL.pillars, [2000, 5000, 2026]),
  H2('Editorial calendar'),
  TABLE(['#', 'When', 'Post', 'Format', 'Goal', 'KPI'], PL.posts.map(p => [p.id, p.date, p.name, p.format, p.goal, p.kpi]), [500, 1400, 2200, 1900, 1500, 1526]),
  H2('The posts and their captions'));
const VIS = { P1: [['P1_Teaser.jpg', 260]], P2: [['strip_c1a.jpg', 480], ['strip_c1b.jpg', 480]], P3: [['P3_Reel_cover.jpg', 200]], P4: [['strip_c2.jpg', 560]], P5: [['strip_c3.jpg', 420]], P6: [['P6_Meme_5_reponses.jpg', 260]], P7: [['P7_Countdown_story.jpg', 200]], P8: [] };
PL.posts.forEach(p => {
  add(H3(`${p.id} · ${p.name} — ${p.date}`));
  VIS[p.id].forEach(([f, w], i) => add(IMGP(f, w, i === VIS[p.id].length - 1 ? `${p.id} · ${p.name}` : undefined)));
  add(P(`**Format:** ${p.format} · **Pillar:** ${p.pillar} · **KPI:** ${p.kpi}`),
    P(`**${p.id === 'P5' || p.id === 'P7' || p.id === 'P8' ? 'Content' : 'Caption'} (FR):** _${p.caption}_`),
    P(`**English:** ${p.en}`));
});

add(H1('Budget'),
  P('_' + D.budget_note + '_'),
  TABLE(['Item', 'Qty', 'Unit', 'Total', 'Owner'], [
    ...D.budget.map(b => [b.item, String(b.qty), eur(b.unit), eur(b.qty * b.unit), b.owner]),
    ['**Subtotal**', '', '', '**' + eur(sub) + '**', ''],
    ['Contingency (10%)', '', '', eur(cont), ''],
    ['**TOTAL**', '', '', '**' + eur(tot) + '**', ''],
  ], [4700, 700, 1100, 1200, 1326]),
  P(`By category: posters €54.00 · event €161.00 · pilot service €64.00 · social media €40.00 · film €25.00. Free: campus space (to request), team phones, CapCut, Canva, Google Forms.`));

add(H1('Indicators'),
  TABLE(['Level', 'Indicator', 'Target', 'Source'], PL.kpis, [1500, 4000, 1800, 1726]),
  P('A confirmed date (everyone chose the same slot) is an intention; a meeting that happened (« yes, we met » the next morning) is the result we judge the campaign on. Less chatting, more meeting.'));
