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
5. Do not share CSS or JS between designs. Each folder must be self-contained so one design can't break another.

## Quality bar for every design

- Responsive from about 360px wide up.
- Keyboard accessible, visible focus states, semantic HTML, alt text on images, sufficient contrast.
- Respect `prefers-reduced-motion`.
- Works without a pointer. Don't make navigation depend only on hover or on hard-to-hit moving targets.
- If a design has a `<noscript>` fallback that repeats the contact email, update it whenever `shared/content.js` changes (it cannot read the file).
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
