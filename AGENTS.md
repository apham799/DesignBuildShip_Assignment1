# AGENTS.md

Instructions for AI coding agents working in this repository.

## Original brief (from the project owner)

> I am working on assignment that is challenging me to creatively explore and design 25 distinct webpages of my choosing. I would like to revamp my portfolio website and thus will try to recreate a home/landing page for my portfolio website. For the webpage, I need to keep techstack relatively simple with just HTML, CSS and optionally JavaScript but no frameworks, no external APIs, and no data storage. The code will be stored in a GitHub Repository and hosted through Vercel. I have also been given a creative challenge that 20 of the 25 webpages need to be completely unique and not look like any of the other students' webpages. There are about 30 students, so it is certainly a tall order. I also need to keep a gallery page that will keep track of the progress or story as I iterate and try different styles or formats.

Follow-up decisions from the owner:

- Content source: the owner's earlier portfolios (Google Site: https://sites.google.com/view/alanp-ortfolio/home, plus a Figma prototype).
- Repo organization: one folder per design.
- Gallery format: timeline with notes.
- Pace: build one design at a time and review before continuing.

## Scope: landing page only

Each design is **only the portfolio landing/home page**. Do not build About, Projects or Contact pages or any routing between pages. Section links may open in-page panels or stay inert. The only navigation that matters is the link back to the gallery.

Every landing page should include the owner's headshot, available as `PORTFOLIO.headshot` (`assets/img/headshot.jpg`, an 800x1000 crop of `assets/img/WinterGala.jpg`; keep the original untouched).

## Hard constraints

- HTML, CSS and optional vanilla JavaScript only.
- No frameworks or libraries, no build step.
- No external APIs or network requests: no CDNs, web fonts, analytics or embeds. Use system fonts and local assets.
- No data storage: no localStorage, sessionStorage, cookies, IndexedDB or backend.
- Deployed as static files on Vercel from a GitHub repo.

## The goal

- 25 distinct homepage designs for the same portfolio.
- At least 20 must be completely unique and unlikely to resemble any of the roughly 30 other students' pages. Avoid generic portfolio layouts (hero + card grid, dark-mode "developer" template, bento grids). Tie each concept to something specific to the owner (their research, projects, lab, Chicago) rather than a layout trend.
- The gallery page is part of the deliverable. It documents the iteration story.

## Repository layout

```
index.html, gallery.css, gallery.js   the design log (progress tracker + timeline)
shared/content.js                     all portfolio text; the single source of truth
assets/img/                           shared images
designs/NN-name/                      one self-contained folder per design
vercel.json                           trailingSlash: true (needed for relative paths)
README.md                             how to run and deploy
```

## Adding a design

1. Create `designs/NN-name/` (two-digit number, kebab-case name) with `index.html`, `style.css` and optionally `script.js`.
2. Load content with `<script src="../../shared/content.js"></script>` and read `window.PORTFOLIO`. Do not hard-code the owner's text in a design. Image paths in the content are relative to the site root, so prefix them with `../../`.
3. Include a link back to the gallery: `<a href="../../index.html">`. Always link to explicit `index.html` files, never bare folders, so pages also work when opened straight from disk (a folder link shows a file listing).
4. Add one entry to `ENTRIES` in `gallery.js`: number, slug, title, date, concept, what was tried, what was learned, what's next, and techniques.
   That one entry drives both gallery views: the Timeline (notes) and the Cards (live previews, opened with `#cards` in the URL). Designs must render well when scaled into a 1440x900 iframe.
5. Do not share CSS or JS between designs. Each folder must be self-contained so one design can't break another.

## Quality bar for every design

