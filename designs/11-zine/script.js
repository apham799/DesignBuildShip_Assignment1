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
     Halftone: dots on a 45 degree grid, each sized by how dark the photo is at that spot.
     The brightness grids are precomputed (halftone-data.js), because a page cannot read the pixels of a local image.
     ===================================================================== */
  const GRIDS = {};
  Object.entries(window.HALFTONE).forEach(([key, g]) => {
    const f = new Float32Array(g.cols * g.rows);
    g.rows36.forEach((row, y) => { for (let x = 0; x < g.cols; x++) f[y * g.cols + x] = parseInt(row[x], 36) / g.levels; });
    GRIDS[key] = { cols: g.cols, rows: g.rows, f };
  });
  function sample(g, u, v) {
    const fx = clamp(u, 0, 1) * (g.cols - 1), fy = clamp(v, 0, 1) * (g.rows - 1);
    const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(x0 + 1, g.cols - 1), y1 = Math.min(y0 + 1, g.rows - 1), tx = fx - x0, ty = fy - y0, w = g.cols;
    return (g.f[y0 * w + x0] * (1 - tx) + g.f[y0 * w + x1] * tx) * (1 - ty) + (g.f[y1 * w + x0] * (1 - tx) + g.f[y1 * w + x1] * tx) * ty;
  }
  function drawHalftone(canvas) {
    const g = GRIDS[canvas.dataset.key], w = canvas.clientWidth;
    if (!g || !w) return;
    const h = w * g.rows / g.cols, dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = getComputedStyle(canvas).color;              // the ink comes from the page's CSS, so swapping inks recolours the photos
    const s = Math.max(4.6, w / (canvas.dataset.key === 'head' ? 44 : 56));
    const c = Math.SQRT1_2, n = Math.ceil(Math.hypot(w, h) / s) + 2, cx = w / 2, cy = h / 2;
    ctx.beginPath();
    for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
      const x = cx + (i * c - j * c) * s, y = cy + (i * c + j * c) * s;
      if (x < -s || y < -s || x > w + s || y > h + s) continue;
      const dark = sample(g, x / w, y / h);
      if (dark < 0.06) continue;
      const r = s * 0.7 * Math.sqrt(dark);
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  const canvases = [];
  const ro = new ResizeObserver(entries => entries.forEach(e => drawHalftone(e.target)));
  function halftone(key, label, className) {
    const cv = el('canvas', { class: 'halftone' + (className ? ' ' + className : ''), 'data-key': key, role: 'img', 'aria-label': label });
    cv.style.aspectRatio = `${GRIDS[key].cols} / ${GRIDS[key].rows}`;
    canvases.push(cv); ro.observe(cv);
    return cv;
  }

  /* ---------- the cover ---------- */
  const [first, ...restName] = P.name.split(' ');
  $('masthead').textContent = `Issue 01 · a zine by ${P.name} · read down: earlier ↓ later`;
  $('title').append(el('span', null, first), el('span', null, restName.join(' ')));
  $('title').setAttribute('aria-label', P.name);
  $('tagline').append(el('b', null, P.standing), `${P.lab}, ${P.school}`);
  const headCv = halftone('head', P.headshot.alt);
  const portrait = document.querySelector('.portrait');
  portrait.replaceChild(headCv, $('cv-head'));

  /* =====================================================================
     The seven pages, in the order things happened
     ===================================================================== */
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

  function words(id) {
    if (id === 'ug') return { title: 'Two degrees, in parallel', body: [el('p', { class: 'lead' }, `${bs.title} (${bs.note}) and ${ba.title}.`), el('p', { class: 'story' }, 'I double majored in Computer Science and Economics.')] };
    if (id === 'mpcs') return { title: 'Pre-Doctoral MPCS', body: [el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0])] };
    if (id === 'axlab') return { title: P.lab, body: [el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])] };
    if (id === 'now') return { title: P.standing, body: [el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])] };
    const p = project(id);
    return { title: p.title, body: [el('p', { class: 'lead' }, p.summary), p.story && el('p', { class: 'story' }, p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      p.tags && p.tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, p.tags.map(t => el('li', null, t)))] };
  }

  const pages = $('pages');
  STOPS.forEach(s => {
    const w = words(s.id), flip = s.k % 2 === 1;
    const kids = [
      el('p', { class: 'when' }, el('span', null, `Page ${s.k + 1} of ${STOPS.length}`), ` · ${s.era}`),
      el('p', { class: 'pageno', 'aria-hidden': 'true' }, String(s.k + 1).padStart(2, '0')),
      el('div', { class: 'words' }, el('p', { class: 'kicker' }, `Page ${s.k + 1}`), el('h2', { id: 'h-' + s.id }, w.title), w.body)
    ];
    if (s.id === 'buoyance') {
      // regular photos, taped to the page: the first is wide, the rest fill two columns, each going into whichever is shorter
      const print = img => el('figure', { class: 'print' },
        el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }),
        el('figcaption', null, img.caption), el('span', { class: 'tape', 'aria-hidden': 'true' }));
      const [lead, ...rest] = bu.images, cols = [[], []], heights = [0, 0];
      rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
      kids.push(el('div', { class: 'prints' }, print(lead), el('div', { class: 'print-cols' }, cols.map(col => el('div', { class: 'print-col' }, col.map(print))))));
    }
    // the balloon gets a strip of its own below the words and the photos, so it can never sit on top of either
    kids.push(el('div', { class: 'floater', 'aria-hidden': 'true', style: `--s:${46 + s.k * 11}px; --tether:${60 + s.k * 14}px` }, el('span', { class: 'balloon' })));
    pages.append(el('section', { class: 'spread reveal' + (flip ? ' flip' : ''), id: 'page-' + s.id, 'aria-labelledby': 'h-' + s.id, 'data-k': s.k }, kids));
  });

  /* ---------- the insert (About) and the back cover (Contact) ---------- */
  $('about').append(el('div', { class: 'card' },
    el('p', { class: 'kicker' }, 'Inside the cover'), el('h2', { id: 'about-title' }, 'About'),
    el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
    el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))));
  $('contact').append(
    el('p', { class: 'kicker' }, 'Back cover'), el('h2', { id: 'contact-title' }, 'Say hello'),
    el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
    el('ul', null, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio'))),
    el('p', { class: 'end' }, 'That was issue 01. ', el('a', { href: '#cover' }, '↑ Back to the cover')),
    el('div', { class: 'floater', 'aria-hidden': 'true', style: '--s:110px; --tether:90px' }, el('span', { class: 'balloon' })));

  /* ---------- the strip: page numbers, where you are, and the ink swap ---------- */
  const stripList = $('strip-list'), where = $('where');
  const numLinks = STOPS.map(s => {
    const a = el('a', { href: '#page-' + s.id, 'aria-label': `Page ${s.k + 1} of ${STOPS.length}: ${s.short}. ${s.era}.` }, String(s.k + 1));
    stripList.append(el('li', null, a));
    return a;
  });
  function setWhere(text) { where.textContent = text; }
  const sections = [
    { node: $('cover'), label: 'Cover' },
    ...STOPS.map(s => ({ node: $('page-' + s.id), label: `Page ${s.k + 1} / ${STOPS.length} · earlier ← → later`, k: s.k })),
    { node: $('about'), label: 'Insert' },
    { node: $('contact'), label: 'Back cover' }
  ];
  setWhere('Cover');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const sec = sections.find(s => s.node === en.target);
      numLinks.forEach((a, i) => { if (sec && sec.k === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      setWhere(sec.label);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => io.observe(s.node));

  const reveal = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target); } }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(n => reveal.observe(n));

  $('swap').addEventListener('click', e => {
    const on = document.body.classList.toggle('swapped');
    e.currentTarget.setAttribute('aria-pressed', String(on));
    canvases.forEach(drawHalftone);
    $('status').textContent = on ? 'Inks swapped: blue numbers and orange headlines.' : 'Inks restored: orange numbers and blue headlines.';
  });

  // the first draw happens when each canvas reports its size (the ResizeObserver); redraw once fonts and layout settle too
  addEventListener('load', () => canvases.forEach(drawHalftone));
})();
