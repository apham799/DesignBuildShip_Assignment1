/*
  The design log. To add a design: build it in /designs/NN-name/, then add one object here.
  Required: n, slug, title, date. Everything else (concept, tried, learned, next, tech) is optional:
  delete a field and its section simply disappears from the page.
  Fields marked (draft) are my first-pass notes; edit them as the story develops.
  Careful with quotes: an apostrophe inside 'single quotes' must be written \' (or use "double quotes").
*/
const TOTAL = 25;

const ENTRIES = [
  {
    n: 1,
    slug: '01-tethered',
    title: 'Tethered',
    date: '2026-10-05',
    concept: 'The page is a gallery focusing on my first main project Buoyancé, a 3-Dimensional shape-changing display through balloons controlled by wheeled robots. Navigation is, hence, five black balloons, each tied to a little wheeled robot on the floor corresponding to different pages on the websit.',
    tried: [
      'Real spring physics: balloons bob, drift away from the cursor and swing back home.',
      'Rope-length constraint, so a balloon can only rise as far as its tether allows.',
      'Robots drive along the floor to stay under their balloons.',
      'A plain text nav along the bottom, so nothing depends on chasing balloons.'
    ],
    learned: 'Making fun interactions can appear very "cool" but become very unpractical for user naviation'
  },
  {
    n: 2,
    slug: '02-system-map',
    title: 'System Map',
    date: '2026-10-05',
    concept: 'My path drawn as a transit system map, a nod to the Chicago CTA map on my T-shirt in some Buoyancé photos. Time runs left to right: my Computer Science and Economics degrees run side by side and merge into the master\'s, my two class projects (Diver Sim, then PenPal) sit on the CS line, and a research line branches off where I join AxLab and runs through the master\'s to Buoyancé and today.',
    tried: [
      'A first version laid the portfolio out as a research paper inside a PDF viewer. It looked clever, but it read as a document, not a webpage, so I dropped it.',
      'A schematic map with 45° lines and interchange stations.',
      'First the trains shuttled back and forth, and Contact sat on the rail, which made the order of events unclear. Now trains only run forward in time, the lines carry direction chevrons, an "Earlier → Later" axis sits under the map, and every stop has a small era label.',
      'Clicking a station opens its details beside the map; "Next stop" buttons walk you along the route.',
      'Clicking my name (in the top bar or on the pass card) turns the side panel into an About Me view, so the landing page needs no separate About page.',
      'On phones the map turns into a vertical route with the same stops and colours.'
    ],
    learned: 'A strong metaphor works best when it is also the navigation. Making the map the interface, instead of decorating a normal page with it, is what made it feel like a webpage.'
  },
  {
    n: 3,
    slug: '03-pin-display',
    title: 'Pin Display',
    date: '2026-10-06',
    concept: 'A dark, tactile page built on a pin display, one kind of shape-changing display my lab works with that my advisor is quite known for. The whole background is a grid of about 16,000 "spring-loaded" pins. My headshot is the relief on the display, and the pins reshape as you scroll.',
    tried: [
      'A fixed grid of pins where every pin is a spring. The pointer presses into them and leaves an impression that slowly heals; a click sends a ripple.',
      'My headshot turned into a "height map", so the pins "rise" to form my face. A Pins / Photo toggle swaps in the real photo.',
      'The display morphs with the section you are in: portrait, then rolling terrain behind my work, then a calm plateau. The page also talks back, so opening a project row sends a ripple through the pins.',
      'A typographic work index with expanding rows instead of cards, so the page does not fall back on a card grid.'
    ],
    learned: 'The first portrait was an unrecognisable blob. A tighter crop, more resolution and a little local contrast made it read more as a face.',
  },
  {
    n: 4,
    slug: '04-reel',
    title: 'The Reel',
    date: '2026-10-06',
    concept: 'The opposite mood of the pin display: warm, daylight and paper and more akin to the bright, artistic nature of Buoyancé. The page is a clothesline. Buoyancé works by reeling tethers, so the content hangs from a rope and a little reel robot on the bottom winds it in as it scrolls.',
    tried: [
      'Scrolling down reels the rope sideways: the drum spins, the rope twists, and the cards naturally move with momentum on the reel.',
      'Paper cards, polaroids and kraft tags make the content feel hung up and handled.',
      'On phones the rope turns vertical, and tabbing to a card with the keyboard reels it into view.'
    ],
    learned: 'A metaphor from the research (reeling a tether) can drive the whole interaction, not just the artwork. Sideways motion from vertical scrolling needs extra care: focus, trackpad swipes and short screens all had to be handled.',
  },
  {
    n: 5,
    slug: '05-toio-mat',
    title: 'The toio Mat',
    date: '2026-10-06',
    concept: 'My portfolio dressed in the interface of Sony toio, the tiny cube robots I also work with. The page is a simulated toio play mat: my sections are printed cards on the mat, and three cubes read them the way a real toio reads its mat. Bold cobalt blue and white, like a toy.',
    tried: [
      'Click a card and a cube turns, drives over and reads it (a nod to the target-position control a real toio has). Or pick a cube up and put it on a card yourself (A slight nod to my most recent in-progress project).',
      'A live readout shows what a toio would report: Position ID (x, y, angle), "position ID missed" when lifted, collision, double-tap, posture and shake level, using the names and ranges from the public toio spec.',
      'A guided tour sends a cube past every card in order. Cubes are keyboard-reachable too (arrow keys nudge, Enter double-taps).'
    ],
    learned: 'A theme works best as the UI around my own content',
  },
  {
    n: 6,
    slug: '06-skyline',
    title: 'Skyline',
    date: '2026-10-06',
    concept: '(draft) A merge of two earlier ideas: the Chicago transit map from design 02 and the balloons-and-robots world of Buoyancé. The map is printed on the floor of a lab, tilted in 3D, and every stop is a black balloon tethered to its spot. The height of each balloon says when that stop happened, so the map becomes a rising skyline (a small Chicago pun).',
    tried: [
      '(draft) Real 3D with CSS transforms: the floor tilts a little as the pointer moves, and the balloons stay upright and facing you.',
      '(draft) Balloon height encodes time, the same idea as Buoyancé showing abstract data in 3D space. Selecting a stop reels its balloon higher.',
      '(draft) Small RoverC-style robots drive each line one way, forward in time, towing coloured balloons whose tethers are reeled out as they go. They glide along the diagonals without turning, like a mecanum-wheel robot.',
      '(draft) Click a stop and the robot whose line serves it drives there and parks on it, while that balloon is reeled higher. Pick another stop (or click the same one again) and the robot goes back to patrolling.',
      '(draft) On phones the room goes on top and a plain list of stops sits underneath; there is a pause button for the robots, and with reduced motion they park.'
    ],
    learned: '(draft) Merging two ideas worked best when each kept its job: the map says where and in what order, the balloons say how late. Putting the data in the height made the 3D feel meaningful, not decorative.',
    next: '(draft) Let a robot drive to the stop you select and reel its balloon up itself, and let the balloons sway with the robots passing underneath.',
    tech: ['CSS 3D transforms', 'Billboarded balloons', 'SVG paths on a tilted plane', 'Per-frame tether reeling']
  }
];