- Responsive from about 360px wide up.
- Keyboard accessible, visible focus states, semantic HTML, alt text on images, sufficient contrast.
- Respect `prefers-reduced-motion`.
- Works without a pointer. Don't make navigation depend only on hover or on hard-to-hit moving targets.
- If a design has a `<noscript>` fallback that repeats the contact email, update it whenever `shared/content.js` changes (it cannot read the file).
- A theme (balloons, toio, trains, ...) is the *interface* around the owner's own portfolio content, not a topic to teach. Every design is a personal portfolio landing page first; do not add explanatory or educational sections about the theme.
- Decorative elements must never sit on top of text, numbers or photos, and photos must never cover them. Give them space in the layout (or a strip of their own) instead of absolute positions, and verify by measuring the rectangles at several widths, not just one.
- Do not add decoration that looks clickable but does nothing (the owner found inert drawers confusing). If something looks interactive, make it work.
- Content stays identical across designs: name, tagline, About, the three projects (Buoyancé, PenPal, Augmented Diver Simulation) and contact details.

## Working conventions

- Match the surrounding code's style, naming and comment density.
- Reflection notes in `gallery.js` ("learned", "next") are the owner's story. Draft them if asked, but mark drafts with `(draft)` so the owner can rewrite them in their own voice.
- Don't invent biographical facts. Use only what's in `shared/content.js`, and ask the owner before adding claims.
- Test before saying something works: serve locally with `python -m http.server 8000` and check it in a browser at desktop and phone widths. Animations driven by `requestAnimationFrame` don't run under headless Chrome's `--virtual-time-budget`. Use a real-time run (for example the DevTools protocol) to verify motion.
- Only commit or push when the owner asks.

## Progress

