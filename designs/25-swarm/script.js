(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVG_NS = 'http://www.w3.org/2000/svg';

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
     The seven stops, in the order things happened, each a station on a vertical line. The colours are the toio LED colours.
     ===================================================================== */
  const STOPS = [
    { id: 'ug',       name: 'Undergrad',  era: 'Undergrad',        color: '#ffd23f' },
    { id: 'diver',    name: dv.shortTitle, era: dv.era,            color: '#29c4ff' },
    { id: 'penpal',   name: pp.title,     era: pp.era,             color: '#8a6bff', small: true },
    { id: 'axlab',    name: 'AxLab',      era: P.labEra,           color: '#2de28b' },
    { id: 'mpcs',     name: 'MPCS',       era: 'Master’s begins',  color: '#ff8a2b' },
    { id: 'buoyance', name: bu.title,     era: bu.era,             color: '#ff4fa3' },
    { id: 'now',      name: 'Now',        era: 'Second year',      color: '#7d8fb0' }
  ];
  STOPS.forEach((s, k) => { s.k = k; });

  function words(id) {
    if (id === 'ug') return { title: 'Two degrees, in parallel', body: [el('p', { class: 'lead' }, `${bs.title} (${bs.note}) and ${ba.title}.`), el('p', null, 'I double majored in Computer Science and Economics.')] };
    if (id === 'mpcs') return { title: 'Pre-Doctoral MPCS', body: [el('p', { class: 'lead' }, P.program + '.')] };
    if (id === 'axlab') return { title: P.lab, body: [el('p', { class: 'lead' }, P.labStory)] };
    if (id === 'now') return { title: P.standing, body: [el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`)] };
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
    const exhSrc = (P.exhibitions.find(e => e.photo) || {}).photo;
    const [lead, ...rest] = bu.images.filter(i => i.src !== exhSrc), cols = [[], []], heights = [0, 0];
    const fig = img => el('figure', { class: 'photo' }, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(fig(img)); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col))));
  }

  /* ---------- the hero ---------- */
  $('kicker').textContent = `${P.role} · ${P.school}`;
  $('name').textContent = P.name;
  $('tagline').textContent = P.tagline;
  $('lab').textContent = `${P.lab}, advised by ${P.advisor}`;
  $('photo').src = ROOT + P.headshot.src; $('photo').alt = P.headshot.alt;
  $('heroLinks').append(link('mailto:' + P.contact.email, P.contact.email), ' · ', link(P.contact.linkedin, 'LinkedIn'), ' · ', el('a', { href: '#publications' }, 'Publications'));

  /* =====================================================================
     The story: one section per stop, in order. Nothing is hidden, so you can read straight down.
     ===================================================================== */
  const story = $('story'), stations = $('stations'), journey = $('path');
  const sections = STOPS.map(s => {
    const w = words(s.id);
    const sec = el('section', { class: 'stop' + (s.small ? ' small' : ''), id: 'page-' + s.id, 'aria-labelledby': 'h-' + s.id, style: `--c:${s.color}` },
      el('p', { class: 'era' }, el('span', { class: 'num', 'aria-hidden': 'true' }, String(s.k + 1)), el('span', { class: 'sr-only' }, `Stop ${s.k + 1} of ${STOPS.length}. `), s.era),
      el('h2', { id: 'h-' + s.id }, w.title), w.body, s.id === 'buoyance' && photos());
    story.append(sec);
    const a = el('a', { class: 'st' + (s.small ? ' small' : '') + (s.k === 0 ? ' pill' : ''), href: '#page-' + s.id, style: `--c:${s.color}`, 'aria-label': `Stop ${s.k + 1} of ${STOPS.length}: ${s.name}. ${s.era}.` }, el('span', { class: 'dot' }), el('span', { class: 'tag', 'aria-hidden': 'true' }, s.name));
    a.addEventListener('click', () => say(`Stop ${s.k + 1} of ${STOPS.length}: ${s.name}.`));
    stations.append(a);
    return { s, sec, a, y: 0 };
  });

  /* ---------- the path heading ---------- */
  story.prepend(el('div', { class: 'path-head' }, el('p', { class: 'era' }, 'Education and research'), el('h2', { id: 'path-title' }, 'Path'),
    el('p', { class: 'path-intro' }, 'From my first degree to now, in order. Follow the line down the page.')));

  /* ---------- about ---------- */
  $('about').append(el('div', { class: 'wrap' }, el('p', { class: 'era' }, 'Biography'), el('h2', { id: 'about-title' }, 'About'),
    el('div', { class: 'about-cols' },
      el('div', { class: 'about-text' }, el('p', { class: 'lead' }, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2])),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`)))));

  /* ---------- publications: published, then forthcoming, then under review ---------- */
  const withMe = authors => authors.split(', ').flatMap((a, i, all) => [a === P.name ? el('b', null, a) : a, i < all.length - 1 ? ', ' : '']);
  function pubItem(p) {
    const proj = p.project && project(p.project), pub = proj && proj.publication;
    const meta = [p.role, pub ? pub.venue : p.venue].filter(Boolean).join(' · ');
    return el('li', { class: 'pub' },
      el('p', { class: 'pub-meta' }, meta),
      pub ? [el('p', { class: 'pub-title' }, pub.title), el('p', { class: 'pub-authors' }, withMe(pub.authors)),
             el('ul', { class: 'links', 'aria-label': 'Links for ' + proj.title }, proj.links.map(l => el('li', null, link(l.url, l.label))))]
          : el('p', { class: 'pub-title todo' }, 'Title to be added.'));
  }
  const pubGroups = [['published', 'Published'], ['forthcoming', 'Forthcoming'], ['under review', 'Under review']];
  $('publications').append(el('div', { class: 'wrap' }, el('p', { class: 'era' }, 'Research output'), el('h2', { id: 'pubs-title' }, 'Publications'),
    pubGroups.map(([status, label]) => {
      const items = P.publications.filter(p => p.status === status);
      return items.length ? el('div', { class: 'pub-group' }, el('h3', null, label, el('span', { class: 'count' }, ` (${items.length})`)), el('ol', { class: 'pubs' }, items.map(pubItem))) : null;
    })));

  /* ---------- exhibitions and demos, newest first ---------- */
  const exhImg = src => bu.images.find(i => i.src === src);
  $('exhibitions').append(el('div', { class: 'wrap' }, el('p', { class: 'era' }, 'Shown to the public'), el('h2', { id: 'exh-title' }, 'Exhibitions and demos'),
    el('ol', { class: 'exh' }, P.exhibitions.map(e => {
      const img = e.photo && exhImg(e.photo);
      return el('li', { class: 'exh-item' }, el('p', { class: 'exh-year' }, e.year), el('div', null, el('p', { class: 'exh-title' }, e.title),
        img && el('figure', { class: 'photo' }, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption))));
    }))));

  /* ---------- contact ---------- */
  $('contact').append(el('div', { class: 'wrap' }, el('p', { class: 'era' }, 'Get in touch'), el('h2', { id: 'contact-title' }, 'Contact'),
    el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
    el('ul', { class: 'links' }, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio'))),
    el('p', { class: 'end' }, el('a', { href: '#top-of-page', id: 'toTop' }, '↑ Back to the top'))));
  $('toTop').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* =====================================================================
     The line. It runs down the left of the story; the part you have passed is drawn in colour. A RoverC robot (design 1's
     robot) drives down a service rail beside it, as far as you have scrolled, reeling in a balloon (design 1). A toio cube
     (design 5) drives to whichever station you are at, and its colour is that stop's colour.
     ===================================================================== */
  const line = $('line'), lineDone = $('lineDone'), service = $('service'), toio = $('toio'), roverWrap = $('roverWrap'), balloon = $('balloon');
  const tether = $('tether'), tetherPath = $('tetherPath'), tracks = $('tracks'), balloonText = $('balloonText');
  const G = { lineX: 100, railX: 44, y0: 0, y1: 0, ys: [], jTop: 0 };
  const R = { y: 0 }, B = { x: 0, y: 0, vx: 0, vy: 0 }, T = { y: 0, v: 0, angle: 0 };
  let cur = 0;

  function layout() {
    const narrow = innerWidth < 600;
    G.lineX = narrow ? 56 : 104; G.railX = narrow ? 24 : 46;
    const root = document.documentElement.style;
    root.setProperty('--gw', (narrow ? 82 : 156) + 'px');
    root.setProperty('--lineX', G.lineX + 'px');
    root.setProperty('--railX', G.railX + 'px');
    const jr = journey.getBoundingClientRect(); G.jTop = jr.top + scrollY;
    G.ys = sections.map(o => o.sec.offsetTop + (o.s.small ? 26 : 34));
    sections.forEach((o, i) => { o.y = G.ys[i]; o.a.style.top = G.ys[i] + 'px'; });
    G.y0 = G.ys[0]; G.y1 = G.ys[G.ys.length - 1];
    // the main line starts at the second station: the first section has two parallel tracks (the two degrees) that merge into it
    const lineTop = G.ys[1];
    line.style.top = lineTop + 'px'; line.style.height = (G.y1 - lineTop) + 'px'; lineDone.style.top = line.style.top; lineDone.style.height = line.style.height;
    const grad = 'linear-gradient(to bottom,' + STOPS.slice(1).map((s, i) => `${s.color} ${G.ys[i + 1] - lineTop}px`).join(',') + ')';
    line.style.background = grad; lineDone.style.background = grad;
    service.style.top = (G.y0 - 40) + 'px'; service.style.height = (G.y1 - G.y0 + 40) + 'px';
    // the two degree tracks
    const x = G.lineX, y0 = G.y0, y1 = G.ys[1], mid = y1 - Math.min(110, (y1 - y0) * 0.35);
    tracks.setAttribute('width', 60); tracks.setAttribute('height', y1 + 10); tracks.setAttribute('viewBox', `0 0 60 ${y1 + 10}`);
    tracks.style.left = (x - 30) + 'px';
    tracks.replaceChildren(
      pathEl(`M20,${y0} V${mid} C20,${mid + 40} 30,${y1 - 30} 30,${y1}`, '#ffd23f'),
      pathEl(`M40,${y0} V${mid} C40,${mid + 40} 30,${y1 - 30} 30,${y1}`, '#2de28b'));
    if (!R.y) { R.y = G.y0; T.y = G.y0; B.x = G.railX; B.y = G.y0 - 112; }
    update(true);
  }
  function pathEl(d, c) { const p = document.createElementNS(SVG_NS, 'path'); p.setAttribute('d', d); p.setAttribute('stroke', c); return p; }

  let ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(false); }); } }
  function update(force) {
    const pr = clamp(scrollY + innerHeight * 0.42 - G.jTop, G.y0, G.y1);
    R.target = pr;
    let k = 0; G.ys.forEach((y, i) => { if (y <= pr + 2) k = i; });
    if (k !== cur || force) {
      cur = k;
      sections.forEach((o, i) => { o.a.classList.toggle('passed', i < k); o.a.classList.toggle('now', i === k); o.sec.classList.toggle('on', i === k); });
      toio.style.setProperty('--led', STOPS[k].color);
      balloonText.textContent = innerWidth < 600 ? String(k + 1) : STOPS[k].name;
      balloon.style.setProperty('--led', STOPS[k].color);
      T.target = G.ys[k];
      if (reduceMotion) { T.y = T.target; }
    }
    if (reduceMotion || force) { R.y = R.target; }
    const lineTop = G.ys[1] || 0;
    lineDone.style.clipPath = `inset(0 0 ${Math.max(0, (G.y1 - lineTop) - (Math.max(R.target, lineTop) - lineTop))}px 0)`;
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { layout(); });
  new ResizeObserver(() => layout()).observe(story);
  addEventListener('load', layout);

  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    if (!reduceMotion) {
      R.y += (R.target - R.y) * Math.min(1, dt * 8);
      T.v += ((T.target - T.y) * 55 - T.v * 11) * dt; T.y += T.v * dt;
      T.angle += ((T.v > 40 ? 180 : T.v < -40 ? 0 : T.angle > 90 ? 180 : 0) - T.angle) * Math.min(1, dt * 8);
      // the balloon floats above its robot on a tether of fixed length, swaying and lagging behind a fast scroll
      const hx = G.railX + Math.sin(t * 0.7) * 5, hy = R.y - 112 + Math.sin(t * 0.9) * 5;
      B.vx += ((hx - B.x) * 13 - B.vx * 3) * dt; B.vy += ((hy - B.y) * 13 - B.vy * 3) * dt; B.x += B.vx * dt; B.y += B.vy * dt;
    } else { B.x = G.railX; B.y = R.y - 112; }
    paint();
  }
  function paint() {
    const bw = innerWidth < 600 ? 40 : 66;
    roverWrap.style.transform = `translate(${G.railX}px, ${R.y.toFixed(1)}px)`;
    balloon.style.width = bw + 'px'; balloon.style.height = (bw * 1.06) + 'px';
    balloon.style.transform = `translate(${(B.x - G.railX - bw / 2).toFixed(1)}px, ${(B.y - R.y - bw * 1.06 + 0).toFixed(1)}px)`;
    // tether from the robot's top to the balloon's knot (coordinates are relative to the rover wrap)
    const kx = B.x - G.railX, ky = B.y - R.y, sway = (B.x - G.railX) * 0.4;
    tetherPath.setAttribute('d', `M0 -8 Q${(kx / 2 + sway).toFixed(1)} ${((ky - 8) / 2).toFixed(1)} ${kx.toFixed(1)} ${ky.toFixed(1)}`);
    toio.style.transform = `translate(${G.lineX - 15}px, ${(T.y - 15).toFixed(1)}px) rotate(${T.angle.toFixed(1)}deg)`;
  }
  const navLinks = [...document.querySelectorAll('#barNav a')];
  const atBottom = () => scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting && !atBottom()) navLinks.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false'));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['about', 'path', 'publications', 'exhibitions', 'contact'].forEach(id => spy.observe($(id)));
  // at the very bottom the last section is the one you are in, even though its middle never reaches the band
  addEventListener('scroll', () => { if (atBottom()) navLinks.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#contact'))); }, { passive: true });
  const bar = $('bar'), setBar = () => document.documentElement.style.setProperty('--bar', bar.offsetHeight + 'px');
  new ResizeObserver(setBar).observe(bar); setBar();

  layout();
  requestAnimationFrame(loop);
})();
