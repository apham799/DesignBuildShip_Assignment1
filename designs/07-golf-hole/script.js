(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const $ = id => document.getElementById(id);
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
     The round: nine holes, in the order things happened. x, y are on the 1000 x 620 course drawing.
     ===================================================================== */
  const HOLES = [
    { n: 1, id: 'bs',       short: 'B.S. CS',        x: 118, y: 500, era: bs.era,        color: '#3d7bd8' },
    { n: 2, id: 'ba',       short: 'B.A. Econ',      x: 118, y: 580, era: ba.era,        color: '#e24a3b' },
    { n: 3, id: 'diver',    short: dv.shortTitle,    x: 300, y: 468, era: dv.era },
    { n: 4, id: 'penpal',   short: pp.title,         x: 420, y: 408, era: pp.era },
    { n: 5, id: 'axlab',    short: 'AxLab',          x: 535, y: 350, era: P.labEra },
    { n: 6, id: 'mpcs',     short: 'MPCS',           x: 648, y: 286, era: 'Master’s begins' },
    { n: 7, id: 'buoyance', short: bu.title,         x: 742, y: 218, era: bu.era },
    { n: 8, id: 'now',      short: 'Now',            x: 850, y: 138, era: 'Second year', cup: true },
    { n: 9, id: 'contact',  short: 'Clubhouse',      x: 905, y: 528, era: 'Contact' }
  ];
  const byId = Object.fromEntries(HOLES.map(h => [h.id, h]));
  const START = { x: 80, y: 540 };             // the ball starts teed up, just behind the line between the two tee markers

  /* ---------- the course drawing ---------- */
  const art = $('art');
  const FAIRWAY = 'M110 500 C200 440 300 380 410 335 C520 290 600 250 680 190 C720 160 750 135 775 120 L800 210 C760 245 700 300 620 360 C520 430 400 480 300 520 C230 545 180 575 140 595 Z';
  const CENTER = [[140, 545], [300, 470], [420, 408], [535, 350], [648, 286], [742, 218], [800, 170]];
  const distToSeg = (px, py, [ax, ay], [bx, by]) => { const dx = bx - ax, dy = by - ay; const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1); return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)); };
  const nearFairway = (x, y) => CENTER.slice(1).some((p, i) => distToSeg(x, y, CENTER[i], p) < 92);

  let rng = 7; const rand = () => { rng = (rng * 16807) % 2147483647; return rng / 2147483647; };   // a fixed seed, so the trees never move
  const trees = [];
  for (let i = 0; i < 400 && trees.length < 62; i++) {
    const x = rand() * 1000, y = rand() * 620, r = 14 + rand() * 12;
    if (nearFairway(x, y)) continue;
    if (Math.hypot(x - 850, y - 138) < 120) continue;                         // keep the green clear
    if (Math.hypot((x - 690) / 150, (y - 505) / 85) < 1) continue;           // and the pond
    if (x > 840 && x < 970 && y > 450 && y < 570) continue;                  // and the clubhouse
    if (x < 150 && y > 450) continue;                                        // and the tees
    if (trees.some(t => Math.hypot(t.x - x, t.y - y) < (t.r + r) * 0.9)) continue;
    trees.push({ x, y, r });
  }

  art.innerHTML = `
    <defs>
      <pattern id="rough" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><rect width="14" height="28" fill="#2c6a3d"/><rect x="14" width="14" height="28" fill="#2a6639"/></pattern>
      <pattern id="mow" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><rect width="32" height="64" fill="#7cba68"/><rect x="32" width="32" height="64" fill="#6cac5a"/></pattern>
      <pattern id="mowGreen" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="11" height="22" fill="#a6da86"/><rect x="11" width="11" height="22" fill="#98d078"/></pattern>
      <radialGradient id="pond" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#8fcbe6"/><stop offset="1" stop-color="#5aa4c8"/></radialGradient>
      <radialGradient id="treeShade" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#3f8a4f"/><stop offset="1" stop-color="#1d4d2b"/></radialGradient>
      <radialGradient id="ballShade" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cfd5d0"/></radialGradient>
    </defs>
    <rect width="1000" height="620" fill="url(#rough)"/>
    <path d="M880 205 C905 300 915 400 905 478" fill="none" stroke="#d8d0b6" stroke-width="12" stroke-linecap="round"/>
    <ellipse cx="690" cy="505" rx="132" ry="66" fill="#4f9bbf"/>
    <ellipse cx="690" cy="505" rx="120" ry="56" fill="url(#pond)"/>
    <path d="M630 495 q30 -8 62 0 M680 520 q34 -8 70 0" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
    <path d="${FAIRWAY}" fill="url(#mow)" stroke="#8cc77a" stroke-width="5" stroke-linejoin="round"/>
    <path d="M470 450 q20 -28 62 -14 q34 12 14 38 q-30 24 -66 4 q-24 -12 -10 -28 z" fill="#ecdca8" stroke="#d3c088" stroke-width="3"/>
    <path d="M722 62 q22 -18 50 -4 q20 16 -4 32 q-28 8 -46 -8 q-6 -10 0 -20 z" fill="#ecdca8" stroke="#d3c088" stroke-width="3"/>
    <path d="M920 182 q24 -16 52 0 q18 18 -6 34 q-30 10 -50 -8 q-6 -12 4 -26 z" fill="#ecdca8" stroke="#d3c088" stroke-width="3"/>
    <circle cx="850" cy="138" r="94" fill="#8dc874"/>
    <circle cx="850" cy="138" r="82" fill="url(#mowGreen)"/>
    <rect x="38" y="466" width="118" height="136" rx="12" fill="url(#mowGreen)" stroke="#8cc77a" stroke-width="4"/>
    <line x1="118" y1="500" x2="118" y2="580" stroke="#fff" stroke-width="2.4" stroke-dasharray="6 6" stroke-linecap="round" opacity=".85"/>
    <ellipse cx="118" cy="506" rx="17" ry="8" fill="rgba(0,0,0,.25)"/><ellipse cx="118" cy="586" rx="17" ry="8" fill="rgba(0,0,0,.25)"/>
    <g transform="translate(80 540)"><line x1="0" y1="2" x2="0" y2="9" stroke="#e8d9a8" stroke-width="3" stroke-linecap="round"/><ellipse cx="0" cy="9" rx="5" ry="2" fill="rgba(0,0,0,.25)"/></g>
    <g>${trees.map(t => `<circle cx="${(t.x + 3).toFixed(0)}" cy="${(t.y + 5).toFixed(0)}" r="${t.r.toFixed(0)}" fill="rgba(0,0,0,.22)"/><circle cx="${t.x.toFixed(0)}" cy="${t.y.toFixed(0)}" r="${t.r.toFixed(0)}" fill="url(#treeShade)"/>`).join('')}</g>
    <g transform="translate(870 484)">
      <rect x="0" y="22" width="76" height="46" fill="#efe6cf" stroke="#b9ad8a" stroke-width="2"/>
      <path d="M-8 24 L38 -6 L84 24 Z" fill="#7a3b2a"/>
      <rect x="31" y="42" width="14" height="26" fill="#6b4a2f"/><rect x="8" y="34" width="14" height="12" fill="#9bc6dd"/><rect x="54" y="34" width="14" height="12" fill="#9bc6dd"/>
    </g>
    <ellipse cx="850" cy="138" rx="9" ry="5" fill="#1b2a1f"/>
    <g id="pin"><line x1="850" y1="140" x2="850" y2="78" stroke="#f4f1e6" stroke-width="3" stroke-linecap="round"/><path class="flag-cloth" d="M851 80 L893 91 L851 103 Z" fill="#d6382b"/></g>
    <path id="tracer" fill="none" stroke="#fff" stroke-width="3.2" stroke-dasharray="1 8" stroke-linecap="round" opacity="0"/>
    <g id="ball"><ellipse id="ball-shadow" rx="7" ry="3.4" fill="rgba(0,0,0,.4)"/><circle id="ball-dot" r="7.5" fill="url(#ballShade)" stroke="#aeb6b0" stroke-width=".8"/></g>`;
  const ballG = art.querySelector('#ball'), ballDot = art.querySelector('#ball-dot'), ballShadow = art.querySelector('#ball-shadow'), tracer = art.querySelector('#tracer');

  /* =====================================================================
     The ball: a shot flies in an arc (a tracer follows it), bounces twice and settles.
     ===================================================================== */
  const ball = { x: START.x, y: START.y, h: 0, hidden: false, scale: 1 };
  let shot = null, tracerPts = [], tracerFade = 0;

  function draw() {
    ballDot.setAttribute('cx', ball.x.toFixed(1)); ballDot.setAttribute('cy', (ball.y - ball.h).toFixed(1));
    ballDot.setAttribute('r', ((7.5 + ball.h * 0.045) * ball.scale).toFixed(2));
    ballShadow.setAttribute('cx', (ball.x + ball.h * 0.18).toFixed(1)); ballShadow.setAttribute('cy', (ball.y + 3).toFixed(1));
    ballShadow.setAttribute('rx', (7 + ball.h * 0.02).toFixed(2)); ballShadow.style.opacity = String(clamp(0.9 - ball.h / 220, 0.25, 0.9));
    ballG.style.opacity = ball.hidden ? '0' : '1';
  }
  draw();

  let last = performance.now(), running = false;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (shot) stepShot(dt);
    if (!shot && tracerFade > 0) { tracerFade = Math.max(0, tracerFade - dt * 0.7); tracer.setAttribute('opacity', String(tracerFade)); }
    draw();
    if (shot || tracerFade > 0) requestAnimationFrame(loop); else running = false;
  }
  function wake() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } }

  function stepShot(dt) {
    const s = shot;
    s.t += dt;
    if (s.phase === 'fly') {
      const u = clamp(s.t / s.dur, 0, 1);
      ball.x = s.sx + (s.lx - s.sx) * u; ball.y = s.sy + (s.ly - s.sy) * u;
      ball.h = 4 * s.arc * u * (1 - u);
      tracerPts.push([ball.x, ball.y - ball.h]);
      tracer.setAttribute('d', 'M' + tracerPts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'));
      if (u >= 1) { s.phase = s.cup ? 'sink' : 'bounce1'; s.t = 0; }
    } else if (s.phase === 'bounce1' || s.phase === 'bounce2') {
      const first = s.phase === 'bounce1', dur = first ? 0.3 : 0.2, hop = first ? 20 : 8;
      const u = clamp(s.t / dur, 0, 1);
      ball.h = 4 * hop * u * (1 - u);
      const along = first ? s.dist * 0.05 * u : s.dist * 0.05 + s.dist * 0.02 * u;
      ball.x = s.lx + s.dx * along; ball.y = s.ly + s.dy * along;
      if (u >= 1) { if (first) { s.phase = 'bounce2'; s.t = 0; } else { ball.h = 0; s.phase = 'rest'; } }
    } else if (s.phase === 'sink') {
      const u = clamp(s.t / 0.45, 0, 1);
      ball.h = 0; ball.hidden = u > 0.55;
      ball.x = s.tx; ball.y = s.ty;
      ball.scale = 1 - u * 0.6;
      if (u >= 1) s.phase = 'rest';
    }
    if (s.phase === 'rest') { const done = shot.resolve; shot = null; tracerFade = 0.9; done(true); }
  }

  // hit a shot to a hole; resolves when the ball has come to rest
  function hit(hole) {
    return new Promise(resolve => {
      if (shot) shot.resolve(false);
      ball.hidden = false; ball.scale = 1;
      const sx = ball.x, sy = ball.y, tx = hole.x, ty = hole.y, dist = Math.hypot(tx - sx, ty - sy);
      if (reduceMotion || dist < 2) {
        ball.x = tx; ball.y = ty; ball.h = 0; ball.hidden = !!hole.cup; shot = null; tracer.setAttribute('opacity', '0'); tracerFade = 0; draw(); resolve(true); return;
      }
      const dx = (tx - sx) / dist, dy = (ty - sy) / dist;
      tracerPts = [[sx, sy]]; tracer.setAttribute('opacity', '0.95'); tracerFade = 0;
      const short = hole.cup ? 0 : dist * 0.07, lx = tx - dx * short, ly = ty - dy * short;
      shot = { phase: 'fly', t: 0, sx, sy, tx, ty, lx, ly, dx, dy, dist, dur: clamp(0.8 + dist / 650, 0.9, 1.9), arc: clamp(dist * 0.3, 36, 150), cup: !!hole.cup, resolve };
      wake();
    });
  }

  /* =====================================================================
     The yardage book: player card + the page for the selected hole
     ===================================================================== */
  $('player').append(
    el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 }),
    el('div', null,
      el('h1', null, P.name),
      el('dl', null,
        el('dt', null, 'Player'), el('dd', null, P.standing),
        el('dt', null, 'Club'), el('dd', null, P.lab),
        el('dt', null, 'Marker'), el('dd', null, P.advisor),
        el('dt', null, 'Tees'), el('dd', null, `${bs.short} / ${ba.short}`),
        el('dt', null, 'Course'), el('dd', null, P.school))));

  const page = $('page');
  const chips = tags => tags && tags.length ? el('ul', { class: 'chips', 'aria-label': 'Topics' }, tags.map(t => el('li', null, t))) : null;
  function photoBlocks(images) {     // first photo spans the width; the rest pack into two columns by aspect ratio
    const fig = img => el('figure', null, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    const [lead, ...rest] = images;
    const cols = [[], []], heights = [0, 0];
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), rest.length > 0 && el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig)))));
  }

  function content(id) {
    const h = byId[id], tag = h ? `Hole ${h.n} · ` : '';
    if (id === 'bs' || id === 'ba') { const d = id === 'bs' ? bs : ba;
      return [el('p', { class: 'kicker' }, tag + 'Tee off'), el('h2', null, d.title), d.note && el('p', { class: 'lead' }, d.note), el('p', { class: 'story' }, 'I double majored in Computer Science and Economics.')]; }
    if (id === 'mpcs') return [el('p', { class: 'kicker' }, tag + 'Master’s begins'), el('h2', null, 'Pre-Doctoral MPCS'), el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0])];
    if (id === 'axlab') return [el('p', { class: 'kicker' }, tag + P.labEra), el('h2', null, P.lab), el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])];
    if (id === 'now') return [el('p', { class: 'kicker' }, tag + 'In the cup'), el('h2', null, P.standing), el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])];
    if (id === 'contact') return [el('p', { class: 'kicker' }, tag + 'The clubhouse'), el('h2', null, 'Contact'),
      el('dl', { class: 'facts' }, el('dt', null, 'Email'), el('dd', null, link('mailto:' + P.contact.email, P.contact.email)),
        el('dt', null, 'LinkedIn'), el('dd', null, link(P.contact.linkedin, 'Alan Pham')), el('dt', null, 'Before'), el('dd', null, link(P.contact.previousSite, 'Previous portfolio')))];
    if (id === 'about') return [el('p', { class: 'kicker' }, 'The player'), el('h2', null, P.name), el('p', { class: 'lead' }, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))];
    const p = project(id);
    if (p) return [el('p', { class: 'kicker' }, tag + (p.era || p.kicker)), el('h2', null, p.title), el('p', { class: 'lead' }, p.summary), p.story && el('p', { class: 'story' }, p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      chips(p.tags), p.images.length > 0 && photoBlocks(p.images)];
    return [el('p', { class: 'kicker' }, 'The round'), el('h2', null, 'Nine holes, one fairway'), el('p', { class: 'lead' }, P.about[2]),
      el('p', { class: 'hint' }, 'Each hole is a stop on my path, in the order it happened, from the tees to the flag. Pick one on the scorecard, or click a marker on the course, to hit a shot there.')];
  }

  function renderPage(id) {
    const h = byId[id], next = h && HOLES[h.n];          // HOLES[h.n] is the following hole
    page.style.setProperty('--c', h && h.color ? h.color : '#2c6a3d');
    page.replaceChildren(...content(id).filter(Boolean),
      ...(next ? [el('ul', { class: 'nextshot', 'aria-label': 'Next hole' }, el('li', { class: 'lbl' }, 'Next hole'), el('li', null, el('button', { type: 'button', 'data-next': next.id }, `${next.n}. ${next.short}`)))] : []));
    page.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => select(b.dataset.next, true)));
  }

  /* ---------- scorecard + markers ---------- */
  const scorecard = $('scorecard'), markers = $('markers');
  HOLES.forEach(h => {
    const b = el('button', { type: 'button', 'data-id': h.id, 'aria-label': `Hole ${h.n}: ${h.short}. ${h.era}. Hit a shot here.` },
      el('span', { class: 'hole' }, String(h.n)), el('span', { class: 'nm' }, h.short), el('span', { class: 'when' }, h.era));
    b.addEventListener('click', () => select(selectedId === h.id ? null : h.id, true));
    scorecard.append(el('li', null, b));

    const m = el('button', { type: 'button', class: 'marker' + (h.y < 180 ? '' : ' above'), 'data-id': h.id, style: `--x:${h.x / 10}%; --y:${h.y / 6.2}%` + (h.color ? `; --c:${h.color}` : ''), 'aria-label': `Hole ${h.n}: ${h.short}. Hit a shot here.` },
      String(h.n), el('span', { class: 'tag' }, h.short));
    m.addEventListener('click', () => select(selectedId === h.id ? null : h.id, true));
    markers.append(m);
  });

  const statusEl = $('status');
  let selectedId = null, roundToken = 0;

  function select(id, fromUser) {
    if (fromUser) stopRound();
    selectedId = id;
    document.querySelectorAll('.scorecard button, .marker').forEach(b => b.setAttribute('aria-current', String(b.dataset.id === id)));
    document.querySelectorAll('[data-open]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.open === id)));
    renderPage(id);
    if (fromUser) history.replaceState(null, '', id ? '#' + id : location.pathname + location.search);
    if (byId[id]) { statusEl.textContent = `Hit a shot to hole ${byId[id].n}, ${byId[id].short}.`; return hit(byId[id]); }
    return Promise.resolve();
  }
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => select(selectedId === b.dataset.open ? null : b.dataset.open, true)));

  /* ---------- play the round: every hole, in order ---------- */
  const roundBtn = $('btn-round');
  function stopRound() { if (roundBtn.getAttribute('aria-pressed') === 'true') { roundToken++; roundBtn.setAttribute('aria-pressed', 'false'); roundBtn.textContent = 'Play the round'; } }
  roundBtn.addEventListener('click', async () => {
    if (roundBtn.getAttribute('aria-pressed') === 'true') { stopRound(); return; }
    const token = ++roundToken;
    roundBtn.setAttribute('aria-pressed', 'true'); roundBtn.textContent = 'Stop the round';
    for (const h of HOLES) {
      if (token !== roundToken) return;
      const ok = await select(h.id, false);
      if (token !== roundToken || ok === false) return;
      await wait(reduceMotion ? 2400 : 2100);
    }
    if (token !== roundToken) return;
    stopRound();
  });

  /* ---------- go ---------- */
  const start = location.hash.slice(1);
  if (byId[start]) { ball.x = byId[start].x; ball.y = byId[start].y; ball.hidden = !!byId[start].cup; draw(); }
  select(byId[start] || start === 'about' ? start : null, false);
})();
