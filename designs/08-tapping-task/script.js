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
     The task. Seven targets sit on a ring. In the classic multi-directional tapping test you always cross
     the ring to the target roughly opposite, so the order goes around the ring in jumps of 3. Here the stops
     are placed so that this zig-zag order IS the order things happened: tapping the lit target walks you through my path.
     ===================================================================== */
  const N = 7, STEP = 3, CX = 500, CY = 500, R = 350;
  const STOPS = [
    { id: 'ug',       short: 'Undergrad', era: 'Undergrad' },
    { id: 'diver',    short: dv.shortTitle, era: dv.era },
    { id: 'penpal',   short: pp.title,    era: pp.era },
    { id: 'axlab',    short: 'AxLab',     era: P.labEra },
    { id: 'mpcs',     short: 'MPCS',      era: 'Master’s begins' },
    { id: 'buoyance', short: bu.title,    era: bu.era },
    { id: 'now',      short: 'Now',       era: 'Second year' }
  ];
  STOPS.forEach((s, k) => {
    const slot = (k * STEP) % N;                                   // where on the ring this stop sits
    const a = (-90 + (slot * 360) / N) * Math.PI / 180;
    s.k = k; s.x = CX + R * Math.cos(a); s.y = CY + R * Math.sin(a);
  });
  const byId = Object.fromEntries(STOPS.map(s => [s.id, s]));

  const ring = $('ring'), linesSvg = $('lines'), centerEl = $('center'), targetsEl = $('targets'), ghost = $('ghost');
  const statusEl = $('status');

  /* ---------- build the ring ---------- */
  const rim = document.createElementNS(SVG_NS, 'circle'); linesSvg.append(rim);
  [['cx', CX], ['cy', CY], ['r', R], ['class', 'rim']].forEach(([k, v]) => rim.setAttribute(k, v));
  const segLayer = document.createElementNS(SVG_NS, 'g'); linesSvg.append(segLayer);

  const targetBtns = STOPS.map(s => {
    const b = el('button', { type: 'button', class: 'target', 'data-id': s.id, 'data-lit': 'false', 'data-visited': 'false' },
      el('span', { class: 'n', 'aria-hidden': 'true' }, String(s.k + 1)), el('span', { class: 'nm' }, s.short));
    b.addEventListener('click', e => tap(s.k, e));
    targetsEl.append(el('li', { style: `--x:${(s.x / 10).toFixed(2)}%; --y:${(s.y / 10).toFixed(2)}%` }, b));
    return b;
  });

  /* ---------- state ---------- */
  let lit = 0;                         // the target that is lit now
  let selected = null;                 // id of whatever the reader shows (a stop, or about/contact)
  let trail = [];                      // stops opened, in order, for the traced star
  const visited = new Set();
  let scores = [];                     // throughput of each scored tap, in bits/s
  let roundDone = false;
  let last = { id: null, mt: null, tp: null, idBits: null, d: null, w: null };
  let moveStart = null, lastTapPos = null, demoToken = 0, demoing = false;

  /* ---------- geometry in real pixels ---------- */
  const px = k => { const r = ring.getBoundingClientRect(); return { x: STOPS[k].x / 1000 * r.width, y: STOPS[k].y / 1000 * r.height }; };
  const widthPx = () => targetBtns[0].getBoundingClientRect().width;
  const dist = (a, b) => { const p = px(a), q = px(b); return Math.hypot(p.x - q.x, p.y - q.y); };
  const idBits = (d, w) => Math.log2(d / w + 1);      // Shannon form of Fitts's index of difficulty

  /* ---------- drawing ---------- */
  function drawSegments() {
    segLayer.replaceChildren();
    const rr = ring.getBoundingClientRect();
    const radius = rr.width ? (widthPx() / rr.width) * 500 : 80;          // a target's radius in drawing units, so arrowheads sit on its edge
    const seg = (a, b, cls) => {
      const dx = STOPS[b].x - STOPS[a].x, dy = STOPS[b].y - STOPS[a].y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const tipD = radius + 5, tx = STOPS[b].x - ux * tipD, ty = STOPS[b].y - uy * tipD;       // the arrow tip, just outside the target it points at
      const l = document.createElementNS(SVG_NS, 'line');
      [['x1', STOPS[a].x], ['y1', STOPS[a].y], ['x2', tx - ux * 20], ['y2', ty - uy * 20], ['class', cls]].forEach(([k, v]) => l.setAttribute(k, v));
      const head = document.createElementNS(SVG_NS, 'polygon');                                 // a solid arrowhead at the end of the line
      const px = -uy, py = ux, back = 34, half = 15;
      head.setAttribute('points', [[tx, ty], [tx - ux * back + px * half, ty - uy * back + py * half], [tx - ux * back - px * half, ty - uy * back - py * half]].map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '));
      head.setAttribute('class', 'arrow ' + cls);
      segLayer.append(l, head);
    };
    for (let i = 1; i < trail.length; i++) if (trail[i] === trail[i - 1] + 1) seg(trail[i - 1], trail[i], 'done');   // only the steps the task itself takes
    const prev = trail.length ? trail[trail.length - 1] : null;
    if (prev != null && !roundDone && prev !== lit) seg(prev, lit, 'active');
  }

  function drawTargets() {
    targetBtns.forEach((b, k) => {
      const s = STOPS[k], isLit = k === lit;                 // after the last target, the first lights again so a new round can start
      b.dataset.lit = String(isLit); b.dataset.visited = String(visited.has(k));
      if (selected === s.id) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      b.setAttribute('aria-label', `Target ${k + 1} of ${N}: ${s.short}. ${s.era}.${isLit ? ' Lit: this is the next target.' : ''}`);
    });
  }

  const f = (v, d = 1) => v == null ? '—' : v.toFixed(d);
  const readoutEl = $('readout');
  function drawCenter() {
    const cur = STOPS.find(s => s.id === selected);
    const meanTp = scores.length ? scores.reduce((acc, v) => acc + v, 0) / scores.length : null;
    // the middle of the ring stays open for the traced star; it only carries a small counter
    centerEl.replaceChildren(el('span', { class: 'c-count' }, cur ? String(cur.k + 1) : '•', el('small', null, '/' + N)));
    let head;
    if (roundDone) head = [el('b', null, 'Round complete'), meanTp != null ? ` · mean throughput ${f(meanTp, 2)} bits/s` : ' · you reached the last target', ` · next round starts at ${STOPS[0].short}`];
    else if (cur) head = [el('b', null, cur.short), ` · ${cur.era} · next: ${STOPS[lit].short}`];
    else head = [el('b', null, 'Tap the lit target'), ` · start at ${STOPS[0].short}`];
    const cell = (k, v) => el('div', null, el('dt', null, k), el('dd', null, v));
    readoutEl.replaceChildren(
      el('p', { class: 'r-head' }, head),
      el('dl', { class: 'r-stats' },
        cell('D', last.d == null ? '—' : `${Math.round(last.d)} px`), cell('W', last.w == null ? '—' : `${Math.round(last.w)} px`),
        cell('ID', last.idBits == null ? '—' : `${f(last.idBits, 2)} bits`), cell('MT', last.mt == null ? '—' : `${f(last.mt, 2)} s`),
        cell('TP', last.tp == null ? '—' : `${f(last.tp, 2)} bits/s`)));
  }

  function render() { drawTargets(); drawSegments(); drawCenter(); }

  /* ---------- the reader ---------- */
  const reader = $('reader');
  const chips = tags => tags && tags.length ? el('ul', { class: 'chips', 'aria-label': 'Topics' }, tags.map(t => el('li', null, t))) : null;
  function photoBlocks(images) {     // first photo spans the width; the rest pack into two columns by aspect ratio
    const fig = img => el('figure', null, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    const [lead, ...rest] = images;
    const cols = [[], []], heights = [0, 0];
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), rest.length > 0 && el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig)))));
  }

  function content(id) {
    const s = byId[id], tag = s ? `Target ${s.k + 1} of ${N} · ` : '';
    if (id === 'ug') return [el('p', { class: 'kicker' }, tag + 'Undergrad'), el('h2', null, 'Two degrees, in parallel'),
      el('p', { class: 'lead' }, `${bs.title} (${bs.note}) and ${ba.title}.`), el('p', { class: 'story' }, 'I double majored in Computer Science and Economics.')];
    if (id === 'mpcs') return [el('p', { class: 'kicker' }, tag + 'Master’s begins'), el('h2', null, 'Pre-Doctoral MPCS'), el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0])];
    if (id === 'axlab') return [el('p', { class: 'kicker' }, tag + P.labEra), el('h2', null, P.lab), el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])];
    if (id === 'now') return [el('p', { class: 'kicker' }, tag + 'We are here'), el('h2', null, P.standing), el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])];
    if (id === 'about') return [el('p', { class: 'kicker' }, 'About'), el('h2', null, P.name), el('p', { class: 'lead' }, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))];
    if (id === 'contact') return [el('p', { class: 'kicker' }, 'Get in touch'), el('h2', null, 'Contact'),
      el('dl', { class: 'facts' }, el('dt', null, 'Email'), el('dd', null, link('mailto:' + P.contact.email, P.contact.email)),
        el('dt', null, 'LinkedIn'), el('dd', null, link(P.contact.linkedin, 'Alan Pham')), el('dt', null, 'Before'), el('dd', null, link(P.contact.previousSite, 'Previous portfolio')))];
    const p = project(id);
    if (p) return [el('p', { class: 'kicker' }, tag + (p.era || p.kicker)), el('h2', null, p.title), el('p', { class: 'lead' }, p.summary), p.story && el('p', { class: 'story' }, p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      chips(p.tags), p.images.length > 0 && photoBlocks(p.images)];
    return [el('p', { class: 'kicker' }, 'The task'), el('h2', null, 'Seven targets, one path'), el('p', { class: 'lead' }, P.about[2]),
      el('p', { class: 'hint' }, 'In a pointing study you tap a lit target, then the next one across the ring. Here each target is a stop on my path, in the order it happened: tap the lit one to open it and light the next. You can also open any target directly, or press Watch the task.')];
  }

  function renderReader() {
    const nextBtn = !roundDone && selected && byId[selected] ? el('button', { type: 'button', class: 'nextbtn' }, `Open next target: ${STOPS[lit].short}`) : null;
    if (nextBtn) nextBtn.addEventListener('click', () => openStop(lit, { free: true }));
    reader.replaceChildren(...content(selected).filter(Boolean), ...(nextBtn ? [nextBtn] : []));
  }

  /* ---------- who ---------- */
  $('who').append(
    el('figure', null, el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 })),
    el('div', null, el('p', { class: 'tag' }, 'Participant'), el('h1', null, P.name), el('p', { class: 'standing' }, P.standing), el('p', { class: 'lab' }, `${P.lab}, ${P.school}`)));

  /* =====================================================================
     Tapping
     ===================================================================== */
  function openStop(k, opts = {}) {
    const s = STOPS[k];
    if (roundDone && k === 0) { trail = []; visited.clear(); }   // starting a new round: clear the old star
    selected = s.id; visited.add(k); roundDone = false;
    trail.push(k); if (trail.length > 9) trail.shift();
    lit = (k + 1) % N;
    if (k === N - 1) { roundDone = true; lit = 0; }
    if (!opts.demo) history.replaceState(null, '', '#' + s.id);
    document.querySelectorAll('[data-open]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    render(); renderReader();
    statusEl.textContent = roundDone ? `Opened ${s.short}. Round complete.` : `Opened ${s.short}. Next target: ${STOPS[lit].short}.`;
  }

  function tap(k, e) {
    if (demoing) stopDemo();
    const wasLit = k === lit;
    const prev = trail.length ? trail[trail.length - 1] : null;
    let scored = false;
    if (wasLit && prev != null && prev !== k) {                     // a proper tap on the lit target: score it
      const d = dist(prev, k), w = widthPx(), id = idBits(d, w);
      const mouse = e && e.pointerType !== 'touch' && e.detail > 0;  // keyboard clicks have detail 0; touch has no approach to time
      const mt = mouse && moveStart != null ? (performance.now() - moveStart) / 1000 : null;
      last = { d, w, idBits: id, mt: mt != null && mt > 0.12 ? mt : null, tp: null };
      if (last.mt != null) { last.tp = id / last.mt; scores.push(last.tp); scored = true; }
    } else if (!wasLit) { last = { d: null, w: null, idBits: null, mt: null, tp: null }; }
    moveStart = null; lastTapPos = e ? { x: e.clientX, y: e.clientY } : null;
    openStop(k);
    if (scored) statusEl.textContent += ` Throughput ${last.tp.toFixed(2)} bits per second.`;
  }

  // movement time starts when the pointer starts moving after the last tap
  ring.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' || moveStart != null) return;
    if (lastTapPos && Math.hypot(e.clientX - lastTapPos.x, e.clientY - lastTapPos.y) < 6) return;
    moveStart = performance.now();
  });

  function resetTask() {
    trail = []; visited.clear(); scores = []; roundDone = false; lit = 0; last = { id: null, mt: null, tp: null, idBits: null, d: null, w: null };
    selected = null; moveStart = null; lastTapPos = null; history.replaceState(null, '', location.pathname + location.search);
    render(); renderReader();
  }

  /* ---------- the About and Contact buttons ---------- */
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    if (demoing) stopDemo();
    const id = selected === b.dataset.open ? null : b.dataset.open;
    selected = id;
    document.querySelectorAll('[data-open]').forEach(o => o.setAttribute('aria-pressed', String(o.dataset.open === id)));
    history.replaceState(null, '', id ? '#' + id : location.pathname + location.search);
    render(); renderReader();
  }));
  $('readlink').addEventListener('click', () => reader.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* =====================================================================
     Watch the task: a ghost cursor plays the whole round
     ===================================================================== */
  const watchBtn = $('btn-watch');
  function stopDemo() { demoToken++; demoing = false; ghost.hidden = true; watchBtn.setAttribute('aria-pressed', 'false'); watchBtn.textContent = 'Watch the task'; }
  async function moveGhost(a, b, ms) {
    const p = px(a), q = px(b);
    if (reduceMotion) { ghost.style.transform = `translate(${q.x}px, ${q.y}px)`; return; }
    const t0 = performance.now();
    await new Promise(res => { (function step(now) {
      const u = clamp((now - t0) / ms, 0, 1), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;   // ease in-out, like a real pointing movement
      ghost.style.transform = `translate(${p.x + (q.x - p.x) * e}px, ${p.y + (q.y - p.y) * e}px)`;
      if (u < 1 && demoing) requestAnimationFrame(step); else res();
    })(t0); });
  }
  watchBtn.addEventListener('click', async () => {
    if (demoing) { stopDemo(); return; }
    resetTask();
    const token = ++demoToken; demoing = true; ghost.hidden = false;
    watchBtn.setAttribute('aria-pressed', 'true'); watchBtn.textContent = 'Stop watching';
    const home = px(0); ghost.style.transform = `translate(${ring.clientWidth * 0.5}px, ${ring.clientHeight * 0.5}px)`;
    let from = null;
    for (let k = 0; k < N; k++) {
      if (token !== demoToken) return;
      if (from == null) { ghost.style.transform = `translate(${home.x}px, ${home.y}px)`; await wait(reduceMotion ? 0 : 350); }
      else { const d = dist(from, k), id = idBits(d, widthPx()); await moveGhost(from, k, clamp(380 + id * 230, 600, 1100)); }
      if (token !== demoToken) return;
      last = from == null ? last : { d: dist(from, k), w: widthPx(), idBits: idBits(dist(from, k), widthPx()), mt: null, tp: null };
      openStop(k, { demo: true });
      from = k;
      await wait(reduceMotion ? 1800 : 2100);
    }
    if (token === demoToken) stopDemo();
  });

  /* ---------- go ---------- */
  addEventListener('resize', () => { drawSegments(); drawCenter(); });
  render(); renderReader();
  const start = location.hash.slice(1);
  if (byId[start]) openStop(byId[start].k, { demo: true });
  else if (start === 'about' || start === 'contact') { selected = start; document.querySelector(`[data-open="${start}"]`).setAttribute('aria-pressed', 'true'); render(); renderReader(); }
})();
