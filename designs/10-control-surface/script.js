(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;

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
  const surname = full => { const p = full.trim().split(/\s+/); return p.length > 1 ? `${p[p.length - 1]}, ${p.slice(0, -1).join(' ')}` : full; };

  /* =====================================================================
     The seven channels, earliest first. The fader's position and the channel LEDs both show where you are in time.
     ===================================================================== */
  const STOPS = [
    { id: 'ug',       short: 'Undergrad',  era: 'Undergrad' },
    { id: 'diver',    short: dv.shortTitle, era: dv.era },
    { id: 'penpal',   short: pp.title,     era: pp.era },
    { id: 'axlab',    short: 'AxLab',      era: P.labEra },
    { id: 'mpcs',     short: 'MPCS',       era: 'Master’s begins' },
    { id: 'buoyance', short: bu.title,     era: bu.era },
    { id: 'now',      short: 'Now',        era: 'Second year' }
  ];
  STOPS.forEach((s, k) => { s.k = k; });
  const byId = Object.fromEntries(STOPS.map(s => [s.id, s]));
  const LAST = STOPS.length - 1;

  /* ---------- head: photo, label tape, status ---------- */
  $('head').append(
    el('figure', null, el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 })),
    el('div', null,
      el('h1', { class: 'tape' }, surname(P.name)),
      el('p', { class: 'standing' }, P.standing),
      el('p', { class: 'lab' }, `${P.lab}, ${P.school}`)));

  /* ---------- photo packing (first spans, the rest balance two columns) ---------- */
  function photoBlocks(images) {
    const fig = img => el('figure', null, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    const [lead, ...rest] = images;
    const cols = [[], []], heights = [0, 0];
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), rest.length > 0 && el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig)))));
  }

  /* ---------- what the display shows ---------- */
  function content(view) {
    if (view.type === 'about') return [el('p', { class: 'kicker' }, 'Panel · About'), el('h2', null, P.name), el('p', { class: 'lead' }, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))];
    if (view.type === 'contact') return [el('p', { class: 'kicker' }, 'Panel · Output'), el('h2', null, 'Contact'),
      el('dl', { class: 'facts' }, el('dt', null, 'Email'), el('dd', null, link('mailto:' + P.contact.email, P.contact.email)),
        el('dt', null, 'LinkedIn'), el('dd', null, link(P.contact.linkedin, 'Alan Pham')), el('dt', null, 'Before'), el('dd', null, link(P.contact.previousSite, 'Previous portfolio')))];
    const s = STOPS[view.k], id = s.id, tag = `Channel ${s.k + 1} of ${STOPS.length} · `;
    if (id === 'ug') return [el('p', { class: 'kicker' }, tag + 'Undergrad'), el('h2', null, 'Two degrees, in parallel'), el('p', { class: 'lead' }, `${bs.title} (${bs.note}) and ${ba.title}.`), el('p', { class: 'story' }, 'I double majored in Computer Science and Economics.')];
    if (id === 'mpcs') return [el('p', { class: 'kicker' }, tag + 'Master’s begins'), el('h2', null, 'Pre-Doctoral MPCS'), el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0])];
    if (id === 'axlab') return [el('p', { class: 'kicker' }, tag + P.labEra), el('h2', null, P.lab), el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])];
    if (id === 'now') return [el('p', { class: 'kicker' }, tag + 'We are here'), el('h2', null, P.standing), el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])];
    const p = project(id);
    return [el('p', { class: 'kicker' }, tag + (p.era || p.kicker)), el('h2', null, p.title), el('p', { class: 'lead' }, p.summary), p.story && el('p', { class: 'story' }, p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      p.tags && p.tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, p.tags.map(t => el('li', null, t))),
      p.images.length > 0 && photoBlocks(p.images)];
  }

  /* ---------- channel strips + tick marks on the fader ---------- */
  const strips = $('strips'), ticks = $('ticks'), fader = $('fader');
  STOPS.forEach(s => {
    const btn = el('button', { type: 'button', 'data-k': s.k, 'aria-label': `Channel ${s.k + 1} of ${STOPS.length}: ${s.short}. ${s.era}.` },
      el('span', { class: 'led', 'aria-hidden': 'true' }), el('span', { class: 'num', 'aria-hidden': 'true' }, String(s.k + 1)),
      el('span', { class: 'nm' }, s.short), el('span', { class: 'era' }, s.era),
      el('span', { class: 'meter', 'aria-hidden': 'true' }, STOPS.map((_, i) => el('i', { class: i <= s.k ? 'lit' : '' }))));
    btn.addEventListener('click', () => { go(s.k, true); showDisplay(); });
    strips.append(el('li', { 'data-k': s.k }, btn));
    const tick = el('button', { type: 'button', class: 'tick', tabindex: '-1', 'aria-hidden': 'true', style: `--p:${s.k / LAST}` }, el('span', { class: 'n' }, String(s.k + 1)));
    tick.addEventListener('click', () => go(s.k, true));
    ticks.append(tick);
    s.btn = btn; s.li = strips.lastChild; s.tick = tick;
  });

  /* =====================================================================
     State: either a stop (0..6) or one of the two panels
     ===================================================================== */
  let view = { type: 'stop', k: 0 };
  let motion = true;
  const lcd = $('screen-body'), bar = $('lcd-bar'), statusEl = $('status');

  function render(announce) {
    const isStop = view.type === 'stop';
    STOPS.forEach(s => { const on = isStop && view.k === s.k; s.li.classList.toggle('on', on); s.tick.classList.toggle('on', on); if (on) s.btn.setAttribute('aria-current', 'true'); else s.btn.removeAttribute('aria-current'); });
    $('btn-about').setAttribute('aria-pressed', String(view.type === 'about'));
    $('btn-contact').setAttribute('aria-pressed', String(view.type === 'contact'));
    const label = isStop ? (STOPS[view.k].short === STOPS[view.k].era ? STOPS[view.k].short : `${STOPS[view.k].short} · ${STOPS[view.k].era}`) : view.type === 'about' ? 'About' : 'Contact';
    bar.replaceChildren(el('span', { class: 'dot' }), el('b', null, isStop ? `CH ${view.k + 1} / ${STOPS.length}` : 'PANEL'), el('span', null, label));
    lcd.replaceChildren(...content(view).filter(Boolean));
    if (motion) { lcd.classList.remove('blip'); void lcd.offsetWidth; lcd.classList.add('blip'); }
    fader.setAttribute('aria-valuetext', `Channel ${(isStop ? view.k : nearest()) + 1} of ${STOPS.length}: ${STOPS[isStop ? view.k : nearest()].short}`);
    if (announce) statusEl.textContent = isStop ? `Channel ${view.k + 1} of ${STOPS.length}: ${STOPS[view.k].short}. ${STOPS[view.k].era}.` : `${label} panel.`;
  }
  // on small screens the controls sit below the display, so bring the display back into view after a tap
  const showDisplay = () => { if (matchMedia('(max-width: 960px)').matches) $('screen-body').closest('.screen').scrollIntoView({ block: 'start', behavior: motion ? 'smooth' : 'auto' }); };
  const nearest = () => clamp(Math.round(+fader.value), 0, LAST);

  function setHash() { const h = view.type === 'stop' ? STOPS[view.k].id : view.type; history.replaceState(null, '', '#' + h); }

  /* ---------- the fader: continuous while you drag, snaps to a channel when you let go ---------- */
  let tween = 0;
  function moveFader(to, animate) {
    cancelAnimationFrame(tween);
    const from = +fader.value;
    if (!animate || !motion || Math.abs(to - from) < 0.001) { fader.value = to; return; }
    const t0 = performance.now(), dur = 240;
    (function step(now) { const u = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - u, 3); fader.value = from + (to - from) * e; if (u < 1) tween = requestAnimationFrame(step); })(t0);
  }
  function go(k, animate) {
    k = clamp(k, 0, LAST);
    view = { type: 'stop', k };
    moveFader(k, animate); render(true); setHash();
  }
  fader.addEventListener('input', () => {                        // live: the display follows the cap
    cancelAnimationFrame(tween);
    const k = nearest();
    if (view.type !== 'stop' || view.k !== k) { view = { type: 'stop', k }; render(true); setHash(); }
  });
  fader.addEventListener('change', () => moveFader(nearest(), true));   // let go: snap to the channel
  fader.addEventListener('keydown', e => {
    const step = { ArrowRight: 1, ArrowUp: 1, PageUp: 1, ArrowLeft: -1, ArrowDown: -1, PageDown: -1 }[e.key];
    if (step != null) { e.preventDefault(); go(nearest() + step, true); }
    else if (e.key === 'Home') { e.preventDefault(); go(0, true); }
    else if (e.key === 'End') { e.preventDefault(); go(LAST, true); }
  });

  /* ---------- the Panels buttons ---------- */
  [['about', 'btn-about'], ['contact', 'btn-contact']].forEach(([type, id]) => $(id).addEventListener('click', () => {
    view = view.type === type ? { type: 'stop', k: nearest() } : { type }; render(true); setHash(); showDisplay();
  }));

  /* ---------- the text-size knob: turn it in a circle, pull it right or up, click to step, or use the arrow keys ---------- */
  const knob = $('knob-text'), SIZES = ['.98rem', '1.12rem', '1.34rem'], SIZE_NAMES = ['Small', 'Medium', 'Large'];
  const DETENT = 60;                                    // degrees between one setting and the next
  let size = 1;
  function setSize(i, keepAngle) {
    size = clamp(i, 0, 2);
    if (!keepAngle) knob.style.setProperty('--angle', `${(size - 1) * DETENT}deg`);
    knob.setAttribute('aria-valuenow', String(size)); knob.setAttribute('aria-valuetext', SIZE_NAMES[size]);
    document.documentElement.style.setProperty('--read', SIZES[size]);
    document.querySelectorAll('.knob-scale button, .knob-scale i').forEach(b => b.classList.toggle('on', +b.dataset.size === size));
  }
  const angleAt = (e, c) => Math.atan2(e.clientX - c.x, c.y - e.clientY) * 180 / Math.PI;   // 0 is straight up, clockwise is positive
  let drag = null;
  knob.addEventListener('pointerdown', e => {
    knob.setPointerCapture(e.pointerId);
    const r = knob.getBoundingClientRect(), c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const centre = Math.hypot(e.clientX - c.x, e.clientY - c.y) < 16;     // grabbed dead centre: there is no angle to follow
    drag = { c, x: e.clientX, y: e.clientY, base: (size - 1) * DETENT, mode: centre ? 'line' : null, last: angleAt(e, c), turned: 0, moved: 0 };
    knob.classList.add('dragging');
  });
  knob.addEventListener('pointermove', e => {
    if (!drag) return;
    const vx = e.clientX - drag.x, vy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.hypot(vx, vy));
    if (!drag.mode) {                                                       // decide from the first real movement: circling turns the knob, a straight pull drags it
      if (drag.moved < 6) return;
      const rx = drag.x - drag.c.x, ry = drag.y - drag.c.y, rl = Math.hypot(rx, ry) || 1;
      const radial = (vx * rx + vy * ry) / rl, tangential = (vx * ry - vy * rx) / rl;
      drag.mode = Math.abs(tangential) >= Math.abs(radial) ? 'turn' : 'line';
    }
    let delta;
    if (drag.mode === 'turn') {
      const a = angleAt(e, drag.c); let step = a - drag.last;
      if (step > 180) step -= 360; else if (step < -180) step += 360;    // keep turning the same way across the straight-down line
      drag.last = a; drag.turned += step; delta = drag.turned;
    } else delta = (vx - vy) * 1.2;                                          // right or up turns it up, left or down turns it down
    const angle = clamp(drag.base + delta, -DETENT, DETENT);
    knob.style.setProperty('--angle', angle + 'deg');                       // the cap follows the hand
    const next = Math.round(angle / DETENT) + 1;
    if (next !== size) setSize(next, true);                                 // the text follows as the knob passes each setting
  });
  const endDrag = () => {
    if (!drag) return;
    const tap = drag.moved < 4;
    drag = null; knob.classList.remove('dragging');
    setSize(tap ? (size + 1) % 3 : size);                                   // snap to the nearest setting; a plain click steps to the next one
    statusEl.textContent = `Text size: ${SIZE_NAMES[size]}.`;
  };
  knob.addEventListener('pointerup', endDrag); knob.addEventListener('pointercancel', endDrag);
  document.querySelectorAll('.knob-scale button').forEach(b => b.addEventListener('click', () => { setSize(+b.dataset.size); statusEl.textContent = `Text size: ${SIZE_NAMES[size]}.`; }));
  knob.addEventListener('keydown', e => {
    const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
    if (d != null) { e.preventDefault(); setSize(size + d); statusEl.textContent = `Text size: ${SIZE_NAMES[size]}.`; }
    else if (e.key === 'Home') { e.preventDefault(); setSize(0); } else if (e.key === 'End') { e.preventDefault(); setSize(2); }
  });

  /* ---------- the two switches ---------- */
  function setSwitch(btn, on) { btn.setAttribute('aria-checked', String(on)); }
  function setPanel(dark) { document.body.dataset.panel = dark ? 'dark' : 'light'; setSwitch($('sw-panel'), dark); }
  function setMotion(on) { motion = on; document.body.dataset.motion = on ? 'on' : 'off'; setSwitch($('sw-motion'), on); }
  $('sw-panel').addEventListener('click', () => { setPanel(document.body.dataset.panel !== 'dark'); statusEl.textContent = `Panel: ${document.body.dataset.panel}.`; });
  $('sw-motion').addEventListener('click', () => { setMotion(!motion); statusEl.textContent = `Motion: ${motion ? 'on' : 'off'}.`; });

  /* ---------- go ---------- */
  setPanel(prefersDark); setMotion(!prefersReduced); setSize(1);
  const start = location.hash.slice(1);
  if (byId[start]) { view = { type: 'stop', k: byId[start].k }; fader.value = view.k; }
  else if (start === 'about' || start === 'contact') view = { type: start };
  render(false);
})();
