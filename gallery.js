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

/* scale each 1440x900 iframe to fit its card */
function fitPreviews() {
  document.querySelectorAll('.preview').forEach(p => {
    p.querySelector('iframe').style.transform = `scale(${p.clientWidth / 1440})`;
  });
}
fitPreviews();
addEventListener('resize', fitPreviews);
