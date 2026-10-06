(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const stage = document.getElementById('stage');
  const svg = document.getElementById('tethers');
  const hint = document.getElementById('hint');
  const list = document.getElementById('project-list');
  const panel = document.getElementById('panel');
  const panelBody = document.getElementById('panel-body');

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = reduceMotion ? 0 : 1;

  const headshot = document.getElementById('headshot');
  headshot.src = ROOT + P.headshot.src;
  headshot.alt = P.headshot.alt;
  document.getElementById('name').textContent = P.name;
  document.getElementById('status').replaceChildren(P.role, document.createElement('br'), P.status);

  /* ---------- what the balloons are ---------- */
  // size: multiplier on the base radius. wide/tall: home position as a fraction of stage width / height.
  const SECTIONS = [
    { id: 'buoyance', label: P.projects[0].title,                       size: 1.45, wide: [0.64, 0.36], tall: [0.50, 0.31] },
    { id: 'penpal',   label: P.projects[1].title,                       size: 0.95, wide: [0.85, 0.20], tall: [0.22, 0.47] },
    { id: 'diver',    label: P.projects[2].shortTitle,                  size: 1.00, wide: [0.47, 0.50], tall: [0.82, 0.46] },
    { id: 'about',    label: 'About',                                   size: 0.85, wide: [0.29, 0.57], tall: [0.34, 0.60] },
    { id: 'contact',  label: 'Contact',                                 size: 0.80, wide: [0.90, 0.52], tall: [0.64, 0.66] }
  ];

  /* ---------- build DOM ---------- */
  const balloons = SECTIONS.map((s, i) => {
    const el = document.createElement('button');
    el.className = 'balloon';
    el.type = 'button';
    el.setAttribute('aria-label', `Open ${s.label}`);
    el.innerHTML = '<span class="seam"></span><span class="label"></span>';
    el.querySelector('.label').textContent = s.label;
    stage.appendChild(el);

    const robot = document.createElement('div');
    robot.className = 'robot';
    robot.innerHTML = '<i></i><i></i>';
    robot.setAttribute('aria-hidden', 'true');
    const shadow = document.createElement('div');
    shadow.className = 'robot-shadow';
    stage.append(shadow, robot);

    const path = document.createElementNS(SVG_NS, 'path');
    svg.appendChild(path);

    el.addEventListener('click', () => { openSection(s.id); bump(b); });

    const b = {
      s, el, robot, shadow, path,
      phase: i * 1.7,
      depth: [0.45, 0.1, 0.8, 0.3, 0.65][i % 5], scale: 1,
      r: 0, home: { x: 0, y: 0 }, x: 0, y: 0, vx: 0, vy: 0,
      rx: 0, ry: 0, L: 0
    };
    return b;
  });

  // Text links: the always-available version of the same navigation.
  SECTIONS.forEach(s => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = s.id === 'diver' ? P.projects[2].title : s.label;
    btn.addEventListener('click', () => openSection(s.id));
    li.appendChild(btn);
    list.appendChild(li);
  });

  /* ---------- layout ---------- */
  let W = 0, H = 0, floorY = 0;

  function layout() {
    const rect = stage.getBoundingClientRect();
    W = rect.width; H = rect.height;
    const floorPct = parseFloat(getComputedStyle(stage).getPropertyValue('--floor-y')) / 100;
    floorY = H * floorPct;
    const narrow = W < 640;
    const base = narrow ? Math.min(W, H) * 0.115 : Math.min(W, H) * 0.075;

    balloons.forEach(b => {
      b.r = Math.max(34, base * b.s.size);
      const [fx, fy] = narrow ? b.s.tall : b.s.wide;
      b.home.x = W * fx;
      b.home.y = H * fy;
      b.x = b.home.x; b.y = b.home.y; b.vx = b.vy = 0;

      const size = b.r * 2;
      b.el.style.width = size + 'px';
      b.el.style.height = size * 1.04 + 'px';
      b.el.style.setProperty('--fs', Math.max(11, Math.min(18, b.r * 0.27)) + 'px');

      // robots are scattered at different depths on the floor, like in the lab photos
      const floorDepth = Math.max(0, H - floorY - 96);
      const robotTop = floorY + 6 + b.depth * floorDepth;
      b.scale = 0.85 + b.depth * 0.4;
      b.rx = b.home.x;
      b.ry = robotTop;
      const homeDist = robotTop - (b.home.y + b.r * 1.04);
      b.L = homeDist * 1.1;
    });

    // On narrow screens the title block is tall; slide the whole group down so no balloon covers it.
    if (narrow) {
      const titleBottom = document.querySelector('.title').getBoundingClientRect().bottom - rect.top;
      const highest = Math.min(...balloons.map(b => b.home.y - b.r));
      const room = Math.min(...balloons.map(b => b.ry - 40 - (b.home.y + b.r * 1.04))); // keep a visible tether
      const dy = Math.max(0, Math.min(titleBottom + 14 - highest, room));
      balloons.forEach(b => {
        b.home.y += dy; b.y = b.home.y;
        b.L = (b.ry - (b.home.y + b.r * 1.04)) * 1.1;
      });
    }
  }

  /* ---------- pointer (the "hand" in the room) ---------- */
  const cursor = { x: 0, y: 0, vx: 0, vy: 0, active: false, t: 0 };

  stage.addEventListener('pointermove', e => {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const now = performance.now();
    if (cursor.active && now > cursor.t) {
      const dt = (now - cursor.t) / 1000;
      cursor.vx = Math.max(-1500, Math.min(1500, (x - cursor.x) / dt));
      cursor.vy = Math.max(-1500, Math.min(1500, (y - cursor.y) / dt));
    }
    cursor.x = x; cursor.y = y; cursor.t = now; cursor.active = true;
  });
  const release = () => { cursor.active = false; cursor.vx = cursor.vy = 0; };
  stage.addEventListener('pointerleave', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') release(); });

  function bump(b) { b.vy += 220; } // little downward dip when you press one

  /* ---------- simulation ---------- */
  const K_HOME = 13;      // spring back toward home
  const DAMP = 3.0;       // air drag
  const REPEL = 1400;     // gentle push away from the hand (weak, so slow approaches can still click)
  const WAKE = 5;         // how much a moving hand drags air along: fast sweeps send balloons flying
  const ROBOT_SPEED = 260; // px/s the little robots can drive

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const t = now / 1000;

    for (const b of balloons) {
      const hx = b.home.x + Math.sin(t * 0.6 + b.phase * 2) * 9 * motion;
      const hy = b.home.y + Math.sin(t * 0.9 + b.phase) * 7 * motion;

      let ax = (hx - b.x) * K_HOME - b.vx * DAMP;
      let ay = (hy - b.y) * K_HOME - b.vy * DAMP;

      if (cursor.active) {
        const dx = b.x - cursor.x, dy = b.y - cursor.y;
        const d = Math.hypot(dx, dy) || 1;
        const R = b.r * 1.7 + 70;
        if (d < R) {
          const q = 1 - d / R;
          const inner = Math.min(1, d / b.r); // fades to zero at the center so you can aim at it
          ax += (dx / d) * q * q * REPEL * inner;
          ay += (dy / d) * q * q * REPEL * inner;
          b.vx += cursor.vx * q * q * WAKE * dt * motion;
          b.vy += cursor.vy * q * q * WAKE * dt * motion;
        }
      }

      b.vx += ax * dt; b.vy += ay * dt;
      b.x += b.vx * dt; b.y += b.vy * dt;
    }

    // balloons don't pass through each other
    for (let i = 0; i < balloons.length; i++) {
      for (let j = i + 1; j < balloons.length; j++) {
        const a = balloons[i], c = balloons[j];
        const dx = c.x - a.x, dy = c.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const min = a.r + c.r + 6;
        if (d < min) {
          const push = (min - d) / 2, nx = dx / d, ny = dy / d;
          a.x -= nx * push; a.y -= ny * push;
          c.x += nx * push; c.y += ny * push;
          const rel = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (rel < 0) { a.vx += nx * rel * 0.5; a.vy += ny * rel * 0.5; c.vx -= nx * rel * 0.5; c.vy -= ny * rel * 0.5; }
        }
      }
    }

    for (const b of balloons) {
      // keep inside the room
      const m = b.r + 4;
      if (b.x < m) { b.x = m; b.vx = Math.abs(b.vx) * 0.4; }
      if (b.x > W - m) { b.x = W - m; b.vx = -Math.abs(b.vx) * 0.4; }
      if (b.y < m) { b.y = m; b.vy = Math.abs(b.vy) * 0.4; }

      // robot drives to sit under its balloon
      const dxr = b.x - b.rx;
      b.rx += Math.max(-ROBOT_SPEED, Math.min(ROBOT_SPEED, dxr * 5)) * dt;

      // tether is a rope of fixed length: balloon can't float further than L from the robot
      const kx = b.x, ky = b.y + b.r * 1.04;
      let tx = kx - b.rx, ty = ky - b.ry;
      let dist = Math.hypot(tx, ty);
      if (dist > b.L) {
        const k = b.L / dist;
        const nx = b.rx + tx * k, ny = b.ry + ty * k;
        b.x += nx - kx; b.y += ny - ky;
        // lose the outward velocity component
        const ux = tx / dist, uy = ty / dist;
        const vOut = b.vx * ux + b.vy * uy;
        if (vOut > 0) { b.vx -= ux * vOut; b.vy -= uy * vOut; }
        tx *= k; ty *= k; dist = b.L;
      }

      draw(b, dist);
    }

    requestAnimationFrame(frame);
  }

  function draw(b, dist) {
    b.el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px)`;
    b.robot.style.transform = `translate(${b.rx - 15}px, ${b.ry}px) scale(${b.scale})`;
    b.shadow.style.transform = `translate(${b.rx - 22}px, ${b.ry + 12 * b.scale}px) scale(${b.scale})`;

    // rope: slack makes it sag sideways
    const kx = b.x, ky = b.y + b.r * 1.04 + 4;
    const ex = b.rx, ey = b.ry + 2;
    const slack = Math.max(0, b.L - dist);
    const sway = Math.sin(performance.now() / 700 + b.phase) * slack * 0.35 + (b.rx - b.x) * 0.1;
    const cx = (kx + ex) / 2 + sway;
    const cy = (ky + ey) / 2 + slack * 0.25;
    b.path.setAttribute('d', `M${kx.toFixed(1)} ${ky.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }

  /* ---------- detail panel ---------- */
  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    if (props) Object.entries(props).forEach(([k, v]) => v != null && n.setAttribute(k, v));
    kids.flat().forEach(k => n.append(k));
    return n;
  }
  const text = (tag, str, cls) => el(tag, cls ? { class: cls } : null, str);
  const link = (href, label) => el('a', { href, target: '_blank', rel: 'noopener' }, label);

  function renderSection(id) {
    const frag = document.createDocumentFragment();
    const heading = (kicker, title) => {
      frag.append(text('p', kicker, 'kicker'), el('h2', { id: 'panel-title', tabindex: '-1' }, title));
    };

    const project = P.projects.find(p => p.id === id);
    if (project) {
      heading(project.kicker, project.title);
      frag.append(text('p', project.summary));
      if (project.publication) {
        const pub = project.publication;
        frag.append(el('p', { class: 'citation' }, pub.authors + '. ', el('em', null, pub.title), '. ' + pub.venue + '.'));
      }
      if (project.links) frag.append(el('ul', { class: 'links' }, project.links.map(l => el('li', null, link(l.url, l.label)))));
      if (project.tags.length) frag.append(el('ul', { class: 'tags' }, project.tags.map(t => text('li', t))));
      project.images.forEach(img => {
        frag.append(el('figure', null,
          el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy' }),
          text('figcaption', img.caption)));
      });
    } else if (id === 'about') {
      heading(P.role, 'About');
      P.about.forEach(p => frag.append(text('p', p)));
      frag.append(el('dl', null,
        text('dt', 'Program'), text('dd', P.program),
        text('dt', 'Undergrad'), text('dd', P.undergrad),
        text('dt', 'Lab'), text('dd', `${P.lab}, advised by ${P.advisor}`)));
    } else if (id === 'contact') {
      heading('Say hello', 'Contact');
      frag.append(el('dl', null,
        text('dt', 'Email'), el('dd', null, link('mailto:' + P.contact.email, P.contact.email)),
        text('dt', 'LinkedIn'), el('dd', null, link(P.contact.linkedin, 'Alan Pham')),
        text('dt', 'Before'), el('dd', null, link(P.contact.previousSite, 'Previous portfolio'))));
    }
    panelBody.replaceChildren(frag);
  }

  function openSection(id) {
    renderSection(id);
    panel.scrollTop = 0;
    if (!panel.open) panel.showModal();
    hint.classList.add('gone');
    history.replaceState(null, '', '#' + id);
  }

  panel.querySelector('.panel-close').addEventListener('click', () => panel.close());
  panel.addEventListener('click', e => { if (e.target === panel) panel.close(); }); // click on backdrop
  panel.addEventListener('close', () => history.replaceState(null, '', location.pathname + location.search));

  /* ---------- go ---------- */
  layout();
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });

  const initial = location.hash.slice(1);
  if (SECTIONS.some(s => s.id === initial)) openSection(initial);

  requestAnimationFrame(t => { last = t; frame(t); });
})();
