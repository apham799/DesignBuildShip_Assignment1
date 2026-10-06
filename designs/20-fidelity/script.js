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
  const chips = tags => tags && tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, tags.map(t => el('li', null, t)));
  const card = (cls, ...kids) => el('article', { class: 'card ' + cls }, kids);

  const FI = { 1: { name: 'Sketch', v: 'v0.1' }, 2: { name: 'Wireframe', v: 'v0.5' }, 3: { name: 'Polished', v: 'v1.0' } };

  /* ---------- intro ---------- */
  $('kicker').textContent = `${P.role} · ${P.school}`;
  $('name').textContent = P.name;
  $('standing').textContent = P.tagline;
  $('labline').textContent = `${P.lab}, advised by ${P.advisor}`;
  $('how').textContent = 'A design starts rough and gets finished. This page does the same as you scroll: a sketch, then a wireframe, then a polished page. Use “Show as” above to see the whole page at one level.';
  $('portrait').append(el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 }));

  /* ---------- chapters ---------- */
  const head = (id, num, title, sub) => el('header', { class: 'chap-head' },
    el('p', { class: 'num' }, num), el('h2', { id: 'h-' + id }, title), sub && el('p', { class: 'sub' }, sub), el('span', { class: 'stage-tag', 'aria-hidden': 'true' }));

  $('undergrad-body').append(head('undergrad', '01', 'Undergrad', 'Two degrees, two course projects'),
    el('div', { class: 'cards two' },
      card('', el('h3', null, 'Two degrees, in parallel'),
        el('p', { class: 'lead' }, `${bs.title} (${bs.note}) and ${ba.title}.`),
        el('p', null, 'I double majored in Computer Science and Economics.')),
      card('', el('p', { class: 'kicker' }, dv.era), el('h3', null, dv.title),
        el('p', null, dv.summary), el('p', { class: 'story' }, dv.story), chips(dv.tags))),
    // a class project, kept small on purpose
    el('div', { class: 'aside' }, el('p', null, el('b', null, pp.title), ` · ${pp.era}. ${pp.summary} ${pp.story}`)));

  $('lab-body').append(head('lab', '02', 'The lab', 'Joined as an undergrad, then the master’s'),
    el('div', { class: 'cards two' },
      card('', el('p', { class: 'kicker' }, P.labEra), el('h3', null, P.lab),
        el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])),
      card('', el('p', { class: 'kicker' }, 'Master’s begins'), el('h3', null, 'Pre-Doctoral MPCS'),
        el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0]))));

  function photos() {
    // the first photo is wide; the rest fill two columns, each going into whichever is shorter
    const fig = img => el('figure', null, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    const [lead, ...rest] = bu.images, cols = [[], []], heights = [0, 0];
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig)))));
  }
  $('buoyance-body').append(head('buoyance', '03', 'Buoyancé', bu.kicker),
    el('div', { class: 'cards one' },
      card('big', el('p', { class: 'lead' }, bu.summary), el('p', { class: 'story' }, bu.story),
        el('p', { class: 'cite' }, `${bu.publication.authors}. `, el('i', null, bu.publication.title), `. ${bu.publication.venue}.`),
        el('ul', { class: 'links', 'aria-label': 'Buoyancé links' }, bu.links.map(l => el('li', null, link(l.url, l.label)))),
        chips(bu.tags), photos())));

  $('now-body').append(head('now', '04', 'Now', 'Second year'),
    el('div', { class: 'cards two' },
      card('', el('h3', null, P.standing), el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2]),
        el('dl', { class: 'facts' },
          el('dt', null, 'Program'), el('dd', null, P.program),
          el('dt', null, 'Undergrad'), el('dd', null, P.undergrad),
          el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))),
      card('', el('h3', null, 'Say hello'),
        el('a', { class: 'big-mail', href: 'mailto:' + P.contact.email }, P.contact.email),
        el('ul', { class: 'links', 'aria-label': 'Elsewhere' }, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio'))))),
    el('p', { class: 'end' }, el('a', { href: '#intro' }, '↑ Back to the top')));

  /* =====================================================================
     Fidelity. Every section has its own level (data-own); the switch can force one level on all of them.
     The look is entirely CSS variables on [data-fi], so changing the level is one attribute and the
     colours, borders, corners, shadows and photo treatment all transition.
     ===================================================================== */
  const sections = [...document.querySelectorAll('main > section')].map(s => ({ el: s, own: Number(s.dataset.own), tag: s.querySelector('.stage-tag') }));
  let forced = null, current = sections[0];
  const levelOf = s => forced || s.own;

  function paint(s, animate) {
    const fi = levelOf(s);
    if (s.el.dataset.fi === String(fi)) return;
    s.el.dataset.fi = String(fi);
    if (s.tag) s.tag.textContent = `${FI[fi].v} · ${FI[fi].name}`;
    if (animate && !reduceMotion) { s.el.classList.add('shift'); setTimeout(() => s.el.classList.remove('shift'), 700); }
  }
  function readout() {
    const fi = levelOf(current);
    $('readout').textContent = `${FI[fi].v} · ${FI[fi].name}`;
  }
  sections.forEach(s => paint(s, false));
  readout();

  const buttons = [...document.querySelectorAll('.control button')];
  buttons.forEach(b => b.addEventListener('click', () => {
    forced = b.dataset.mode === 'design' ? null : Number(b.dataset.mode);
    buttons.forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    sections.forEach(s => paint(s, true));
    readout();
    $('status').textContent = forced ? `The whole page is shown at the ${FI[forced].name.toLowerCase()} level.` : 'Each section is shown at its own level, from sketch to polished.';
  }));

  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    current = sections.find(s => s.el === en.target); readout();
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => io.observe(s.el));
})();