- 01 `01-tethered`: done. Balloon-and-robot physics navigation, based on the Buoyancé project.
- 02 `02-system-map`: done. The portfolio as a transit system map where x = time (undergrad on the left, master's on the right); stations open details in a side panel; Contact lives in the header and pass card, not on the map. Timeline facts (from the owner): Diver Sim (undergrad CS class project) -> PenPal (undergrad CS class project) -> joined AxLab (undergrad) -> Buoyancé started in AxLab as an undergrad, published during the master's; double major in CS (HCI specialization) and Economics. (A first attempt styled as a PDF viewer was rejected by the owner: designs must feel like a webpage, not an imitation of another document or app.)
- 03 `03-pin-display`: done. Dark pin-display page: a fixed canvas grid of spring-loaded pins forms the owner's headshot (precomputed height map in `portrait.js`), reacts to the pointer, and morphs by section (portrait / terrain / flat). Typographic work index with `<details>` rows.
- 04 `04-reel`: done. Warm daylight clothesline page: vertical scroll reels a rope sideways (reel robot + drum), cards swing on clothespins; becomes a vertical rope on phones and short screens (< 900px wide or < 660px tall). Content cards are built from `shared/content.js`.
- 05 `05-toio-mat`: done. A personal portfolio in a toio-style UI: a simulated toio play mat where the owner's sections are printed cards and three draggable cubes read them (click a card and a cube drives over; a readout shows simulated Position ID / collision / double-tap / posture / shake). The owner works with Sony toio, but the page deliberately doesn't say so (he asked for that line to be removed); don't invent what he builds with it, ask him. Educational toio facts were cut on purpose (see the theme rule above).
- 06 `06-skyline`: done. A merge of designs 01 and 02: the CTA-style map printed on a lab floor in CSS 3D, each stop a black balloon whose height encodes when it happened (a rising skyline); RoverC-style robots (the owner's idea) drive each line forward in time towing coloured balloons with reeling tethers. Selecting a stop sends the robot whose line serves it to park on that stop (it releases and resumes patrol when another stop or nothing is chosen). Wall-label panel on the left; stop list under the room on phones.
- 07 `07-golf-hole`: done. Golf-themed: the page is one golf hole drawn in SVG, with nine holes (the stops, plus the clubhouse for contact) on a scorecard; selecting a hole hits a ball there along an arc with a tracer, and Now drops it in the cup. The two degrees are the two tee markers of ONE teeing ground (they ran in parallel; do not draw them as separate sequential holes). Yardage-book panel with a player card (Player, Club, Marker = advisor, Tees = degrees). The owner said golf is a big part of his life but gave no specifics: the page claims nothing about his golf. Ask him before adding any.
- 08 `08-tapping-task`: done. A Fitts-law tapping test as navigation: seven stops on a ring (the parallel degrees are one Undergrad target; Contact is outside the ring), placed so the test's zig-zag order is chronological, which traces a seven-point star. Tap the lit target to open a stop and light the next; the readout shows D, W, ID, MT and throughput (movement time only for real pointer input). Option A of four ideas proposed to the owner (B card catalog, C control surface, D zine); the owner wants to explore each in turn.
- 09 `09-card-catalog`: done. Option B: a card-catalog cabinet. Oak cabinet face of eight working drawers (six subject drawers that highlight the cards filed under that subject - Computer science, Economics, HCI, Actuated UI, Virtual reality, Balloons and robots - plus About and Contact, which open pulled cards; there is no purely decorative drawer, since the owner found those confusing), and the open PHAM, ALAN drawer holding seven index cards filed in order of occurrence (one pulled up to read at a time, accordion). Cards carry invented HCI call numbers, a main entry, typed title and imprint, notes, photos and tracings built from real topics and co-authors. No claims about any real library.
- 10 `10-control-surface`: done. Option C: a matte instrument panel. A time fader (a styled native range input that updates the display live while dragged and snaps to a channel on release), seven channel strips with rising meters, a text-size knob, Panel (light/dark, default follows the system) and Motion switches, and About/Contact buttons, all of which do something real. Content is plain readable text on the display, not a drawing of a device. One option left from the four proposed: D (the zine).
- 11 `11-zine`: done. Option D, the last of the four: a two-ink (orange and blue on cream) print zine. Huge cover name, a halftone headshot, and one spread per stop with giant page numbers 01-07 in order of occurrence. Only the cover portrait is halftone, drawn on a canvas from a precomputed brightness grid in `halftone-data.js` (a page cannot read local image pixels). The Buoyancé photos are deliberately regular full-colour photos: halftoning them at that size produced meaningless blobs, per the owner. A bottom strip jumps between pages, and Swap inks trades the inks. Orange is only 3.2:1 on the paper, so it is limited to giant numerals and headlines; small text stays deep blue (8.5:1) and the back cover is always blue. The decorative balloons each live in their own `.floater` strip in the grid flow, so they cannot overlap text or photos (they used to be absolutely positioned and did).
- 12 `12-dark-room`: done. First of a second batch of ideas (B The Music Box was declined by the owner as too close to the control surface; C The Sketchbook is design 13; still to explore: D The Affinity Wall, E Supply and Demand). A dark room lit by a glowing-balloon cursor: seven objects (six SVG drawings plus the AxLab logo, `assets/img/axlab-logo-white.png`, downloaded from the lab site and saved locally at the owner's request; earliest on the left) are revealed only by the light, while their number, name and era are always readable (the darkness hides decoration, never text). Lights on switch (default on for prefers-contrast: more), intro drift (off for reduced motion), touch drag, keyboard focus moves the light. Clicking an object opens it on a bright projected screen below with step chips, prev/next, About and Contact.
- 13 `13-sketchbook`: done. A graph-paper research notebook: seven hand-drawn SVG doodles (one per stop, each `path.ln` with `pathLength="1"` so CSS draws them in when the stop scrolls into view; a feTurbulence wobble filter on the doodles only, never on text), a pen line with a red tip drawn down the page between numbered bubbles as you scroll (wobble is in the geometry, not a filter), a contents row on the cover whose bubbles link to each stop, highlighter marks on key phrases, black photo corners on the Buoyancé photos (on a paper sheet on desktop so the pen line passes behind it), the AxLab logo as a sticker (`assets/img/axlab-logo-black.png`, downloaded from the lab site). A Doodle button turns on a pen (navy, red, highlighter, Undo, Clear, Done, Escape) that draws SVG strokes in page coordinates; in memory only, nothing saved. Gotcha: Chrome did not restyle `path[pathLength]` when an ancestor class changed, so use a class (`.ln`) for anything that must react to a parent class.
