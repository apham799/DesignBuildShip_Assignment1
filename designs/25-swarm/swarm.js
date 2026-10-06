/* =====================================================================
   The swarm: RoverC robots, each reeling a balloon, and toio cubes wander the page like NPCs behind the content.
   They only ever go where nothing is: every time the page loads or resizes, it measures every line of text, image, card and button
   and the robots plan their routes through the free space. A button in the bar pauses them.
   ===================================================================== */
(() => {
  const P = window.PORTFOLIO;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = ['#ffd23f', '#29c4ff', '#8a6bff', '#2de28b', '#ff8a2b', '#ff4fa3'];   // the toio LED colours used on the page
  const CELL = 20, MIN_WIDTH = 1040;      // narrower than this the content fills the window: no free space, so no swarm and no button
  const layer = document.createElement('div');
  layer.className = 'swarm'; layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  const btn = $('swarmBtn'), status = $('status');
  let paused = reduceMotion, agents = [], W = 0, H = 0, cols = 0, rows = 0, sat = null;

  /* ---------- what is in the way: every line of text and every box, in page coordinates ---------- */
  function obstacles() {
    const main = document.querySelector('main'), out = [];
    const ox = scrollX, oy = scrollY;
    const add = (r, pad) => { if (r.width > 0.5 && r.height > 0.5) out.push([r.left + ox - pad, r.top + oy - pad, r.right + ox + pad, r.bottom + oy + pad]); };
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.nodeValue.trim()) continue;
      const parent = n.parentElement;
      if (!parent || parent.closest('script, style, noscript, [hidden]')) continue;
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) add(r, 10);
    }
    main.querySelectorAll('img, figure, .mat, .facts, .links a, .chips li, .big, .st, .toio, .rover-wrap, button, .path-head').forEach(e => add(e.getBoundingClientRect(), 12));
    // the whole gutter beside the story belongs to the line, its stations and its own robot, balloon and toio
    const j = $('path'), s = $('story');
    if (j && s) { const a = j.getBoundingClientRect(), b = s.getBoundingClientRect(); add({ left: a.left, top: a.top, right: b.left + parseFloat(getComputedStyle(s).paddingLeft), bottom: a.bottom, width: 1, height: 1 }, 0); }
    return out;
  }

  /* an occupancy grid with a summed-area table, so "is this whole box free?" is a constant-time question */
  function build() {
    W = document.documentElement.clientWidth; H = Math.max(document.documentElement.scrollHeight, innerHeight);
    cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL);
    layer.style.height = H + 'px';                         // the layer is as tall as the page, so robots further down are not clipped
    const blocked = new Uint8Array(cols * rows);
    obstacles().forEach(([l, t, r, b]) => {
      const c0 = clamp(Math.floor(l / CELL), 0, cols - 1), c1 = clamp(Math.floor((r - 0.01) / CELL), 0, cols - 1);
      const r0 = clamp(Math.floor(t / CELL), 0, rows - 1), r1 = clamp(Math.floor((b - 0.01) / CELL), 0, rows - 1);
      for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) blocked[y * cols + x] = 1;
    });
    sat = new Int32Array((cols + 1) * (rows + 1));
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++)
      sat[(y + 1) * (cols + 1) + x + 1] = blocked[y * cols + x] + sat[y * (cols + 1) + x + 1] + sat[(y + 1) * (cols + 1) + x] - sat[y * (cols + 1) + x];
  }
  function boxFree(l, t, r, b) {
    if (l < 4 || t < 0 || r > W - 4 || b > H) return false;
    const c0 = Math.floor(l / CELL), c1 = Math.floor((r - 0.01) / CELL), r0 = Math.floor(t / CELL), r1 = Math.floor((b - 0.01) / CELL);
    const s = (y, x) => sat[y * (cols + 1) + x];
    return s(r1 + 1, c1 + 1) - s(r0, c1 + 1) - s(r1 + 1, c0) + s(r0, c0) === 0;
  }

  /* ---------- the agents ---------- */
  // a RoverC with its balloon needs a tall free box (the balloon floats above it); a toio needs a small one
  const FOOT = { rover: [-50, -154, 50, 20], toio: [-18, -18, 18, 18] };
  const free = (a, x, y) => { const f = FOOT[a.kind]; return boxFree(x + f[0], y + f[1], x + f[2], y + f[3]); };
  function pathFree(a, x0, y0, x1, y1) {
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 10);
    for (let i = 1; i <= n; i++) if (!free(a, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n)) return false;
    return true;
  }
  function makeAgent(kind, i) {
    const root = document.createElement('div'); root.className = 'npc ' + kind;
    const color = COLORS[i % COLORS.length];
    root.style.setProperty('--led', color);
    const a = { kind, root, x: 0, y: 0, tx: 0, ty: 0, state: 'wait', wait: 0.4 + Math.random() * 2, heading: Math.random() * 360, vx: 0, vy: 0, phase: Math.random() * 6.28, bx: 0, by: -100, bvx: 0, bvy: 0, home: 0, size: 0.85 + Math.random() * 0.3 };
    if (kind === 'rover') {
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'npc-tether'); svg.setAttribute('focusable', 'false');
      a.path = document.createElementNS(NS, 'path'); svg.append(a.path);
      a.balloon = document.createElement('div'); a.balloon.className = 'npc-balloon';
      const body = document.createElement('div'); body.className = 'npc-rover';
      body.innerHTML = '<span class="ctl"></span><span class="wheel a"></span><span class="wheel b"></span><span class="wheel c"></span><span class="wheel d"></span>';
      root.append(svg, a.balloon, body);
    } else {
      root.innerHTML = '<div class="npc-toio"><span class="led"></span></div>';
      a.body = root.firstChild;
    }
    layer.append(root);
    return a;
  }
  function spawn() {
    agents.forEach(a => a.root.remove()); agents = [];
    if (W < MIN_WIDTH) return;
    const count = clamp(Math.round(H / 620), 4, 14);
    for (let i = 0; i < count; i++) {
      const a = makeAgent(i % 2 === 0 ? 'rover' : 'toio', i);
      const yMid = (i + 0.5) / count * H;
      let placed = false;
      for (let t = 0; t < 400 && !placed; t++) {
        const x = 30 + Math.random() * (W - 60), y = clamp(yMid + (Math.random() - 0.5) * (H / count) * 1.4, 20, H - 20);
        if (free(a, x, y)) { a.x = x; a.y = y; a.home = y; placed = true; }
      }
      if (!placed) { a.root.remove(); continue; }
      a.tx = a.x; a.ty = a.y; a.bx = a.x; a.by = a.y - 100;
      agents.push(a);
    }
    btn.hidden = agents.length === 0;
    paint(0, performance.now());
  }

  function pick(a) {
    for (let t = 0; t < 30; t++) {
      const ang = Math.random() * Math.PI * 2, d = 70 + Math.random() * 260;
      const x = a.x + Math.cos(ang) * d, y = clamp(a.y + Math.sin(ang) * d, a.home - 700, a.home + 700);
      if (free(a, x, y) && pathFree(a, a.x, a.y, x, y)) { a.tx = x; a.ty = y; a.state = 'go'; return; }
    }
    a.state = 'wait'; a.wait = 1.5 + Math.random() * 2;                 // boxed in for now: wait and try again
  }
  function step(a, dt) {
    if (a.state === 'wait') { a.wait -= dt; a.vx = a.vy = 0; if (a.wait <= 0) pick(a); return; }
    const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
    if (d < 2) { a.state = 'wait'; a.wait = 0.8 + Math.random() * 3; a.vx = a.vy = 0; return; }
    const ux = dx / d, uy = dy / d;
    if (a.kind === 'toio') {                                           // a toio turns to face where it is going, then drives
      const want = Math.atan2(uy, ux) * 180 / Math.PI + 90;
      let diff = ((want - a.heading + 540) % 360) - 180;
      a.heading += clamp(diff, -300 * dt, 300 * dt);
      if (Math.abs(diff) > 14) { a.vx = a.vy = 0; return; }
    }
    const sp = (a.kind === 'rover' ? 34 : 46) * a.size;
    const nx = a.x + ux * sp * dt, ny = a.y + uy * sp * dt;
    if (!free(a, nx, ny)) { a.state = 'wait'; a.wait = 0.3; a.vx = a.vy = 0; return; }   // the page changed under it: stop and re-plan
    a.vx = ux * sp; a.vy = uy * sp; a.x = nx; a.y = ny;
  }
  function paint(dt, now) {
    const t = now / 1000;
    agents.forEach(a => {
      if (a.kind === 'rover') {
        if (dt > 0) {
          // the balloon floats above its robot on a tether, leaning back when the robot drives
          const hx = a.x - a.vx * 0.5 + Math.sin(t * 0.7 + a.phase) * 4, hy = a.y - 96 * a.size + Math.sin(t * 0.9 + a.phase) * 3;
          a.bvx += ((hx - a.bx) * 13 - a.bvx * 3) * dt; a.bvy += ((hy - a.by) * 13 - a.bvy * 3) * dt; a.bx += a.bvx * dt; a.by += a.bvy * dt;
        }
        const r = 20 * a.size, kx = a.bx - a.x, ky = a.by - a.y + r * 1.06;
        a.root.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px) scale(${a.size.toFixed(2)})`;
        a.balloon.style.transform = `translate(${(a.bx - a.x - 20).toFixed(1)}px, ${(a.by - a.y - 21).toFixed(1)}px)`;
        a.path.setAttribute('d', `M0 -8 Q${(kx * 0.5).toFixed(1)} ${((ky - 8) * 0.55).toFixed(1)} ${kx.toFixed(1)} ${ky.toFixed(1)}`);
      } else {
        a.root.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px)`;
        a.body.style.transform = `translate(-14px, -14px) rotate(${a.heading.toFixed(1)}deg) scale(${a.size.toFixed(2)})`;
      }
    });
  }
  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (paused || document.hidden) return;
    agents.forEach(a => step(a, dt));
    paint(dt, now);
  }

  /* ---------- the button ---------- */
  function setPaused(p, announce) {
    paused = p;
    btn.setAttribute('aria-pressed', String(p));
    btn.setAttribute('aria-label', p ? 'Play robots' : 'Pause robots');
    btn.querySelector('.lbl').textContent = p ? 'Play robots' : 'Pause robots';
    btn.querySelector('.ico').innerHTML = p ? '&#9654;' : '&#10074;&#10074;';
    layer.classList.toggle('paused', p);
    if (announce) status.textContent = p ? 'The background robots are paused.' : 'The background robots are moving.';
  }
  btn.addEventListener('click', () => setPaused(!paused, true));
  setPaused(paused, false);

  /* ---------- plan, and re-plan whenever the page changes shape ---------- */
  let timer;
  function plan() { build(); spawn(); layer.style.visibility = ''; }
  // while the page is changing shape the robots are hidden, then they are placed again in the new free space
  function schedule() { layer.style.visibility = 'hidden'; clearTimeout(timer); timer = setTimeout(plan, 300); }
  addEventListener('resize', schedule);
  addEventListener('load', () => setTimeout(plan, 300));
  new ResizeObserver(schedule).observe(document.querySelector('main'));
  document.fonts && document.fonts.ready.then(schedule);
  plan();
  requestAnimationFrame(loop);
  window.__swarm = { get agents() { return agents; }, obstacles, get paused() { return paused; } };    // read by the tests only
})();
