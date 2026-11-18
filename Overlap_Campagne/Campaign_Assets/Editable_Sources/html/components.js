// Overlap — reusable illustrative screens (390 x 844 CSS px), styled after the Canva app screens.
// These are illustrative prototype screens, not a live app.
const AV = { C: 'a1', L: 'a2', S: 'a3', Y: 'a4', N: 'a5' };
const avs = (list, size = 38) => list.map(k => `<span class="av ${AV[k] || 'a5'}" style="width:${size}px;height:${size}px;margin-right:-10px;font-size:${size * .4}px">${k}</span>`).join('');
const status = (t = '9:41') => `<div class="status"><span>${t}</span><span style="letter-spacing:2px">▮▮▮</span></div><div class="notch"></div>`;

function phone(inner, scale = 1, extra = '') {
  return `<div class="phone" style="width:${418 * scale}px;height:${872 * scale}px;padding:${14 * scale}px;border-radius:${56 * scale}px;${extra}">
    <div style="width:390px;height:844px;transform:scale(${scale});transform-origin:0 0;border-radius:44px;overflow:hidden">
      <div class="screen">${inner}</div></div></div>`;
}

const chatHeader = (n) => `${status()}<div class="chathead" style="margin-top:14px"><span class="av a3" style="width:42px;height:42px">LI</span>
  <div><div style="font:700 17px var(--ui)">Les Inséparables</div><div style="font:500 13px var(--ui);color:#6E6A64">Camille, Léo, Nora, Sarah, Yanis</div></div>
  ${n ? `<span class="badge" style="margin-left:auto">${n}</span>` : ''}</div>`;

const bubble = (who, cls, txt, me = false) => me
  ? `<div class="msg me">${txt}</div>`
  : `<div class="msg"><span class="who ${cls}">${who}</span>${txt}</div>`;

function screenChat(msgs, n) {
  return chatHeader(n) + `<div class="chat">${msgs.join('')}</div>`;
}

function screenGroup() {
  return `${status()}<div style="padding:26px 22px">
   <div style="font:800 15px var(--ui);color:#6E6A64">Nouveau plan</div>
   <div style="font:800 34px/1.1 var(--ui);margin:6px 0 20px">Avec qui ?</div>
   ${[['Les Inséparables', 'C L N S Y', true], ['Coloc rue Oberkampf', 'C N', false], ['Lyon forever', 'C S Y', false]].map(([g, m, on]) => `
   <div class="card" style="display:flex;align-items:center;gap:12px;margin-bottom:12px;${on ? 'outline:3px solid #1143F7' : ''}">
     <div style="display:flex;flex:none;padding-right:12px">${avs(m.split(' '), 34)}</div><div style="margin-left:14px"><div style="font:700 17px var(--ui)">${g}</div><div style="font:500 13px var(--ui);color:#6E6A64">${m.split(' ').length} personnes</div></div>
     <div style="margin-left:auto;width:26px;height:26px;border-radius:50%;${on ? 'background:#1143F7' : 'border:2px solid #ccc'}"></div></div>`).join('')}
   <div style="font:800 15px var(--ui);color:#6E6A64;margin:22px 0 10px">Quand ?</div>
   <div style="display:flex;gap:8px;flex-wrap:wrap">${['Cette semaine', 'Avant les vacances', 'Le soir', 'Le week-end'].map((t, i) => `<span style="font:700 14px var(--ui);padding:9px 14px;border-radius:999px;${i === 1 || i === 2 ? 'background:#000;color:#fff' : 'background:#fff'}">${t}</span>`).join('')}</div>
   <div class="btn blue" style="margin-top:34px">Trouver un créneau commun</div>
   <div style="text-align:center;font:500 13px var(--ui);color:#6E6A64;margin-top:12px">Overlap ne lit que libre / occupé. Jamais le contenu de ton agenda.</div></div>`;
}

