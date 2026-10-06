(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const $ = id => document.getElementById(id);
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
     The scenes. Flat marker drawings, grey for the set, ink for the lines and one red pen for whatever
     the eye should follow, the way a storyboard artist works. Every scene is 320 x 180.
     ===================================================================== */
  const arcP = (cx, cy, rx, ry = rx) => `M${cx - rx},${cy}a${rx},${ry} 0 1,0 ${2 * rx},0a${rx},${ry} 0 1,0 ${-2 * rx},0`;
  const sceneSvg = inner => `<svg viewBox="0 0 320 180" aria-hidden="true" focusable="false">${inner}</svg>`;
  const bg = (floorClass = '') => `<rect width="320" height="180" class="f0"/><rect y="150" width="320" height="30" class="f1 ${floorClass}"/><path d="M0,150 H320" class="s"/>`;
  // a person standing with the feet at (x, y); l and r are where the hands are
  const person = (x, y, { s = 1, l = [x - 30, y - 60], r = [x + 30, y - 60] } = {}) => {
    const sh = y - 70 * s;
    return `<path d="M${x - 8 * s},${y} L${x - 6 * s},${y - 40 * s} M${x + 8 * s},${y} L${x + 6 * s},${y - 40 * s}" class="s"/>` +
      `<path d="M${x - 10 * s},${sh + 4 * s} L${l[0]},${l[1]} M${x + 10 * s},${sh + 4 * s} L${r[0]},${r[1]}" class="s"/>` +
      `<rect x="${x - 12 * s}" y="${sh - 4 * s}" width="${24 * s}" height="${40 * s}" rx="${7 * s}" class="s f2"/>` +
      `<circle cx="${x}" cy="${y - 92 * s}" r="${11 * s}" class="s fw"/>` +
      `<circle cx="${l[0]}" cy="${l[1]}" r="3.2" class="s fw"/><circle cx="${r[0]}" cy="${r[1]}" r="3.2" class="s fw"/>`;
  };
  const robot = (x, y = 128) =>
    `<rect x="${x - 14}" y="${y}" width="28" height="12" rx="2" class="s f2"/><circle cx="${x - 8}" cy="${y + 17}" r="5" class="s fw"/><circle cx="${x + 8}" cy="${y + 17}" r="5" class="s fw"/>`;
  const balloon = (cx, cy, rx = 22, ry = 26, cls = 'fi') =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="s ${cls}"/><path d="M${cx - 4},${cy + ry} l4,7 l4,-7 z" class="s fi"/>` +
    (cls === 'fi' ? `<ellipse cx="${cx - rx * 0.4}" cy="${cy - ry * 0.4}" rx="${rx * 0.2}" ry="${ry * 0.12}" class="hi" transform="rotate(-30 ${cx - rx * 0.4} ${cy - ry * 0.4})"/>` : '');
  const rays = (cx, cy, r1, r2) => Array.from({ length: 12 }, (_, i) => {
    const a = i * Math.PI / 6, c = Math.cos(a), sn = Math.sin(a);
    if (sn > 0.85) return '';
    return `M${(cx + c * r1).toFixed(1)},${(cy + sn * r1).toFixed(1)} L${(cx + c * r2).toFixed(1)},${(cy + sn * r2).toFixed(1)}`;
  }).join(' ');

  const SCENES = {
    // two degrees: a code board and a chart, one person between them
    ug: sceneSvg(bg() +
      `<path d="M74,116 V150 M246,116 V150" class="s"/>` +
      `<rect x="36" y="34" width="76" height="82" class="s fw"/><path d="M62,58 L48,73 L62,88 M86,58 L100,73 L86,88 M78,54 L70,92" class="s"/>` +
      `<rect x="208" y="34" width="76" height="82" class="s fw"/><path d="M220,104 V50 M220,104 H274" class="s"/><path d="M226,96 Q240,92 248,78 T272,56" class="s fr thick"/>` +
      person(160, 150, { l: [116, 92], r: [204, 92] })),
    // VR: a headset under water
    diver: sceneSvg(`<rect width="320" height="180" class="f0"/><path d="M0,150 q20,-10 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 V180 H0 Z" class="s f1"/>` +
      `<path d="M0,166 q20,-8 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0" class="s"/>` +
      person(160, 150, { l: [126, 84], r: [194, 84] }) +
      `<rect x="145" y="52" width="30" height="13" rx="5" class="s fi"/><path d="M145,58 H141 M175,58 H179" class="s"/>` +
      `<circle cx="236" cy="66" r="7" class="s fr"/><circle cx="254" cy="42" r="10" class="s fr"/><circle cx="226" cy="30" r="5" class="s fr"/>` +
      `<path d="M44,112 q18,-14 36,0 q-18,14 -36,0 Z M80,112 l12,-10 v20 z" class="s f2"/>`),
    // a pen drawing a line, close up (an insert shot)
    penpal: sceneSvg(`<rect width="320" height="180" class="f0"/>` +
      `<path d="M122,134 L129,109 L241,29 L251,43 L139,123 Z" class="s f2"/><path d="M129,109 L139,123" class="s"/><path d="M228,38 L238,52" class="s"/>` +
      `<path d="M122,134 C100,152 84,120 62,138 S34,154 18,134" class="s fr thick"/>`),
    // a person beside a small robot that reels a tether up out of the frame
    axlab: sceneSvg(bg() +
      person(96, 150, { l: [72, 104], r: [152, 104] }) +
      `<rect x="190" y="122" width="64" height="22" rx="4" class="s f2"/><circle cx="204" cy="148" r="7" class="s fw"/><circle cx="240" cy="148" r="7" class="s fw"/>` +
      `<circle cx="222" cy="112" r="11" class="s f1"/><circle cx="222" cy="112" r="4" class="s fw"/><path d="M222,101 V0" class="s"/>` +
      `<path d="M158,66 Q192,44 214,76 M205,66 L214,76 L201,79" class="s fr thick"/>`),
    // a laptop in front of a skyline, with a red sun
    mpcs: sceneSvg(bg() +
      `<circle cx="276" cy="44" r="13" class="s fr thick"/>` +
      `<path d="M168,150 V76 h26 V150 M198,150 V100 h22 V150 M224,150 V58 h30 V150 M258,150 V88 h24 V150 M286,150 V112 h26 V150" class="s f1"/>` +
      `<path d="M233,58 V32 M245,58 V40" class="s"/>` +
      person(80, 150, { l: [106, 108], r: [106, 114] }) +
      `<rect x="106" y="88" width="38" height="26" rx="2" class="s fw"/><path d="M100,116 H150" class="s thick"/><path d="M112,98 H136 M112,106 H128" class="s"/>`),
    // three balloons tethered to robots, one being reached for
    buoyance: sceneSvg(bg() +
      [[60, 66, 62], [128, 44, 126], [196, 76, 190]].map(([cx, cy, rx]) =>
        `<path d="M${cx},${cy + 33} C${cx - 10},${cy + 54} ${rx + 12},${cy + 70} ${rx},128" class="s"/>` + robot(rx) + balloon(cx, cy)).join('') +
      `<ellipse cx="196" cy="76" rx="29" ry="33" class="s fr thick" fill="none"/>` +
      person(268, 150, { l: [226, 90], r: [296, 94] })),
    // a glowing balloon held up, and an arrow out of the frame
    now: sceneSvg(bg() +
      `<circle cx="150" cy="64" r="62" class="glow"/><path d="${rays(150, 64, 40, 54)}" class="s fr thick"/>` +
      balloon(150, 64, 25, 29, 'fy') +
      person(104, 150, { l: [80, 108], r: [150, 104] }) +
      `<path d="M236,112 H290 M278,100 L292,112 L278,124" class="s fr thick"/>`)
  };

  /* =====================================================================
     The panels. Each says which shot it is, which stop it is, and gives one line of caption.
     ===================================================================== */
  const PANELS = [
    { id: 'ug',       title: 'Undergrad',                shot: 'Wide',        era: 'Undergrad',        span: 5, cap: `${bs.title} (${bs.note}) and ${ba.title}.` },
    { id: 'diver',    title: dv.shortTitle,              shot: 'Point of view', era: dv.era,           span: 4, cap: dv.summary },
    { id: 'penpal',   title: pp.title,                   shot: 'Insert',      era: pp.era,             span: 3, cap: pp.summary, small: true },
    { id: 'axlab',    title: 'AxLab',                    shot: 'Medium',      era: P.labEra,           span: 6, cap: P.labStory },
    { id: 'mpcs',     title: 'MPCS',                     shot: 'Establishing', era: 'Master’s begins',  span: 6, cap: P.program + '.' },
    { id: 'buoyance', title: bu.title,                   shot: 'Wide',        era: bu.era,             span: 8, cap: bu.story },
    { id: 'now',      title: 'Now',                      shot: 'Close-up',    era: 'Second year',      span: 4, cap: `${P.standing}. Advised by ${P.advisor}.` }
  ];
  PANELS.forEach((p, i) => { p.k = i; });

  function words(id) {
    if (id === 'ug') return { title: 'Two degrees, in parallel', body: [el('p', { class: 'lead-p' }, `${bs.title} (${bs.note}) and ${ba.title}.`), el('p', null, 'I double majored in Computer Science and Economics.')] };
    if (id === 'mpcs') return { title: 'Pre-Doctoral MPCS', body: [el('p', { class: 'lead-p' }, P.program + '.'), el('p', null, P.about[0])] };
    if (id === 'axlab') return { title: P.lab, body: [el('p', { class: 'lead-p' }, P.labStory), el('p', null, P.about[1])] };
    if (id === 'now') return { title: P.standing, body: [el('p', { class: 'lead-p' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])] };
    const p = project(id);
    return { title: p.title, body: [
      el('p', { class: 'lead-p' }, p.summary), p.story && el('p', null, p.story),
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

  /* ---------- the title slate ---------- */
  $('title').textContent = P.name;
  $('lead').append(el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 }), el('figcaption', null, 'Lead'));
  $('meta').append(
    el('dt', null, 'Role'), el('dd', null, P.tagline),
    el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`),
    el('dt', null, 'Panels'), el('dd', null, `${PANELS.length}, in the order things happened`));
  $('how').textContent = 'Read left to right, top to bottom. Open any panel to read the whole scene.';

  /* ---------- the sheet of panels ---------- */
  const list = $('panels');
  const openers = PANELS.map(p => {
    const w = words(p.id);
    const open = el('button', { type: 'button', class: 'open', 'aria-label': `Open panel ${p.k + 1}: ${p.title}. ${p.era}.` }, 'Open scene ', el('span', { 'aria-hidden': 'true' }, '→'));
    open.addEventListener('click', () => showPanel(p.k));
    const frame = el('div', { class: 'frame' });
    frame.insertAdjacentHTML('beforeend', SCENES[p.id]);
    frame.append(el('span', { class: 'num', 'aria-hidden': 'true' }, String(p.k + 1)), el('span', { class: 'shot', 'aria-hidden': 'true' }, p.shot));
    const li = el('li', { class: 'panel' + (p.small ? ' small' : ''), style: `--span:${p.span}` },
      el('article', { 'aria-labelledby': 'pt-' + p.id },
        frame,
        el('div', { class: 'caption' },
          el('p', { class: 'era' }, el('span', { class: 'sr-only' }, `Panel ${p.k + 1} of ${PANELS.length}. `), p.era),
          el('h2', { id: 'pt-' + p.id }, w.title === p.title ? p.title : p.title),
          el('p', { class: 'cap' }, p.cap),
          open)));
    list.append(li);
    return open;
  });
  $('end').append(el('p', null, 'To be continued.'), el('a', { href: 'mailto:' + P.contact.email }, P.contact.email));

  /* ---------- the open scene, with previous and next ---------- */
  const dlg = $('dlg'), dlgBody = $('dlgBody');
  function renderPanel(k, focusSel) {
    const p = PANELS[k], w = words(p.id);
    const prev = PANELS[k - 1], next = PANELS[k + 1];
    const stepBtn = (q, dir) => {
      if (!q) return el('span');
      const b = el('button', { type: 'button', class: 'step ' + dir }, dir === 'prev' ? `← ${q.k + 1} ${q.title}` : `${q.k + 1} ${q.title} →`);
      b.addEventListener('click', () => { renderPanel(q.k, '.step.' + dir); say(`Panel ${q.k + 1} of ${PANELS.length}: ${q.title}.`); });
      return b;
    };
    const scene = el('div', { class: 'scene' }); scene.insertAdjacentHTML('beforeend', SCENES[p.id]);
    scene.append(el('span', { class: 'num', 'aria-hidden': 'true' }, String(p.k + 1)), el('span', { class: 'shot', 'aria-hidden': 'true' }, p.shot));
    dlgBody.replaceChildren(...[
      scene,
      el('p', { class: 'era' }, `Panel ${p.k + 1} of ${PANELS.length} · ${p.era}`),
      el('h2', { id: 'dlg-title' }, w.title), w.body, p.id === 'buoyance' && photos(),
      el('div', { class: 'steps' }, stepBtn(prev, 'prev'), stepBtn(next, 'next'))].flat(Infinity).filter(Boolean));
    if (focusSel) { const b = dlgBody.querySelector(focusSel) || dlgBody.querySelector('.step'); if (b) b.focus({ preventScroll: true }); }
    dlg.querySelector('.dlg-sheet').scrollTop = 0;
  }
  function showPanel(k) { renderPanel(k); dlg.showModal(); }
  const say = t => { $('status').textContent = t; };
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  function openInfo(title, era, body) {
    dlgBody.replaceChildren(el('p', { class: 'era' }, era), el('h2', { id: 'dlg-title' }, title), ...body.flat(Infinity).filter(Boolean));
    dlg.showModal();
  }
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.open === 'about') openInfo('About', 'Production notes', [
      el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))]);
    else openInfo('Say hello', 'Contact', [
      el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
      el('ul', { class: 'links' }, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio')))]);
  }));

  // the panels are drawn on as the sheet scrolls into view (all shown at once for reduced motion)
  if (!reduceMotion) {
    document.documentElement.classList.add('anim');
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    list.querySelectorAll('.panel').forEach(li => io.observe(li));
  }
})();