/* ---------- render ---------- */
const tracker = document.getElementById('tracker');
const timeline = document.getElementById('timeline');
document.getElementById('count').textContent = `${ENTRIES.length} / ${TOTAL}`;

for (let i = 1; i <= TOTAL; i++) {
  const entry = ENTRIES.find(e => e.n === i);
  const li = document.createElement('li');
  li.className = entry ? 'done' : '';
  if (entry) {
    const a = document.createElement('a');
    a.href = '#design-' + i;
    a.textContent = String(i).padStart(2, '0');
    a.title = entry.title;
    li.appendChild(a);
  } else {
    li.textContent = String(i).padStart(2, '0');
  }
  tracker.appendChild(li);
}

function h(tag, props, ...kids) {
  const n = document.createElement(tag);
  Object.entries(props || {}).forEach(([k, v]) => n.setAttribute(k, v));
  kids.flat().forEach(k => { if (k != null && k !== false) n.append(k); }); // skip missing pieces
  return n;
}

ENTRIES.forEach(e => {
  const url = `designs/${e.slug}/index.html`; // explicit file, so it also works when opened from disk
  const frame = h('iframe', { src: url, title: `Live preview of ${e.title}`, loading: 'lazy', tabindex: '-1', scrolling: 'no' });
  const preview = h('a', { class: 'preview', href: url, 'aria-label': `Open design ${e.n}: ${e.title}` }, frame, h('span', { class: 'open' }, 'Open design →'));

  const card = h('li', { class: 'entry', id: 'design-' + e.n },
    h('div', { class: 'num', 'aria-hidden': 'true' }, String(e.n).padStart(2, '0')),
    h('article', null,
      h('header', null,
        h('h3', null, e.title),
        h('time', { datetime: e.date }, e.date)),
      preview,
      e.concept && h('p', { class: 'concept' }, e.concept),
      (e.tried?.length || e.learned || e.next) && h('div', { class: 'cols' },
        e.tried?.length && h('section', null, h('h4', null, 'What I tried'), h('ul', null, e.tried.map(t => h('li', null, t)))),
        (e.learned || e.next) && h('section', null,
          e.learned && [h('h4', null, 'What I learned'), h('p', null, e.learned)],
          e.next && [h('h4', null, 'Next time'), h('p', null, e.next)])),
      e.tech?.length && h('ul', { class: 'tech', 'aria-label': 'Techniques' }, e.tech.map(t => h('li', null, t)))));
  timeline.appendChild(card);
});

