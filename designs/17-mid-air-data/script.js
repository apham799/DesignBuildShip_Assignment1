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
     The data. Each stop has three attributes, and each attribute is one axis of the chart:
       when    1..7, the order things happened (the two degrees ran in parallel, so both are 1)
       topic   my reading of each project's tags
       setting where it happened: in class, in the lab, in the graduate program
     ===================================================================== */
  const TOPICS = {
    econ: { label: 'Economics',                      short: 'Econ',     color: '#2c9a57', z: -0.75 },
    hci:  { label: 'Computer science & HCI',         short: 'CS & HCI', color: '#c98a00', z: -0.25 },
    vr:   { label: 'Virtual reality',                short: 'VR',       color: '#2f7fd1', z: 0.25 },
    act:  { label: 'Actuated & tangible interfaces', short: 'Actuated', color: '#d23f7c', z: 0.75 }
  };
  const SETTINGS = {
    class: { label: 'In class',        short: 'Class',   y: -0.45 },
    lab:   { label: 'In the lab',      short: 'Lab',     y: 0.1 },
    prog:  { label: 'Grad program',    short: 'Program', y: 0.65 }
  };
  const xOf = when => -0.9 + (when - 1) * 0.3;
  const POINTS = [
    { id: 'bs',       name: 'CS degree',  title: bs.title, era: 'Undergrad',       when: 1, topic: 'hci',  setting: 'class', words: 'ug' },
    { id: 'ba',       name: 'Economics',  title: ba.title, era: 'Undergrad',       when: 1, topic: 'econ', setting: 'class', words: 'ug' },
    { id: 'diver',    name: dv.shortTitle, title: dv.title, era: dv.era,          when: 2, topic: 'vr',   setting: 'class', words: 'diver' },
    { id: 'penpal',   name: pp.title,     title: pp.title, era: pp.era,           when: 3, topic: 'act',  setting: 'class', words: 'penpal' },
    { id: 'axlab',    name: 'AxLab',      title: 'AxLab',  era: P.labEra,         when: 4, topic: 'act',  setting: 'lab',   words: 'axlab' },
    { id: 'mpcs',     name: 'MPCS',       title: 'MPCS',   era: 'Master’s begins', when: 5, topic: 'hci',  setting: 'prog',  words: 'mpcs' },
    { id: 'buoyance', name: bu.title,     title: bu.title, era: bu.era,           when: 6, topic: 'act',  setting: 'lab',   words: 'buoyance' },
    { id: 'now',      name: 'Now',        title: 'Now',    era: 'Second year',    when: 7, topic: 'hci',  setting: 'prog',  words: 'now' }
  ];
  POINTS.forEach((p, i) => { p.i = i; p.x = xOf(p.when); p.z = TOPICS[p.topic].z; p.y = SETTINGS[p.setting].y; p.color = TOPICS[p.topic].color; });

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
  function photos() {
    // the first photo is wide; the rest fill two columns, each going into whichever is shorter
    const [lead, ...rest] = bu.images, cols = [[], []], heights = [0, 0];
    const fig = img => el('figure', { class: 'photo' }, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(fig(img)); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col))));
  }

  /* ---------- page furniture ---------- */
  $('title').textContent = P.name;
  $('tagline').textContent = P.tagline;
  $('headshot').src = ROOT + P.headshot.src; $('headshot').alt = P.headshot.alt;
  $('legend').append(...Object.values(TOPICS).map(t => el('li', null, el('i', { style: `background:${t.color}`, 'aria-hidden': 'true' }), t.label)));

  /* =====================================================================
     The table, the second way to read the chart, and the main way for keyboards and screen readers
     ===================================================================== */
  let sel = null;
  const rows = POINTS.map(p => {
    const b = el('button', { type: 'button', 'aria-pressed': 'false' }, el('i', { style: `background:${p.color}`, 'aria-hidden': 'true' }), p.name);
    b.addEventListener('click', () => select(p, { fromList: true }));
    const tr = el('tr', null, el('th', { scope: 'row' }, b), el('td', null, String(p.when)), el('td', null, TOPICS[p.topic].short), el('td', null, SETTINGS[p.setting].short));
    $('rows').append(tr);
    return { tr, b };
  });

  const detail = $('detail');
  function select(p, opts = {}) {
    sel = p;
    rows.forEach((r, i) => { const on = i === p.i; r.tr.classList.toggle('on', on); r.b.setAttribute('aria-pressed', String(on)); });
    const w = words(p.words);
    const kids = [
      el('p', { class: 'ref' }, `${p.era} · ${TOPICS[p.topic].label} · ${SETTINGS[p.setting].label}`),
      el('h2', { id: 'h-detail' }, w.title), w.body,
      p.id === 'buoyance' && photos()
    ];
    detail.replaceChildren(...kids.flat(Infinity).filter(Boolean));
    detail.setAttribute('aria-labelledby', 'h-detail');
    if (opts.say !== false) $('status').textContent = `${p.name}: ${TOPICS[p.topic].label}, ${SETTINGS[p.setting].label.toLowerCase()}, step ${p.when} of 7.`;
    if (!opts.fromList) { /* picked in the chart: keep the page where it is */ }
    dirty = true;
  }

  /* =====================================================================
     The chart: a small 3D engine on a 2D canvas (rotate, perspective-project, draw far to near)
     ===================================================================== */
  const cv = $('cv'), ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, dirty = true;
  let yaw = -0.61, pitch = 0.38;                       // radians
  let target = null, spinning = !reduceMotion;
  const D = 4.4;                                       // camera distance
  const R = 0.12;                                      // balloon radius, in chart units

  function fit() {
    const r = cv.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    dirty = true;
  }
  new ResizeObserver(fit).observe(cv);

  function proj(x, y, z) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
    const f = Math.min(W * 0.56, H * 0.66) * (D / 2.4);
    const s = f / (D + z2);
    return { x: W / 2 + x1 * s, y: H / 2 + 6 - y2 * s, d: z2, s };
  }

  const INK = '#33414d', EDGE = '#9fb0bc', GRID = '#d3dce3';
  const font = (px, w = 600) => `${w} ${px}px "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif`;
  const labelPx = () => (W < 480 ? 11 : 13);

  function line(a, b, color, width = 1, dash) {
    const p = proj(...a), q = proj(...b);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
  }
  function text(str, x, y, px, color, w = 600, align = 'center') {
    ctx.font = font(px, w); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#f4f7f9'); bg.addColorStop(1, '#dde5ea');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // floor grid and the box
    for (let i = -4; i <= 4; i++) {
      const t = i / 4;
      line([t, -1, -1], [t, -1, 1], GRID); line([-1, -1, t], [1, -1, t], GRID);
    }
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([x, z]) => line([x, -1, z], [x, 1, z], EDGE));
    [[-1, -1, -1, 1, -1, -1], [-1, -1, 1, 1, -1, 1], [-1, -1, -1, -1, -1, 1], [1, -1, -1, 1, -1, 1],
     [-1, 1, -1, 1, 1, -1], [-1, 1, 1, 1, 1, 1], [-1, 1, -1, -1, 1, 1], [1, 1, -1, 1, 1, 1]].forEach(e => line([e[0], e[1], e[2]], [e[3], e[4], e[5]], EDGE));

    // axes at the front-left corner: when (x), topic (z), setting (y), with their tick labels
    const tp = Math.round(clamp(W / 38, 10, 13)), axisText = [];
    const say = (str, x, y, color, w, align) => axisText.push({ str, x, y, color, w, align });
    line([-1, -1, 1], [1, -1, 1], INK, 2); line([1, -1, 1], [1, -1, -1], INK, 2); line([-1, -1, 1], [-1, 1, 1], INK, 2);
    for (let w = 1; w <= 7; w++) { const q = proj(xOf(w), -1, 1.0); say(String(w), q.x, q.y + 12, INK, 700, 'center'); }
    { const q = proj(1.0, -1, 1.18); say('When →', q.x + 6, q.y + 14, INK, 700, 'left'); }
    Object.values(TOPICS).forEach(t => { const q = proj(1, -1, t.z); say(t.short, q.x + 8, q.y + 4, INK, 600, 'left'); });
    { const q = proj(1, -1, -1.16); say('Topic →', q.x + 8, q.y + 2, INK, 700, 'left'); }
    Object.values(SETTINGS).forEach(s => { const q = proj(-1, s.y, 1); say(s.short, q.x - 8, q.y, INK, 600, 'right'); line([-1, s.y, 1], [-1.04, s.y, 1], INK, 2); });
    { const q = proj(-1, 1.1, 1); say('Setting ↑', q.x, q.y, INK, 700, 'center'); }
    const taken = [];
    axisText.forEach(t => {
      ctx.font = font(tp, t.w);
      const tw = ctx.measureText(t.str).width, x0 = t.align === 'right' ? t.x - tw : t.align === 'center' ? t.x - tw / 2 : t.x;
      const shift = clamp(x0, 4, W - tw - 4) - x0;                       // keep every axis label inside the canvas
      let y = t.y;
      for (let n = 0; n < 8 && taken.some(q => x0 + shift < q.x + q.w + 3 && x0 + shift + tw > q.x - 3 && Math.abs(y - q.y) < tp + 1); n++) y += tp + 2;
      taken.push({ x: x0 + shift, w: tw, y });
      text(t.str, t.x + shift, y, tp, t.color, t.w, t.align);
    });

    // each point is a stack: robot on the floor, tether, balloon; draw far stacks first
    const stacks = POINTS.map(p => ({ p, b: proj(p.x, p.y, p.z) })).sort((a, b) => b.b.d - a.b.d);
    const placed = [];
    stacks.forEach(({ p, b }) => {
      const on = sel === p, r = R * b.s;
      const floor = proj(p.x, -1, p.z), top = proj(p.x, -0.93, p.z);
      // shadow where the balloon stands
      ctx.beginPath(); ctx.ellipse(floor.x, floor.y, r * 1.1, r * 0.4 * (0.4 + Math.sin(pitch)), 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 45, 60, 0.18)'; ctx.fill();
      // robot: a little square on the floor
      const k = 0.075;
      const quad = [[-k, -k], [k, -k], [k, k], [-k, k]].map(([dx, dz]) => proj(p.x + dx, -0.99, p.z + dz));
      ctx.beginPath(); quad.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
      ctx.fillStyle = '#26323c'; ctx.fill();
      ctx.beginPath(); ctx.arc(top.x, top.y + 1, Math.max(2, r * 0.16), 0, Math.PI * 2); ctx.fillStyle = on ? p.color : '#8da0ad'; ctx.fill();
      // tether, then balloon
      const knot = proj(p.x, p.y - R * 1.02, p.z);
      ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(knot.x, knot.y);
      ctx.strokeStyle = on ? p.color : '#5a6b78'; ctx.lineWidth = on ? 2.4 : 1.4; ctx.stroke();
      if (on) { ctx.beginPath(); ctx.arc(b.x, b.y, r + 10, 0, Math.PI * 2); ctx.fillStyle = p.color + '33'; ctx.fill(); }
      const g = ctx.createRadialGradient(b.x - r * 0.35, b.y - r * 0.4, r * 0.1, b.x, b.y, r);
      g.addColorStop(0, '#6b7782'); g.addColorStop(0.35, '#232a31'); g.addColorStop(1, '#090c0f');
      ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = on ? 4 : 2.5; ctx.strokeStyle = p.color; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(b.x - r * 0.38, b.y - r * 0.42, r * 0.22, r * 0.12, -0.7, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
      placed.push({ p, x: b.x, y: b.y, r, d: b.d });
    });
    hits = placed;

    // labels last, nudged up so none sit on another
    const px = labelPx(), boxes = [], leaders = [], pills = [];
    placed.slice().reverse().sort((a, b) => a.y - b.y).forEach(o => {
      ctx.font = font(px, sel === o.p ? 800 : 600);
      const w = ctx.measureText(o.p.name).width + 16, h = px + 10;
      let x = clamp(o.x - w / 2, 4, W - w - 4), y = o.y - o.r - h - 6;
      const y0 = y;
      // keep clear of the other labels and of the other balloons
      const clear = () => !boxes.some(q => x < q.x + q.w + 2 && x + w > q.x - 2 && y < q.y + q.h + 2 && y + h > q.y - 2)
        && !placed.some(q => q !== o && x < q.x + q.r + 3 && x + w > q.x - q.r - 3 && y < q.y + q.r + 3 && y + h > q.y - q.r - 3);
      for (let n = 0; n < 14 && !clear(); n++) y -= h * 0.6 + 2;
      y = Math.max(4, y);
      boxes.push({ x, y, w, h });
      if (y0 - y > 14) leaders.push(() => { ctx.beginPath(); ctx.moveTo(o.x, y + h); ctx.lineTo(o.x, o.y - o.r); ctx.strokeStyle = o.p.color; ctx.lineWidth = 1.5; ctx.stroke(); });
      pills.push(() => {
        ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2);
        ctx.fillStyle = sel === o.p ? '#ffffff' : 'rgba(255,255,255,0.96)'; ctx.fill();
        ctx.lineWidth = sel === o.p ? 3 : 1.5; ctx.strokeStyle = o.p.color; ctx.stroke();
        text(o.p.name, x + w / 2, y + h / 2 + 1, px, '#14202a', sel === o.p ? 800 : 600);
      });
    });
    leaders.forEach(f => f()); pills.forEach(f => f());
    dirty = false;
  }
  let hits = [];

  /* ---------- the viewpoint: presets, sliders, dragging, a slow spin ---------- */
  const VIEWS = { '3d': [-0.61, 0.38], front: [0, 0.06], side: [Math.PI / 2, 0.06], top: [0, Math.PI / 2 - 0.001] };
  const yawBox = $('yaw'), pitchBox = $('pitch'), spinBtn = $('spin');
  const deg = r => Math.round(r * 180 / Math.PI);
  function syncSliders() {
    let d = deg(yaw) % 360; if (d > 180) d -= 360; if (d < -180) d += 360;
    yawBox.value = String(d); pitchBox.value = String(deg(pitch));
  }
  function setSpin(on) { spinning = on && !reduceMotion; spinBtn.setAttribute('aria-pressed', String(spinning)); }
  function goTo(name) {
    setSpin(false);
    const [ty, tp] = VIEWS[name];
    let dy = ty - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));            // the short way round
    if (reduceMotion) { yaw += dy; pitch = tp; syncSliders(); dirty = true; }
    else target = { yaw: yaw + dy, pitch: tp, t: 0, y0: yaw, p0: pitch };
    $('status').textContent = `${name === '3d' ? '3D' : name[0].toUpperCase() + name.slice(1)} view.`;
  }
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => goTo(b.dataset.view)));
  yawBox.addEventListener('input', () => { setSpin(false); target = null; yaw = yawBox.value * Math.PI / 180; dirty = true; });
  pitchBox.addEventListener('input', () => { setSpin(false); target = null; pitch = pitchBox.value * Math.PI / 180; dirty = true; });
  spinBtn.addEventListener('click', () => { setSpin(spinBtn.getAttribute('aria-pressed') !== 'true'); target = null; });
  if (reduceMotion) spinBtn.disabled = true;
  spinBtn.setAttribute('aria-pressed', String(spinning));

  // drag to turn; a tap (a drag of under 5 px) picks the balloon under the finger
  let drag = null;
  cv.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    cv.setPointerCapture(e.pointerId); setSpin(false); target = null;
    drag = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, moved: false };
    cv.classList.add('grab');
  });
  cv.addEventListener('pointermove', e => {
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 5) drag.moved = true;
      drag.x = e.clientX; drag.y = e.clientY;
      yaw += dx * 0.008; pitch = clamp(pitch + dy * 0.006, 0, Math.PI / 2 - 0.001);
      syncSliders(); dirty = true;
    } else {
      const r = cv.getBoundingClientRect(); cv.style.cursor = pick(e.clientX - r.left, e.clientY - r.top) ? 'pointer' : 'grab';
    }
  });
  const end = e => {
    if (!drag) return;
    if (!drag.moved) { const r = cv.getBoundingClientRect(); const p = pick(e.clientX - r.left, e.clientY - r.top); if (p) select(p); }
    drag = null; cv.classList.remove('grab');
  };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', () => { drag = null; cv.classList.remove('grab'); });
  function pick(x, y) {
    let best = null;
    hits.forEach(h => { const d = Math.hypot(x - h.x, y - h.y); if (d <= h.r + 12 && (!best || h.d < best.d)) best = h; });
    return best && best.p;
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (target) {
      target.t = Math.min(1, target.t + dt / 0.7);
      const e = 1 - Math.pow(1 - target.t, 3);
      yaw = target.y0 + (target.yaw - target.y0) * e; pitch = target.p0 + (target.pitch - target.p0) * e;
      if (target.t >= 1) target = null;
      syncSliders(); dirty = true;
    } else if (spinning && !drag && !document.hidden) { yaw += dt * 0.12; syncSliders(); dirty = true; }
    if (dirty) draw();
    requestAnimationFrame(frame);
  }

  /* ---------- About and Contact ---------- */
  const dlg = $('dlg'), dlgBody = $('dlgBody');
  function openDialog(title, kicker, body) {
    dlgBody.replaceChildren(el('p', { class: 'ref' }, kicker), el('h2', { id: 'dlg-title' }, title), ...body);
    dlg.showModal();
  }
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.open === 'about') openDialog('About', 'The person behind the data', [
      el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))]);
    else openDialog('Say hello', 'Contact', [
      el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
      el('ul', { class: 'links' }, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio')))]);
  }));

  fit();
  select(POINTS[POINTS.length - 2], { say: false });          // start on Buoyancé
  syncSliders();
  requestAnimationFrame(frame);
})();
