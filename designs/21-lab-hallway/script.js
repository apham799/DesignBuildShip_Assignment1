(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const say = t => { $('status').textContent = t; };

  /* =====================================================================
     The rooms: seven doors down the hall, earliest nearest the entrance, alternating sides.
     d is how far from the entrance the door stands, in px of hallway.
     ===================================================================== */
  const L = 5600;                                   // length of the hall
  const STOPS = [
    { id: 'ug',       name: 'Undergrad',    era: 'Undergrad' },
    { id: 'diver',    name: dv.shortTitle,  era: dv.era },
    { id: 'penpal',   name: pp.title,       era: pp.era, small: true },
    { id: 'axlab',    name: 'AxLab',        era: P.labEra },
    { id: 'mpcs',     name: 'MPCS',         era: 'Master’s begins' },
    { id: 'buoyance', name: bu.title,       era: bu.era },
    { id: 'now',      name: 'Now',          era: 'Second year' }
  ];
  STOPS.forEach((s, k) => { s.k = k; s.d = 800 + k * 620; s.side = k % 2 === 0 ? 'left' : 'right'; });
  const TRAVEL = L - 520;                           // how far you can walk
  const stopC = s => clamp(s.d - 450, 0, TRAVEL);   // where you stand to face a door

  function words(id) {
    if (id === 'ug') return { title: 'Two degrees, in parallel', body: [el('p', { class: 'lead' }, `${bs.title} (${bs.note}) and ${ba.title}.`), el('p', null, 'I double majored in Computer Science and Economics.')] };
    if (id === 'mpcs') return { title: 'Pre-Doctoral MPCS', body: [el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0])] };
    if (id === 'axlab') return { title: P.lab, body: [el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])] };
    if (id === 'now') return { title: P.standing, body: [el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])] };
    const p = project(id);
    return { title: p.title, body: [
      el('p', { class: 'lead' }, p.summary), p.story && el('p', null, p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      p.tags && p.tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, p.tags.map(t => el('li', null, t)))
    ] };
  }
  function photos() {
    // the first photo is wide; the rest fill two columns, each going into whichever is shorter
    const [lead, ...rest] = bu.images, cols = [[], []], heights = [0, 0];
    const fig = img => el('figure', { class: 'photo' }, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(fig(img)); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col))));
  }

  /* ---------- intro, end card ---------- */
  $('kicker').textContent = `${P.role} · ${P.school}`;
  $('name').textContent = P.name;
  $('tagline').textContent = P.tagline;
  $('lab').textContent = `${P.lab}, advised by ${P.advisor}`;
  $('badge').append(el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 }), el('figcaption', null, 'Visitor'));
  $('endMail').textContent = P.contact.email; $('endMail').href = 'mailto:' + P.contact.email;
  $('endLinks').append(link(P.contact.linkedin, 'LinkedIn'), ' · ', link(P.contact.previousSite, 'Previous portfolio'));

  /* =====================================================================
     Build the hall (CSS 3D). Walls, floor and ceiling are big planes; doors and the photo frames sit on the
     walls; hanging signs, a robot and a balloon stand in the air facing you.
     ===================================================================== */
  const world = $('world');
  const wallL = el('div', { class: 'wall left' }), wallR = el('div', { class: 'wall right' });
  const floor = el('div', { class: 'plane floor' }), ceil = el('div', { class: 'plane ceil' });
  const endWall = el('div', { class: 'end-wall' }, el('div', { class: 'end-window' }), el('p', { class: 'exit' }, 'EXIT'));
  world.append(wallL, wallR, floor, ceil, endWall);
  // The big planes are tiled in short segments: browsers clip one huge quad badly where it passes the camera,
  // while short ones stay correct and the one under the camera is far outside the screen.
  const SEG = 400;
  for (let i = 0; i * SEG < L; i++) {
    [wallL, wallR].forEach(w => w.append(el('div', { class: 'wseg', style: `left: ${i * SEG}px; background-position: 0 0, ${-(i * SEG) % 200}px 0, 0 0` })));
    floor.append(el('div', { class: 'fseg', style: `top: ${i * SEG}px` }));
    ceil.append(el('div', { class: 'cseg', style: `top: ${i * SEG}px` }));
  }

  const doors = [], signs = [], spills = [];
  STOPS.forEach(s => {
    const wall = s.side === 'left' ? wallL : wallR;
    const at = s.side === 'left' ? 'left' : 'right';
    const door = el('div', { class: 'door' + (s.small ? ' small' : ''), style: `${at}: ${s.d - 75}px` },
      el('div', { class: 'frame' }, el('div', { class: 'room' }), el('div', { class: 'leaf' }, el('span', { class: 'plate' }, String(s.k + 1)), el('span', { class: 'glass' }), el('span', { class: 'handle' }))));
    wall.append(door);
    // the light spilling out of an open door onto the floor
    const spill = el('div', { class: 'spill ' + s.side, style: `bottom: ${s.d - 90}px` });
    floor.append(spill); spills.push(spill);
    doors.push(door);

    const x = (s.side === 'left' ? -1 : 1) * (s.small ? 150 : 170), z = -s.d;
    const sign = el('button', { type: 'button', class: 'sign' + (s.small ? ' small' : ''), tabindex: '-1', style: `--tx:${x}px; --tz:${z}px` },
      el('span', { class: 'sn' }, String(s.k + 1)), el('span', { class: 'st' }, el('b', null, s.name), el('i', null, s.era)));
    world.append(sign); signs.push(sign);
  });
  // ceiling lights
  for (let d = 380; d < L - 200; d += 560) ceil.append(el('div', { class: 'tube', style: `top: ${d}px` }));
  // photos of the Buoyancé work hang on the wall opposite its door (decoration: the full photos are in the room)
  bu.images.forEach((img, i) => {
    wallL.append(el('div', { class: 'picture', style: `left: ${3400 + i * 235}px` }, el('img', { src: ROOT + img.src, alt: '', 'aria-hidden': 'true', width: img.w, height: img.h, loading: 'lazy' })));
  });
  // a poster by the entrance and the resident robot with its black balloon
  wallR.append(el('div', { class: 'poster', style: 'right: 300px' }, el('span', { class: 'p1' }), el('span', { class: 'p2' }), el('span', { class: 'p3' })));
  world.append(el('div', { class: 'resident', style: '--tz:-2300px' }, el('span', { class: 'rb' }), el('span', { class: 'rt' }), el('span', { class: 'rr' })));

  /* =====================================================================
     Walking: the page scrolls, the hall slides past. Position is smoothed so scrolling feels like a stride.
     ===================================================================== */
  const walk = $('walk');
  let target = 0, cur = 0, focus = 0, lookX = 0, lookY = 0, lookTX = 0, lookTY = 0;

  function sizeWalk() { walk.style.height = (TRAVEL + innerHeight) + 'px'; }
  function readScroll() { target = clamp(scrollY, 0, TRAVEL); }
  addEventListener('scroll', readScroll, { passive: true });
  addEventListener('resize', () => { sizeWalk(); readScroll(); });
  sizeWalk(); readScroll();

  matchMedia('(pointer: fine)').matches && addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    lookTX = (e.clientX / innerWidth - 0.5) * 5;        // a gentle look-around; small, so targets hardly move under the pointer
    lookTY = (e.clientY / innerHeight - 0.5) * -2;
  }, { passive: true });

  const enterBtn = $('enter'), hudRoom = $('hudRoom'), intro = $('intro'), endCard = $('endCard');
  const dirButtons = STOPS.map(s => {
    const b = el('button', { type: 'button', 'aria-label': `Room ${s.k + 1}: ${s.name}. ${s.era}. Walk there.` }, el('span', { class: 'n', 'aria-hidden': 'true' }, String(s.k + 1)), el('span', { class: 't' }, el('b', null, s.name), el('i', null, s.era)));
    b.addEventListener('click', () => walkTo(s.k));
    $('dirList').append(el('li', null, b));
    return b;
  });

  function setFocus(k, announce) {
    focus = k;
    const s = STOPS[k];
    hudRoom.textContent = `Room ${k + 1} of ${STOPS.length} · ${s.name}`;
    enterBtn.textContent = `Enter room ${k + 1} →`;
    enterBtn.setAttribute('aria-label', `Enter room ${k + 1}: ${s.name}`);
    dirButtons.forEach((b, i) => b.setAttribute('aria-current', i === k ? 'true' : 'false'));
    signs.forEach((g, i) => g.classList.toggle('near', i === k));
    if (announce) say(`Room ${k + 1} of ${STOPS.length}: ${s.name}.`);
  }

  let lastFocus = -1, last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    cur = reduceMotion ? target : cur + (target - cur) * Math.min(1, dt * 7);
    if (Math.abs(target - cur) < 0.15) cur = target;
    lookX += (lookTX - lookX) * Math.min(1, dt * 9); lookY += (lookTY - lookY) * Math.min(1, dt * 9);
    if (reduceMotion) { lookX = lookY = 0; }
    world.style.transform = `translateZ(${cur.toFixed(1)}px)`;
    $('rig').style.transform = `rotateY(${lookX.toFixed(2)}deg) rotateX(${lookY.toFixed(2)}deg)`;

    // the door ahead of you is the one the HUD talks about; doors near you stand open
    let best = 0, bd = 1e9;
    STOPS.forEach((s, i) => { const dd = Math.abs(s.d - (cur + 450)); if (dd < bd) { bd = dd; best = i; } });
    if (best !== lastFocus) { lastFocus = best; setFocus(best, false); }
    STOPS.forEach((s, i) => {
      const ahead = s.d - cur, open = ahead < 950 && ahead > -350;
      doors[i].classList.toggle('open', open); spills[i].classList.toggle('on', open);
      // a sign you have walked past would fill the screen, so it fades out as you reach it
      const op = clamp((ahead + 70) / 220, 0, 1);
      signs[i].style.opacity = op.toFixed(2); signs[i].style.visibility = op <= 0.01 ? 'hidden' : 'visible';
    });

    intro.style.opacity = String(clamp(1 - cur / 320, 0, 1)); intro.style.visibility = cur > 330 ? 'hidden' : 'visible';
    const atEnd = cur >= TRAVEL - 200;
    endCard.classList.toggle('show', atEnd);
    document.body.classList.toggle('walking', cur > 40);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function walkTo(k) {
    const y = stopC(STOPS[k]);
    scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    say(`Walking to room ${k + 1}: ${STOPS[k].name}.`);
  }
  $('backUp').addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  enterBtn.addEventListener('click', () => openRoom(focus));

  // arrow keys walk from room to room when nothing else has the focus
  addEventListener('keydown', e => {
    if (dlg.open || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    if (t !== document.body && t !== document.documentElement) return;
    const down = ['ArrowDown', 's', 'S'].includes(e.key), up = ['ArrowUp', 'w', 'W'].includes(e.key);
    if (!down && !up) return;
    e.preventDefault();
    const ahead = STOPS.findIndex(s => stopC(s) > target + 8), behind = STOPS.map(s => stopC(s)).filter(c => c < target - 8).length - 1;
    if (down) { if (ahead >= 0) walkTo(ahead); else scrollTo({ top: TRAVEL, behavior: reduceMotion ? 'auto' : 'smooth' }); }
    else walkTo(Math.max(0, behind));
  });

  /* ---------- the room (the door opens onto the content) ---------- */
  const dlg = $('dlg'), dlgBody = $('dlgBody');
  function renderRoom(k, focusSel) {
    const s = STOPS[k], w = words(s.id), prev = STOPS[k - 1], next = STOPS[k + 1];
    const step = (q, dir) => {
      if (!q) return el('span');
      const b = el('button', { type: 'button', class: 'step ' + dir }, dir === 'prev' ? `← Room ${q.k + 1} · ${q.name}` : `Room ${q.k + 1} · ${q.name} →`);
      b.addEventListener('click', () => { renderRoom(q.k, '.step.' + dir); say(`Room ${q.k + 1} of ${STOPS.length}: ${q.name}.`); });
      return b;
    };
    dlgBody.replaceChildren(...[
      el('p', { class: 'plate-line' }, el('span', { class: 'pn', 'aria-hidden': 'true' }, String(k + 1)), `Room ${k + 1} of ${STOPS.length} · ${s.era}`),
      el('h2', { id: 'dlg-title' }, w.title), w.body, s.id === 'buoyance' && photos(),
      el('div', { class: 'steps' }, step(prev, 'prev'), step(next, 'next'))].flat(Infinity).filter(Boolean));
    if (focusSel) { const b = dlgBody.querySelector(focusSel) || dlgBody.querySelector('.step'); if (b) b.focus({ preventScroll: true }); }
    dlg.querySelector('.dlg-sheet').scrollTop = 0;
  }
  function openRoom(k) { if (dlg.open) return; renderRoom(k); dlg.showModal(); }
  // Clicks on the hall are matched by where the signs and doors are drawn, which stays reliable at every distance
  // (the browser's own hit test misses small, far-away 3D elements).
  const pointIn = (r, x, y) => r.width > 8 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  function roomAt(x, y) {
    for (const i of STOPS.map((_, k) => k).sort((a, b) => signs[b].getBoundingClientRect().width - signs[a].getBoundingClientRect().width)) {
      if (signs[i].style.visibility !== 'hidden' && pointIn(signs[i].getBoundingClientRect(), x, y)) return i;
    }
    for (const i of STOPS.map((_, k) => k).sort((a, b) => doors[b].getBoundingClientRect().width - doors[a].getBoundingClientRect().width)) {
      if (pointIn(doors[i].getBoundingClientRect(), x, y)) return i;
    }
    return -1;
  }
  const viewport = $('viewport');
  viewport.addEventListener('click', e => { const k = roomAt(e.clientX, e.clientY); if (k >= 0) openRoom(k); });
  viewport.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') viewport.style.cursor = roomAt(e.clientX, e.clientY) >= 0 ? 'pointer' : 'default'; });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  function openInfo(title, kicker, body) {
    dlgBody.replaceChildren(el('p', { class: 'plate-line' }, kicker), el('h2', { id: 'dlg-title' }, title), ...body.flat(Infinity).filter(Boolean));
    dlg.showModal();
  }
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.open === 'about') openInfo('About', 'Notice board', [
      el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))]);
    else openInfo('Say hello', 'Front desk', [
      el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
      el('ul', { class: 'links' }, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio')))]);
  }));
  setFocus(0, false);
})();
