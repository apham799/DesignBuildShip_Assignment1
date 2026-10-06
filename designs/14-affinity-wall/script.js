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

  /* =====================================================================
     The notes. Colour is the topic, so a sort by topic gives one colour per cluster.
     Order here is the order things happened, which is also the reading order for screen readers.
     ===================================================================== */
  const TOPICS = {
    hci:  { label: 'Computer science & HCI',        cls: 'c-yellow' },
    act:  { label: 'Actuated & tangible interfaces', cls: 'c-pink' },
    vr:   { label: 'Virtual reality',                cls: 'c-blue' },
    econ: { label: 'Economics',                      cls: 'c-green' }
  };
  const ITEMS = [
    { id: 'bs',       n: 1, topic: 'hci',  time: 'ug', place: 'class', title: bs.title, era: 'Undergrad', blurb: bs.note },
    { id: 'ba',       n: 1, topic: 'econ', time: 'ug', place: 'class', title: ba.title, era: 'Undergrad', blurb: 'I double majored in Computer Science and Economics.' },
    { id: 'diver',    n: 2, topic: 'vr',   time: 'ug', place: 'class', title: dv.title, era: dv.era, blurb: dv.summary },
    { id: 'penpal',   n: 3, topic: 'act',  time: 'ug', place: 'class', title: pp.title, era: pp.era, blurb: pp.summary },
    { id: 'axlab',    n: 4, topic: 'act',  time: 'ug', place: 'lab',   title: 'AxLab', era: P.labEra, blurb: P.labStory },
    { id: 'mpcs',     n: 5, topic: 'hci',  time: 'ms', place: 'prog',  title: 'Pre-Doctoral MPCS', era: 'Master’s begins', blurb: P.program },
    { id: 'buoyance', n: 6, topic: 'act',  time: 'ms', place: 'lab',   title: bu.title, era: bu.era, blurb: bu.summary },
    ...bu.images.map((img, i) => ({ id: 'ph' + i, photo: img, topic: 'act', time: 'ms', place: 'lab', title: img.caption, era: 'Photo' })),
    { id: 'now',      n: 7, topic: 'hci',  time: 'ms', place: 'prog',  title: 'Now', era: 'Second year', blurb: `${P.standing}. Advised by ${P.advisor}.` }
  ];
  const GROUPS = {
    time:  { key: 'time',  names: { ug: 'Undergrad', ms: 'Master’s' }, say: 'time' },
    topic: { key: 'topic', names: Object.fromEntries(Object.entries(TOPICS).map(([k, v]) => [k, v.label])), say: 'topic' },
    place: { key: 'place', names: { class: 'In class', lab: 'In the lab', prog: 'Grad program' }, say: 'place' }
  };
  GROUPS.topic.key = 'topic';

  /* ---------- what each note says when you open it ---------- */
  function detail(it) {
    if (it.photo) return { title: it.photo.caption, body: [el('img', { class: 'big-photo', src: ROOT + it.photo.src, alt: it.photo.alt, width: it.photo.w, height: it.photo.h })] };
    if (it.id === 'bs' || it.id === 'ba') return { title: it.title, era: 'Undergrad', body: [el('p', { class: 'lead' }, `${bs.title} (${bs.note}) and ${ba.title}.`), el('p', null, 'I double majored in Computer Science and Economics.')] };
    if (it.id === 'mpcs') return { title: it.title, era: it.era, body: [el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0])] };
    if (it.id === 'axlab') return { title: P.lab, era: it.era, body: [el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])] };
    if (it.id === 'now') return { title: P.standing, era: it.era, body: [el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])] };
    const p = project(it.id);
    return { title: p.title, era: p.era, body: [
      el('p', { class: 'lead' }, p.summary), p.story && el('p', null, p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      p.tags && p.tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, p.tags.map(t => el('li', null, t)))
    ] };
  }

  const dlg = $('dlg'), dlgBody = $('dlgBody'), dlgNote = $('dlgNote');
  function openDialog(cls, title, era, body) {
    dlgNote.className = 'dlg-note ' + cls;
    dlgBody.replaceChildren(...[era && el('p', { class: 'era' }, era), el('h2', { id: 'dlg-title' }, title), ...body].filter(Boolean));
    dlg.showModal();
  }
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });       // a click on the dimmed area closes it

  /* ---------- the head: headshot, name, sort buttons ---------- */
  $('title').textContent = P.name;
  $('tagline').textContent = P.tagline;
  $('lab').textContent = `${P.lab} · ${P.school}`;
  $('idPhoto').append(el('span', { class: 'pin', 'aria-hidden': 'true' }), el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 }));

  $('legend').append(...Object.values(TOPICS).map(t => el('li', null, el('i', { class: 'sw ' + t.cls, 'aria-hidden': 'true' }), t.label)),
    el('li', null, el('i', { class: 'dot', 'aria-hidden': 'true' }, '3'), 'Number: the order things happened'));

  const MODES = [['time', 'Time'], ['topic', 'Topic'], ['place', 'Place'], ['scatter', 'Scatter']];
  const sortBtns = MODES.map(([mode, label]) => {
    const b = el('button', { type: 'button', class: 'sort', 'data-mode': mode, 'aria-pressed': 'false' }, label);
    b.addEventListener('click', () => layout(mode, { say: true }));
    $('sorts').append(b);
    return b;
  });

  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.open === 'about') openDialog('c-yellow', 'About', 'Notes on me', [
      el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))]);
    else openDialog('c-green', 'Say hello', 'Contact', [
      el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
      el('ul', { class: 'links' }, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio')))]);
  }));

  /* ---------- build the notes ---------- */
  const wall = $('wall');
  let zTop = 10;
  const items = ITEMS.map((it, i) => {
    const node = it.photo ? photoNote(it) : stickyNote(it);
    node.id = 'note-' + it.id;
    node.append(el('span', { class: 'sr-only grp' }));
    wall.append(node);
    const st = { ...it, el: node, i, x: 0, y: 0, r: 0, w: 0, h: 0 };
    const grip = node.querySelector('.grip');
    grip.addEventListener('pointerdown', e => startDrag(st, e));
    grip.addEventListener('keydown', e => moveByKey(st, e));
    return st;
  });
  function gripButton(it) {
    return el('button', { type: 'button', class: 'grip', tabindex: '-1', 'aria-label': `Move the note “${it.title}”. Drag, or use the arrow keys.` });
  }
  function stickyNote(it) {
    const read = el('button', { type: 'button', class: 'open', 'aria-label': `Read the note: ${it.title}` }, 'Read note ', el('span', { 'aria-hidden': 'true' }, '→'));
    read.addEventListener('click', () => { const d = detail(it); openDialog(TOPICS[it.topic].cls, d.title, d.era, d.body); });
    const g = gripButton(it);
    if (it.n) g.append(el('span', { class: 'dot', 'aria-hidden': 'true' }, String(it.n)));
    let foot = read;
    if (it.id === 'buoyance') {
      // the whole note is the toggle for the photo pile under it; Read note stays a separate button on top of it
      const photoIds = ITEMS.filter(p => p.photo).map(p => 'note-' + p.id).join(' ');
      const toggle = el('button', { type: 'button', class: 'open toggle', 'aria-expanded': 'false', 'aria-controls': photoIds });
      toggle.addEventListener('click', () => setPhotos(!photosOpen));
      read.classList.add('read');
      foot = el('div', { class: 'foot' }, toggle, read);
    }
    return el('article', { class: 'note ' + TOPICS[it.topic].cls, 'aria-labelledby': 'h-' + it.id },
      g,
      el('div', { class: 'note-body' },
        el('p', { class: 'era' }, el('span', { class: 'sr-only' }, it.n ? `Stop ${it.n} of 7. ` : ''), it.era),
        el('h3', { id: 'h-' + it.id }, it.title),
        el('p', { class: 'blurb' }, it.blurb)),
      foot);
  }
  function photoNote(it) {
    const open = el('button', { type: 'button', class: 'open', 'aria-label': `Enlarge the photo: ${it.photo.caption}` }, 'Enlarge ', el('span', { 'aria-hidden': 'true' }, '↗'));
    open.addEventListener('click', () => { const d = detail(it); openDialog('c-photo', d.title, 'Photo', d.body); });
    return el('figure', { class: 'note photo' },
      gripButton(it),
      el('img', { src: ROOT + it.photo.src, alt: it.photo.alt, width: it.photo.w, height: it.photo.h, loading: 'lazy', draggable: 'false' }),
      el('figcaption', { id: 'h-' + it.id }, it.photo.caption),
      open);
  }

  /* =====================================================================
     Layout: clusters are packed left to right like a shelf; inside a cluster, notes fill the shortest column.
     Everything is an absolutely placed note moved with a transform, so a re-sort is a slide.
     ===================================================================== */
  let mode = 'time', labels = [], lastW = 0, seed = 7, photosOpen = false;
  const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const byId = id => items.find(it => it.id === id);
  const photos = items.filter(it => it.photo);
  // closed, the four photos are a pile tucked under the Buoyancé note, each a little further down and askew
  const PILE = [{ dx: -7, dy: 7, r: -4 }, { dx: 9, dy: 14, r: 3 }, { dx: -4, dy: 21, r: -2 }, { dx: 7, dy: 28, r: 5 }];
  const PILE_EXTRA = 40;                                     // room the pile needs below the note
  const place = (it, x, y, r) => {
    it.x = x; it.y = y; it.r = r;
    it.el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
    if (it.id === 'buoyance' && !photosOpen) tuck();
  };
  function tuck() {
    const bu = byId('buoyance');
    photos.forEach((p, k) => {
      const o = PILE[k % PILE.length];
      p.x = bu.x + o.dx; p.y = bu.y + o.dy; p.r = bu.r + o.r;
      p.el.style.transition = bu.el.classList.contains('drag') ? 'none' : '';      // the pile follows a drag without lagging
      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`;
    });
  }
  function labelToggle() {
    const t = byId('buoyance').el.querySelector('.toggle');
    t.setAttribute('aria-expanded', String(photosOpen));
    t.setAttribute('aria-label', photosOpen ? 'Hide the four photos under this note' : 'Show the four photos under this note');
    t.replaceChildren(photosOpen ? 'Hide photos ' : `Show ${photos.length} photos `, el('span', { 'aria-hidden': 'true' }, photosOpen ? '↑' : '↓'));
  }
  function setPhotos(open) {
    photosOpen = open;
    labelToggle();
    $('status').textContent = open ? 'The four Buoyancé photos are spread out on the wall.' : 'The Buoyancé photos are tucked back under the note.';
    layout(mode);
  }

  function layout(next, opts = {}) {
    mode = next;
    const W = wall.clientWidth, narrow = W < 520;
    const pad = narrow ? 12 : 28, gap = narrow ? 14 : 20, nw = narrow ? Math.min(W - 2 * pad - 16, 300) : 212;   // narrow: leave room for the tilt
    wall.style.setProperty('--nw', nw + 'px');
    items.forEach(it => { it.el.style.height = ''; it.el.style.zIndex = ''; });
    items.forEach(it => { it.w = nw; it.h = it.el.offsetHeight; it.packH = it.h; });
    const bu = byId('buoyance'), bs = byId('bs'), ba = byId('ba');
    if (!photosOpen) bu.packH = bu.h + PILE_EXTRA;
    photos.forEach(p => { p.el.classList.toggle('stacked', !photosOpen); p.el.inert = !photosOpen; p.el.setAttribute('aria-hidden', String(!photosOpen)); });
    const live = items.filter(it => photosOpen || !it.photo);          // closed photos take no place of their own
    labels.forEach(l => l.remove()); labels = [];
    let bottom = pad;

    if (mode === 'scatter') {
      const cell = nw + 40, cols = Math.max(1, Math.floor((W - 2 * pad + 40) / cell));
      const order = live.map((_, i) => i).sort(() => rng() - 0.5);
      let y = pad;
      for (let r = 0; r * cols < order.length; r++) {
        const row = order.slice(r * cols, r * cols + cols);
        row.forEach((idx, c) => place(live[idx], (narrow ? (W - nw) / 2 : pad + c * cell) + (rng() - 0.5) * (narrow ? 8 : 16), y + (rng() - 0.5) * 16, (rng() - 0.5) * 8));
        y += Math.max(...row.map(idx => live[idx].packH)) + 40;
      }
      bottom = y - 40 + pad;
      live.forEach(it => { it.el.querySelector('.grp').textContent = ' Not grouped.'; });
    } else {
      const g = GROUPS[mode];
      const names = Object.keys(g.names).filter(k => live.some(it => it[g.key] === k));
      const maxCols = Math.max(1, Math.floor((W - 2 * pad + gap) / (nw + gap)));
      let x = pad, y = pad, rowH = 0;
      names.forEach(name => {
        const members = live.filter(it => it[g.key] === name);
        const want = members.length <= 1 ? 1 : members.length <= 6 ? 2 : 3;
        const cols = Math.min(want, maxCols), cw = cols * nw + (cols - 1) * gap;
        if (x > pad && x + cw > W - pad + 1) { x = pad; y += rowH + 36; rowH = 0; }
        if (narrow) x = Math.round((W - cw) / 2);
        const label = el('div', { class: 'label', 'aria-hidden': 'true' }, g.names[name]);
        label.style.width = cw + 'px'; label.style.transform = `translate(${x}px, ${y}px)`;
        wall.append(label); labels.push(label);
        const lh = label.offsetHeight, top = y + lh + 16, colY = Array(cols).fill(top);
        let rest = members;
        if (members.includes(bs) && members.includes(ba)) {
          // the two degrees were one double major, so the notes overlap a little (the second sits over the first's empty lower right corner)
          rest = members.filter(it => it !== bs && it !== ba);
          if (cols >= 2) {
            place(bs, x, top, -1.2); place(ba, x + nw - 26, top + 40, 1.6);     // low enough to leave the first note's number dot showing
            colY[0] = colY[1] = top + Math.max(bs.packH, ba.packH + 40) + gap;
          } else {
            place(bs, x, top, -1); place(ba, x + 12, top + bs.packH - 6, 1.4);
            colY[0] = top + bs.packH - 6 + ba.packH + gap;
          }
        }
        rest.forEach(it => {
          const c = colY.indexOf(Math.min(...colY));
          place(it, x + c * (nw + gap), colY[c], ((it.i * 37) % 11 - 5) * 0.45);
          colY[c] += it.packH + gap;
        });
        members.forEach(it => { it.el.querySelector('.grp').textContent = ` Group: ${g.names[name]}.`; });
        rowH = Math.max(rowH, Math.max(...colY) - gap - y);
        x += cw + 40;
      });
      bottom = y + rowH + pad;
    }
    if (!photosOpen) {
      photos.forEach(p => { p.h = bu.h; p.el.style.height = bu.h + 'px'; p.el.style.zIndex = 1; p.el.querySelector('.grp').textContent = ' Tucked under the Buoyancé note.'; });
      bu.el.style.zIndex = 2;
      tuck();
    }
    wall.style.height = Math.ceil(bottom) + 'px';
    lastW = W;
    sortBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    requestAnimationFrame(() => labels.forEach(l => l.classList.add('show')));
    if (opts.say) {
      const g = GROUPS[mode];
      $('status').textContent = mode === 'scatter' ? 'The notes are scattered across the wall.'
        : `Sorted by ${g.say}: ` + Object.keys(g.names).filter(k => live.some(it => it[g.key] === k)).map(k => `${g.names[k]} (${live.filter(it => it[g.key] === k).length})`).join(', ') + '.';
    }
  }

  /* ---------- dragging, by the strip at the top of each note ---------- */
  function growWall() {
    const bottom = Math.max(...items.map(it => it.y + it.h)) + 28;
    if (bottom > wall.offsetHeight) wall.style.height = Math.ceil(bottom) + 'px';
  }
  function startDrag(it, e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    const grip = e.currentTarget, box = wall.getBoundingClientRect();
    const offX = e.clientX - box.left - it.x, offY = e.clientY - box.top - it.y;
    grip.setPointerCapture(e.pointerId);
    it.el.classList.add('drag'); it.el.style.zIndex = ++zTop;
    const move = ev => {
      const b = wall.getBoundingClientRect();
      place(it, clamp(ev.clientX - b.left - offX, 0, wall.clientWidth - it.w), Math.max(0, ev.clientY - b.top - offY), it.r);
    };
    const end = () => {
      grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', end); grip.removeEventListener('pointercancel', end);
      it.el.classList.remove('drag'); growWall();
    };
    grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
  }
  function moveByKey(it, e) {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d) return;
    e.preventDefault();
    const s = e.shiftKey ? 60 : 20;
    place(it, clamp(it.x + d[0] * s, 0, wall.clientWidth - it.w), Math.max(0, it.y + d[1] * s), it.r);
    it.el.style.zIndex = ++zTop; growWall();
  }

  labelToggle();

  /* ---------- start: a pile of notes, then the first sort ---------- */
  if (reduceMotion) layout('time');
  else {
    wall.classList.add('instant');
    layout('scatter');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wall.classList.remove('instant');
      setTimeout(() => layout('time'), 500);
    }));
  }
  // a new width means a new layout (this resets any notes you moved); a new height alone does not
  new ResizeObserver(() => { if (wall.clientWidth !== lastW) layout(mode); }).observe(wall);
})();
