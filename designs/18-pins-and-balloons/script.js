(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* =====================================================================
     Room one: the pin display. A fixed grid of pins; each pin is a spring whose target height comes from the
     current mode, pushed down by your hand and lifted by ripples. Only pins that changed are redrawn.
     ===================================================================== */
  const Field = (() => {
    const canvas = document.getElementById('pins');
    const ctx = canvas.getContext('2d', { alpha: false });
    const BG = '#0d0d10';
    const TAU = Math.PI * 2;
    const LEVELS = 32;
    const MODE_BRIGHT = { portrait: 1, terrain: 0.45, flat: 0.25, dusk: 0.36 };

    const K = reduceMotion ? 220 : 80, C = reduceMotion ? 30 : 9;
    const HEAL = 0.22;
    const HAND_R = 84;

    const PORT = window.PIN_PORTRAIT;
    const portrait = new Float32Array(PORT.cols * PORT.rows);
    PORT.rows36.forEach((row, y) => { for (let x = 0; x < PORT.cols; x++) portrait[y * PORT.cols + x] = parseInt(row[x], 36) / PORT.levels; });
    function samplePortrait(u, v) {
      if (u < 0 || v < 0 || u > 1 || v > 1) return 0;
      const fx = u * (PORT.cols - 1), fy = v * (PORT.rows - 1);
      const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(x0 + 1, PORT.cols - 1), y1 = Math.min(y0 + 1, PORT.rows - 1);
      const tx = fx - x0, ty = fy - y0, w = PORT.cols;
      const a = portrait[y0 * w + x0], b = portrait[y0 * w + x1], c = portrait[y1 * w + x0], d = portrait[y1 * w + x1];
      return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
    }

    let W, H, dpr, cell, cellPx, cellCss, cols, rows, n;
    let rect = { x: 0, y: 0, w: 1, h: 1 };
    let h, v, press, tgt, lastLevel;
    let sprites = [];
    let mode = 'portrait', bright = 0, brightTarget = 1, lastBright = -1;
    let forceAll = true, targetsDirty = true, settling = true;
    let time = 0, lastT = performance.now();
    const hand = { x: -999, y: -999, on: false };
    let ripples = [];

    const mix = (a, b, t) => a + (b - a) * t;
    const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
    const lerpC = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

    function makeSprite(t) {
      const c = document.createElement('canvas');
      c.width = c.height = cellPx;
      const g = c.getContext('2d');
      g.fillStyle = BG; g.fillRect(0, 0, cellPx, cellPx);
      const s = cellPx, cx = s / 2, cy = s / 2, R = s * 0.4, lift = s * 0.09 * t;
      g.fillStyle = rgb(lerpC([20, 20, 24], [128, 112, 84], t));
      g.beginPath(); g.arc(cx, cy + lift, R * (0.9 + 0.12 * t), 0, TAU); g.fill();
      const topR = R * (0.86 + 0.2 * t);
      const top = lerpC([31, 32, 38], [255, 244, 222], Math.pow(t, 0.85));
      const grad = g.createRadialGradient(cx - topR * 0.3, cy - lift - topR * 0.35, topR * 0.1, cx, cy - lift, topR);
      grad.addColorStop(0, rgb(lerpC(top, [255, 255, 255], 0.28)));
      grad.addColorStop(1, rgb(top));
      g.fillStyle = grad; g.beginPath(); g.arc(cx, cy - lift * 0.6, topR, 0, TAU); g.fill();
      return c;
    }

    function setup() {
      W = innerWidth; H = innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      let rw, rh, rx, ry;
      if (W < 800) { rw = Math.min(W * 0.78, 340); rh = rw * 1.25; rx = (W - rw) / 2; ry = 64; }
      else { rh = Math.min(H * 0.78, W * 0.4 * 1.25); rw = rh * 0.8; rx = W - rw - W * 0.07; ry = (H - rh) / 2 + 10; }
      rect = { x: rx, y: ry, w: rw, h: rh };

      cell = Math.max(8, Math.round(rw / 60));
      cellPx = Math.max(4, Math.round(cell * dpr));
      cellCss = cellPx / dpr;
      cols = Math.ceil(W / cellCss); rows = Math.ceil(H / cellCss); n = cols * rows;
      canvas.width = cols * cellPx; canvas.height = rows * cellPx;
      canvas.style.width = canvas.width / dpr + 'px'; canvas.style.height = canvas.height / dpr + 'px';
      ctx.fillStyle = BG; ctx.fillRect(0, 0, canvas.width, canvas.height);

      sprites = Array.from({ length: LEVELS }, (_, i) => makeSprite(i / (LEVELS - 1)));
      h = new Float32Array(n); v = new Float32Array(n); press = new Float32Array(n); tgt = new Float32Array(n);
      lastLevel = new Int16Array(n).fill(-1);
      forceAll = true; targetsDirty = true; settling = true; lastBright = -1;

      const root = document.documentElement.style;
      root.setProperty('--px', rx + 'px'); root.setProperty('--py', ry + 'px');
      root.setProperty('--pw', rw + 'px'); root.setProperty('--ph', rh + 'px');
      root.setProperty('--portrait-bottom', (ry + rh) + 'px');
    }

    function computeTargets() {
      const t = reduceMotion ? 0 : time;
      for (let j = 0; j < rows; j++) {
        const cy = (j + 0.5) * cellCss;
        for (let i = 0; i < cols; i++) {
          const cx = (i + 0.5) * cellCss, k = j * cols + i;
          let T;
          if (mode === 'portrait') T = samplePortrait((cx - rect.x) / rect.w, (cy - rect.y) / rect.h);
          else if (mode === 'terrain') T = 0.5 + 0.28 * Math.sin(cx * 0.011 + t * 0.5) + 0.22 * Math.cos(cy * 0.014 - t * 0.37) + 0.12 * Math.sin((cx + cy) * 0.02 + t * 0.8);
          else if (mode === 'dusk') T = 0.42 + 0.17 * Math.sin(cx * 0.008 + t * 0.35) + 0.13 * Math.cos(cy * 0.011 - t * 0.28);
          else T = 0.22 + 0.05 * Math.sin((cx - cy) * 0.012 + t * 0.4);
          tgt[k] = T < 0 ? 0 : T > 1 ? 1 : T;
        }
      }
      targetsDirty = false;
    }

    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min(0.033, (now - lastT) / 1000); lastT = now;
      time += dt;

      bright += (brightTarget - bright) * Math.min(1, dt * 3.5);
      if (Math.abs(bright - brightTarget) < 0.004) bright = brightTarget;
      const brightMoving = Math.abs(bright - lastBright) > 0.004;
      const animated = (mode === 'terrain' || mode === 'dusk') && !reduceMotion && document.body.dataset.theme !== 'light';
      ripples = ripples.filter(r => now - r.t0 < r.dur * 1000);

      if (!settling && !hand.on && !ripples.length && !animated && !brightMoving && !forceAll && !targetsDirty) return;
      if (document.body.dataset.theme === 'light' && !settling && !forceAll && !targetsDirty && !brightMoving) return;   // hidden: nothing to draw

      if (targetsDirty || animated) computeTargets();

      const doAll = forceAll || brightMoving;
      const R2 = HAND_R * HAND_R;
      const useAlpha = bright < 0.995;
      let anyMoving = false;

      for (let j = 0; j < rows; j++) {
        const cy = (j + 0.5) * cellCss;
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i, cx = (i + 0.5) * cellCss;

          let p = press[k];
          if (p > 0) { p -= HEAL * dt; press[k] = p = p < 0 ? 0 : p; if (p > 0) anyMoving = true; }
          if (hand.on) {
            const dx = cx - hand.x, dy = cy - hand.y, d2 = dx * dx + dy * dy;
            if (d2 < R2) { const f = 1 - Math.sqrt(d2) / HAND_R, s = f * f * (3 - 2 * f); if (s > p) { p = s; press[k] = p; } }
          }

          let E = tgt[k] * (1 - p);
          for (let r = 0; r < ripples.length; r++) {
            const rp = ripples[r], age = (now - rp.t0) / 1000;
            const dx = cx - rp.x, dy = cy - rp.y, d = Math.sqrt(dx * dx + dy * dy);
            const off = d - age * 560, band = 64;
            if (off > -band && off < band) E += rp.amp * Math.cos(off / band * Math.PI / 2) * (1 - age / rp.dur);
          }
          E = E < 0 ? 0 : E > 1 ? 1 : E;

          let hh = h[k], vv = v[k];
          vv += ((E - hh) * K - vv * C) * dt; hh += vv * dt;
          if (hh < 0) { hh = 0; vv = 0; } else if (hh > 1.04) { hh = 1.04; vv = 0; }
          h[k] = hh; v[k] = vv;
          if (Math.abs(E - hh) > 0.004 || Math.abs(vv) > 0.01) anyMoving = true;

          let lvl = Math.round(hh * (LEVELS - 1));
          lvl = lvl < 0 ? 0 : lvl > LEVELS - 1 ? LEVELS - 1 : lvl;
          if (doAll || lvl !== lastLevel[k]) {
            lastLevel[k] = lvl;
            const x = i * cellPx, y = j * cellPx;
            if (useAlpha) { ctx.fillStyle = BG; ctx.fillRect(x, y, cellPx, cellPx); ctx.globalAlpha = bright; ctx.drawImage(sprites[lvl], x, y); ctx.globalAlpha = 1; }
            else ctx.drawImage(sprites[lvl], x, y);
          }
        }
      }
      lastBright = bright; forceAll = false; settling = anyMoving;
    }

    let resizeTimer;
    addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setup, 150); });
    setup();
    requestAnimationFrame(t => { lastT = t; frame(t); });

    return {
      setMode(m) { if (m === mode) return; mode = m; brightTarget = MODE_BRIGHT[m]; targetsDirty = true; settling = true; },
      ripple(x, y, amp = 0.5) {
        if (reduceMotion) return;
        if (ripples.length > 4) ripples.shift();
        ripples.push({ x, y, amp, dur: 2.2, t0: performance.now() });
      },
      hand(x, y, on) { hand.x = x; hand.y = y; hand.on = on; if (on) settling = true; }
    };
  })();

  addEventListener('pointermove', e => Field.hand(e.clientX, e.clientY, true), { passive: true });
  document.addEventListener('mouseout', e => { if (!e.relatedTarget) Field.hand(-999, -999, false); });
  addEventListener('pointercancel', () => Field.hand(-999, -999, false));
  addEventListener('blur', () => Field.hand(-999, -999, false));
  addEventListener('pointerdown', e => { Field.hand(e.clientX, e.clientY, true); Field.ripple(e.clientX, e.clientY, 0.5); }, { passive: true });
  addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') Field.hand(-999, -999, false); }, { passive: true });

  /* =====================================================================
     Room two: tethered balloons. Each stage is a small room with its own balloons, robots and ropes
     (the same rules as the first design: springs home, a push away from the hand, a rope of fixed length).
     The balloons rise from their robots when the stage scrolls into view.
     ===================================================================== */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const motion = reduceMotion ? 0 : 1;
  const stages = [];

  function makeStage(root, items) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'tethers'); svg.setAttribute('aria-hidden', 'true');
    root.append(svg);
    const balloons = items.map((it, i) => {
      const a = document.createElement('a');
      a.className = 'balloon'; a.href = it.href;
      if (!it.href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
      a.setAttribute('aria-label', it.aria || it.label);
      const label = document.createElement('span'); label.className = 'label'; label.textContent = it.label;
      a.append(label);
      const robot = document.createElement('div'); robot.className = 'robot'; robot.setAttribute('aria-hidden', 'true'); robot.innerHTML = '<i></i><i></i>';
      const shadow = document.createElement('div'); shadow.className = 'robot-shadow'; shadow.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS(SVG_NS, 'path');
      svg.append(path); root.append(shadow, robot, a);
      return { it, el: a, robot, shadow, path, phase: i * 1.7, depth: [0.2, 0.7, 0.45][i % 3], x: 0, y: 0, vx: 0, vy: 0, rx: 0, ry: 0, L: 0, r: 40, home: { x: 0, y: 0 }, scale: 1 };
    });
    const S = { root, balloons, W: 0, H: 0, active: false, t0: 0, cursor: { x: 0, y: 0, vx: 0, vy: 0, active: false, t: 0 }, risen: reduceMotion ? 1 : 0 };

    S.layout = () => {
      const r = root.getBoundingClientRect();
      S.W = r.width; S.H = r.height;
      const floorY = S.H * 0.8, base = clamp(Math.min(S.W, S.H) * 0.125, 36, 72);
      balloons.forEach(b => {
        b.r = base * b.it.size;
        b.home.x = S.W * b.it.at[0]; b.home.y = S.H * b.it.at[1];
        b.rx = b.home.x; b.ry = floorY + 6 + b.depth * Math.max(0, S.H - floorY - 40);
        b.scale = 0.85 + b.depth * 0.35;
        b.L = (b.ry - (b.home.y + b.r * 1.04)) * 1.12;
        const size = b.r * 2;
        b.el.style.width = size + 'px'; b.el.style.height = size * 1.04 + 'px';
        b.el.style.setProperty('--fs', clamp(b.r * 0.25, 11, 16) + 'px');
        b.x = b.home.x; b.y = S.risen >= 1 ? b.home.y : b.ry - b.r * 1.04 - 16; b.vx = b.vy = 0;
        draw(b, 0);
      });
    };

    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now(), c = S.cursor;
      if (c.active && now > c.t) { const dt = (now - c.t) / 1000; c.vx = clamp((x - c.x) / dt, -1500, 1500); c.vy = clamp((y - c.y) / dt, -1500, 1500); }
      c.x = x; c.y = y; c.t = now; c.active = true;
    });
    const release = () => { S.cursor.active = false; S.cursor.vx = S.cursor.vy = 0; };
    root.addEventListener('pointerleave', release); root.addEventListener('pointercancel', release);
    root.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') release(); });

    new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { if (!S.active) { S.active = true; S.t0 = performance.now(); if (!reduceMotion) { S.risen = 0; S.layout(); } } }
      else { S.active = false; if (!reduceMotion) S.risen = 0; }
    }, { threshold: 0.2 }).observe(root);

    stages.push(S);
    return S;
  }

  const K_HOME = 13, DAMP = 3, REPEL = 1400, WAKE = 5, ROBOT_SPEED = 260;
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

  function step(S, now, dt) {
    const t = now / 1000, c = S.cursor, n = S.balloons.length;
    S.balloons.forEach((b, i) => {
      // rising: each balloon lifts off its robot a little after the one before
      const p = reduceMotion ? 1 : ease((now - S.t0) / 1700 - i * 0.18);
      const startY = b.ry - b.r * 1.04 - 16;
      const hx = b.home.x + Math.sin(t * 0.6 + b.phase * 2) * 9 * motion;
      const hy = (startY + (b.home.y - startY) * p) + Math.sin(t * 0.9 + b.phase) * 7 * motion * p;
      let ax = (hx - b.x) * K_HOME - b.vx * DAMP, ay = (hy - b.y) * K_HOME - b.vy * DAMP;
      if (c.active && motion && p > 0.95) {
        const dx = b.x - c.x, dy = b.y - c.y, d = Math.hypot(dx, dy) || 1, R = b.r * 1.7 + 70;
        if (d < R) {
          const q = 1 - d / R, inner = Math.min(1, d / b.r);
          ax += (dx / d) * q * q * REPEL * inner; ay += (dy / d) * q * q * REPEL * inner;
          b.vx += c.vx * q * q * WAKE * dt; b.vy += c.vy * q * q * WAKE * dt;
        }
      }
      b.vx += ax * dt; b.vy += ay * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    });
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = S.balloons[i], d2 = S.balloons[j], dx = d2.x - a.x, dy = d2.y - a.y, d = Math.hypot(dx, dy) || 1, min = a.r + d2.r + 6;
      if (d < min) {
        const push = (min - d) / 2, nx = dx / d, ny = dy / d;
        a.x -= nx * push; a.y -= ny * push; d2.x += nx * push; d2.y += ny * push;
        const rel = (d2.vx - a.vx) * nx + (d2.vy - a.vy) * ny;
        if (rel < 0) { a.vx += nx * rel * 0.5; a.vy += ny * rel * 0.5; d2.vx -= nx * rel * 0.5; d2.vy -= ny * rel * 0.5; }
      }
    }
    S.balloons.forEach(b => {
      const m = b.r + 4;
      if (b.x < m) { b.x = m; b.vx = Math.abs(b.vx) * 0.4; }
      if (b.x > S.W - m) { b.x = S.W - m; b.vx = -Math.abs(b.vx) * 0.4; }
      if (b.y < m) { b.y = m; b.vy = Math.abs(b.vy) * 0.4; }
      b.rx += clamp((b.x - b.rx) * 5, -ROBOT_SPEED, ROBOT_SPEED) * dt;
      const kx = b.x, ky = b.y + b.r * 1.04;
      let tx = kx - b.rx, ty = ky - b.ry, dist = Math.hypot(tx, ty);
      if (dist > b.L) {
        const k = b.L / dist, nx = b.rx + tx * k, ny = b.ry + ty * k;
        b.x += nx - kx; b.y += ny - ky;
        const ux = tx / dist, uy = ty / dist, vOut = b.vx * ux + b.vy * uy;
        if (vOut > 0) { b.vx -= ux * vOut; b.vy -= uy * vOut; }
        dist = b.L;
      }
      draw(b, dist);
    });
  }

  function draw(b, dist) {
    b.el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px)`;
    b.robot.style.transform = `translate(${b.rx - 15}px, ${b.ry}px) scale(${b.scale})`;
    b.shadow.style.transform = `translate(${b.rx - 22}px, ${b.ry + 12 * b.scale}px) scale(${b.scale})`;
    const kx = b.x, ky = b.y + b.r * 1.04 + 4, ex = b.rx, ey = b.ry + 2;
    const slack = Math.max(0, b.L - dist);
    const sway = Math.sin(performance.now() / 700 + b.phase) * slack * 0.35 + (b.rx - b.x) * 0.1;
    b.path.setAttribute('d', `M${kx.toFixed(1)} ${ky.toFixed(1)} Q${((kx + ex) / 2 + sway).toFixed(1)} ${((ky + ey) / 2 + slack * 0.25).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }

  let lastFrame = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - lastFrame) / 1000); lastFrame = now;
    stages.forEach(S => { if (S.active) step(S, now, dt); });
    requestAnimationFrame(loop);
  }

  /* =====================================================================
     The page itself
     ===================================================================== */
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
  const card = (cls, ...kids) => el('article', { class: 'card ' + cls }, kids);
  const chips = tags => tags && tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, tags.map(t => el('li', null, t)));

  /* ---------- intro ---------- */
  $('eyebrow').textContent = `${P.role} · ${P.school}`;
  $('name').textContent = P.name;
  $('standing').textContent = P.tagline;
  $('lab-line').textContent = `${P.lab}, advised by ${P.advisor}`;
  $('portrait-photo').src = ROOT + P.headshot.src; $('portrait-photo').alt = P.headshot.alt;
  document.querySelectorAll('.view button').forEach(b => b.addEventListener('click', () => {
    document.body.dataset.view = b.dataset.view;
    document.querySelectorAll('.view button').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
  }));

  /* ---------- chapter 1: undergrad, on the pin display ---------- */
  $('undergrad-body').append(
    el('header', { class: 'chap-head' }, el('p', { class: 'num' }, '01'), el('h2', { id: 'undergrad-title' }, 'Undergrad'), el('p', { class: 'era' }, 'Two degrees, two course projects')),
    el('div', { class: 'cards' },
      card('', el('h3', null, 'Two degrees, in parallel'),
        el('p', { class: 'lead' }, `${bs.title} (${bs.note}) and ${ba.title}.`),
        el('p', null, 'I double majored in Computer Science and Economics.')),
      card('', el('p', { class: 'kicker' }, dv.era), el('h3', null, dv.title),
        el('p', null, dv.summary), dv.story && el('p', { class: 'story' }, dv.story), chips(dv.tags))),
    // a class project, kept small on purpose
    el('div', { class: 'aside' },
      el('p', null, el('b', null, pp.title), ` · ${pp.era}. ${pp.summary} ${pp.story}`)));

  /* ---------- chapter 2: the lab and Buoyancé, in the room of balloons ---------- */
  function photoBlocks() {
    const fig = img => el('figure', null, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    const [lead, ...rest] = bu.images, cols = [[], []], heights = [0, 0];
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(img); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig)))));
  }
  $('lab-body').append(
    el('header', { class: 'chap-head' }, el('p', { class: 'num' }, '02'), el('h2', { id: 'lab-title' }, 'The lab and Buoyancé'), el('p', { class: 'era' }, 'Joined as an undergrad, published in the master’s')),
    el('div', { class: 'cards' },
      card('', el('p', { class: 'kicker' }, P.labEra), el('h3', null, P.lab), el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])),
      card('', el('p', { class: 'kicker' }, 'Master’s begins'), el('h3', null, 'Pre-Doctoral MPCS'), el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0])),
      card('main', el('p', { class: 'kicker' }, bu.kicker), el('h3', null, bu.title),
        el('p', { class: 'lead' }, bu.summary), el('p', { class: 'story' }, bu.story),
        el('p', { class: 'cite' }, `${bu.publication.authors}. `, el('i', null, bu.publication.title), `. ${bu.publication.venue}.`),
        chips(bu.tags), photoBlocks())));

  /* ---------- chapter 3: now, on the pins again with glowing balloons ---------- */
  $('now-body').append(
    el('header', { class: 'chap-head' }, el('p', { class: 'num' }, '03'), el('h2', { id: 'now-title' }, 'Now'), el('p', { class: 'era' }, 'Second year')),
    el('div', { class: 'cards' },
      card('', el('h3', null, P.standing), el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2]),
        el('dl', { class: 'facts' },
          el('dt', null, 'Program'), el('dd', null, P.program),
          el('dt', null, 'Undergrad'), el('dd', null, P.undergrad),
          el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))),
      card('', el('h3', null, 'Say hello'), el('p', { class: 'lead mail' }, P.contact.email),
        el('p', { class: 'cite' }, 'The three balloons are the links: email, LinkedIn and my previous portfolio.'))));

  /* ---------- the two sets of balloons ---------- */
  const labStage = makeStage($('stage-lab'), [
    { label: bu.links[0].label, href: bu.links[0].url, size: 1.05, at: [0.3, 0.3] },
    { label: bu.links[1].label, href: bu.links[1].url, size: 0.95, at: [0.72, 0.36] },
    { label: bu.links[2].label, href: bu.links[2].url, size: 1.0, at: [0.5, 0.64] }
  ]);
  const nowStage = makeStage($('stage-now'), [
    { label: 'Email', aria: `Email ${P.contact.email}`, href: 'mailto:' + P.contact.email, size: 1.05, at: [0.3, 0.3] },
    { label: 'LinkedIn', href: P.contact.linkedin, size: 0.95, at: [0.72, 0.36] },
    { label: 'Previous portfolio', href: P.contact.previousSite, size: 1.0, at: [0.5, 0.64] }
  ]);
  let layoutTimer;
  const layoutAll = () => stages.forEach(S => S.layout());
  addEventListener('resize', () => { clearTimeout(layoutTimer); layoutTimer = setTimeout(layoutAll, 120); });
  new ResizeObserver(() => { clearTimeout(layoutTimer); layoutTimer = setTimeout(layoutAll, 60); }).observe($('stage-lab'));
  layoutAll();

  /* ---------- the chapters in the header, and the theme that follows the scroll ---------- */
  const CHAPTERS = [['intro', 'Intro'], ['undergrad', 'Undergrad'], ['lab', 'Lab'], ['now', 'Now']];
  const navLinks = CHAPTERS.map(([id, label]) => { const a = el('a', { href: '#' + id, 'data-chapter': id }, label); $('chapters').append(a); return a; });
  let current = 'intro';
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const sec = en.target, body = document.body;
      if (body.dataset.theme !== sec.dataset.theme) Field.ripple(innerWidth / 2, innerHeight / 2, 0.45);   // the display answers a change of room
      body.dataset.theme = sec.dataset.theme; body.dataset.mode = sec.dataset.mode;
      Field.setMode(sec.dataset.mode);
      current = sec.id;
      navLinks.forEach(a => a.setAttribute('aria-current', a.dataset.chapter === current ? 'true' : 'false'));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('main > section[data-theme]').forEach(s => io.observe(s));

  requestAnimationFrame(loop);
})();
