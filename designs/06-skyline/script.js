(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const $ = id => document.getElementById(id);

  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => v != null && n.setAttribute(k, v));
    kids.flat(Infinity).forEach(k => { if (k != null && k !== false) n.append(k); });
    return n;
  }
  const svg = (tag, attrs) => {
    const n = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  };
  const link = (href, label) => el('a', { href, target: '_blank', rel: 'noopener' }, label);
  const project = id => P.projects.find(p => p.id === id);
  const bs = P.degrees.find(d => d.id === 'bs'), ba = P.degrees.find(d => d.id === 'ba');
  const bu = project('buoyance'), pp = project('penpal'), dv = project('diver');

  /* =====================================================================
     The map. Same stops and lines as the system map, but each stop is a balloon
     whose height says when it happened (x runs left to right with time).
     ===================================================================== */
  const LINES = {
    cs:       { name: 'Computer Science (B.S.)', color: '#1f5fbf' },
    econ:     { name: 'Economics (B.A.)',        color: '#1e8e4a' },
    research: { name: 'Research (AxLab)',        color: '#e8730c' }
  };
  // x, y live on the 1000 x 520 floor mat. d = balloon diameter.
  const STATIONS = [
    { id: 'bs',       short: 'B.S. CS',   line: 'cs',       x: 100, y: 110, d: 58, era: bs.era },
    { id: 'ba',       short: 'B.A. Econ', line: 'econ',     x: 100, y: 380, d: 58, era: ba.era },
    { id: 'diver',    short: dv.shortTitle, line: 'cs',     x: 200, y: 110, d: 62, era: dv.era },
    { id: 'penpal',   short: pp.title,    line: 'cs',       x: 320, y: 110, d: 62, era: pp.era },
    { id: 'axlab',    short: 'AxLab',     line: 'research', x: 410, y: 110, d: 64, inter: true, era: P.labEra },
    { id: 'mpcs',     short: 'MPCS',      line: 'research', x: 600, y: 245, d: 70, inter: true, era: 'Master’s begins' },
    { id: 'buoyance', short: bu.title,    line: 'research', x: 760, y: 245, d: 86, era: bu.era },
    { id: 'now',      short: 'Now',       line: 'research', x: 920, y: 245, d: 72, era: 'Second year' }
  ];
  const byId = Object.fromEntries(STATIONS.map(s => [s.id, s]));
  const NEXT = { bs: ['diver'], ba: ['mpcs'], diver: ['penpal'], penpal: ['axlab'], axlab: ['mpcs'], mpcs: ['buoyance'], buoyance: ['now'], now: [] };
  const ROUTES = [
    { line: 'cs',       d: 'M100 110 H465 L600 245' },
    { line: 'econ',     d: 'M100 380 H465 L600 245' },
    { line: 'research', d: 'M410 110 L545 245 H920' }
  ];

  const altOf = x => 46 + (x - 100) * 0.30;       // balloon height for a spot on the time axis
  const robotAltOf = x => 28 + (x - 100) * 0.30;  // the robots' balloons rise along the same slope, a little lower

  const plane = $('plane'), scene = $('scene'), room = $('room');

  // routes printed on the floor mat
  const routeSvg = svg('svg', { viewBox: '0 0 1000 520', 'aria-hidden': 'true', focusable: 'false' });
  const routePaths = ROUTES.map(r => { const p = svg('path', { class: 'route', d: r.d, stroke: LINES[r.line].color }); routeSvg.append(p); return p; });
  plane.append(routeSvg);
  routePaths.forEach(path => {                      // little chevrons: time only runs forward
    const total = path.getTotalLength();
    for (let len = 64; len < total - 34; len += 80) {
      const p = path.getPointAtLength(len);
      if (STATIONS.some(s => Math.hypot(s.x - p.x, s.y - p.y) < 36)) continue;
      const a = path.getPointAtLength(len - 1), b = path.getPointAtLength(len + 1);
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      routeSvg.append(svg('path', { class: 'chev', d: 'M-3.2 -4.6 L3 0 L-3.2 4.6', transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})` }));
    }
  });

  // the stops: a dot on the floor, a tether, a balloon
  STATIONS.forEach(s => {
    s.tether = el('span', { class: 'tether' });
    s.lift = el('span', { class: 'lift' });
    s.balloon = el('button', { type: 'button', class: 'balloon', style: `--d:${s.d}px; --fs:${(s.d * clamp(1.55 / Math.max(s.short.length, 5), 0.16, 0.235)).toFixed(1)}px`, 'data-id': s.id, 'aria-label': `${s.short}. ${s.era}. Open details.` },
      el('span', { class: 'seam' }), el('span', { class: 'name' }, s.short));
    s.balloon.addEventListener('click', () => select(selectedId === s.id ? null : s.id, true));
    s.lift.append(el('span', { class: 'billboard' }, s.balloon));
    s.anchor = el('span', { class: 'anchor', style: `left:${s.x}px; top:${s.y}px` },
      el('span', { class: 'shadow' }), el('span', { class: 'dot' + (s.inter ? ' inter' : '') }), s.tether, s.lift);
    plane.append(s.anchor);
    s.alt = altOf(s.x);
  });

  // RoverC-style robots: one per line, towing a balloon that is reeled out as they go
  const ROBOTS = [
    { path: routePaths[0], color: '#1f5fbf', speed: 92, start: 0.06 },
    { path: routePaths[1], color: '#1e8e4a', speed: 92, start: 0.30 },
    { path: routePaths[2], color: '#e8730c', speed: 96, start: 0.52 }
  ].map((r, i) => {
    r.len = r.path.getTotalLength(); r.p = r.len * r.start; r.wait = 0; r.i = i;
    r.mode = 'patrol'; r.stationId = null; r.targetP = 0; r.stops = {};
    STATIONS.forEach(st => {                          // find the point on this route closest to the stop
      let best = Infinity, at = 0;
      for (let len = 0; len <= r.len; len += 1) { const pt = r.path.getPointAtLength(len); const d = Math.hypot(pt.x - st.x, pt.y - st.y); if (d < best) { best = d; at = len; } }
      if (best < 3) r.stops[st.id] = at;
    });
    r.tether = el('span', { class: 'tether' });
    r.lift = el('span', { class: 'lift' });
    r.lift.append(el('span', { class: 'billboard' }, el('span', { class: 'robot-balloon', style: `--bc:${r.color}; --d:44px` })));
    r.node = el('span', { class: 'robot', 'aria-hidden': 'true' },
      el('span', { class: 'body' }), ['a', 'b', 'c', 'd'].map(c => el('span', { class: 'wheel ' + c })), r.tether, r.lift);
    plane.append(r.node);
    return r;
  });
  let paused = reduceMotion;

  /* ---------- fit the scene and tilt it with the pointer ---------- */
  let tilt = 58, tiltTarget = 58;
  function fit() {
    const w = room.clientWidth, h = room.clientHeight;
    const s = clamp(Math.min(w * 0.8 / 1000, h * 1.0 / 700), 0.3, 1.1);
    scene.style.setProperty('--s', s.toFixed(3));
    plane.style.top = (w < 700 ? 58 : 56) + '%';
  }
  room.addEventListener('pointermove', e => { if (!reduceMotion) { const r = room.getBoundingClientRect(); tiltTarget = 53 + ((e.clientY - r.top) / r.height) * 10; } });
  addEventListener('resize', fit);

  /* ---------- the loop ---------- */
  let last = performance.now(), selectedId = null;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduceMotion) { tilt += (tiltTarget - tilt) * Math.min(1, dt * 4); scene.style.setProperty('--tilt', tilt.toFixed(2) + 'deg'); }

    STATIONS.forEach((s, i) => {                      // the selected balloon is reeled higher; all of them bob a little
      const target = altOf(s.x) + (s.id === selectedId ? 62 : 0) + (reduceMotion ? 0 : Math.sin(now / 900 + i * 1.7) * 3);
      s.alt += (target - s.alt) * Math.min(1, dt * 5);
      s.tether.style.height = s.alt.toFixed(1) + 'px';
      s.lift.style.transform = `translateZ(${s.alt.toFixed(1)}px)`;
    });

    ROBOTS.forEach(r => {
      if (r.mode === 'dispatch') {
        const d = r.targetP - r.p, step = 320 * dt;
        if (Math.abs(d) <= step) { r.p = r.targetP; r.mode = 'parked'; r.node.classList.add('parked'); say(`A robot has parked at ${byId[r.stationId].short}.`); }
        else r.p += Math.sign(d) * step;
      } else if (r.mode === 'patrol' && !paused) {
        if (r.wait > 0) { r.wait -= dt; if (r.wait <= 0) { r.p = 0; r.node.classList.remove('hidden'); } }
        else { r.p += r.speed * dt; if (r.p >= r.len) { r.p = r.len; r.wait = 1.1; r.node.classList.add('hidden'); } }
      }
      const pt = r.path.getPointAtLength(clamp(r.p, 0, r.len));
      const alt = robotAltOf(pt.x);
      r.node.style.left = pt.x.toFixed(1) + 'px'; r.node.style.top = pt.y.toFixed(1) + 'px';
      r.tether.style.height = alt.toFixed(1) + 'px';
      r.lift.style.transform = `translateZ(${alt.toFixed(1)}px)`;
    });
  }

  $('pause').addEventListener('click', e => {
    paused = !paused; e.currentTarget.setAttribute('aria-pressed', String(paused)); e.currentTarget.textContent = paused ? 'Resume robots' : 'Pause robots';
  });
  if (reduceMotion) { $('pause').textContent = 'Resume robots'; $('pause').setAttribute('aria-pressed', 'true'); }

  // key under the room
  Object.values(LINES).forEach(l => $('key-lines').append(el('li', { style: `--c:${l.color}` }, l.name)));

  /* =====================================================================
     The wall label: pass card + details
     ===================================================================== */
  $('card').append(
    el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 }),
    el('div', null,
      el('h1', null, P.name),
      el('p', { class: 'standing' }, P.standing),
      el('p', null, `${P.lab}, ${P.school}`)));

  const detail = $('detail');
  const chips = tags => tags && tags.length ? el('ul', { class: 'chips', 'aria-label': 'Topics' }, tags.map(t => el('li', null, t))) : null;
  function photoBlocks(images) {     // first photo spans the width; the rest pack into two columns by aspect ratio
    const fig = img => el('figure', null, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    const [lead, ...rest] = images;
    const cols = [[], []], heights = [0, 0];
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), rest.length > 0 && el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig)))));
  }

  function content(id) {
    if (id === 'bs' || id === 'ba') { const d = id === 'bs' ? bs : ba;
      return [el('p', { class: 'kicker' }, 'Undergraduate degree'), el('h2', null, d.title), d.note && el('p', { class: 'lead' }, d.note), el('p', { class: 'story' }, 'I double majored in Computer Science and Economics.')]; }
    if (id === 'mpcs') return [el('p', { class: 'kicker' }, 'Master’s begins'), el('h2', null, 'Pre-Doctoral MPCS'), el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0])];
    if (id === 'axlab') return [el('p', { class: 'kicker' }, 'Research lab · ' + P.labEra), el('h2', null, P.lab), el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])];
    if (id === 'now') return [el('p', { class: 'kicker' }, 'We are here'), el('h2', null, P.standing), el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])];
    if (id === 'about') return [el('p', { class: 'kicker' }, 'About'), el('h2', null, P.name), el('p', { class: 'lead' }, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))];
    if (id === 'contact') return [el('p', { class: 'kicker' }, 'Get in touch'), el('h2', null, 'Contact'),
      el('dl', { class: 'facts' }, el('dt', null, 'Email'), el('dd', null, link('mailto:' + P.contact.email, P.contact.email)),
        el('dt', null, 'LinkedIn'), el('dd', null, link(P.contact.linkedin, 'Alan Pham')), el('dt', null, 'Before'), el('dd', null, link(P.contact.previousSite, 'Previous portfolio')))];
    const p = project(id);
    if (p) return [el('p', { class: 'kicker' }, p.kicker), el('h2', null, p.title), el('p', { class: 'lead' }, p.summary), p.story && el('p', { class: 'story' }, p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      chips(p.tags), p.images.length > 0 && photoBlocks(p.images)];
    return [el('p', { class: 'kicker' }, 'Overview'), el('h2', null, 'Where I’ve been, and when'), el('p', { class: 'lead' }, P.about[2]),
      el('p', { class: 'hint' }, 'Each balloon is a stop on my path, and the higher it floats, the later it happened. Pick one to reel it in.')];
  }

  function colorOf(id) { const s = byId[id]; return s ? LINES[s.line].color : LINES.research.color; }

  function renderDetail(id) {
    detail.style.setProperty('--c', id ? colorOf(id) : '#14161a');
    const next = (NEXT[id] || []).map(n => el('li', null, el('button', { type: 'button', style: `--nc:${colorOf(n)}`, 'data-next': n }, byId[n].short)));
    detail.replaceChildren(...content(id).filter(Boolean), ...(next.length ? [el('ul', { class: 'nextstops', 'aria-label': 'Next stops' }, el('li', { class: 'lbl' }, 'Next stop'), next)] : []));
    detail.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => { select(b.dataset.next, true); byId[b.dataset.next].balloon.focus({ preventScroll: true }); }));
  }

  // phones: a plain list of the same stops, oldest first
  const routeList = $('route-list');
  STATIONS.forEach(s => {
    const b = el('button', { type: 'button', 'data-id': s.id }, s.short === 'Now' ? 'Now' : (s.id === 'bs' ? bs.title : s.id === 'ba' ? ba.title : s.id === 'mpcs' ? 'Pre-Doctoral MPCS' : s.id === 'axlab' ? 'AxLab' : s.short), el('span', null, s.era));
    b.addEventListener('click', () => { select(selectedId === s.id ? null : s.id, true); detail.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' }); });
    routeList.append(el('li', null, b));
  });

  /* ---------- robots stop at the stop you pick ---------- */
  const statusEl = $('status');
  function say(text) { statusEl.textContent = text; }

  function release(r) { r.mode = 'patrol'; r.stationId = null; r.node.classList.remove('parked'); }

  function dispatchFor(id) {
    // a robot that was parked or heading somewhere else goes back to patrolling
    ROBOTS.forEach(r => { if (r.mode !== 'patrol' && r.stationId !== id) release(r); });
    if (!byId[id]) return;
    // only a robot whose route really passes through this stop can serve it; pick the nearest one along its route
    const candidates = ROBOTS.filter(r => r.stops[id] != null);
    if (!candidates.length) return;
    const robot = candidates.find(r => r.stationId === id)
      || candidates.reduce((a, b) => Math.abs(a.p - a.stops[id]) <= Math.abs(b.p - b.stops[id]) ? a : b);
    if (robot.wait > 0) { robot.wait = 0; robot.p = 0; robot.node.classList.remove('hidden'); }   // it was waiting at the end of its line
    robot.stationId = id; robot.targetP = robot.stops[id];
    if (reduceMotion) { robot.p = robot.targetP; robot.mode = 'parked'; robot.node.classList.add('parked'); say(`A robot is parked at ${byId[id].short}.`); }
    else robot.mode = 'dispatch';
  }

  function select(id, fromUser) {
    selectedId = id;
    dispatchFor(id);
    STATIONS.forEach(s => s.anchor.classList.toggle('selected', s.id === id));
    document.querySelectorAll('[data-open]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.open === id)));
    routeList.querySelectorAll('button').forEach(b => b.setAttribute('aria-current', String(b.dataset.id === id)));
    renderDetail(id);
    if (fromUser) history.replaceState(null, '', id ? '#' + id : location.pathname + location.search);
  }
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => select(selectedId === b.dataset.open ? null : b.dataset.open, true)));

  /* ---------- go ---------- */
  fit();
  const start = location.hash.slice(1);
  select(byId[start] || start === 'about' || start === 'contact' ? start : null);
  requestAnimationFrame(t => { last = t; frame(t); });
})();
