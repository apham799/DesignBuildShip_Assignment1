(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================================
     The pin display: a fixed grid of pins. Each pin is a spring whose
     target height comes from the current "mode" (portrait / terrain / flat),
     pushed down by your hand and lifted by ripples. Only pins that changed
     are redrawn, so a settled display costs almost nothing.
     ===================================================================== */
  const Field = (() => {
    const canvas = document.getElementById('pins');
    const ctx = canvas.getContext('2d', { alpha: false });
    const BG = '#0d0d10';
    const TAU = Math.PI * 2;
    const LEVELS = 32;
    const MODE_BRIGHT = { portrait: 1, terrain: 0.55, flat: 0.3 };

    // spring feel (stiffer and fully damped when the visitor prefers reduced motion)
    const K = reduceMotion ? 220 : 80, C = reduceMotion ? 30 : 9;
    const HEAL = 0.22;        // how fast a pressed impression recovers (per second)
    const HAND_R = 84;        // radius of the "hand", in CSS px

    // decode the precomputed portrait (base-36 characters -> 0..1)
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
      g.fillStyle = rgb(lerpC([20, 20, 24], [128, 112, 84], t));          // the pin's side, visible when raised
      g.beginPath(); g.arc(cx, cy + lift, R * (0.9 + 0.12 * t), 0, TAU); g.fill();
      const topR = R * (0.86 + 0.2 * t);
      const top = lerpC([31, 32, 38], [255, 244, 222], Math.pow(t, 0.85));  // the pin's head, brighter the higher it is
      const grad = g.createRadialGradient(cx - topR * 0.3, cy - lift - topR * 0.35, topR * 0.1, cx, cy - lift, topR);
      grad.addColorStop(0, rgb(lerpC(top, [255, 255, 255], 0.28)));
      grad.addColorStop(1, rgb(top));
      g.fillStyle = grad; g.beginPath(); g.arc(cx, cy - lift * 0.6, topR, 0, TAU); g.fill();
      return c;
    }

    function setup() {
      W = innerWidth; H = innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      // where the portrait sits
      let rw, rh, rx, ry;
      if (W < 800) { rw = Math.min(W * 0.78, 360); rh = rw * 1.25; rx = (W - rw) / 2; ry = 64; }
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
          if (mode === 'portrait') {
            T = samplePortrait((cx - rect.x) / rect.w, (cy - rect.y) / rect.h);
          } else if (mode === 'terrain') {
            T = 0.5 + 0.28 * Math.sin(cx * 0.011 + t * 0.5) + 0.22 * Math.cos(cy * 0.014 - t * 0.37) + 0.12 * Math.sin((cx + cy) * 0.02 + t * 0.8);
          } else {
            T = 0.22 + 0.05 * Math.sin((cx - cy) * 0.012 + t * 0.4);
          }
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
      const animatedTerrain = mode === 'terrain' && !reduceMotion;
      ripples = ripples.filter(r => now - r.t0 < r.dur * 1000);

      // nothing to do: the display has settled
      if (!settling && !hand.on && !ripples.length && !animatedTerrain && !brightMoving && !forceAll && !targetsDirty) return;

      if (targetsDirty || animatedTerrain) computeTargets();

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
          if (hand.on) {                       // pressing into the pins
            const dx = cx - hand.x, dy = cy - hand.y, d2 = dx * dx + dy * dy;
            if (d2 < R2) { const f = 1 - Math.sqrt(d2) / HAND_R, s = f * f * (3 - 2 * f); if (s > p) { p = s; press[k] = p; } }
          }

          let E = tgt[k] * (1 - p);
          for (let r = 0; r < ripples.length; r++) {   // expanding ring of raised pins
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
    addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { setup(); }, 150); });
    setup();
    requestAnimationFrame(t => { lastT = t; frame(t); });

    return {
      setMode(m) { if (m === mode) return; mode = m; brightTarget = MODE_BRIGHT[m]; targetsDirty = true; settling = true; },
      ripple(x, y, amp = 0.5) {
        if (ripples.length > 4) ripples.shift();
        ripples.push({ x, y, amp, dur: 2.2, t0: performance.now() });
      },
      hand(x, y, on) { hand.x = x; hand.y = y; hand.on = on; if (on) settling = true; },
      get mode() { return mode; }
    };
  })();

  /* ---------- the hand ---------- */
  addEventListener('pointermove', e => Field.hand(e.clientX, e.clientY, true), { passive: true });
  document.addEventListener('mouseout', e => { if (!e.relatedTarget) Field.hand(-999, -999, false); });   // cursor left the window
  addEventListener('pointercancel', () => Field.hand(-999, -999, false));
  addEventListener('blur', () => Field.hand(-999, -999, false));
  addEventListener('pointerdown', e => { Field.hand(e.clientX, e.clientY, true); if (!reduceMotion) Field.ripple(e.clientX, e.clientY, 0.55); }, { passive: true });
  addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') Field.hand(-999, -999, false); }, { passive: true });

  /* =====================================================================
     The page
     ===================================================================== */
  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => v != null && n.setAttribute(k, v));
    kids.flat(Infinity).forEach(k => { if (k != null && k !== false) n.append(k); });
    return n;
  }
  const link = (href, label) => el('a', { href, target: '_blank', rel: 'noopener' }, label);
  const $ = id => document.getElementById(id);
  const project = id => P.projects.find(p => p.id === id);

  /* hero */
  $('eyebrow').textContent = `${P.role} · ${P.school}`;
  $('name').textContent = P.name;
  $('standing').textContent = P.standing;
  $('lab').textContent = `${P.lab}, advised by ${P.advisor}`;
  $('lead').textContent = P.about[2];
  $('portrait-photo').src = ROOT + P.headshot.src;

  document.querySelectorAll('.view button').forEach(b => b.addEventListener('click', () => {
    document.body.dataset.view = b.dataset.view;
    document.querySelectorAll('.view button').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
  }));

  /* work index: newest first, one row open at a time */
  const rowsEl = $('rows');
  let lastBuzz = 0;
  function buzz(summary, amp) {            // the page talks to the pins: rows send a ripple in from the right edge
    const now = performance.now();
    if (reduceMotion || now - lastBuzz < 450 || innerWidth < 800) return;
    lastBuzz = now;
    const r = summary.getBoundingClientRect();
    Field.ripple(innerWidth * 0.86, r.top + r.height / 2, amp);
  }

  // Photos: the first spans the full width; the rest go into two columns, each into whichever column is currently
  // shorter (using each photo's real proportions), so no blank gaps open up between them.
  function photoBlocks(images) {
    const fig = img => el('figure', null,
      el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }),
      el('figcaption', null, img.caption));
    const [lead, ...rest] = images;
    const cols = [[], []], heights = [0, 0];
    rest.forEach(img => {
      const c = heights[0] <= heights[1] ? 0 : 1;
      cols[c].push(img);
      heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2;   // +0.2 allows for the caption and gap
    });
    return [fig(lead), rest.length > 0 && el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col.map(fig))))];
  }

  ['buoyance', 'penpal', 'diver'].forEach((id, idx) => {
    const p = project(id);
    const photos = p.images.length > 0;
    const text = el('div', { class: 'row-text' },
      el('p', { class: 'kicker' }, p.kicker),
      el('p', null, p.summary),
      p.story && el('p', { class: 'story' }, p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'row-links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      p.tags && p.tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, p.tags.map(t => el('li', null, t))));
    const gallery = photos && el('div', { class: 'row-photos' }, photoBlocks(p.images));

    const summary = el('summary', null,
      el('span', { class: 'num' }, String(idx + 1).padStart(2, '0')),
      el('span', { class: 'ttl' }, p.title),
      el('span', { class: 'era' }, p.era || ''),
      el('span', { class: 'chev', 'aria-hidden': 'true' }, '+'));
    const row = el('details', { class: 'row', name: 'work' }, summary,
      el('div', { class: 'row-body' + (photos ? ' has-photos' : '') }, text, gallery));
    if (idx === 0) row.open = true;
    summary.addEventListener('pointerenter', () => buzz(summary, 0.3));
    row.addEventListener('toggle', () => { if (row.open) buzz(summary, 0.5); });
    rowsEl.append(row);
  });

  /* about */
  $('about-copy').append(
    el('h2', { id: 'about-title' }, 'About'),
    el('p', { class: 'lead' }, P.about[0]),
    el('p', null, P.about[1]),
    el('p', null, P.about[2]),
    el('dl', { class: 'facts' },
      el('dt', null, 'Program'), el('dd', null, P.program),
      el('dt', null, 'Undergrad'), el('dd', null, P.undergrad),
      el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`),
      el('dt', null, 'Published'), el('dd', null, link(project('buoyance').links[0].url, `${project('buoyance').title}, ${project('buoyance').publication.venue}`))));
  const aboutImg = $('about-img');
  aboutImg.src = ROOT + P.headshot.src; aboutImg.alt = P.headshot.alt;

  /* contact */
  const mailBtn = link('mailto:' + P.contact.email, P.contact.email);
  mailBtn.className = 'bigmail';
  mailBtn.removeAttribute('target'); mailBtn.removeAttribute('rel');
  mailBtn.addEventListener('pointerenter', () => { if (!reduceMotion && innerWidth >= 800) { const r = mailBtn.getBoundingClientRect(); Field.ripple(innerWidth * 0.86, r.top + r.height / 2, 0.4); } });
  $('contact-copy').append(
    el('h2', { id: 'contact-title' }, 'Contact'),
    mailBtn,
    el('ul', { class: 'elsewhere', 'aria-label': 'Elsewhere' },
      el('li', null, link(P.contact.linkedin, 'LinkedIn')),
      el('li', null, link(P.contact.previousSite, 'Previous portfolio'))),
    el('div', { class: 'foot' },
      el('a', { href: '../../index.html' }, '← Back to the design log'),
      el('span', null, 'Plain HTML, CSS and JavaScript. Nothing here talks to a server.')));

  /* the display follows the section you are in */
  const sections = [...document.querySelectorAll('main > section[data-mode]')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { Field.setMode(en.target.dataset.mode); document.body.dataset.mode = en.target.dataset.mode; }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => io.observe(s));
})();
