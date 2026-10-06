(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => v != null && n.setAttribute(k, v));
    kids.flat(Infinity).forEach(k => { if (k != null && k !== false) n.append(k); });
    return n;
  }
  const link = (href, label) => el('a', { href, target: '_blank', rel: 'noopener' }, label);
  const project = id => P.projects.find(p => p.id === id);
  const bs = P.degrees.find(d => d.id === 'bs'), ba = P.degrees.find(d => d.id === 'ba');
  const bu = project('buoyance'), pp = project('penpal'), dv = project('diver');

  /* =====================================================================
     The seven objects, earliest on the left. The drawings are only revealed by the light;
     the number, the name and the era under each one are always readable.
     ===================================================================== */
  const ART = {
    ug: `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="112" rx="40" ry="5" fill="#000" opacity=".5"/>
      <rect x="20" y="34" width="34" height="76" rx="4" fill="#5b8cff"/><rect x="26" y="42" width="22" height="4" rx="2" fill="#fff" opacity=".8"/><rect x="26" y="52" width="22" height="3" rx="1.5" fill="#fff" opacity=".5"/>
      <g transform="rotate(7 76 70)"><rect x="58" y="28" width="38" height="82" rx="4" fill="#4fd196"/><rect x="65" y="38" width="24" height="4" rx="2" fill="#fff" opacity=".8"/><rect x="65" y="48" width="24" height="3" rx="1.5" fill="#fff" opacity=".5"/></g></svg>`,
    diver: `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="112" rx="40" ry="5" fill="#000" opacity=".5"/>
      <path d="M16 62 C16 40 104 40 104 62" fill="none" stroke="#9fb0e8" stroke-width="7" stroke-linecap="round"/>
      <rect x="18" y="48" width="84" height="46" rx="16" fill="#d3dbff"/><circle cx="46" cy="71" r="14" fill="#0b1020"/><circle cx="74" cy="71" r="14" fill="#0b1020"/>
      <circle cx="46" cy="71" r="7" fill="#4aa8ff" opacity=".85"/><circle cx="74" cy="71" r="7" fill="#4aa8ff" opacity=".85"/><rect x="54" y="62" width="12" height="18" rx="3" fill="#aab6e8"/></svg>`,
    penpal: `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="112" rx="40" ry="5" fill="#000" opacity=".5"/>
      <polygon points="58,72 70,72 92,14 80,12" fill="#fff6dc"/><polygon points="58,72 70,72 64,86" fill="#ffc24d"/><rect x="82" y="10" width="14" height="8" rx="2" transform="rotate(12 89 14)" fill="#ff7a59"/>
      <rect x="26" y="80" width="68" height="24" rx="7" fill="#ffd08a"/><rect x="38" y="87" width="16" height="6" rx="2" fill="#ff7a59"/>
      <circle cx="42" cy="106" r="9" fill="#1b2030"/><circle cx="78" cy="106" r="9" fill="#1b2030"/><circle cx="42" cy="106" r="4" fill="#9aa3bd"/><circle cx="78" cy="106" r="4" fill="#9aa3bd"/></svg>`,
    axlab: `<img src="${ROOT}assets/img/axlab-logo-white.png" alt="" width="800" height="285">`,   // the lab's own logo (saved locally, so nothing is loaded from outside)
    mpcs: `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="112" rx="46" ry="5" fill="#000" opacity=".5"/>
      <rect x="24" y="34" width="72" height="50" rx="5" fill="#cfd6e8"/><rect x="29" y="39" width="62" height="40" rx="2" fill="#0d1428"/>
      <rect x="35" y="47" width="30" height="3" rx="1.5" fill="#6fe6b0"/><rect x="35" y="55" width="42" height="3" rx="1.5" fill="#8fb6ff"/><rect x="35" y="63" width="24" height="3" rx="1.5" fill="#ffc24d"/>
      <path d="M12 88 H108 L100 100 Q99 102 96 102 H24 Q21 102 20 100 Z" fill="#aab4cf"/></svg>`,
    buoyance: `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="113" rx="34" ry="4" fill="#000" opacity=".5"/>
      <ellipse cx="60" cy="40" rx="30" ry="34" fill="#12151f" stroke="#3a4260" stroke-width="2"/><ellipse cx="48" cy="26" rx="8" ry="12" fill="#fff" opacity=".35" transform="rotate(-24 48 26)"/>
      <path d="M54 72 L66 72 L60 80 Z" fill="#12151f" stroke="#3a4260" stroke-width="1.5"/><path d="M60 80 L60 98" stroke="#cdd3e6" stroke-width="2"/>
      <rect x="40" y="98" width="40" height="14" rx="5" fill="#ffd08a"/><circle cx="48" cy="112" r="6" fill="#1b2030"/><circle cx="72" cy="112" r="6" fill="#1b2030"/></svg>`,
    now: `<svg viewBox="0 0 120 120"><defs><radialGradient id="halo"><stop offset="0" stop-color="#fff2c8" stop-opacity=".9"/><stop offset="1" stop-color="#fff2c8" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="60" cy="113" rx="26" ry="4" fill="#000" opacity=".5"/><circle cx="60" cy="42" r="52" fill="url(#halo)"/>
      <ellipse cx="60" cy="42" rx="28" ry="32" fill="#fff7dc"/><ellipse cx="50" cy="28" rx="7" ry="11" fill="#fff" transform="rotate(-24 50 28)"/>
      <path d="M55 73 L65 73 L60 80 Z" fill="#fff0c2"/><path d="M60 80 L60 112" stroke="#e7d9b0" stroke-width="2"/></svg>`
  };
  const DY = [0, -16, 8, -10, 4, -22, 0];                 // a little depth, so they do not stand in a ruler line
  const SC = [1, .94, 1.02, .98, 1, 1.14, 1.02];
  const STOPS = [
    { id: 'ug',       short: 'Undergrad', era: 'Undergrad' },
    { id: 'diver',    short: dv.shortTitle, era: dv.era },
    { id: 'penpal',   short: pp.title,     era: pp.era },
    { id: 'axlab',    short: 'AxLab',      era: P.labEra },
    { id: 'mpcs',     short: 'MPCS',       era: 'Master’s begins' },
    { id: 'buoyance', short: bu.title,     era: bu.era },
    { id: 'now',      short: 'Now',        era: 'Second year' }
  ];
  STOPS.forEach((s, k) => { s.k = k; });
  const byId = Object.fromEntries(STOPS.map(s => [s.id, s]));
  const LAST = STOPS.length - 1;

  /* ---------- the room: who, hint, objects ---------- */
  $('who').append(
    el('figure', null, el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 })),
    el('div', null, el('h1', null, P.name), el('p', { class: 'standing' }, P.standing), el('p', { class: 'lab' }, `${P.lab}, ${P.school}`)));
  const touchy = matchMedia('(hover: none)').matches;
  $('hint').append(el('b', null, touchy ? 'Drag your finger to move the light. ' : 'Move the light. '), 'Each object it finds is a stop on my path, earliest on the left. ' + (touchy ? 'Tap' : 'Click') + ' one to open it. ', el('b', null, 'Lights on'), ' (top right) removes the dark.');

  const room = $('room'), lamp = $('lamp'), tip = $('tip'), objects = $('objects'), statusEl = $('status');
  STOPS.forEach(s => {
    const art = el('span', { class: 'art' + (s.id === 'axlab' ? ' logo-art' : ''), 'aria-hidden': 'true' }); art.innerHTML = ART[s.id];
    const btn = el('button', { type: 'button', class: 'obj', 'data-k': s.k, 'aria-label': `Stop ${s.k + 1} of ${STOPS.length}: ${s.short}. ${s.era}. Open it.` },
      art, el('span', { class: 'lab' }, el('span', { class: 'num', 'aria-hidden': 'true' }, String(s.k + 1)), el('span', { class: 'nm' }, s.short), el('span', { class: 'era' }, s.era === s.short ? '' : s.era)));
    btn.addEventListener('click', () => openView({ type: 'stop', k: s.k }, true));
    btn.addEventListener('focus', () => { stopAutopilot(); const c = centers[s.k]; if (c) { T.x = c.x; T.y = c.y; run(); } });
    objects.append(el('li', { style: `--dy:${DY[s.k]}px; --sc:${SC[s.k]}` }, btn));
    s.btn = btn; s.art = art;
  });

  /* =====================================================================
     The light: a glowing balloon that follows the pointer with a little spring.
     It only changes how much of the scene you can see, never the labels or the screen.
     ===================================================================== */
  const L = { x: 0, y: 0 }, T = { x: 0, y: 0 };
  let centers = [], R = 220, running = false, autopilotOn = !reduceMotion, autopilotToken = 0;

  function measure() {
    const rr = room.getBoundingClientRect();
    R = clamp(innerWidth * 0.2, 150, 260);
    room.style.setProperty('--r', R + 'px');
    centers = STOPS.map(s => { const r = s.art.getBoundingClientRect(); return { x: r.left - rr.left + r.width / 2, y: r.top - rr.top + r.height / 2, size: Math.max(r.width, r.height) / 2 }; });
  }
  function apply() {
    room.style.setProperty('--lx', L.x.toFixed(1) + 'px'); room.style.setProperty('--ly', L.y.toFixed(1) + 'px');
    lamp.style.transform = `translate(${L.x.toFixed(1)}px, ${L.y.toFixed(1)}px)`;
    tip.style.transform = `translate(${T.x.toFixed(1)}px, ${T.y.toFixed(1)}px)`;
    STOPS.forEach((s, i) => {
      const c = centers[i]; if (!c) return;
      const d = Math.hypot(L.x - c.x, L.y - c.y);
      const lit = clamp(1 - (d - c.size * 0.4) / (R * 0.85), 0, 1);
      s.btn.style.setProperty('--lit', lit.toFixed(2));
      s.btn.classList.toggle('on', lit > 0.55);
    });
  }
  function run() { if (!running) { running = true; requestAnimationFrame(frame); } }
  function frame() {
    const k = reduceMotion ? 1 : 0.17;
    L.x += (T.x - L.x) * k; L.y += (T.y - L.y) * k;
    apply();
    if (Math.hypot(T.x - L.x, T.y - L.y) > 0.4) requestAnimationFrame(frame); else { L.x = T.x; L.y = T.y; apply(); running = false; }
  }
  function aim(clientX, clientY) {
    const rr = room.getBoundingClientRect();
    T.x = clamp(clientX - rr.left, 0, rr.width); T.y = clamp(clientY - rr.top, 0, rr.height);
    run();
  }
  const stopAutopilot = () => { autopilotOn = false; autopilotToken++; };
  room.addEventListener('pointermove', e => { stopAutopilot(); aim(e.clientX, e.clientY); });
  room.addEventListener('pointerdown', e => { stopAutopilot(); aim(e.clientX, e.clientY); });

  // before you touch anything, the light drifts along the objects once, so you can see what it does
  async function autopilot() {
    const token = ++autopilotToken; autopilotOn = true;
    await wait(700);
    for (let i = 0; i < STOPS.length; i++) {
      if (token !== autopilotToken) return;
      const c = centers[i]; if (!c) continue;
      T.x = c.x; T.y = c.y - c.size * 0.3; run(); await wait(950);
    }
    if (token !== autopilotToken) return;
    const rr = room.getBoundingClientRect(); T.x = rr.width * 0.5; T.y = rr.height * 0.58; run(); autopilotOn = false;
  }

  /* =====================================================================
     The screen: what the light found, written out
     ===================================================================== */
  function photoBlocks(images) {     // first photo spans the width; the rest pack into two columns by aspect ratio
    const fig = img => el('figure', null, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    const [lead, ...rest] = images;
    const cols = [[], []], heights = [0, 0];
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), rest.length > 0 && el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig)))));
  }
  function body(view) {
    if (view.type === 'about') return { kicker: 'About', title: P.name, kids: [el('p', { class: 'lead' }, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))] };
    if (view.type === 'contact') return { kicker: 'Get in touch', title: 'Contact', kids: [el('dl', { class: 'facts' }, el('dt', null, 'Email'), el('dd', null, link('mailto:' + P.contact.email, P.contact.email)),
      el('dt', null, 'LinkedIn'), el('dd', null, link(P.contact.linkedin, 'Alan Pham')), el('dt', null, 'Before'), el('dd', null, link(P.contact.previousSite, 'Previous portfolio')))] };
    if (view.type === 'overview') return { kicker: 'On the screen', title: 'Seven stops in the dark', kids: [el('p', { class: 'lead' }, P.about[2]), el('p', null, 'Light up an object in the room above, or use the numbers here, to read about each stop in the order it happened.')] };
    const s = STOPS[view.k], id = s.id;
    if (id === 'ug') return { kicker: 'Undergrad', title: 'Two degrees, in parallel', kids: [el('p', { class: 'lead' }, `${bs.title} (${bs.note}) and ${ba.title}.`), el('p', { class: 'story' }, 'I double majored in Computer Science and Economics.')] };
    if (id === 'mpcs') return { kicker: 'Master’s begins', title: 'Pre-Doctoral MPCS', kids: [el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0])] };
    if (id === 'axlab') return { kicker: P.labEra, title: P.lab, kids: [el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])] };
    if (id === 'now') return { kicker: 'We are here', title: P.standing, kids: [el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])] };
    const p = project(id);
    return { kicker: p.era || p.kicker, title: p.title, kids: [el('p', { class: 'lead' }, p.summary), p.story && el('p', { class: 'story' }, p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      p.tags && p.tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, p.tags.map(t => el('li', null, t))),
      p.images.length > 0 && photoBlocks(p.images)] };
  }

  let view = { type: 'overview' };
  const paper = $('paper'), screenEl = $('screen');
  function render() {
    const isStop = view.type === 'stop', k = isStop ? view.k : null;
    const b = body(view);
    const steps = el('div', { class: 'steps', role: 'group', 'aria-label': 'Stops' });
    STOPS.forEach(s => {
      const bt = el('button', { type: 'button', 'aria-label': `Stop ${s.k + 1}: ${s.short}` }, String(s.k + 1));
      if (k === s.k) bt.setAttribute('aria-current', 'true');
      bt.addEventListener('click', () => openView({ type: 'stop', k: s.k }, false));
      steps.append(bt);
    });
    const where = isStop ? el('p', { class: 'where' }, el('b', null, `Stop ${k + 1} of ${STOPS.length}`), ` · ${STOPS[k].era}`) : el('p', { class: 'where' }, view.type === 'overview' ? 'Overview' : view.type === 'about' ? 'About' : 'Contact');
    const prev = isStop && k > 0 ? el('button', { type: 'button' }, `← ${STOPS[k - 1].short}`) : null;
    const next = isStop && k < LAST ? el('button', { type: 'button' }, `${STOPS[k + 1].short} →`) : null;
    if (prev) prev.addEventListener('click', () => openView({ type: 'stop', k: k - 1 }, false));
    if (next) next.addEventListener('click', () => openView({ type: 'stop', k: k + 1 }, false));
    paper.replaceChildren(
      el('div', { class: 'top-row' }, where, steps),
      el('p', { class: 'kicker' }, b.kicker), el('h2', { id: 'screen-title' }, b.title), ...b.kids.filter(Boolean),
      el('div', { class: 'foot' }, el('div', null, prev, ' ', next), el('a', { href: '#room' }, '↑ Back to the room')));
    STOPS.forEach(s => { if (k === s.k) s.btn.setAttribute('aria-current', 'true'); else s.btn.removeAttribute('aria-current'); });
    document.querySelectorAll('[data-view]').forEach(bn => bn.setAttribute('aria-pressed', String(view.type === bn.dataset.view)));
  }
  function openView(v, scroll) {
    view = v; render();
    const h = v.type === 'stop' ? STOPS[v.k].id : v.type === 'overview' ? '' : v.type;
    history.replaceState(null, '', h ? '#' + h : location.pathname + location.search);
    statusEl.textContent = v.type === 'stop' ? `Stop ${v.k + 1} of ${STOPS.length}: ${STOPS[v.k].short}. ${STOPS[v.k].era}.` : `${v.type} on the screen.`;
    if (scroll) screenEl.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('[data-view]').forEach(bn => bn.addEventListener('click', () => {
    openView(view.type === bn.dataset.view ? { type: 'overview' } : { type: bn.dataset.view }, true);
  }));

  /* ---------- lights on ---------- */
  const lights = $('lights');
  function setLights(on) { document.body.dataset.lights = on ? 'on' : 'off'; lights.setAttribute('aria-pressed', String(on)); lights.textContent = on ? 'Lights off' : 'Lights on'; }
  lights.addEventListener('click', () => { setLights(document.body.dataset.lights !== 'on'); statusEl.textContent = `Lights ${document.body.dataset.lights}.`; });
  setLights(matchMedia('(prefers-contrast: more)').matches);     // people who ask for more contrast start with the lights on

  /* ---------- go ---------- */
  measure();
  L.x = T.x = room.clientWidth * 0.5; L.y = T.y = room.clientHeight * 0.58; apply();
  addEventListener('resize', () => { measure(); apply(); });
  addEventListener('load', () => { measure(); apply(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); apply(); });

  const start = location.hash.slice(1);
  if (byId[start]) { view = { type: 'stop', k: byId[start].k }; autopilotOn = false; }
  else if (start === 'about' || start === 'contact') { view = { type: start }; autopilotOn = false; }
  render();
  if (autopilotOn) autopilot();
})();
