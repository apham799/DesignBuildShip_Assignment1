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
     The seven stops, each a numbered part of the drawing. Numerals run 10, 12, 14 ... in the order things happened.
     ===================================================================== */
  const STOPS = [
    { id: 'ug',       num: 10, short: 'Undergrad', era: 'Undergrad' },
    { id: 'diver',    num: 12, short: dv.shortTitle, era: dv.era },
    { id: 'penpal',   num: 14, short: pp.title,     era: pp.era },
    { id: 'axlab',    num: 16, short: 'AxLab',      era: P.labEra },
    { id: 'mpcs',     num: 18, short: 'MPCS',       era: 'Master’s begins' },
    { id: 'buoyance', num: 20, short: bu.title,     era: bu.era },
    { id: 'now',      num: 22, short: 'Now',        era: 'Second year' }
  ];
  STOPS.forEach((s, k) => { s.k = k; s.part = $('p' + s.num); });

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

  /* ---------- the title block ---------- */
  $('title').textContent = P.name;
  $('tagline').textContent = P.tagline;
  $('inventor').append(el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 }), el('figcaption', null, 'Inventor'));
  $('meta').append(
    el('dt', null, 'Advisor'), el('dd', null, P.advisor),
    el('dt', null, 'Lab'), el('dd', null, P.lab),
    el('dt', null, 'Status'), el('dd', null, P.standing));

  // ground hatching under the floor line
  $('ticks').setAttribute('d', Array.from({ length: 19 }, (_, i) => `M${112 + i * 30},840 l-12,14`).join(' '));

  /* ---------- the numbered list ---------- */
  const list = $('parts'), detail = $('detail');
  const buttons = STOPS.map(s => {
    const b = el('button', { type: 'button', 'aria-pressed': 'false', 'aria-label': `Numeral ${s.num}: ${s.short}. ${s.era}.` },
      el('span', { class: 'n', 'aria-hidden': 'true' }, String(s.num)),
      el('span', { class: 't' }, el('b', null, s.short), el('i', null, s.era)));
    b.addEventListener('click', () => select(s));
    list.append(el('li', null, b));
    return b;
  });

  let current = null;
  function select(s, opts = {}) {
    current = s;
    STOPS.forEach(o => { o.part.classList.toggle('on', o === s); buttons[o.k].setAttribute('aria-pressed', String(o === s)); });
    const w = words(s.id);
    const kids = [
      el('p', { class: 'ref' }, `Ref. ${s.num} · ${s.era}`),
      el('h2', { id: 'h-detail' }, w.title), w.body
    ];
    if (s.id === 'buoyance') {
      const [lead, ...rest] = bu.images;
      const fig = (img, i) => el('figure', { class: 'photo' },
        el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }),
        el('figcaption', null, el('b', null, `Fig. 3${'ABCD'[i]} `), img.caption));
      // the first photo is wide; the rest fill two columns, each going into whichever is shorter
      const cols = [[], []], heights = [0, 0];
      rest.forEach((img, i) => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(fig(img, i + 1)); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.25; });
      kids.push(el('div', { class: 'photos' }, fig(lead, 0), el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col)))));
    }
    const prev = STOPS[s.k - 1], next = STOPS[s.k + 1];
    kids.push(el('div', { class: 'step' },
      prev ? stepBtn(prev, '←') : el('span'),
      next ? stepBtn(next, '→') : el('span')));
    detail.replaceChildren(...kids.flat(Infinity).filter(Boolean));
    detail.setAttribute('aria-labelledby', 'h-detail');
    if (opts.say !== false) $('status').textContent = `Numeral ${s.num}: ${w.title}.`;
  }
  function stepBtn(s, arrow) {
    const b = el('button', { type: 'button', class: 'next' }, arrow === '←' ? `← ${s.num} ${s.short}` : `${s.num} ${s.short} →`);
    b.addEventListener('click', () => { select(s); const btns = [...detail.querySelectorAll('.step button')]; (arrow === '←' ? btns[0] : btns[btns.length - 1])?.focus(); });
    return b;
  }

  // the parts and numerals in the drawing are a second way in (the list is the keyboard way)
  STOPS.forEach(s => s.part.addEventListener('click', () => {
    select(s);
    if (innerWidth < 1000) detail.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });   // the text sits below the drawing on narrow screens
  }));

  /* ---------- assembled and exploded ---------- */
  const wrap = $('figWrap'), figLabel = $('figLabel');
  const views = document.querySelectorAll('.view');
  function setView(name, say = true) {
    const ex = name === 'exploded';
    wrap.classList.toggle('exploded', ex);
    figLabel.textContent = ex ? 'FIG. 2' : 'FIG. 1';
    views.forEach(v => v.setAttribute('aria-pressed', String(v.dataset.view === name)));
    if (say) $('status').textContent = ex ? 'Exploded view: the parts are pulled apart.' : 'Assembled view.';
  }
  views.forEach(v => v.addEventListener('click', () => setView(v.dataset.view)));

  /* ---------- About and Contact ---------- */
  const dlg = $('dlg'), dlgBody = $('dlgBody');
  function openDialog(title, era, body) {
    dlgBody.replaceChildren(el('p', { class: 'ref' }, era), el('h2', { id: 'dlg-title' }, title), ...body);
    dlg.showModal();
  }
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.open === 'about') openDialog('About', 'Description', [
      el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))]);
    else openDialog('Say hello', 'Contact', [
      el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
      el('ul', { class: 'links' }, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio')))]);
  }));

  /* ---------- start: the parts come together, then the first stop is read ---------- */
  select(STOPS[0], { say: false });
  if (reduceMotion) setView('assembled', false);
  else {
    wrap.classList.add('instant');
    setView('exploded', false);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wrap.classList.remove('instant');
      setTimeout(() => setView('assembled', false), 500);
    }));
  }
})();
