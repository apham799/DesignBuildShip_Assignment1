(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 900px)');

  const mapEl = document.getElementById('map');
  const routesSvg = document.getElementById('routes');
  const stationsEl = document.getElementById('stations');
  const legendEl = document.getElementById('legend');
  const cardEl = document.getElementById('card');
  const detail = document.getElementById('detail');
  const panel = document.getElementById('panel');

  /* ---------- DOM helpers ---------- */
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

  /* ---------- the system ---------- */
  // x runs left to right with time: the undergrad years sit on the left, the master's on the right.
  const LINES = {
    cs:       { name: 'Computer Science (B.S.)', color: '#1f5fbf' },
    econ:     { name: 'Economics (B.A.)',        color: '#1e8e4a' },
    research: { name: 'Research (AxLab)',        color: '#e8730c' }
  };

  const bs = P.degrees.find(d => d.id === 'bs');
  const ba = P.degrees.find(d => d.id === 'ba');
  const project = id => P.projects.find(p => p.id === id);

  // x, y are in the 1000 x 520 map space. place = where the name sits relative to the stop;
  // era is the small line under the name that says when it happened.
  const STATIONS = [
    { id: 'bs',       label: bs.short,                    era: bs.era,                  line: 'cs',       x: 100, y: 110, place: 'below start' },
    { id: 'ba',       label: ba.short,                    era: ba.era,                  line: 'econ',     x: 100, y: 380, place: 'above start' },
    { id: 'diver',    label: project('diver').shortTitle, era: project('diver').era,    line: 'cs',       x: 200, y: 110, place: 'above' },
    { id: 'penpal',   label: project('penpal').title,     era: project('penpal').era,   line: 'cs',       x: 320, y: 110, place: 'below' },
    { id: 'axlab',    label: 'AxLab',                     era: P.labEra,                line: 'research', x: 410, y: 110, place: 'above narrow', inter: true },
    { id: 'mpcs',     label: 'MPCS Pre-Doctoral',         era: 'Master’s begins',   line: 'research', x: 600, y: 245, place: 'above right wide', inter: true },
    { id: 'buoyance', label: project('buoyance').title,   era: project('buoyance').era, line: 'research', x: 760, y: 245, place: 'below' },
    { id: 'now',      label: 'Now',                       era: 'Second year',           line: 'research', x: 920, y: 245, place: 'above', here: true }
  ];
  const byId = Object.fromEntries(STATIONS.map(s => [s.id, s]));

  // Which stop comes next in time.
  const NEXT = { bs: ['diver'], ba: ['mpcs'], diver: ['penpal'], penpal: ['axlab'], axlab: ['mpcs'], mpcs: ['buoyance'], buoyance: ['now'], now: [] };

  // The two degrees run side by side, then merge into the master's at MPCS.
  // Diver Sim and PenPal are class projects on the CS line. The research line leaves the CS line when I join AxLab and runs to the present.
  const ROUTES = [
    { line: 'cs',       d: 'M100 110 H465 L600 245' },
    { line: 'econ',     d: 'M100 380 H465 L600 245' },
    { line: 'research', d: 'M410 110 L545 245 H920' }
  ];

  /* ---------- draw the map ---------- */
  ROUTES.forEach((r, i) => {
    routesSvg.append(svg('path', { d: r.d, stroke: LINES[r.line].color, pathLength: 1, class: 'draw', style: `--delay:${i * 0.25}s` }));
  });

  // Chevrons along every line point the way time flows (the same way the trains run).
  const drawn = [...routesSvg.querySelectorAll('path.draw')];
  ROUTES.forEach((r, i) => {
    const path = drawn[i];
    const total = path.getTotalLength();
    const stops = STATIONS.map(s => [s.x, s.y]);
    for (let len = 62; len < total - 30; len += 78) {
      const p = path.getPointAtLength(len);
      if (stops.some(([sx, sy]) => Math.hypot(sx - p.x, sy - p.y) < 34)) continue; // keep clear of station dots
      const a = path.getPointAtLength(len - 1), b = path.getPointAtLength(len + 1);
      const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      routesSvg.append(svg('path', { class: 'chev', d: 'M-3.2 -4.6 L3 0 L-3.2 4.6', transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${angle.toFixed(1)})` }));
    }
  });

  if (!reduceMotion) {
    // one train per line, always moving forward in time, then re-entering at the start
    ROUTES.forEach((r, i) => {
      const dur = 15 + i * 3;
      const g = svg('g', { 'aria-hidden': 'true', opacity: 0 });
      g.append(
        svg('rect', { x: -15, y: -6.5, width: 30, height: 13, rx: 3.5, fill: '#fff', stroke: '#14161a', 'stroke-width': 2 }),
        svg('rect', { x: -10, y: -2, width: 20, height: 4, rx: 2, fill: LINES[r.line].color }));
      g.append(
        svg('animateMotion', { path: r.d, dur: `${dur}s`, begin: `-${2 + i * 4}s`, repeatCount: 'indefinite', rotate: 'auto' }),
        svg('animate', { attributeName: 'opacity', values: '0;1;1;0', keyTimes: '0;0.06;0.92;1', dur: `${dur}s`, begin: `-${2 + i * 4}s`, repeatCount: 'indefinite' }));
      routesSvg.append(g);
    });
  }

  // Time axis under the map (phones get a one-line note instead).
  mapEl.append(
    el('div', { class: 'axis', 'aria-hidden': 'true' }, el('span', null, 'Earlier'), el('i'), el('span', null, 'Later')),
    el('p', { class: 'timenote' }, 'Trains only run forward in time: earliest stop at the top, most recent at the bottom.'));

  Object.values(LINES).forEach(l => {
    legendEl.append(el('li', { style: `--c:${l.color}` }, l.name));
  });

  /* ---------- stations ---------- */
  const pins = {};
  const items = {};
  STATIONS.forEach(s => {
    const color = LINES[s.line].color;
    const pin = el('button', {
      type: 'button', class: 'pin' + (s.inter ? ' inter' : ''), 'data-id': s.id,
      'aria-expanded': 'false', 'aria-controls': 'detail', style: `--c:${color}`
    },
      el('span', { class: 'dot' }),
      el('span', { class: 'lab ' + s.place }, s.label, s.era && ' ', s.era && el('span', { class: 'yr' }, s.era)));
    const li = el('li', { class: 'station', style: `--x:${s.x / 10}%; --y:${s.y / 5.2}%; --c:${color}` }, pin);
    if (s.here) li.append(el('span', { class: 'here', 'aria-hidden': 'true', 'data-text': 'We are here' }));
    stationsEl.append(li);
    pins[s.id] = pin; items[s.id] = li;
    pin.addEventListener('click', () => select(active === s.id ? null : s.id, { fromUser: true }));
  });

  /* ---------- the pass card ---------- */
  cardEl.append(
    el('div', { class: 'stripes', 'aria-hidden': 'true' }, Object.values(LINES).map(l => el('span', { style: `--c:${l.color}` }))),
    el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 }),
    el('div', null,
      el('h1', null, el('button', { type: 'button', class: 'name-link', 'data-open': 'about', 'aria-controls': 'detail', 'aria-pressed': 'false' }, P.name)),
      el('p', { class: 'standing' }, P.standing),
      el('p', null, P.school),
      el('p', null, P.lab),
      el('p', { class: 'reach' }, link('mailto:' + P.contact.email, 'Email'), link(P.contact.linkedin, 'LinkedIn'), el('button', { type: 'button', class: 'about-link', 'data-open': 'about', 'aria-controls': 'detail', 'aria-pressed': 'false' }, 'About'))));

  /* ---------- station details ---------- */
  function citation(pub) {
    return el('p', { class: 'cite' }, `${pub.authors}. `, el('i', null, pub.title), `. ${pub.venue}.`);
  }
  const chips = tags => tags && tags.length ? el('ul', { class: 'chips', 'aria-label': 'Topics' }, tags.map(t => el('li', null, t))) : null;

  // Photos: the first spans the full width; the rest go into two columns, each into whichever column is currently
  // shorter (using each photo's real proportions), so no blank gaps open up between them.
  function photoBlocks(images) {
    const fig = img => el('figure', null,
      el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }),
      el('figcaption', null, img.caption));
    const [lead, ...rest] = images;
    const cols = [[], []], heights = [0, 0];
    rest.forEach(img => {
      const c = heights[0] <= heights[1] ? 0 : 1;
      cols[c].push(img);
      heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2;   // +0.2 allows for the caption and gap
    });
    return [fig(lead), rest.length > 0 && el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig))))];
  }

  function content(id) {
    if (id === 'bs' || id === 'ba') {
      const d = id === 'bs' ? bs : ba;
      return [el('p', { class: 'kicker' }, 'Undergraduate degree'), el('h2', null, d.title), d.note && el('p', null, d.note),
        el('p', { class: 'story' }, 'I double majored in Computer Science and Economics.')];
    }
    if (id === 'mpcs') {
      return [el('p', { class: 'kicker' }, 'Master’s begins'), el('h2', null, 'Pre-Doctoral MPCS'), el('p', null, P.program + '.'), el('p', null, P.about[0])];
    }
    if (id === 'axlab') {
      return [el('p', { class: 'kicker' }, 'Research lab · ' + P.labEra), el('h2', null, P.lab), el('p', null, P.labStory), el('p', null, P.about[1])];
    }
    if (id === 'now') {
      return [el('p', { class: 'kicker' }, 'We are here'), el('h2', null, P.standing), el('p', null, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])];
    }
    if (id === 'about') {
      return [
        el('p', { class: 'kicker' }, 'About'),
        el('h2', null, P.name),
        el('p', { class: 'lead' }, P.about[0]),
        el('p', null, P.about[1]),
        el('p', null, P.about[2]),
        el('dl', { class: 'facts' },
          el('dt', null, 'Program'), el('dd', null, P.program),
          el('dt', null, 'Undergrad'), el('dd', null, P.undergrad),
          el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`),
          el('dt', null, 'Published'), el('dd', null, link(project('buoyance').links[0].url, `${project('buoyance').title}, ${project('buoyance').publication.venue}`))),
        el('ul', { class: 'links', 'aria-label': 'Elsewhere' },
          el('li', null, link('mailto:' + P.contact.email, 'Email')),
          el('li', null, link(P.contact.linkedin, 'LinkedIn')),
          el('li', null, link(P.contact.previousSite, 'Previous portfolio')))
      ];
    }
    if (id === 'contact') {
      return [el('p', { class: 'kicker' }, 'Get in touch'), el('h2', null, 'Contact'),
        el('dl', { class: 'facts' },
          el('dt', null, 'Email'), el('dd', null, link('mailto:' + P.contact.email, P.contact.email)),
          el('dt', null, 'LinkedIn'), el('dd', null, link(P.contact.linkedin, 'Alan Pham')),
          el('dt', null, 'Before'), el('dd', null, link(P.contact.previousSite, 'Previous portfolio')))];
    }
    const p = project(id);
    if (p) {
      return [
        el('p', { class: 'kicker' }, p.kicker),
        el('h2', null, p.title),
        el('p', null, p.summary),
        p.story && el('p', { class: 'story' }, p.story),
        p.publication && citation(p.publication),
        p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
        chips(p.tags),
        p.images.length > 0 && el('div', { class: 'photos' }, photoBlocks(p.images))
      ];
    }
    // overview (nothing selected)
    return [el('p', { class: 'kicker' }, 'Overview'), el('h2', null, 'Welcome aboard'), el('p', null, P.about[2]),
      el('p', { class: 'hint' }, 'Pick a station on the map to see where I’ve been and what I’ve built.')];
  }

  let active = null;

  function renderDetail(id) {
    const color = LINES[(byId[id] || { line: 'research' }).line].color;
    detail.style.setProperty('--c', color);
    const next = (NEXT[id] || []).map(n => el('li', null, el('button', { type: 'button', style: `--nc:${LINES[byId[n].line].color}`, 'data-next': n }, byId[n].label)));
    const nextList = next.length ? [el('ul', { class: 'nextstops', 'aria-label': 'Next stops' }, el('li', { class: 'lbl' }, 'Next stop'), next)] : [];
    detail.replaceChildren(...content(id).filter(Boolean), ...nextList);
    detail.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => select(b.dataset.next, { fromUser: true, focusPin: true })));
    detail.classList.remove('enter');
    void detail.offsetWidth; // restart the entrance animation
    detail.classList.add('enter');
  }

  function placeDetail() {
    if (!desktop.matches && items[active]) items[active].append(detail); // contact has no stop, so it stays in the panel
    else panel.append(detail);
  }

  function select(id, opts = {}) {
    active = id;
    Object.entries(pins).forEach(([k, pin]) => {
      pin.classList.toggle('active', k === id);
      pin.setAttribute('aria-expanded', String(k === id));
    });
    document.querySelectorAll('[data-open]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.open === id)));
    renderDetail(id);
    placeDetail();
    if (opts.fromUser) history.replaceState(null, '', id ? '#' + id : location.pathname + location.search);
    if (opts.fromUser) {
      if (desktop.matches) panel.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      else (items[id] || panel).scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      if (opts.focusPin && pins[id]) pins[id].focus({ preventScroll: true });
    }
  }

  desktop.addEventListener('change', placeDetail);

  // About and Contact live outside the rail. Buttons in the sign bar and the pass card open them.
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => select(active === b.dataset.open ? null : b.dataset.open, { fromUser: true })));

  const start = location.hash.slice(1);
  select(byId[start] || start === 'contact' || start === 'about' ? start : null);
})();