if (ENTRIES.length < TOTAL) {
  timeline.appendChild(h('li', { class: 'entry next' },
    h('div', { class: 'num', 'aria-hidden': 'true' }, String(ENTRIES.length + 1).padStart(2, '0')),
    h('article', null, h('p', { class: 'concept' }, 'Next design in progress…'))));
}

/* ---------- cards view: every design at a glance ---------- */
const cardsEl = document.getElementById('cards');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

ENTRIES.forEach(e => {
  const url = `designs/${e.slug}/index.html`;
  // previews are live pages, so they load only while a card is near the screen (see the observer below)
  const frame = h('iframe', { 'data-src': url, title: `Live preview of ${e.title}`, tabindex: '-1', scrolling: 'no' });
  const preview = h('a', { class: 'preview', href: url, tabindex: '-1', 'aria-label': `Open design ${e.n}: ${e.title}` }, frame, h('span', { class: 'open', 'aria-hidden': 'true' }, 'Open design →'));
  const notes = h('button', { type: 'button', class: 'notes' }, 'Read the notes');
  notes.addEventListener('click', () => {
    setView('timeline');
    document.getElementById('design-' + e.n).scrollIntoView({ block: 'start' });
  });
  cardsEl.appendChild(h('li', { class: 'card', id: 'card-' + e.n },
    preview,
    h('div', { class: 'card-body' },
      h('div', { class: 'card-head' },
        h('span', { class: 'card-num', 'aria-hidden': 'true' }, String(e.n).padStart(2, '0')),
        h('h3', null, e.title),
        h('time', { datetime: e.date }, e.date)),
      e.concept && h('p', { class: 'card-concept' }, e.concept),
      h('div', { class: 'card-actions' }, h('a', { class: 'go', href: url }, 'Open design →'), notes))));
});

if (ENTRIES.length < TOTAL) {
  cardsEl.appendChild(h('li', { class: 'card next' },
    h('span', { class: 'card-num', 'aria-hidden': 'true' }, String(ENTRIES.length + 1).padStart(2, '0')),
    h('p', { class: 'card-concept' }, 'Next design in progress…')));
}

// Keep at most the nearby previews running: load when close, unload when far, so many live pages never run at once.
const mountObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    const f = en.target.querySelector('iframe');
    if (en.isIntersecting && f.dataset.live !== '1') { f.src = f.dataset.src; f.dataset.live = '1'; }
    else if (!en.isIntersecting && f.dataset.live === '1') { f.src = 'about:blank'; f.dataset.live = '0'; }
  });
}, { rootMargin: '250px 0px' });
cardsEl.querySelectorAll('.preview').forEach(p => mountObserver.observe(p));

/* ---------- switching views (kept in the URL hash, since nothing may be stored) ---------- */
const segButtons = [...document.querySelectorAll('.seg button')];
const viewNote = document.getElementById('view-note');
const NOTES = {
  timeline: 'The story: what I tried and learned for each design, oldest first.',
  cards: 'Every design at a glance. Click a card to open it live.'
};

function setView(view) {
  view = view === 'cards' ? 'cards' : 'timeline';
  document.body.dataset.view = view;
  timeline.hidden = view !== 'timeline';
  cardsEl.hidden = view !== 'cards';
  segButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  viewNote.textContent = NOTES[view];
  history.replaceState(null, '', view === 'cards' ? '#cards' : location.pathname + location.search);
  fitPreviews();
}
segButtons.forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

// in cards view the progress tracker jumps to the card instead of the timeline entry
tracker.addEventListener('click', ev => {
  const a = ev.target.closest('a');
  if (!a || document.body.dataset.view !== 'cards') return;
  ev.preventDefault();
  const card = document.getElementById('card-' + a.getAttribute('href').replace('#design-', ''));
  if (card) card.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
});

/* scale each 1440x900 iframe to fit its card (hidden views have no width yet, so skip them) */
function fitPreviews() {
  document.querySelectorAll('.preview').forEach(p => {
    if (p.clientWidth) p.querySelector('iframe').style.transform = `scale(${p.clientWidth / 1440})`;
  });
}
addEventListener('resize', fitPreviews);

const startView = location.hash === '#cards' || new URLSearchParams(location.search).get('view') === 'cards' ? 'cards' : 'timeline';
if (startView === 'cards') setView('cards'); else fitPreviews();
