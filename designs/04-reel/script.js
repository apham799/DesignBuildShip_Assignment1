(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reelMode = matchMedia('(min-width: 900px) and (min-height: 660px)');

  const reel = document.getElementById('reel');
  const stage = document.getElementById('stage');
  const track = document.getElementById('track');
  const ropeSvg = document.getElementById('rope');
  const rigSvg = document.getElementById('rig');
  const rulerList = document.getElementById('ruler-list');
  const clouds = [...document.querySelectorAll('.cloud')];

  /* ---------- helpers ---------- */
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
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* =====================================================================
     The cards that hang on the rope
     ===================================================================== */
  const cards = [];   // { id, el, left, w, angle, omega, mass }
  const clip = () => el('span', { class: 'clip', 'aria-hidden': 'true' });
  function addCard(id, node, mass = 1) {
    node.id = id;
    node.prepend(clip());
    track.append(node);
    cards.push({ id, el: node, left: 0, w: 0, angle: 0, omega: 0, mass });
  }
  const photoFig = (img, extra) => el('figure', { class: 'card polaroid ' + (extra || '') },
    el('img', { src: ROOT + img.src, alt: img.alt, width: img.w, height: img.h, loading: 'lazy' }),
    el('figcaption', null, img.caption));

  const buoyance = project('buoyance'), penpal = project('penpal'), diver = project('diver');

  addCard('hello', el('article', { class: 'card hello' },
    el('p', { class: 'eyebrow' }, `${P.role} · ${P.school}`),
    el('h1', null, P.name),
    el('p', { class: 'standing' }, P.standing),
    el('p', { class: 'lab' }, `${P.lab}, advised by ${P.advisor}`),
    el('p', { class: 'lead' }, P.about[2]),
    el('p', { class: 'hint', id: 'hint' }, 'Scroll to reel in the rest →')), 1.2);

  const portrait = el('figure', { class: 'card polaroid portrait' },
    el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 }),
    el('figcaption', null, P.name));
  addCard('portrait', portrait, 0.9);

  addCard('buoyance', el('article', { class: 'card buoyance' },
    el('p', { class: 'kicker' }, buoyance.kicker),
    el('h2', null, buoyance.title),
    el('p', null, buoyance.summary),
    buoyance.story && el('p', { class: 'story' }, buoyance.story),
    el('p', { class: 'cite' }, `${buoyance.publication.authors}. `, el('i', null, buoyance.publication.title), `. ${buoyance.publication.venue}.`),
    el('ul', { class: 'links', 'aria-label': 'Buoyancé links' }, buoyance.links.map(l => el('li', null, link(l.url, l.label)))),
    el('ul', { class: 'chips', 'aria-label': 'Topics' }, buoyance.tags.map(t => el('li', null, t)))), 1.6);

  const shapes = ['wide', 'wide', 'tall', 'wide'];
  buoyance.images.forEach((img, i) => addCard('photo-' + i, photoFig(img, shapes[i]), 1));

  const tag = (p, extra) => el('article', { class: 'card tag' },
    el('p', { class: 'kicker' }, p.era || p.kicker),
    el('h2', null, p.title),
    el('p', null, p.summary),
    p.story && el('p', { class: 'story' }, p.story),
    p.tags && p.tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, p.tags.map(t => el('li', null, t))));
  addCard('penpal', tag(penpal), 0.9);
  addCard('diver', tag(diver), 0.9);

  addCard('about', el('article', { class: 'card about' },
    el('p', { class: 'kicker' }, 'About'),
    el('h2', null, P.name),
    el('p', { class: 'lead' }, P.about[0]),
    el('p', null, P.about[1]),
    el('dl', { class: 'facts' },
      el('dt', null, 'Program'), el('dd', null, P.program),
      el('dt', null, 'Undergrad'), el('dd', null, P.undergrad),
      el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`),
      el('dt', null, 'Published'), el('dd', null, link(buoyance.links[0].url, `${buoyance.title}, ${buoyance.publication.venue}`)))), 1.4);

  addCard('contact', el('article', { class: 'card ticket' },
    el('p', { class: 'kicker' }, 'End of the line'),
    el('h2', null, 'Contact'),
    link('mailto:' + P.contact.email, P.contact.email),
    el('ul', { class: 'links', 'aria-label': 'Elsewhere' },
      el('li', null, link(P.contact.linkedin, 'LinkedIn')),
      el('li', null, link(P.contact.previousSite, 'Previous portfolio'))),
    el('p', { class: 'foot' }, el('a', { href: '../../index.html' }, '← Back to the design log'))), 1);
  cards[cards.length - 1].el.querySelector('a[href^="mailto:"]').className = 'mail';

  const byId = Object.fromEntries(cards.map(c => [c.id, c]));

  /* ---------- the ruler: jump along the tether ---------- */
  const STOPS = [
    ['hello', 'Hello', ['hello', 'portrait']], ['buoyance', 'Buoyancé', ['buoyance']],
    ['photo-0', 'Photos', ['photo-0', 'photo-1', 'photo-2', 'photo-3']], ['penpal', 'PenPal', ['penpal']],
    ['diver', 'Diver Sim', ['diver']], ['about', 'About', ['about']], ['contact', 'Contact', ['contact']]
  ];
  const stopButtons = STOPS.map(([target, label, group]) => {
    const b = el('button', { type: 'button' }, label);
    b.addEventListener('click', () => goTo(target));
    rulerList.append(el('li', null, b));
    return { b, group };
  });

  /* =====================================================================
     Reel mode (desktop): vertical scroll winds the rope horizontally
     ===================================================================== */
  let on = false, W = 0, H = 0, ropeY = 0, maxX = 0, reelTop = 0, sagDepth = 56;
  let drum = null, twist = null;
  let lastX = 0, lastT = performance.now(), p = 0;

  const sagAt = sx => {                     // a gentle catenary-ish curve: lowest in the middle of the screen
    const t = (2 * sx) / W - 1;
    return sx <= 0 || sx >= W ? 0 : sagDepth * (1 - t * t);
  };

  function buildRope() {
    ropeSvg.replaceChildren();
    const pts = [];
    for (let x = 96; x <= W + 20; x += 24) pts.push(`${x},${(ropeY + sagAt(x)).toFixed(1)}`);
    const d = 'M' + pts.join(' L');
    ropeSvg.append(svg('path', { class: 'strand', d }));
    twist = svg('path', { class: 'twist', d });
    ropeSvg.append(twist);
  }

  function buildRig() {
    rigSvg.replaceChildren();
    const cx = 96, cy = ropeY + 36, floor = H - 70;
    const g = svg('g');
    // mast and braces
    g.append(svg('line', { x1: cx, y1: cy, x2: cx, y2: floor - 36, stroke: '#2a2420', 'stroke-width': 8, 'stroke-linecap': 'round' }));
    g.append(svg('line', { x1: cx - 46, y1: floor - 36, x2: cx, y2: cy + 120, stroke: '#2a2420', 'stroke-width': 4, 'stroke-linecap': 'round' }));
    g.append(svg('line', { x1: cx + 46, y1: floor - 36, x2: cx, y2: cy + 120, stroke: '#2a2420', 'stroke-width': 4, 'stroke-linecap': 'round' }));
    // robot base with two wheels
    g.append(svg('rect', { x: cx - 62, y: floor - 44, width: 124, height: 40, rx: 10, fill: '#1c2230' }));
    g.append(svg('rect', { x: cx - 40, y: floor - 36, width: 18, height: 6, rx: 3, fill: '#e5503a' }));
    [-38, 38].forEach(dx => {
      g.append(svg('circle', { cx: cx + dx, cy: floor + 4, r: 17, fill: '#2a2420' }));
      g.append(svg('circle', { cx: cx + dx, cy: floor + 4, r: 9, fill: '#dcbf8f' }));
    });
    // the drum the rope winds onto
    drum = svg('g');
    drum.append(svg('circle', { cx, cy, r: 36, fill: '#e9d8b4', stroke: '#2a2420', 'stroke-width': 6 }));
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      drum.append(svg('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * 30, y2: cy + Math.sin(a) * 30, stroke: '#2a2420', 'stroke-width': 4, 'stroke-linecap': 'round' }));
    }
    drum.append(svg('circle', { cx, cy, r: 8, fill: '#e5503a' }));
    drum.dataset.cx = cx; drum.dataset.cy = cy;
    g.append(drum);
    rigSvg.append(g);
  }

  function layout() {
    on = reelMode.matches;
    document.body.classList.toggle('is-reel', on);
    if (!on) {
      reel.style.height = '';
      track.style.transform = '';
      cards.forEach(c => { c.el.style.transform = ''; });
      return;
    }
    W = innerWidth; H = innerHeight;
    ropeY = Math.round(H * (H < 800 ? 0.17 : 0.22));      // a higher rope on short screens leaves more room below
    stage.style.setProperty('--rope-y', ropeY + 'px');
    sagDepth = Math.min(64, H * 0.07);
    buildRope(); buildRig();
    const trackW = track.scrollWidth;
    maxX = Math.max(0, trackW - W);
    reel.style.height = (maxX + H) + 'px';
    reelTop = reel.getBoundingClientRect().top + scrollY;
    cards.forEach(c => { c.left = c.el.offsetLeft; c.w = c.el.offsetWidth; });
    lastX = -clamp(scrollY - reelTop, 0, maxX);
  }

  function goTo(id, behavior) {
    const c = byId[id];
    if (!c) return;
    if (!on) { c.el.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    const target = clamp(c.left + c.w / 2 - W * 0.5, 0, maxX);
    scrollTo({ top: reelTop + target, behavior: behavior || (reduceMotion ? 'auto' : 'smooth') });
  }

  // The stage and track are clipped, not scrollable. Browsers still scroll them to reveal a focused element,
  // which would knock the whole scene out of place, so pin them and reel the page ourselves instead.
  const trackwrap = document.querySelector('.trackwrap');
  [stage, trackwrap].forEach(n => n.addEventListener('scroll', () => { n.scrollLeft = 0; n.scrollTop = 0; }));

  // keyboard users: focusing something on a card reels that card into view
  track.addEventListener('focusin', e => {
    if (!on) return;
    stage.scrollLeft = 0; trackwrap.scrollLeft = 0;
    const c = cards.find(k => k.el.contains(e.target));
    if (!c) return;
    const sx = c.left - p;
    if (sx < 200 || sx + c.w > W - 20) goTo(c.id, 'auto');
  });

  // sideways trackpad swipes reel too
  addEventListener('wheel', e => {
    if (on && Math.abs(e.deltaX) > Math.abs(e.deltaY)) { scrollBy(0, e.deltaX); e.preventDefault(); }
  }, { passive: false });

  /* ---------- per-frame: wind the rope, swing the cards ---------- */
  const hint = document.getElementById('hint');
  function frame(t) {
    requestAnimationFrame(frame);
    if (!on) return;
    const dt = Math.min(0.033, (t - lastT) / 1000) || 0.016; lastT = t;
    p = clamp(scrollY - reelTop, 0, maxX);
    const x = -p;
    const vx = (x - lastX) / dt; lastX = x;           // px per second; negative while you scroll down

    track.style.transform = `translate3d(${x}px,0,0)`;
    if (drum) drum.setAttribute('transform', `rotate(${((p / 213) * 360).toFixed(1)} ${drum.dataset.cx} ${drum.dataset.cy})`);
    if (twist) twist.style.strokeDashoffset = String(p % 18);
    if (!reduceMotion) clouds.forEach((c, i) => { c.style.transform = `translate3d(${-p * (0.05 + i * 0.035)}px,0,0)`; });
    if (hint) hint.classList.toggle('gone', p > 40);

    let nearest = null, best = Infinity;
    for (const c of cards) {
      const sx = c.left + x + c.w / 2;                 // where the card's centre is on screen
      const dy = sagAt(sx);
      if (!reduceMotion) {                             // pendulum: scrolling swings each card on its clip
        const k = 60, damp = 4, push = 0.17 / c.mass;
        const acc = -k * c.angle - damp * c.omega + push * vx;
        c.omega += acc * dt; c.angle += c.omega * dt;
        c.angle = clamp(c.angle, -14, 14);
      }
      c.el.style.transform = `translate3d(0,${dy.toFixed(1)}px,0) rotate(${c.angle.toFixed(2)}deg)`;
      const d = Math.abs(sx - W * 0.5);
      if (d < best) { best = d; nearest = c; }
    }
    if (nearest) stopButtons.forEach(s => s.b.setAttribute('aria-current', String(s.group.includes(nearest.id))));
  }

  layout();
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });
  reelMode.addEventListener('change', layout);
  addEventListener('load', layout);                    // photos change card heights, so measure again once loaded
  requestAnimationFrame(frame);
})();
