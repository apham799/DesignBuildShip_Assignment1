(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => v != null && n.setAttribute(k, v));
    kids.flat(Infinity).forEach(k => { if (k != null && k !== false) n.append(k); });
    return n;
  }
  // a small curly arrow for the margin notes (it has to be created in the SVG namespace)
  const curl = d => { const s = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path'); s.setAttribute('viewBox', '0 0 60 40'); s.setAttribute('focusable', 'false'); p.setAttribute('d', d); s.append(p); return s; };
  const link = (href, label) => el('a', { href, target: '_blank', rel: 'noopener' }, label);
  const project = id => P.projects.find(p => p.id === id);
  const bs = P.degrees.find(d => d.id === 'bs'), ba = P.degrees.find(d => d.id === 'ba');
  const bu = project('buoyance'), pp = project('penpal'), dv = project('diver');

  // a highlighter stroke under the phrases that matter (a real <mark>, so it also reads as emphasis)
  function hl(text, ...phrases) {
    const re = new RegExp('(' + phrases.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')');
    return text.split(re).map((part, i) => i % 2 ? el('mark', null, part) : part);
  }

  /* =====================================================================
     The doodles: every line is one <path class="ln" pathLength="1">, so a single CSS rule can "draw" any of them (a class, because Chrome does not restyle an attribute selector on pathLength when an ancestor class changes).
     ===================================================================== */
  const arc = (cx, cy, rx, ry = rx) => `M${cx - rx},${cy}a${rx},${ry} 0 1,0 ${2 * rx},0a${rx},${ry} 0 1,0 ${-2 * rx},0`;
  const ln = (d, cls = '') => `<path pathLength="1" class="ln ${cls}" d="${d}"/>`;
  const fl = (d, cls = 'hl') => `<path class="fl ${cls}" d="${d}"/>`;
  const doodle = (...parts) => `<svg class="doodle" viewBox="0 0 320 240" aria-hidden="true" focusable="false">${parts.join('')}</svg>`;
  const rays = (cx, cy, r1, r2, skipDown) => Array.from({ length: 12 }, (_, i) => {
    const a = i * Math.PI / 6, c = Math.cos(a), s = Math.sin(a);
    if (skipDown && s > 0.9) return '';
    return ln(`M${(cx + c * r1).toFixed(1)},${(cy + s * r1).toFixed(1)}L${(cx + c * r2).toFixed(1)},${(cy + s * r2).toFixed(1)}`);
  }).join('');

  const DOODLES = {
    // two degrees: books for the first, code brackets and a rising chart for the second
    ug: doodle(
      fl('M24,142 L156,138 L158,200 L22,200 Z'),
      ln('M28,196 L150,196 L150,170 L28,170 Z'), ln('M42,170 V196'), ln('M60,183 H130'),
      ln('M38,168 L40,142 L138,140 L136,168'), ln('M52,155 H118'),
      ln('M188,62 L158,90 L188,118'), ln('M262,62 L292,90 L262,118'), ln('M238,52 L214,126'),
      ln('M186,206 V150 M186,206 H300'), ln('M194,196 Q214,190 226,172 T256,160 T294,132'), ln('M280,128 L294,132 L290,146', 'rd')),
    // a VR headset above the waves
    diver: doodle(
      fl(arc(112, 120, 22), 'hl'), fl(arc(208, 120, 22), 'hl'),
      ln('M64,96 Q64,80 80,80 H240 Q256,80 256,96 V148 Q256,164 240,164 H208 Q196,164 190,150 Q184,138 160,138 Q136,138 130,150 Q124,164 112,164 H80 Q64,164 64,148 Z'),
      ln(arc(112, 120, 22)), ln(arc(208, 120, 22)),
      ln('M104,80 Q160,46 216,80'), ln('M64,104 Q40,106 34,128'), ln('M256,104 Q280,106 286,128'),
      ln('M14,204 q20,-14 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0'), ln('M30,226 q20,-12 40,0 t40,0 t40,0 t40,0 t40,0 t40,0'),
      ln('M30,176 q16,-14 32,0 q-16,14 -32,0 Z'), ln('M62,176 l10,-9 v18 z'),
      ln(arc(288, 60, 6), 'rd'), ln(arc(300, 34, 9), 'rd'), ln(arc(274, 26, 4), 'rd')),
    // a pen leaving a trail, standing on a spring
    penpal: doodle(
      fl('M110,200 L122,172 L252,42 L268,58 L138,188 Z'),
      ln('M110,200 L122,172 L252,42 L268,58 L138,188 Z'), ln('M122,172 L138,188'), ln('M239,55 L255,71'),
      ln('M110,200 C96,216 80,186 62,200 S30,216 16,198', 'rd'),
      ln('M210,212 l8,-16 l8,16 l8,-16 l8,16 l8,-16'), ln('M200,216 H266')),
    // a small robot, a sparking sky and a flask: the lab
    axlab: doodle(
      fl('M243.5,158 H294.5 L300,170 Q306,184 292,184 H246 Q232,184 238,170 Z'),
      ln('M104,138 Q104,132 110,132 H210 Q216,132 216,138 V186 Q216,192 210,192 H110 Q104,192 104,186 Z'),
      ln(arc(124, 200, 12)), ln(arc(196, 200, 12)), ln('M160,132 V104'), ln(arc(160, 96, 8)),
      ln(arc(136, 158, 6)), ln(arc(184, 158, 6)), ln('M140,174 Q160,186 180,174'), ln('M104,150 H92 M216,150 H228'),
      ln('M64,92 l16,12 M54,126 l20,2 M70,60 l12,18', 'rd'),
      ln('M262,70 V118 L238,170 Q232,184 246,184 H292 Q306,184 300,170 L276,118 V70'), ln('M254,70 H284'),
      ln(arc(266, 172, 4)), ln(arc(280, 166, 3))),
    // a laptop in front of a skyline
    mpcs: doodle(
      fl('M40,110 h120 v70 h-120 z'),
      ln('M40,110 h120 v70 h-120 z'), ln('M26,182 h148 l-10,12 h-128 z'), ln('M54,128 h50 M54,144 h76 M54,160 h38'), ln('M100,160 v10', 'rd'),
      ln('M196,196 V70 h30 V196'), ln('M204,70 v-28 M218,70 v-20'), ln('M204,100 h14 M204,124 h14 M204,148 h14'),
      ln('M240,196 L246,96 h22 L274,196'), ln('M280,196 V120 h20 V196'), ln('M14,196 H306')),
    // balloons tethered to robots
    buoyance: doodle(
      fl(arc(70, 66, 26, 32), 'ink'), fl(arc(160, 44, 26, 32), 'ink'), fl(arc(250, 74, 26, 32), 'ink'),
      ln(arc(70, 66, 26, 32)), ln(arc(160, 44, 26, 32)), ln(arc(250, 74, 26, 32)),
      ln('M56,52 q4,-8 12,-10', 'sh'), ln('M146,30 q4,-8 12,-10', 'sh'), ln('M236,60 q4,-8 12,-10', 'sh'),
      ln('M66,99 L70,106 L74,99'), ln('M156,77 L160,84 L164,77'), ln('M246,107 L250,114 L254,107'),
      ln('M70,106 C58,126 84,146 70,174'), ln('M160,84 C148,110 172,140 160,174'), ln('M250,114 C238,136 262,152 250,174'),
      ln('M52,174 h36 v16 h-36 z'), ln('M142,174 h36 v16 h-36 z'), ln('M232,174 h36 v16 h-36 z'),
      ln(arc(60, 196, 5)), ln(arc(80, 196, 5)), ln(arc(150, 196, 5)), ln(arc(170, 196, 5)), ln(arc(240, 196, 5)), ln(arc(260, 196, 5)),
      ln('M14,202 H306')),
    // the glowing balloon, still going
    now: doodle(
      fl('M160,40 C196,40 206,76 192,102 C184,116 172,126 160,130 C148,126 136,116 128,102 C114,76 124,40 160,40 Z', 'hl'),
      ln('M160,40 C196,40 206,76 192,102 C184,116 172,126 160,130 C148,126 136,116 128,102 C114,76 124,40 160,40 Z'), ln('M142,62 q6,-12 18,-14', 'sh2'),
      rays(160, 84, 62, 80, true),
      ln('M155,131 L160,139 L165,131'), ln('M160,139 C140,150 180,160 160,172 S150,182 160,190'),
      ln('M134,190 h52 v18 h-52 z'), ln(arc(146, 214, 6)), ln(arc(174, 214, 6)), ln('M110,222 H210'))
  };

  /* =====================================================================
     The seven stops, in the order things happened
     ===================================================================== */
  const STOPS = [
    { id: 'ug',       short: 'Undergrad', era: 'Undergrad',       note: 'CS + Econ, side by side' },
    { id: 'diver',    short: dv.shortTitle, era: dv.era,          note: 'the first one' },
    { id: 'penpal',   short: pp.title,     era: pp.era,           note: 'after Diver Sim, before AxLab' },
    { id: 'axlab',    short: 'AxLab',      era: P.labEra,         note: 'advised by Prof. Nakagaki' },
    { id: 'mpcs',     short: 'MPCS',       era: 'Master’s begins', note: 'Pre-Doctoral, second year' },
    { id: 'buoyance', short: bu.title,     era: bu.era,           note: 'UIST 2025!' },
    { id: 'now',      short: 'Now',        era: 'Second year',    note: 'you are here' }
  ];
  STOPS.forEach((s, k) => { s.k = k; });

  function words(id) {
    if (id === 'ug') return { title: 'Two degrees, in parallel', body: [el('p', { class: 'lead' }, hl(`${bs.title} (${bs.note}) and ${ba.title}.`, bs.note)), el('p', null, 'I double majored in Computer Science and Economics.')] };
    if (id === 'mpcs') return { title: 'Pre-Doctoral MPCS', body: [el('p', { class: 'lead' }, hl(P.program + '.', 'Pre-Doctoral')), el('p', null, P.about[0])] };
    if (id === 'axlab') return { title: P.lab, body: [el('p', { class: 'lead' }, hl(P.labStory, 'AxLab')), el('p', null, P.about[1])] };
    if (id === 'now') return { title: P.standing, body: [el('p', { class: 'lead' }, hl(`Advised by ${P.advisor} at the ${P.lab}.`, P.advisor)), el('p', null, hl(P.about[2], 'ACM UIST 2025'))] };
    const p = project(id);
    return { title: p.title, body: [
      el('p', { class: 'lead' }, id === 'buoyance' ? hl(p.summary, '20 m or more') : id === 'diver' ? hl(p.summary, 'virtual reality') : hl(p.summary, 'Actuated user interfaces')),
      p.story && el('p', null, id === 'buoyance' ? hl(p.story, 'published during my master’s') : p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      p.tags && p.tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, p.tags.map(t => el('li', null, t)))
    ] };
  }

  /* ---------- the cover ---------- */
  $('eyebrow').textContent = 'A research notebook · read down: earlier ↓ later';
  $('title').textContent = P.name;
  $('tagline').textContent = P.tagline;
  $('lab').textContent = `${P.lab} · ${P.school}`;
  $('portrait').append(
    el('div', { class: 'mount' }, el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 })),
    el('span', { class: 'hi', 'aria-hidden': 'true' }, curl('M54,34 C38,36 22,26 14,8 M6,16 L14,6 L22,14'), 'hi!'));

  // the contents: seven numbered bubbles joined by a squiggle, each one a link to its page
  const routeList = el('ol');
  STOPS.forEach(s => routeList.append(el('li', null,
    el('a', { href: '#page-' + s.id, 'aria-label': `Page ${s.k + 1} of ${STOPS.length}: ${s.short}. ${s.era}.` },
      el('span', { class: 'bubble', 'aria-hidden': 'true' }, String(s.k + 1)),
      el('span', { class: 'lbl' }, s.short)))));
  $('route').append(el('p', { class: 'route-title', 'aria-hidden': 'true' }, 'contents · earlier', el('i'), 'later'), routeList);

  /* ---------- the seven pages ---------- */
  const pages = $('pages');
  const trail = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  trail.setAttribute('class', 'trail'); trail.setAttribute('aria-hidden', 'true'); trail.setAttribute('focusable', 'false');
  trail.innerHTML = '<path class="guide"/><path class="drawn"/><circle class="tip" r="5"/>';
  pages.append(trail);

  const bubbles = [];
  STOPS.forEach(s => {
    const w = words(s.id), flip = s.k % 2 === 1;
    const bubble = el('span', { class: 'bubble big' + (s.id === 'now' ? ' now' : ''), 'aria-hidden': 'true' }, String(s.k + 1));
    bubbles.push(bubble);
    const sketch = el('div', { class: 'sketch' });
    sketch.insertAdjacentHTML('beforeend', DOODLES[s.id]);
    if (s.id === 'axlab') sketch.append(el('img', { class: 'sticker', src: ROOT + 'assets/img/axlab-logo-black.png', alt: 'AxLab logo', width: 3003, height: 1071, loading: 'lazy' }));
    sketch.append(el('p', { class: 'note', 'aria-hidden': 'true' }, curl('M54,34 C38,36 22,26 14,8 M6,16 L14,6 L22,14'), s.note));
    const kids = [
      bubble,
      el('div', { class: 'words' },
        el('p', { class: 'when' }, el('span', null, `Page ${s.k + 1} of ${STOPS.length}`), ` · ${s.era}`),
        el('h2', { id: 'h-' + s.id }, w.title), w.body),
      sketch
    ];
    if (s.id === 'buoyance') {
      // regular photos in photo corners: the first is wide, the rest fill two columns, each going into whichever is shorter
      const print = img => el('figure', { class: 'print' },
        el('div', { class: 'mount' }, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h })),
        el('figcaption', null, img.caption));
      const [lead, ...rest] = bu.images, cols = [[], []], heights = [0, 0];
      rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
      kids.push(el('div', { class: 'prints' }, print(lead), el('div', { class: 'print-cols' }, cols.map(col => el('div', { class: 'print-col' }, col.map(print))))));
    }
    pages.append(el('section', { class: 'stop' + (flip ? ' flip' : ''), id: 'page-' + s.id, 'aria-labelledby': 'h-' + s.id, 'data-k': s.k }, kids));
  });
  document.querySelectorAll('.doodle').forEach(svg => svg.querySelectorAll('path.ln').forEach((p, i) => p.style.setProperty('--i', Math.min(i, 16))));

  /* ---------- the insert (About) and the sticky note (Contact) ---------- */
  $('about').append(
    el('p', { class: 'kicker' }, 'Inside the back cover'), el('h2', { id: 'about-title' }, 'About'),
    el('div', { class: 'about-cols' },
      el('div', { class: 'about-text' }, el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, hl(P.about[2], 'ACM UIST 2025'))),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))));
  $('contact').append(
    el('div', { class: 'sticky' },
      el('p', { class: 'kicker' }, 'Back cover'), el('h2', { id: 'contact-title' }, 'Say hello'),
      el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
      el('ul', null, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio'))),
      el('p', { class: 'end' }, el('a', { href: '#cover' }, '↑ Back to the cover'))));

  /* =====================================================================
     The drawn path: a pen goes from bubble to bubble as you scroll. The wobble is in the geometry,
     so the redraw on every scroll frame stays cheap (a filter would be re-rendered each time).
     ===================================================================== */
  const guide = trail.querySelector('.guide'), drawn = trail.querySelector('.drawn'), tip = trail.querySelector('.tip');
  let pts = [], cum = [], total = 0, pagesTop = 0;
  const wob = y => Math.sin(y * 0.045 + 1.3) * 1.6 + Math.sin(y * 0.113) * 1.0;

  function buildTrail() {
    const box = pages.getBoundingClientRect(), W = pages.clientWidth, H = pages.scrollHeight;
    pagesTop = box.top + scrollY;
    trail.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const centers = bubbles.map(b => { const r = b.getBoundingClientRect(); return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }; });
    const amp = innerWidth >= 900 ? 34 : 7;
    pts = []; cum = []; total = 0;
    for (let i = 0; i < centers.length - 1; i++) {
      const a = centers[i], b = centers[i + 1], n = Math.max(8, Math.round((b.y - a.y) / 10)), sign = i % 2 ? -1 : 1;
      for (let j = i === 0 ? 0 : 1; j <= n; j++) {
        const t = j / n, edge = Math.sin(Math.PI * t);                 // the wobble fades to nothing at each bubble, so the line enters its centre
        const y = a.y + (b.y - a.y) * t;
        pts.push({ x: a.x + (b.x - a.x) * t + sign * amp * Math.sin(2 * Math.PI * t) + wob(y) * edge, y });
      }
    }
    pts.forEach((p, i) => { total += i ? Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0; cum.push(total); });
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join('');
    guide.setAttribute('d', d); drawn.setAttribute('d', d);
    drawn.style.strokeDasharray = `${total} ${total + 10}`;
    update();
  }
  let ticking = false;
  function update() {
    ticking = false;
    if (!pts.length) return;
    // how far down the page the pen has got: the line reaches the point a little below the middle of the screen
    const y = scrollY + innerHeight * 0.62 - pagesTop;
    let i = pts.findIndex(p => p.y >= y);
    if (reduceMotion || i === -1) i = pts.length - 1;
    const upto = reduceMotion ? total : (y < pts[0].y ? 0 : cum[i]);
    drawn.style.strokeDashoffset = String(total - upto);
    if (reduceMotion) { tip.style.display = 'none'; return; }
    tip.setAttribute('cx', pts[i].x.toFixed(1)); tip.setAttribute('cy', pts[i].y.toFixed(1));
    tip.style.opacity = y < pts[0].y - 40 ? 0 : 1;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  new ResizeObserver(buildTrail).observe(pages);
  addEventListener('load', buildTrail);

  /* ---------- doodles draw themselves when their page comes into view ---------- */
  const reveal = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target); } }), { rootMargin: '0px 0px -20% 0px' });
  document.querySelectorAll('.stop, .cover').forEach(n => reveal.observe(n));

  /* =====================================================================
     Doodle on the page. Strokes are SVG paths in page coordinates, so they stay put as you scroll.
     They live in memory only: nothing is stored, and a reload gives a clean page.
     ===================================================================== */
  const ink = $('ink'), penBtn = $('pen'), tray = $('tray'), sheet = $('sheet');
  const undoBtn = $('undo'), clearBtn = $('clear'), status = $('status');
  let colour = 'navy', stroke = null;
  const say = t => { status.textContent = t; };

  function syncButtons() { const none = !ink.querySelector('path'); undoBtn.disabled = none; clearBtn.disabled = none; }
  function setPen(on) {
    sheet.classList.toggle('pen-on', on);
    penBtn.setAttribute('aria-pressed', String(on));
    tray.hidden = !on;
    say(on ? 'Doodle pen on. Drag on the page to draw. Press Escape or Done to stop. Links are paused while drawing.' : 'Doodle pen off.');
  }
  penBtn.addEventListener('click', () => setPen(penBtn.getAttribute('aria-pressed') !== 'true'));
  $('done').addEventListener('click', () => { setPen(false); penBtn.focus(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('pen-on')) { setPen(false); penBtn.focus(); } });
  tray.querySelectorAll('.sw').forEach(b => b.addEventListener('click', () => {
    colour = b.dataset.ink;
    tray.querySelectorAll('.sw').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
  }));
  undoBtn.addEventListener('click', () => { const last = ink.lastElementChild; if (last) last.remove(); syncButtons(); say('Last stroke removed.'); });
  clearBtn.addEventListener('click', () => { ink.replaceChildren(); syncButtons(); say('All doodles cleared.'); });

  const at = e => { const r = ink.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  ink.addEventListener('pointerdown', e => {
    if (!sheet.classList.contains('pen-on') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    ink.setPointerCapture(e.pointerId);
    const p = at(e), path = document.createElementNS(NS, 'path');
    path.setAttribute('class', 's-' + colour);
    path.setAttribute('d', `M${p.x.toFixed(1)},${p.y.toFixed(1)}l0.01,0`);       // a click leaves a dot
    ink.append(path);
    stroke = { path, last: p, d: `M${p.x.toFixed(1)},${p.y.toFixed(1)}` };
    syncButtons();
  });
  ink.addEventListener('pointermove', e => {
    if (!stroke) return;
    const p = at(e), m = { x: (stroke.last.x + p.x) / 2, y: (stroke.last.y + p.y) / 2 };
    stroke.d += `Q${stroke.last.x.toFixed(1)},${stroke.last.y.toFixed(1)} ${m.x.toFixed(1)},${m.y.toFixed(1)}`;
    stroke.last = p;
    stroke.path.setAttribute('d', stroke.d);
  });
  const finish = () => {
    if (!stroke) return;
    stroke.path.setAttribute('d', stroke.d + `L${stroke.last.x.toFixed(1)},${stroke.last.y.toFixed(1)}`);
    stroke = null;
  };
  ink.addEventListener('pointerup', finish);
  ink.addEventListener('pointercancel', finish);
})();
