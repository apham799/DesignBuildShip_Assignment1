# 25 ways to say "Alan Pham"

Design Build Ship, Assignment 1: 25 homepage designs for one portfolio. Plain HTML, CSS and JavaScript. No frameworks, no external APIs, no data storage.

```
index.html, gallery.*     the design log (timeline + progress tracker)
shared/content.js         all portfolio text, read by every design
assets/img/               Buoyancé photos
designs/NN-name/          one self-contained folder per design
vercel.json               trailingSlash, so relative paths work in each design folder
```

## Add a design

1. Create `designs/NN-name/` with `index.html`, `style.css` and optionally `script.js`.
2. Load content with `<script src="../../shared/content.js"></script>` and read `window.PORTFOLIO`.
   Image paths in the content are relative to the site root, so prefix them with `../../`.
3. Link back with `<a href="../../index.html">`. Link to explicit `index.html` files, not bare folders, so it also works when opened from disk.
4. Add one entry to `ENTRIES` in `gallery.js`.

## Run locally

`python -m http.server 8000`, then open http://localhost:8000/

## Deploy

Push to GitHub and import the repo in Vercel. There is no build step. Leave the framework preset on "Other".