function screenInvite() {
  return `${status()}<div style="padding:40px 24px;text-align:center">
   <div style="display:flex;justify-content:center;margin:20px 0 26px">${avs(['C'], 86)}</div>
   <div style="font:800 30px/1.15 var(--ui)">Camille veut caler une date avec Les Inséparables</div>
   <div style="font:500 17px/1.4 var(--ui);color:#444;margin:16px 0 26px">Donne tes soirs libres d'ici le 18 déc. Overlap trouve les créneaux où <b>tout le monde</b> est libre.</div>
   <div class="card" style="text-align:left">${['Mar. 8', 'Mer. 9', 'Jeu. 10', 'Sam. 12'].map((d, i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;${i ? 'border-top:1px solid #eee' : ''}"><span style="font:700 16px var(--ui)">${d} déc.</span><span style="font:700 14px var(--ui);padding:6px 12px;border-radius:999px;${i === 1 ? 'background:#eee;color:#888' : 'background:#1143F7;color:#fff'}">${i === 1 ? 'Occupé·e' : 'Libre'}</span></div>`).join('')}</div>
   <div class="btn black" style="margin-top:22px">Envoyer mes dispos · 30 s</div>
   <div style="font:500 13px var(--ui);color:#6E6A64;margin-top:12px">Rien à installer pendant le pilote</div></div>`;
}

function slotRow(day, time, votes, total, on) {
  return `<div class="card" style="margin-bottom:12px;${on ? 'background:#1143F7;color:#fff' : ''}">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div style="font:800 21px var(--ui)">${day}</div><div style="font:600 15px var(--ui);opacity:.75">${time}</div></div>
      <div style="font:800 18px var(--ui);padding:7px 13px;border-radius:999px;${on ? 'background:#fff;color:#1143F7' : 'background:#F3ECE1'}">${votes}/${total}</div></div></div>`;
}

function screenSlots(votes = [1, 5, 2], lockIdx = -1) {
  const S = [['Mar. 8 déc.', '20h00'], ['Jeu. 10 déc.', '19h30'], ['Sam. 12 déc.', '12h00']];
  return `${status()}<div style="padding:26px 22px">
   <div style="font:800 15px var(--ui);color:#6E6A64">Les Inséparables · 5 personnes</div>
   <div style="font:800 31px/1.12 var(--ui);margin:6px 0 6px">3 créneaux où vous êtes <span style="color:#1143F7">tous</span> libres</div>
   <div style="font:500 15px var(--ui);color:#6E6A64;margin-bottom:18px">Tape le tien. La date se cale quand tout le monde a choisi.</div>
   ${S.map((s, i) => slotRow(s[0], s[1], votes[i], 5, i === lockIdx)).join('')}
   ${lockIdx >= 0 ? `<div style="margin-top:16px;background:#000;color:#fff;border-radius:24px;padding:18px 20px">
     <div style="font:800 24px var(--ui)">C'est calé ✓</div>
     <div style="font:600 16px var(--ui);opacity:.85;margin-top:4px">Jeudi 10 déc. · 19h30 · 5/5</div></div>` :
      `<div class="btn black" style="margin-top:16px">Je choisis jeudi 19h30</div>`}</div>`;
}

function screenPlace() {
  return `${status()}<div style="padding:26px 22px">
   <div style="font:800 15px var(--ui);color:#6E6A64">Jeudi 10 déc. · 19h30</div>
   <div style="font:800 31px/1.12 var(--ui);margin:6px 0 16px">Un lieu pratique pour tout le monde</div>
   <div style="height:250px;border-radius:24px;background:#E9EEF9;position:relative;overflow:hidden">
     <svg width="346" height="250" style="position:absolute;inset:0"><path d="M0 70 L346 40 M0 170 L346 210 M90 0 L120 250 M250 0 L220 250" stroke="#fff" stroke-width="14"/>
     ${[[40, 40, '#FE512D'], [300, 60, '#1143F7'], [60, 210, '#FBB736'], [290, 200, '#6168F4'], [180, 30, '#000']].map(([x, y, c]) => `<line x1="${x}" y1="${y}" x2="172" y2="128" stroke="${c}" stroke-width="3" stroke-dasharray="6 6"/><circle cx="${x}" cy="${y}" r="13" fill="${c}" stroke="#fff" stroke-width="4"/>`).join('')}
     <circle cx="172" cy="128" r="24" fill="#000"/><circle cx="172" cy="128" r="9" fill="#fff"/></svg></div>
   <div class="card" style="margin-top:14px"><div style="font:800 19px var(--ui)">Bar à mi-chemin · 11e arr.</div>
     <div style="font:600 14px var(--ui);color:#6E6A64;margin-top:4px">12 à 18 min pour chacun·e en métro</div></div>
   <div class="card" style="margin-top:12px;display:flex;align-items:center;gap:12px"><span style="width:38px;height:38px;border-radius:50%;background:#FBB736;display:flex;align-items:center;justify-content:center;font:800 18px var(--ui)">!</span>
     <div><div style="font:700 16px var(--ui)">Rappel la veille et 2 h avant</div><div style="font:500 13px var(--ui);color:#6E6A64">Pour tout le groupe</div></div></div></div>`;
}

function show() {
  const id = (location.hash || '#s1').slice(1);
  document.querySelectorAll('.s').forEach(el => el.style.display = el.id === id ? 'block' : 'none');
}
window.addEventListener('hashchange', show);

// Flat "blob" characters in the spirit of the Overlap mascot (vector, crisp at any size).
// mood: 'happy' (^ ^), 'flat' (– –), 'look' (• •)
function person({ x = 0, y = 0, s = 1, body = '#1143F7', head = '#F6D9C4', mood = 'happy', phone = false, hair = '#000', label = '' }) {
  const eyes = mood === 'happy'
    ? `<path d="M-30 -8 q10 -14 20 0 M10 -8 q10 -14 20 0" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round"/>`
    : mood === 'flat'
      ? `<path d="M-30 -4 h20 M10 -4 h20" stroke="#000" stroke-width="6" stroke-linecap="round"/><path d="M-10 26 h20" stroke="#000" stroke-width="5" stroke-linecap="round"/>`
      : `<circle cx="-20" cy="-4" r="6"/><circle cx="20" cy="-4" r="6"/>`;
  const mouth = mood === 'happy' ? `<path d="M-14 20 q14 14 28 0" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>` : '';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-100 260 C-110 120 -70 70 0 70 C70 70 110 120 100 260 Z" fill="${body}"/>
    <g transform="translate(0 0)"><circle r="72" fill="${head}"/>
      <path d="M-72 -10 C-70 -70 70 -80 72 -14 C40 -50 -30 -52 -72 -10Z" fill="${hair}"/>${eyes}${mouth}</g>
    ${phone ? `<g transform="translate(30 150) rotate(-12)"><rect x="-26" y="-48" width="52" height="96" rx="10" fill="#111"/><rect x="-21" y="-42" width="42" height="84" rx="7" fill="#DCE2FF"/></g>
               <path d="M60 220 C70 190 60 170 40 165" stroke="${head}" stroke-width="26" fill="none" stroke-linecap="round"/>` : ''}
    ${label ? `<text y="300" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="#000">${label}</text>` : ''}
  </g>`;
}
