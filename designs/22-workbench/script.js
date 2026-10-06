(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = reduceMotion ? 0 : 1;
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
     The seven stops, in the order things happened. Each is a RoverC-style robot on the rail, a balloon in the sky
     and a colour (the colours are the toio cube LEDs from design 5). The toio cube is a separate token on its own mat strip.
     ===================================================================== */
  const STOPS = [
    { id: 'ug',       name: 'Undergrad',  era: 'Undergrad',        color: '#ffd23f' },
    { id: 'diver',    name: dv.shortTitle, era: dv.era,            color: '#29c4ff' },
    { id: 'penpal',   name: pp.title,     era: pp.era,             color: '#8a6bff', small: true },
    { id: 'axlab',    name: 'AxLab',      era: P.labEra,           color: '#2de28b' },
    { id: 'mpcs',     name: 'MPCS',       era: 'Master’s begins',  color: '#ff8a2b' },
    { id: 'buoyance', name: bu.title,     era: bu.era,             color: '#ff4fa3' },
    { id: 'now',      name: 'Now',        era: 'Second year',      color: '#e8eefc' }
  ];
  STOPS.forEach((s, k) => { s.k = k; });
  let sel = 5;                                        // start on Buoyancé, the work I would show first

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
      p.tags && p.tags.length > 0 && el('ul', { class: 'chips-t', 'aria-label': 'Topics' }, p.tags.map(t => el('li', null, t)))
    ] };
  }
  function photos() {
    // the first photo is wide; the rest fill two columns, each going into whichever is shorter
    const [lead, ...rest] = bu.images, cols = [[], []], heights = [0, 0];
    const fig = img => el('figure', { class: 'photo' }, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(fig(img)); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col))));
  }

  /* ---------- words, portrait ---------- */
  $('kicker').textContent = `${P.role} · ${P.school}`;
  $('name').textContent = P.name;
  $('tagline').textContent = P.tagline;
  $('lab').textContent = `${P.lab}, advised by ${P.advisor}`;
  $('photo').src = ROOT + P.headshot.src; $('photo').alt = P.headshot.alt;
  document.querySelectorAll('.view button').forEach(b => b.addEventListener('click', () => {
    $('portrait').dataset.view = b.dataset.view;
    document.querySelectorAll('.view button').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    Field.dirty();
  }));

  /* =====================================================================
     The pin display under the mat. A grid of spring-loaded pins: a raised platform under the reader, the portrait
     in pins, a recess under every cube with a ring around it, ripples when you pick a stop, and your hand.
     ===================================================================== */
  const Field = (() => {
    const canvas = $('pins'), mat = $('mat'), ctx = canvas.getContext('2d', { alpha: false });
    const BG = '#0d0d10', TAU = Math.PI * 2, LEVELS = 28;
    const K = reduceMotion ? 220 : 80, C = reduceMotion ? 30 : 9, HEAL = 0.22, HAND_R = 64;
    const PORT = window.PIN_PORTRAIT;
    const portrait = new Float32Array(PORT.cols * PORT.rows);
    PORT.rows36.forEach((row, y) => { for (let x = 0; x < PORT.cols; x++) portrait[y * PORT.cols + x] = parseInt(row[x], 36) / PORT.levels; });
    const samplePortrait = (u, v) => {
      if (u < 0 || v < 0 || u > 1 || v > 1) return 0;
      const fx = u * (PORT.cols - 1), fy = v * (PORT.rows - 1);
      const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(x0 + 1, PORT.cols - 1), y1 = Math.min(y0 + 1, PORT.rows - 1), tx = fx - x0, ty = fy - y0, w = PORT.cols;
      return (portrait[y0 * w + x0] * (1 - tx) + portrait[y0 * w + x1] * tx) * (1 - ty) + (portrait[y1 * w + x0] * (1 - tx) + portrait[y1 * w + x1] * tx) * ty;
    };

    let W = 0, H = 0, dpr = 1, cell = 12, cellPx = 12, cols = 0, rows = 0, n = 0;
    let h, v, press, tgt, lastLevel, sprites = [];
    let forceAll = true, targetsDirty = true, settling = true, ripples = [], lastT = performance.now();
    const hand = { x: -999, y: -999, on: false };
    const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

    function sprite(t) {
      const c = document.createElement('canvas'); c.width = c.height = cellPx;
      const g = c.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, cellPx, cellPx);
      const s = cellPx, cx = s / 2, cy = s / 2, R = s * 0.4, lift = s * 0.09 * t;
      g.fillStyle = rgb(mixc([20, 20, 24], [128, 112, 84], t));
      g.beginPath(); g.arc(cx, cy + lift, R * (0.9 + 0.12 * t), 0, TAU); g.fill();
      const topR = R * (0.86 + 0.2 * t), top = mixc([31, 32, 38], [255, 244, 222], Math.pow(t, 0.85));
      const grad = g.createRadialGradient(cx - topR * 0.3, cy - lift - topR * 0.35, topR * 0.1, cx, cy - lift, topR);
      grad.addColorStop(0, rgb(mixc(top, [255, 255, 255], 0.28))); grad.addColorStop(1, rgb(top));
      g.fillStyle = grad; g.beginPath(); g.arc(cx, cy - lift * 0.6, topR, 0, TAU); g.fill();
      return c;
    }
    function setup() {
      const r = mat.getBoundingClientRect();
      W = Math.round(r.width); H = Math.round(r.height);
      if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // the pins are sized from the portrait: about 58 pins across it, so the face is clearly a face (the height map is 64 pins wide)
      const pw = $('photo').getBoundingClientRect().width || 300;
      cell = clamp(Math.round(pw / 58), 5, 9);
      while ((W / cell) * (H / cell) > 70000 && cell < 12) cell++;           // keep the pin count sane on a very tall mat
      cellPx = Math.max(4, Math.round(cell * dpr)); const cc = cellPx / dpr;
      cols = Math.ceil(W / cc); rows = Math.ceil(H / cc); n = cols * rows;
      canvas.width = cols * cellPx; canvas.height = rows * cellPx;
      canvas.style.width = canvas.width / dpr + 'px'; canvas.style.height = canvas.height / dpr + 'px';
      ctx.fillStyle = BG; ctx.fillRect(0, 0, canvas.width, canvas.height);
      sprites = Array.from({ length: LEVELS }, (_, i) => sprite(i / (LEVELS - 1)));
      h = new Float32Array(n); v = new Float32Array(n); press = new Float32Array(n); tgt = new Float32Array(n); lastLevel = new Int16Array(n).fill(-1);
      forceAll = targetsDirty = settling = true;
    }
    const rel = e => { const m = mat.getBoundingClientRect(), r = e.getBoundingClientRect(); return { l: r.left - m.left, t: r.top - m.top, r: r.right - m.left, b: r.bottom - m.top, w: r.width, h: r.height, cx: r.left - m.left + r.width / 2, cy: r.top - m.top + r.height / 2 }; };
    const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
    const smoothW = cc => Math.max(10, cc * 1.2);

    function computeTargets() {
      const cc = cellPx / dpr, rd = rel($('reader')), pt = rel($('portrait')), photoMode = $('portrait').dataset.view === 'photo';
      const im = rel($('photo')), cubes = [...document.querySelectorAll('.rover')].map(c => rel(c)), st = rel($('strip'));
      for (let j = 0; j < rows; j++) {
        const cy = (j + 0.5) * cc;
        for (let i = 0; i < cols; i++) {
          const cx = (i + 0.5) * cc, k = j * cols + i;
          let T = 0.12;
          // a raised platform under the reader, with a soft edge
          const dx = Math.max(rd.l - cx, 0, cx - rd.r), dy = Math.max(rd.t - cy, 0, cy - rd.b);
          T = Math.max(T, 0.44 * (1 - smooth(Math.hypot(dx, dy) / smoothW(cc))));
          // the portrait, in pins (flat when the photo is showing)
          if (!photoMode) { const u = (cx - im.l) / im.w, w = (cy - im.t) / im.h; if (u >= 0 && u <= 1 && w >= 0 && w <= 1) T = samplePortrait(u, w); }
          else if (cx > im.l - 10 && cx < im.r + 10 && cy > im.t - 10 && cy < im.b + 10) T = 0.2;
          // the toio strip is a flat printed mat, a little raised
          { const sdx = Math.max(st.l - cx, 0, cx - st.r), sdy = Math.max(st.t - cy, 0, cy - st.b); T = Math.max(T, 0.3 * (1 - smooth(Math.hypot(sdx, sdy) / 10))); }
          // each robot sits in a recess, with a raised ring around it (the selected one has a taller ring)
          cubes.forEach((q, ci) => {
            const d = Math.hypot(cx - q.cx, cy - q.cy), R = q.w * 0.66;
            if (d < R && cy < st.t - 4) T = Math.min(T, 0.02 + 0.1 * smooth(d / R));
            else if (d < R + 26) T = Math.max(T, (ci === sel ? 0.78 : 0.34) * Math.sin(Math.PI * (d - R) / 26));
          });
          tgt[k] = clamp(T, 0, 1);
        }
      }
      targetsDirty = false;
    }
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min(0.033, (now - lastT) / 1000); lastT = now;
      ripples = ripples.filter(r => now - r.t0 < r.dur * 1000);
      if (!n || (!settling && !hand.on && !ripples.length && !forceAll && !targetsDirty)) return;
      if (targetsDirty) computeTargets();
      const cc = cellPx / dpr, R2 = HAND_R * HAND_R;
      let anyMoving = false;
      for (let j = 0; j < rows; j++) {
        const cy = (j + 0.5) * cc;
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i, cx = (i + 0.5) * cc;
          let p = press[k];
          if (p > 0) { p -= HEAL * dt; press[k] = p = p < 0 ? 0 : p; if (p > 0) anyMoving = true; }
          if (hand.on) { const dx = cx - hand.x, dy = cy - hand.y, d2 = dx * dx + dy * dy; if (d2 < R2) { const f = 1 - Math.sqrt(d2) / HAND_R, s = f * f * (3 - 2 * f); if (s > p) { p = s; press[k] = p; } } }
          let E = tgt[k] * (1 - p);
          for (let r = 0; r < ripples.length; r++) {
            const rp = ripples[r], age = (now - rp.t0) / 1000, dx = cx - rp.x, dy = cy - rp.y, d = Math.sqrt(dx * dx + dy * dy), off = d - age * 480, band = 56;
            if (off > -band && off < band) E += rp.amp * Math.cos(off / band * Math.PI / 2) * (1 - age / rp.dur);
          }
          E = E < 0 ? 0 : E > 1 ? 1 : E;
          let hh = h[k], vv = v[k];
          vv += ((E - hh) * K - vv * C) * dt; hh += vv * dt;
          if (hh < 0) { hh = 0; vv = 0; } else if (hh > 1.04) { hh = 1.04; vv = 0; }
          h[k] = hh; v[k] = vv;
          if (Math.abs(E - hh) > 0.004 || Math.abs(vv) > 0.01) anyMoving = true;
          let lvl = Math.round(hh * (LEVELS - 1)); lvl = lvl < 0 ? 0 : lvl > LEVELS - 1 ? LEVELS - 1 : lvl;
          if (forceAll || lvl !== lastLevel[k]) { lastLevel[k] = lvl; ctx.drawImage(sprites[lvl], i * cellPx, j * cellPx); }
        }
      }
      forceAll = false; settling = anyMoving;
    }
    let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(setup, 80); }).observe(mat);
    mat.addEventListener('pointermove', e => { const m = mat.getBoundingClientRect(); hand.x = e.clientX - m.left; hand.y = e.clientY - m.top; hand.on = true; settling = true; }, { passive: true });
    mat.addEventListener('pointerleave', () => { hand.on = false; hand.x = hand.y = -999; });
    mat.addEventListener('pointerdown', e => { const m = mat.getBoundingClientRect(); Field.ripple(e.clientX - m.left, e.clientY - m.top, 0.4); }, { passive: true });
    setup(); requestAnimationFrame(t => { lastT = t; frame(t); });
    return {
      dirty() { targetsDirty = true; settling = true; },
      ripple(x, y, amp = 0.5) { if (reduceMotion) return; if (ripples.length > 4) ripples.shift(); ripples.push({ x, y, amp, dur: 1.8, t0: performance.now() }); },
      rippleAt(elm, amp) { const m = $('mat').getBoundingClientRect(), r = elm.getBoundingClientRect(); this.ripple(r.left - m.left + r.width / 2, r.top - m.top + r.height / 2, amp); }
    };
  })();

  /* =====================================================================
     The rail of cubes, the balloons in the sky and their tethers
     ===================================================================== */
  const sky = $('sky'), rail = $('rail'), table = $('table'), tethers = $('tethers'), chips = $('chips');
  const things = STOPS.map(s => {
    const cube = el('div', { class: 'rover', style: `--led:${s.color}` }, el('span', { class: 'ctl' }), el('span', { class: 'wheel a' }), el('span', { class: 'wheel b' }), el('span', { class: 'wheel c' }), el('span', { class: 'wheel d' }));
    rail.append(el('div', { class: 'slot' }, cube));
    const balloon = el('button', { type: 'button', class: 'balloon' + (s.small ? ' small' : ''), style: `--led:${s.color}`, 'aria-label': `Stop ${s.k + 1} of ${STOPS.length}: ${s.name}. ${s.era}.`, 'aria-pressed': 'false' },
      el('span', { class: 'num', 'aria-hidden': 'true' }, String(s.k + 1)), el('span', { class: 'label', 'aria-hidden': 'true' }, s.name));
    balloon.addEventListener('click', () => select(s.k, { ripple: true, say: true }));
    sky.append(balloon);
    const path = document.createElementNS(SVG_NS, 'path'); tethers.append(path);
    const chip = el('button', { type: 'button', class: 'chip', style: `--led:${s.color}`, 'aria-pressed': 'false', 'aria-label': `Stop ${s.k + 1}: ${s.name}` }, el('b', null, String(s.k + 1)), el('span', { class: 't' }, s.name));
    chip.addEventListener('click', () => select(s.k, { ripple: true, say: true }));
    chips.append(chip);
    return { s, cube, balloon, path, chip, x: 0, y: 0, vx: 0, vy: 0, home: { x: 0, y: 0 }, r: 40, L: 100, cx: 0, cy: 0, phase: s.k * 1.7 };
  });

  let TW = 0, TH = 0;
  function layout() {
    const tr = table.getBoundingClientRect(); TW = tr.width; TH = tr.height;
    const sr = sky.getBoundingClientRect(), skyH = sr.height;
    const slotW = rail.getBoundingClientRect().width / STOPS.length;
    const r = clamp(slotW * 0.36, 20, 46);
    things.forEach((t, i) => {
      const c = t.cube.getBoundingClientRect();
      t.cx = c.left - tr.left + c.width / 2; t.cy = c.top - tr.top + 4;                 // where the tether is tied (top of the cube)
      t.r = r * (t.s.small ? 0.82 : 1);
      t.home.x = t.cx; t.home.y = (sr.top - tr.top) + t.r + 10 + (i % 2 ? 14 : 0);
      t.L = (t.cy - (t.home.y + t.r * 1.04)) * 1.1;
      t.balloon.style.width = t.r * 2 + 'px'; t.balloon.style.height = t.r * 2.08 + 'px';
      t.balloon.style.setProperty('--fs', clamp(t.r * 0.3, 10, 15) + 'px');
      if (!t.x && !t.y) { t.x = t.home.x; t.y = t.home.y + (reduceMotion ? 0 : 40); }
    });
    tethers.setAttribute('viewBox', `0 0 ${TW} ${TH}`);
  }
  new ResizeObserver(layout).observe(table);
  addEventListener('load', () => { layout(); Field.dirty(); T.x = T.target = slotCenter(sel); paintToio(); });

  const cursor = { x: 0, y: 0, vx: 0, vy: 0, active: false, t: 0 };
  sky.addEventListener('pointermove', e => {
    const tr = table.getBoundingClientRect(), x = e.clientX - tr.left, y = e.clientY - tr.top, now = performance.now();
    if (cursor.active && now > cursor.t) { const dt = (now - cursor.t) / 1000; cursor.vx = clamp((x - cursor.x) / dt, -1400, 1400); cursor.vy = clamp((y - cursor.y) / dt, -1400, 1400); }
    cursor.x = x; cursor.y = y; cursor.t = now; cursor.active = true;
  });
  const letGo = () => { cursor.active = false; cursor.vx = cursor.vy = 0; };
  sky.addEventListener('pointerleave', letGo); sky.addEventListener('pointercancel', letGo);
  sky.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') letGo(); });

  const K_HOME = 13, DAMP = reduceMotion ? 12 : 3, REPEL = 1200, WAKE = 4;
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000); last = now;
    if (!reduceMotion) {
      T.v += ((T.target - T.x) * 60 - T.v * 11) * dt; T.x += T.v * dt;
      T.angle += ((Math.abs(T.v) > 40 ? (T.v > 0 ? 90 : -90) : 0) - T.angle) * Math.min(1, dt * 8);
      paintToio();
    }
    const tt = now / 1000;
    things.forEach((t, i) => {
      const lift = i === sel ? 20 : 0;
      const hx = t.home.x + Math.sin(tt * 0.6 + t.phase * 2) * 5 * motion, hy = t.home.y - lift + Math.sin(tt * 0.9 + t.phase) * 5 * motion;
      let ax = (hx - t.x) * K_HOME - t.vx * DAMP, ay = (hy - t.y) * K_HOME - t.vy * DAMP;
      if (cursor.active && motion) {
        const dx = t.x - cursor.x, dy = t.y - cursor.y, d = Math.hypot(dx, dy) || 1, R = t.r * 1.6 + 50;
        if (d < R) { const q = 1 - d / R, inner = Math.min(1, d / t.r); ax += (dx / d) * q * q * REPEL * inner; ay += (dy / d) * q * q * REPEL * inner; t.vx += cursor.vx * q * q * WAKE * dt; t.vy += cursor.vy * q * q * WAKE * dt; }
      }
      t.vx += ax * dt; t.vy += ay * dt; t.x += t.vx * dt; t.y += t.vy * dt;
    });
    for (let i = 0; i < things.length; i++) for (let j = i + 1; j < things.length; j++) {
      const a = things[i], b = things[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, min = a.r + b.r + 3;
      if (d < min) { const push = (min - d) / 2, nx = dx / d, ny = dy / d; a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push; }
    }
    things.forEach((t, i) => {
      // balloons stay inside the sky, and the tether is a rope of fixed length from the cube
      const sr = sky.getBoundingClientRect(), tr = table.getBoundingClientRect(), top = sr.top - tr.top, m = t.r + 3;
      t.x = clamp(t.x, m, TW - m); if (t.y < top + m) { t.y = top + m; t.vy = Math.abs(t.vy) * 0.4; }
      const kx = t.x, ky = t.y + t.r * 1.04; let ddx = kx - t.cx, ddy = ky - t.cy; const dist = Math.hypot(ddx, ddy), Lmax = t.L + (i === sel ? 20 : 0);
      if (dist > Lmax) { const k = Lmax / dist; t.x += t.cx + ddx * k - kx; t.y += t.cy + ddy * k - ky; }
      t.balloon.style.transform = `translate(${(t.x - t.r).toFixed(1)}px, ${(t.y - t.r).toFixed(1)}px)`;
      const slack = Math.max(0, Lmax - Math.min(dist, Lmax)), sway = Math.sin(now / 700 + t.phase) * slack * 0.3 * motion + (t.cx - t.x) * 0.1;
      const ex = t.x, ey = t.y + t.r * 1.04 + 3;
      t.path.setAttribute('d', `M${ex.toFixed(1)} ${ey.toFixed(1)} Q${((ex + t.cx) / 2 + sway).toFixed(1)} ${((ey + t.cy) / 2 + slack * 0.2).toFixed(1)} ${t.cx.toFixed(1)} ${t.cy.toFixed(1)}`);
    });
    requestAnimationFrame(loop);
  }

  /* =====================================================================
     Picking a stop: its cube spins, its balloon is reeled higher, the pins ripple, and the reader changes
     ===================================================================== */
  const reader = $('reader');
  function select(k, opts = {}) {
    sel = k;
    const s = STOPS[k], w = words(s.id), prev = STOPS[k - 1], next = STOPS[k + 1];
    things.forEach((t, i) => {
      t.balloon.classList.toggle('on', i === k); t.balloon.setAttribute('aria-pressed', String(i === k));
      t.chip.classList.toggle('on', i === k); t.chip.setAttribute('aria-pressed', String(i === k));
      t.cube.classList.toggle('on', i === k);
    });
    const cube = things[k].cube;
    toioTo(k);
    if (opts.ripple && !reduceMotion) Field.rippleAt(cube, 0.55);
    const step = (q, dir) => {
      if (!q) return el('span');
      const b = el('button', { type: 'button', class: 'step ' + dir }, dir === 'prev' ? `← ${q.k + 1} ${q.name}` : `${q.k + 1} ${q.name} →`);
      b.addEventListener('click', () => { select(q.k, { ripple: true, say: true }); const nb = reader.querySelector('.step.' + dir) || reader.querySelector('.step'); if (nb) nb.focus({ preventScroll: true }); });
      return b;
    };
    reader.style.setProperty('--led', s.color);
    reader.replaceChildren(...[
      el('p', { class: 'ref' }, el('span', { class: 'dot', 'aria-hidden': 'true' }, String(k + 1)), `Stop ${k + 1} of ${STOPS.length} · ${s.era}`),
      el('h2', null, w.title), w.body, s.id === 'buoyance' && photos(),
      el('div', { class: 'steps' }, step(prev, 'prev'), step(next, 'next'))].flat(Infinity).filter(Boolean));
    Field.dirty();
    if (opts.say) say(`Stop ${k + 1} of ${STOPS.length}: ${s.name}.`);
  }

  /* =====================================================================
     The toio cube: a separate token on a printed mat strip. It drives to the stop you pick (a smooth
     target-position move, like the toio's own), takes on that stop's colour and reports its simulated position ID.
     ===================================================================== */
  const strip = $('strip'), toio = $('toio'), stripId = $('stripId');
  const RANGE = { x0: 98, x1: 402, y0: 142, y1: 358 };      // the toio Core Cube mat coordinate range
  const T = { x: 0, target: 0, v: 0, angle: 0 };
  const slotCenter = k => { const sr = strip.getBoundingClientRect(), c = things[k].cube.getBoundingClientRect(); return c.left - sr.left + c.width / 2; };
  function toioTo(k) {
    T.target = slotCenter(k);
    toio.style.setProperty('--led', STOPS[k].color);
    if (reduceMotion) { T.x = T.target; paintToio(); }
  }
  function paintToio() {
    const sw = strip.clientWidth || 1;
    toio.style.transform = `translate(${(T.x - toio.offsetWidth / 2).toFixed(1)}px, -50%) rotate(${T.angle.toFixed(1)}deg)`;
    const px = Math.round(RANGE.x0 + (T.x / sw) * (RANGE.x1 - RANGE.x0)), py = Math.round((RANGE.y0 + RANGE.y1) / 2);
    stripId.textContent = `toio · simulated · x ${px}  y ${py}  angle ${Math.round(((T.angle % 360) + 360) % 360)}°`;
  }
  // a click on the strip sends the toio to the nearest stop (the balloons and chips remain the keyboard way)
  strip.addEventListener('click', e => {
    const x = e.clientX - strip.getBoundingClientRect().left;
    let best = 0, bd = 1e9; things.forEach((t, i) => { const d = Math.abs(slotCenter(i) - x); if (d < bd) { bd = d; best = i; } });
    select(best, { ripple: true, say: true });
  });

  /* ---------- About and Contact ---------- */
  const dlg = $('dlg'), dlgBody = $('dlgBody');
  function openInfo(title, kicker, body) {
    dlgBody.replaceChildren(el('p', { class: 'ref' }, kicker), el('h2', { id: 'dlg-title' }, title), ...body.flat(Infinity).filter(Boolean));
    dlg.showModal();
  }
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.open === 'about') openInfo('About', 'The person at the bench', [
      el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))]);
    else openInfo('Say hello', 'Contact', [
      el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
      el('ul', { class: 'links' }, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio')))]);
  }));

  select(sel);
  layout();
  T.x = T.target = slotCenter(sel); paintToio();
  addEventListener("resize", () => { T.x = T.target = slotCenter(sel); paintToio(); });
  requestAnimationFrame(loop);
  // when the page wakes up, the pins answer once from the cubes in turn
  if (!reduceMotion) setTimeout(() => things.forEach((t, i) => setTimeout(() => Field.rippleAt(t.cube, 0.35), i * 110)), 500);
})();
