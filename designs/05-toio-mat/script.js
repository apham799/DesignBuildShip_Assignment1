(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wrap180 = a => ((((a + 180) % 360) + 360) % 360) - 180;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => v != null && n.setAttribute(k, v));
    kids.flat(Infinity).forEach(k => { if (k != null && k !== false) n.append(k); });
    return n;
  }
  const link = (href, label) => el('a', { href, target: '_blank', rel: 'noopener' }, label);
  const project = id => P.projects.find(p => p.id === id);

  /* =====================================================================
     Words on the page (all from shared/content.js)
     ===================================================================== */
  $('eyebrow').textContent = `${P.role} · ${P.school}`;
  $('name').textContent = P.name;
  $('standing').textContent = P.standing;
  $('lab').textContent = `${P.lab}, advised by ${P.advisor}`;

  /* =====================================================================
     Reader panel: what a card says when a cube reads it
     ===================================================================== */
  const bu = project('buoyance'), pp = project('penpal'), dv = project('diver');
  const kicker = (text, color) => el('p', { class: 'kicker', style: color ? `--c:${color}` : null }, text);
  const chips = tags => tags && tags.length ? el('ul', { class: 'chips', 'aria-label': 'Topics' }, tags.map(t => el('li', null, t))) : null;

  // photos: first spans the width, the rest pack into two columns by aspect ratio (no gaps)
  function photos(images) {
    const fig = img => el('figure', null, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    const [lead, ...rest] = images;
    const cols = [[], []], heights = [0, 0];
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photo-stack' }, fig(lead),
      rest.length > 0 && el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig)))));
  }

  const CARDS = [
    { id: 'about', title: P.name, sub: 'About me', color: '#ffd23f', photo: true },
    { id: 'axlab', title: 'AxLab', sub: P.labEra, color: '#2de28b' },
    { id: 'buoyance', title: bu.title, sub: bu.era, color: '#ff4fa3' },
    { id: 'penpal', title: pp.title, sub: pp.era, color: '#8a6bff' },
    { id: 'diver', title: dv.shortTitle, sub: dv.era, color: '#29c4ff' },
    { id: 'contact', title: 'Contact', sub: 'Say hello', color: '#c9d1ee' }
  ];
  const cardById = Object.fromEntries(CARDS.map(c => [c.id, c]));

  function panelFor(id) {
    const c = cardById[id];
    const color = c && c.color;
    if (id === 'about') return [kicker('About', color), el('h2', null, P.name), el('p', { class: 'lead' }, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts-dl' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad),
        el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))];
    if (id === 'axlab') return [kicker('Research lab · ' + P.labEra, color), el('h2', null, P.lab), el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])];
    if (id === 'buoyance') return [kicker(bu.kicker, color), el('h2', null, bu.title), el('p', { class: 'lead' }, bu.summary), bu.story && el('p', { class: 'story', style: `--c:${color}` }, bu.story),
      el('p', { class: 'cite' }, `${bu.publication.authors}. `, el('i', null, bu.publication.title), `. ${bu.publication.venue}.`),
      el('ul', { class: 'links', 'aria-label': 'Buoyancé links' }, bu.links.map(l => el('li', null, link(l.url, l.label)))), chips(bu.tags), photos(bu.images)];
    if (id === 'penpal' || id === 'diver') { const p = id === 'penpal' ? pp : dv;
      return [kicker(p.kicker, color), el('h2', null, p.title), el('p', { class: 'lead' }, p.summary), p.story && el('p', { class: 'story', style: `--c:${color}` }, p.story), chips(p.tags)]; }
    if (id === 'contact') return [kicker('Get in touch', color), el('h2', null, 'Contact'),
      el('dl', { class: 'facts-dl' }, el('dt', null, 'Email'), el('dd', null, link('mailto:' + P.contact.email, P.contact.email)),
        el('dt', null, 'LinkedIn'), el('dd', null, link(P.contact.linkedin, 'Alan Pham')), el('dt', null, 'Before'), el('dd', null, link(P.contact.previousSite, 'Previous portfolio')))];
    return [kicker('Welcome'), el('h2', null, 'Meet the cubes'), el('p', { class: 'lead' }, P.about[2]),
      el('p', { class: 'hint' }, 'Click a card on the mat and a cube drives over to read it. Or pick a cube up, carry it to a card and put it down. Or press “Take the tour”.')];
  }

  /* =====================================================================
     The mat: cards and cubes
     ===================================================================== */
  const mat = $('mat');
  // toio Core Cube Simple Play Mat coordinate range (from the spec). Our mat maps linearly onto it.
  const RANGE = { x0: 98, x1: 402, y0: 142, y1: 358 };

  const LAYOUTS = {
    wide: {
      cards: { about: [22, 27, -1.2], axlab: [50, 27, 1], buoyance: [78, 27, -1], penpal: [22, 62, 1.2], diver: [50, 62, -1], contact: [78, 62, 1.2] },
      homes: [[18, 90], [50, 90], [82, 90]]
    },
    tall: {
      cards: { about: [27, 13, -1], axlab: [73, 13, 1], buoyance: [27, 35, 1], penpal: [73, 35, -1], diver: [27, 57, -1], contact: [73, 57, 1] },
      homes: [[18, 89], [50, 89], [82, 89]]
    }
  };
  let layoutKey = 'wide', matW = 1, matH = 1, cubeSize = 40;

  CARDS.forEach(c => {
    c.el = el('button', { type: 'button', class: 'card' + (c.photo ? ' photo' : ''), 'data-id': c.id, style: `--c:${c.color}`, 'aria-label': `${c.title}: ${c.sub}. Send a cube to read this card.` },
      el('span', { class: 'bar' }),
      c.photo && el('span', { class: 'pic', style: `background-image:url('${ROOT + P.headshot.src}')`, role: 'img', 'aria-label': P.headshot.alt }),
      el('span', { class: 'body' }, el('b', null, c.title), el('span', null, c.sub)),
      el('span', { class: 'id', 'aria-hidden': 'true' }));
    c.el.addEventListener('click', () => sendToCard(c));
    mat.append(c.el);
  });

  const CUBE_DEFS = [
    { name: 'cube 1', led: [45, 226, 139] },
    { name: 'cube 2', led: [255, 138, 43] },
    { name: 'cube 3', led: [255, 79, 163] }
  ];
  const cubes = CUBE_DEFS.map((d, i) => {
    const node = el('div', { class: 'cube', tabindex: '0', role: 'button', 'aria-label': `${d.name}, a simulated toio cube. Drag it to move it. Double-tap to spin. Arrow keys nudge it.` },
      el('span', { class: 'glow' }), el('span', { class: 'shadow' }),
      el('span', { class: 'inner' }, el('span', { class: 'wheel l' }), el('span', { class: 'wheel r' }), el('span', { class: 'face' }), el('span', { class: 'nose' })));
    mat.append(node);
    node.style.setProperty('--led', `rgb(${d.led.join(',')})`);
    return { i, name: d.name, base: d.led, led: d.led.slice(), node, x: 0, y: 0, angle: 0, held: false, onMat: true, card: null,
      drive: null, collisionUntil: 0, tapUntil: 0, shake: 0, shakeFlips: [], lastDx: 0, spin: 0, dirty: true };
  });
  let selected = cubes[0];
  let tourToken = 0;

  const cardRect = c => {   // card box in mat pixels (bounding box, so the slight tilt is included)
    const m = mat.getBoundingClientRect(), r = c.el.getBoundingClientRect();
    return { l: r.left - m.left, t: r.top - m.top, r: r.right - m.left, b: r.bottom - m.top, cx: (r.left + r.right) / 2 - m.left, cy: (r.top + r.bottom) / 2 - m.top };
  };
  const spotFor = card => {
    const r = cardRect(card), w = r.r - r.l, h = r.b - r.t;
    return layoutKey === 'tall' ? { x: r.cx + w * 0.27, y: r.cy } : { x: r.cx, y: r.cy + h * 0.26 };
  };
  const cardUnder = cube => CARDS.find(c => { const r = cardRect(c); return cube.x > r.l && cube.x < r.r && cube.y > r.t && cube.y < r.b; }) || null;

  function layout(reset) {
    const m = mat.getBoundingClientRect();
    const key = innerWidth <= 560 ? 'tall' : 'wide';
    const keyChanged = key !== layoutKey;
    const oldW = matW, oldH = matH;
    layoutKey = key; mat.classList.toggle('tall', key === 'tall');
    matW = mat.clientWidth || m.width; matH = mat.clientHeight || m.height;
    cubeSize = cubes[0].node.offsetWidth || 40;
    const L = LAYOUTS[key];
    CARDS.forEach(c => {
      const [px, py, tilt] = L.cards[c.id];
      c.el.style.setProperty('--cx', (px / 100 * matW).toFixed(1) + 'px');
      c.el.style.setProperty('--cy', (py / 100 * matH).toFixed(1) + 'px');
      c.el.style.setProperty('--tilt', tilt + 'deg');
    });
    cubes.forEach((c, i) => {
      if (reset || keyChanged || !oldW || oldW === 1) { c.x = L.homes[i][0] / 100 * matW; c.y = L.homes[i][1] / 100 * matH; c.angle = 0; c.drive = null; }
      else { c.x *= matW / oldW; c.y *= matH / oldH; }
      c.dirty = true;
    });
    requestFrame();
  }

  /* =====================================================================
     Simulated sensors (names follow the toio specification)
     ===================================================================== */
  const toPositionId = c => ({
    x: Math.round(RANGE.x0 + (c.x / matW) * (RANGE.x1 - RANGE.x0)),
    y: Math.round(RANGE.y0 + (c.y / matH) * (RANGE.y1 - RANGE.y0)),
    angle: Math.round(((c.angle % 360) + 360) % 360)
  });
  const rainbow = t => [Math.round(127 + 127 * Math.sin(t / 120)), Math.round(127 + 127 * Math.sin(t / 120 + 2.1)), Math.round(127 + 127 * Math.sin(t / 120 + 4.2))];

  let lastConsole = 0;
  function renderConsole(force) {
    const now = performance.now();
    if (!force && now - lastConsole < 90) return;
    lastConsole = now;
    const c = selected, pad = (v, n) => String(v).padStart(n, ' ');
    const pos = c.held || !c.onMat ? 'position ID missed (cube is off the mat)' : (() => { const p = toPositionId(c); return `x ${pad(p.x, 3)}   y ${pad(p.y, 3)}   angle ${pad(p.angle, 3)}°`; })();
    const colliding = now < c.collisionUntil ? 1 : 0, tapped = now < c.tapUntil ? 1 : 0;
    const motor = c.drive ? `target-position control → phase: ${c.drive.phase}` : 'idle';
    $('console-who').textContent = `· ${c.name} · simulated`;
    $('console-out').textContent =
`position ID    ${pos}
standard ID    ${c.card ? c.card.title + ' card' : 'none'}
horizontal     ${c.held ? 0 : 1}
collision      ${colliding}
double-tap     ${tapped}
posture        ${c.held ? '—' : '1 (top upward)'}
shake          ${c.shake}
motor          ${motor}
led            rgb(${c.led.join(', ')})`;
  }

  function select(c) {
    selected = c;
    cubes.forEach(k => k.node.classList.toggle('selected', k === c));
    renderConsole(true);
  }

  /* =====================================================================
     Reading cards
     ===================================================================== */
  let readId = null;
  function showCard(id) {
    readId = id;
    CARDS.forEach(c => c.el.classList.toggle('read', c.id === id));
    $('reader-body').replaceChildren(...panelFor(id).filter(Boolean));
  }
  function readUnder(cube) {
    const c = cardUnder(cube);
    cube.card = c;
    if (c) { showCard(c.id); $('status').textContent = `${cube.name} read the ${c.title} card.`; }
    renderConsole(true);
  }

  /* =====================================================================
     Motion: dragging, driving to a target, collisions
     ===================================================================== */
  let frameWanted = false, running = false, lastT = 0;
  function requestFrame() { frameWanted = true; if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(loop); } }

  function bumpFlags(c, now) { c.collisionUntil = now + 700; }

  function separate(c, now) {         // cubes can't overlap: a collision pushes the other cube away
    const min = cubeSize * 0.98;
    cubes.forEach(o => {
      if (o === c || o.held) return;
      let dx = o.x - c.x, dy = o.y - c.y, d = Math.hypot(dx, dy);
      if (d >= min) return;
      if (d < 0.01) { dx = 1; dy = 0; d = 1; }
      const push = (min - d) + 1;
      o.x = clamp(o.x + (dx / d) * push, cubeSize / 2, matW - cubeSize / 2);
      o.y = clamp(o.y + (dy / d) * push, cubeSize / 2, matH - cubeSize / 2);
      o.angle += (Math.random() - 0.5) * 24; o.dirty = true;
      o.card = cardUnder(o);
      bumpFlags(c, now); bumpFlags(o, now);
    });
  }

  function driveTo(c, tx, ty, finalAngle = 0) {      // like toio's target-position control
    return new Promise(resolve => {
      if (c.drive && c.drive.resolve) c.drive.resolve(false);
      tx = clamp(tx, cubeSize / 2, matW - cubeSize / 2); ty = clamp(ty, cubeSize / 2, matH - cubeSize / 2);
      if (reduceMotion) { c.x = tx; c.y = ty; c.angle = finalAngle; c.drive = null; c.dirty = true; c.held = false; readUnder(c); requestFrame(); resolve(true); return; }
      c.drive = { tx, ty, fa: finalAngle, phase: 'turn', v: 0, resolve };
      c.card = null; requestFrame(); renderConsole(true);
    });
  }

  function stepDrive(c, dt, now) {
    const d = c.drive; if (!d) return;
    const dx = d.tx - c.x, dy = d.ty - c.y, dist = Math.hypot(dx, dy);
    if (d.phase === 'turn') {
      const diff = wrap180((Math.atan2(dy, dx) * 180) / Math.PI - c.angle);
      c.angle += clamp(diff * 7, -560, 560) * dt;
      if (Math.abs(diff) < 2 || dist < 2) d.phase = 'move';
    } else if (d.phase === 'move') {
      const vmax = matW * 0.62;
      d.v = Math.min(d.v + vmax * 2.6 * dt, vmax, 50 + dist * 5.5);
      const step = d.v * dt;
      const want = (Math.atan2(dy, dx) * 180) / Math.PI;
      c.angle += wrap180(want - c.angle) * Math.min(1, dt * 9);
      if (dist <= step + 0.8) { c.x = d.tx; c.y = d.ty; d.phase = 'align'; }
      else { c.x += (dx / dist) * step; c.y += (dy / dist) * step; separate(c, now); }
    } else {
      const diff = wrap180(d.fa - c.angle);
      c.angle += clamp(diff * 8, -560, 560) * dt;
      if (Math.abs(diff) < 1.5) { c.angle = d.fa; const done = d.resolve; c.drive = null; readUnder(c); done(true); }
    }
    c.dirty = true;
  }

  function loop(t) {
    const now = performance.now(), dt = Math.min(0.033, (t - lastT) / 1000 || 0.016); lastT = t;
    let active = false;
    cubes.forEach(c => {
      if (c.drive) { stepDrive(c, dt, now); active = true; }
      if (c.spin > 0) { c.spin -= dt; c.angle += 900 * dt; c.dirty = true; active = true; if (c.spin <= 0) { c.spin = 0; c.angle = Math.round(c.angle / 90) * 90; } }
      // LED shows what the cube is feeling
      let led = c.base;
      if (now < c.tapUntil) led = rainbow(now);
      else if (now < c.collisionUntil) led = [255, 59, 59];
      else if (c.held) led = [255, 255, 255];
      if (led !== c.led && led.some((v, i) => v !== c.led[i])) { c.led = led.slice ? led.slice() : led; c.node.style.setProperty('--led', `rgb(${c.led.join(',')})`); }
      if (now < c.tapUntil || now < c.collisionUntil) active = true;
      if (c.held) active = true;
      if (c.shake && !c.held) { c.shake = 0; }
      if (c.dirty) { c.node.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px) rotate(${c.angle.toFixed(1)}deg)`; c.dirty = false; }
    });
    renderConsole(false);
    if (active || frameWanted) { frameWanted = false; requestAnimationFrame(loop); } else { running = false; renderConsole(true); }
  }

  /* ---------- picking cubes up ---------- */
  cubes.forEach(c => {
    let grab = null, lastTap = 0, lastTapPos = null;
    c.node.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      stopTour();
      try { c.node.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or already captured */ }
      const m = mat.getBoundingClientRect();
      grab = { dx: c.x - (e.clientX - m.left), dy: c.y - (e.clientY - m.top), moved: 0 };
      c.drive && c.drive.resolve(false); c.drive = null;
      c.held = true; c.onMat = false; c.card = null; c.shake = 0; c.shakeFlips = [];
      c.node.classList.add('held'); select(c); requestFrame(); e.preventDefault();
    });
    c.node.addEventListener('pointermove', e => {
      if (!grab || !c.held) return;
      const m = mat.getBoundingClientRect(), now = performance.now();
      const nx = clamp(e.clientX - m.left + grab.dx, cubeSize / 2, matW - cubeSize / 2);
      const ny = clamp(e.clientY - m.top + grab.dy, cubeSize / 2, matH - cubeSize / 2);
      const dx = nx - c.x; grab.moved += Math.hypot(dx, ny - c.y);
      if (Math.abs(dx) > 3 && Math.sign(dx) !== Math.sign(c.lastDx) && c.lastDx !== 0) c.shakeFlips.push(now);   // direction reversals = shaking
      if (Math.abs(dx) > 3) c.lastDx = dx;
      c.shakeFlips = c.shakeFlips.filter(t => now - t < 700);
      c.shake = Math.min(10, c.shakeFlips.length);
      if (Math.hypot(dx, ny - c.y) > 1.5) c.angle += wrap180(((Math.atan2(ny - c.y, dx) * 180) / Math.PI) - c.angle) * 0.18;
      c.x = nx; c.y = ny; c.dirty = true;
      separate(c, now);
      requestFrame();
    });
    const release = e => {
      if (!grab) return;
      const now = performance.now(), wasTap = grab.moved < 6;
      grab = null; c.held = false; c.onMat = true; c.shake = 0; c.node.classList.remove('held');
      try { c.node.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
      // double-tap: two quick taps without dragging
      if (wasTap) {
        if (now - lastTap < 380 && lastTapPos && Math.hypot(c.x - lastTapPos.x, c.y - lastTapPos.y) < 12) { doubleTap(c); lastTap = 0; }
        else { lastTap = now; lastTapPos = { x: c.x, y: c.y }; }
      }
      readUnder(c); requestFrame();
    };
    c.node.addEventListener('pointerup', release);
    c.node.addEventListener('pointercancel', release);

    // keyboard: arrows nudge the cube, Enter or Space double-taps it
    c.node.addEventListener('keydown', e => {
      const step = cubeSize * 0.6, dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (dirs[e.key]) {
        e.preventDefault(); stopTour(); select(c);
        c.x = clamp(c.x + dirs[e.key][0] * step, cubeSize / 2, matW - cubeSize / 2); c.y = clamp(c.y + dirs[e.key][1] * step, cubeSize / 2, matH - cubeSize / 2);
        c.angle = Math.atan2(dirs[e.key][1], dirs[e.key][0]) * 180 / Math.PI; c.dirty = true; separate(c, performance.now());
        readUnder(c); requestFrame();
      } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(c); doubleTap(c); }
    });
    c.node.addEventListener('focus', () => select(c));
  });

  function doubleTap(c) {
    const now = performance.now();
    c.tapUntil = now + 900;
    if (!reduceMotion) c.spin = 0.4;
    select(c); requestFrame();
  }

  /* ---------- sending a cube to a card ---------- */
  function pickCube(target) {
    const idle = cubes.filter(c => !c.held && !c.drive);
    const pool = idle.length ? idle : cubes;
    if (selected && pool.includes(selected)) return selected;
    return pool.slice().sort((a, b) => Math.hypot(a.x - target.cx, a.y - target.cy) - Math.hypot(b.x - target.cx, b.y - target.cy))[0];
  }
  function sendToCard(card) {
    stopTour();
    const r = cardRect(card), spot = spotFor(card);
    const already = cubes.find(c => c.card === card && !c.held);
    if (already) { select(already); showCard(card.id); return Promise.resolve(); }
    const cube = pickCube(r);
    select(cube);
    return driveTo(cube, spot.x, spot.y, 0);
  }

  /* ---------- buttons ---------- */
  function sendHome() {
    const L = LAYOUTS[layoutKey];
    return Promise.all(cubes.map((c, i) => driveTo(c, L.homes[i][0] / 100 * matW, L.homes[i][1] / 100 * matH, 0)));
  }
  $('btn-home').addEventListener('click', () => { stopTour(); sendHome(); });

  const tourBtn = $('btn-tour');
  function stopTour() { if (tourBtn.getAttribute('aria-pressed') === 'true') { tourToken++; tourBtn.setAttribute('aria-pressed', 'false'); tourBtn.textContent = 'Take the tour'; } }
  tourBtn.setAttribute('aria-pressed', 'false');
  tourBtn.addEventListener('click', async () => {
    if (tourBtn.getAttribute('aria-pressed') === 'true') { stopTour(); return; }
    const token = ++tourToken;
    tourBtn.setAttribute('aria-pressed', 'true'); tourBtn.textContent = 'Stop the tour';
    const cube = selected;
    select(cube);
    for (const card of CARDS) {                                  // a route of waypoints, one card at a time
      if (token !== tourToken) return;
      const spot = spotFor(card);
      const ok = await driveTo(cube, spot.x, spot.y, 0);
      if (token !== tourToken || ok === false) return;
      await wait(reduceMotion ? 2600 : 2300);
    }
    if (token !== tourToken) return;
    tourBtn.setAttribute('aria-pressed', 'false'); tourBtn.textContent = 'Take the tour';
    await sendHome(); showCard(null);
  });

  /* =====================================================================
     Start
     ===================================================================== */
  function init() {
    layout(true);
    select(cubes[0]);
    showCard(null);
    renderConsole(true);
  }
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => layout(false), 120); });
  if (document.readyState === 'complete') init(); else addEventListener('load', init);
  // lay out immediately too, so the page is not empty while images load
  layout(true); select(cubes[0]); showCard(null);
})();
