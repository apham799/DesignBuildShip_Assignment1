(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);

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
  const surname = full => { const parts = full.trim().split(/\s+/); return parts.length > 1 ? `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}` : full; };
  const roman = n => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][n] || String(n + 1);

  /* =====================================================================
     The cards. Filed in order of occurrence, like a catalog filed by date. The call numbers are a design
     device (class "HCI", then the card number and a cutter made from the title), not a real library scheme.
     ===================================================================== */
  const cutter = title => { const t = title.replace(/[^A-Za-z]/g, ''); const sum = [...t].reduce((a, ch) => a + ch.charCodeAt(0), 0); return `${t[0].toUpperCase()}${10 + (sum % 89)}`; };
  const coauthors = (bu.publication.authors.split(',').map(s => s.trim()).filter(n => n && n !== P.name));

  const CARDS = [
    { id: 'ug', short: 'Undergrad', title: 'Two degrees, in parallel', era: 'Undergrad',
      statement: `${bs.title} (${bs.note}) and ${ba.title}`, imprint: 'Undergraduate degrees, studied together',
      body: [{ story: true, text: 'I double majored in Computer Science and Economics.' }],
      subjects: ['Computer science', 'Economics'], added: [] },
    { id: 'diver', short: dv.shortTitle, title: dv.title, era: dv.era,
      statement: dv.summary, imprint: dv.kicker, body: [{ text: dv.story }],
      subjects: ['Virtual reality', 'Human-computer interaction'], added: [] },
    { id: 'penpal', short: pp.title, title: pp.title, era: pp.era,
      statement: pp.summary, imprint: pp.kicker, body: [{ text: pp.story }],
      subjects: ['Actuated interfaces'], added: [] },
    { id: 'axlab', short: 'AxLab', title: P.lab, era: P.labEra,
      statement: P.labStory, imprint: 'Research lab', body: [{ text: P.about[1] }],
      subjects: ['Actuated interfaces', 'Human-computer interaction'], added: [P.advisor.replace(/^Professor\s+/, '')] },
    { id: 'mpcs', short: 'MPCS', title: 'Pre-Doctoral MPCS', era: 'Master’s begins',
      statement: P.program, imprint: 'The University of Chicago', body: [{ text: P.about[0] }],
      subjects: ['Computer science'], added: [] },
    { id: 'buoyance', short: bu.title, title: bu.title, era: bu.era,
      statement: bu.summary, imprint: `${bu.kicker}`, body: [{ story: true, text: bu.story }],
      citation: bu.publication, links: bu.links, images: bu.images,
      subjects: [...bu.tags.filter(t => !/UIST/i.test(t)), 'Human-computer interaction'], added: coauthors },
    { id: 'now', short: 'Now', title: P.standing, era: 'Second year',
      statement: `Advised by ${P.advisor} at the ${P.lab}`, imprint: 'We are here', body: [{ text: P.about[2] }],
      subjects: ['Computer science', 'Actuated interfaces', 'Human-computer interaction'], added: [P.advisor.replace(/^Professor\s+/, '')] }
  ];
  const TOPICS = [
    { id: 'cs',   label: 'COMPUTER SCIENCE',  name: 'Computer science' },
    { id: 'econ', label: 'ECONOMICS',         name: 'Economics' },
    { id: 'hci',  label: 'HCI',               name: 'Human-computer interaction' },
    { id: 'act',  label: 'ACTUATED UI',       name: 'Actuated interfaces' },
    { id: 'vr',   label: 'VIRTUAL REALITY',   name: 'Virtual reality' },
    { id: 'bal',  label: 'BALLOONS & ROBOTS', name: 'Balloons and robots' }
  ];
  const FILED_UNDER = { ug: ['cs', 'econ'], diver: ['vr', 'hci'], penpal: ['act'], axlab: ['act', 'hci'], mpcs: ['cs'], buoyance: ['bal', 'act', 'hci'], now: ['cs', 'act', 'hci'] };
  CARDS.forEach(c => { c.topics = FILED_UNDER[c.id]; });
  const countFor = id => CARDS.filter(c => c.topics.includes(id)).length;
  const plural = n => `${n} card${n === 1 ? '' : 's'}`;
  // the imprint line, without repeating a word the era already says (for example, Published twice)
  const imprintLine = c => c.imprint.toLowerCase().includes(c.era.toLowerCase().split(' ')[0].slice(0, 8)) ? c.imprint : `${c.imprint} · ${c.era}`;
  CARDS.forEach((c, k) => { c.k = k; c.call = `HCI ${k + 1} .${cutter(c.short)}`; });
  const byId = Object.fromEntries(CARDS.map(c => [c.id, c]));

  /* ---------- the cabinet face: every drawer opens something ---------- */
  const face = $('face');
  TOPICS.forEach(t => {
    const n = countFor(t.id);
    const btn = el('button', { type: 'button', class: 'dr', 'data-topic': t.id, 'aria-pressed': 'false', title: `Subject: ${t.name} (${plural(n)})` },
      el('span', { class: 'label' }, t.label), el('span', { class: 'pull' }), el('span', { class: 'count', 'aria-hidden': 'true' }, String(n)));
    btn.setAttribute('aria-label', `Subject drawer: ${t.name}, ${plural(n)}`);
    btn.addEventListener('click', () => toggleTopic(t.id));
    face.append(btn);
  });
  ['about', 'contact'].forEach(which => {
    const btn = el('button', { type: 'button', class: 'dr real', 'data-open': which, 'aria-haspopup': 'dialog', title: which === 'about' ? 'About me' : 'Contact' },
      el('span', { class: 'label' }, which === 'about' ? 'ABOUT' : 'CONTACT'), el('span', { class: 'pull' }));
    btn.addEventListener('click', () => openSlip(which));
    face.append(btn);
  });

  /* ---------- the guide card at the front of the drawer ---------- */
  $('guide').append(
    el('figure', null, el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 })),
    el('div', null,
      el('h1', null, surname(P.name)),
      el('p', { class: 'standing' }, P.standing),
      el('p', { class: 'lab' }, `${P.lab}, ${P.school}`),
      el('p', { class: 'lead' }, P.about[2])));

  /* ---------- photos: first spans the width, the rest pack into two columns by aspect ratio ---------- */
  function photoBlocks(images) {
    const fig = img => el('figure', null, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    const [lead, ...rest] = images;
    const cols = [[], []], heights = [0, 0];
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), rest.length > 0 && el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig)))));
  }

  /* ---------- build the drawer ---------- */
  const cardsEl = $('cards'), statusEl = $('status');
  const TABS = ['#e7c36a', '#a8cfae', '#e9a99b', '#a9c3e4', '#e7c36a', '#c9b3e0', '#a8cfae'];
  CARDS.forEach(c => {
    const open = el('div', { class: 'face-card' },
      el('span', { class: 'callno' }, c.call),
      el('p', { class: 'entry' },
        el('span', { class: 'main' }, `${surname(P.name)}.`),
        el('span', { class: 'title' }, c.title),
        el('span', { class: 'imprint' }, imprintLine(c))),
      el('div', { class: 'body' },
        el('p', null, c.statement),
        c.body.map(b => b.text && el('p', { class: b.story ? 'story' : null }, b.text))),
      c.citation && el('p', { class: 'fields' }, el('span', { class: 'k' }, 'Cite: '), `${c.citation.authors}. `, el('i', null, c.citation.title), `. ${c.citation.venue}.`),
      c.links && el('dl', { class: 'fields' }, c.links.map(l => [el('dt', null, '→'), el('dd', null, link(l.url, l.label))])),
      c.images && photoBlocks(c.images),
      el('p', { class: 'tracings' },
        c.subjects.map((s, i) => `${i + 1}. ${s}. `), c.added.map((n, i) => `${roman(i)}. ${surname(n)}. `), `${roman(c.added.length)}. Title.`),
      c.k < CARDS.length - 1 && el('button', { type: 'button', class: 'nextcard', 'data-next': CARDS[c.k + 1].id }, `Next card → ${CARDS[c.k + 1].short}`));

    const btn = el('button', { type: 'button', 'aria-expanded': 'false', 'aria-controls': 'panel-' + c.id },
      el('span', { class: 'tab', style: `--tab-x:${(c.k / (CARDS.length - 1)) * 62 + 2}%; --tab:${TABS[c.k]}`, 'aria-hidden': 'true' }, c.call.replace(/ \..*$/, '')),
      el('span', { class: 'num', 'aria-hidden': 'true' }, String(c.k + 1)),
      el('span', { class: 'ttl' }, c.short === c.title ? c.title : `${c.short}`),
      el('span', { class: 'era' }, c.era));
    btn.setAttribute('aria-label', `Card ${c.k + 1} of ${CARDS.length}: ${c.short}. ${c.era}.`);
    c.btn = btn;
    c.node = el('article', { class: 'card', id: 'card-' + c.id },
      el('h2', { class: 'strip' }, btn),
      el('div', { class: 'panel', id: 'panel-' + c.id, role: 'region', 'aria-label': c.short }, el('div', null, open)));
    btn.addEventListener('click', () => toggle(c.id, true));
    open.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => { toggle(b.dataset.next, true); byId[b.dataset.next].btn.focus({ preventScroll: true }); }));
    cardsEl.append(c.node);
  });

  /* ---------- opening and closing ---------- */
  let openId = null;
  function toggle(id, fromUser) {
    openId = openId === id ? null : id;
    CARDS.forEach(c => { const isOpen = c.id === openId; c.node.classList.toggle('open', isOpen); c.btn.setAttribute('aria-expanded', String(isOpen)); });
    if (fromUser) history.replaceState(null, '', openId ? '#' + openId : location.pathname + location.search);
    statusEl.textContent = openId ? `Card ${byId[openId].k + 1} of ${CARDS.length} is open: ${byId[openId].short}.` : 'All cards are filed.';
    if (fromUser && openId) {
      const bring = () => byId[openId].node.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      bring(); if (!reduceMotion) setTimeout(bring, 400);       // again once the cards above have finished closing
    }
  }

  /* ---------- subject drawers: highlight the cards filed under a subject ---------- */
  const filterEl = $('filter');
  let topic = null;
  function toggleTopic(id) { topic = topic === id ? null : id; applyFilter(); }
  function applyFilter() {
    const t = TOPICS.find(x => x.id === topic);
    document.querySelectorAll('[data-topic]').forEach(b => { const on = b.dataset.topic === topic; b.setAttribute('aria-pressed', String(on)); b.classList.toggle('pulled', on); });
    CARDS.forEach(c => { const m = !t || c.topics.includes(t.id); c.node.classList.toggle('dim', !m); c.node.classList.toggle('match', !!t && m); });
    filterEl.hidden = !t;
    if (!t) { filterEl.replaceChildren(); statusEl.textContent = 'Subject filter cleared. All cards shown.'; return; }
    const n = countFor(t.id), clear = el('button', { type: 'button' }, 'Clear');
    clear.addEventListener('click', () => toggleTopic(t.id));
    filterEl.replaceChildren('Subject: ', el('b', null, t.name), ` \u00b7 ${plural(n)}  `, clear);
    statusEl.textContent = `Subject drawer ${t.name}: ${plural(n)} highlighted.`;
    const open = openId && byId[openId];
    if (!open || !open.topics.includes(t.id)) toggle(CARDS.find(c => c.topics.includes(t.id)).id, true);   // open the first card on this subject
    else open.node.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  // arrow keys flip through the drawer
  cardsEl.addEventListener('keydown', e => {
    const strips = CARDS.map(c => c.btn), i = strips.indexOf(document.activeElement);
    if (i < 0) return;
    const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: strips.length - 1 }[e.key];
    if (to == null) return;
    e.preventDefault(); strips[clamp(to, 0, strips.length - 1)].focus();
  });
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- pulled cards: About and Contact ---------- */
  const slip = $('slip'), slipBody = $('slip-body');
  let slipOpener = null;
  function openSlip(which) {
    slipOpener = document.activeElement;
    slipBody.replaceChildren(which === 'about'
      ? el('div', { class: 'slip-card' }, el('span', { class: 'callno' }, 'REF. ABOUT'), el('h2', { id: 'slip-title' }, `${surname(P.name)}`),
          el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
          el('dl', { class: 'fields' },
            el('dt', null, 'Program:'), el('dd', null, P.program), el('dt', null, 'Undergrad:'), el('dd', null, P.undergrad), el('dt', null, 'Lab:'), el('dd', null, `${P.lab}, advised by ${P.advisor}`)))
      : el('div', { class: 'slip-card' }, el('span', { class: 'callno' }, 'REQUEST SLIP'), el('h2', { id: 'slip-title' }, 'Contact'),
          el('dl', { class: 'fields' },
            el('dt', null, 'Email:'), el('dd', null, link('mailto:' + P.contact.email, P.contact.email)),
            el('dt', null, 'LinkedIn:'), el('dd', null, link(P.contact.linkedin, 'Alan Pham')),
            el('dt', null, 'Before:'), el('dd', null, link(P.contact.previousSite, 'Previous portfolio')))));
    slip.showModal();
    history.replaceState(null, '', '#' + which);
  }
  slip.addEventListener('close', () => { history.replaceState(null, '', openId ? '#' + openId : location.pathname + location.search); if (slipOpener) slipOpener.focus(); });
  slip.addEventListener('click', e => { if (e.target === slip) slip.close(); });   // a click on the backdrop closes it

  /* ---------- go ---------- */
  const start = location.hash.slice(1);
  if (byId[start]) toggle(start, false);
  else if (start === 'about' || start === 'contact') { toggle(CARDS[0].id, false); openSlip(start); }
  else toggle(CARDS[0].id, false);
})();
